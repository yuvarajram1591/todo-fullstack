import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // available for injection anywhere without re-importing
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}