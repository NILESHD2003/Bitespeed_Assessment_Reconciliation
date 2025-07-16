import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentityModule } from './identity/identity.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [IdentityModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
