import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// IMPORTANT: Prisma 7 generates client.ts as the entry file — import it directly, not the folder
import { PrismaClient } from '../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Prisma 7 requires an explicit driver adapter — it no longer
    // manages its own connection pool internally like Prisma 6 did.
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}