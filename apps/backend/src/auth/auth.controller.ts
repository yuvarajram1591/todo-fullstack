import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './signup.dto';
import { LoginDto } from './login.dto';
import { ChangePasswordDto } from './change-password.dto';
import { ForgotPasswordDto } from './forgot-password.dto';
import { ResetPasswordDto } from './reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ── Email/password routes ──────────────────────────
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Req() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  // ── Google OAuth routes ──────────────────────────────
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res: Response) {
    const user = await this.authService.findOrCreateGoogleUser(req.user);
    const { accessToken } = this.authService.generateJwt(user);
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${accessToken}`,
    );
  }

  // ── Shared ────────────────────────────────────────────
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req) {
    return req.user;
  }
}
