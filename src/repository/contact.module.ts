import { Module } from '@nestjs/common';
import { ContactRepository } from './contact.repository';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    providers: [ContactRepository, PrismaService],
    exports: [ContactRepository],
})
export class ContactModule {}
