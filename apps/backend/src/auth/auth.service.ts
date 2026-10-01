import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './mail.service';
import { SignupDto } from './signup.dto';
import { LoginDto } from './login.dto';


type GoogleUser = {
  googleId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // ── Google OAuth ──────────────────────────────────────────
  async findOrCreateGoogleUser(googleUser: GoogleUser) {
    // First check if this Google account has logged in before
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.googleId },
    });

    if (!user) {
      // Second: check if an email/password account already exists with this email —
      // if so, LINK the Google login to it instead of creating a duplicate user
      const existingByEmail = await this.prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (existingByEmail) {
        user = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: { googleId: googleUser.googleId },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            googleId: googleUser.googleId,
            email: googleUser.email,
            name: googleUser.name,
            avatarUrl: googleUser.avatarUrl,
          },
        });
      }
    }

    return user;
  }

  // ── Email/password signup ──────────────────────────────────
  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashedPassword, name: dto.name },
    });

    return this.generateJwt(user);
  }

  // ── Email/password login ─────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      // Covers both "no account" and "Google-only account with no password"
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateJwt(user);
  }

  // ── Change password ──────────────────────────────────────────
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw new NotFoundException('User not found or has no password set');
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNew },
    });

    return { message: 'Password updated successfully' };
  }

  // ── Forgot password ──────────────────────────────────────────
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { message: 'If that email exists, a reset link has been sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If that email exists, a reset link has been sent' };
  }

  // ── Reset password ───────────────────────────────────────────
  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      throw new UnauthorizedException('Reset link is invalid or has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
    });

    return { message: 'Password has been reset successfully' };
  }

  generateJwt(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    return { accessToken: this.jwtService.sign(payload) };
  }
}