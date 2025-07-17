import PrismaService from '../prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class ContactRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createNewPrimaryContact(data: {email?: string; phoneNumber?: string}) {
        return this.prisma.contact.create({
            data: {
                email: data.email || null,
                phoneNumber: data.phoneNumber || null,
                linkPrecedence: 'PRIMARY',
                linkedId: null,
            },
        });
    }

    async createNewSecondaryContact(data: {email?: string; phoneNumber?: string}, primaryContactId: number) {
        const newContact = await this.prisma.contact.create({
          data: {
                email: data.email || null,
                phoneNumber: data.phoneNumber || null,
                linkPrecedence: 'SECONDARY',
                linkedId: primaryContactId,
            },  
        })
    }

    async findContactByPrimaryId(primaryContactId: number) {
        const data = await this.prisma.contact.findMany({
            where: {
                OR: [
                    {id: primaryContactId},
                    {linkedId: primaryContactId}
                ]
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        return data;
    }

    async findContactByEmailOrPhone(email?: string, phoneNumber?: string) {
        const data = await this.prisma.contact.findMany({
            where: {
                OR: [
                    email ? { email } : undefined,
                    phoneNumber ? { phoneNumber: String(phoneNumber) } : undefined,
                ].filter(Boolean) as Prisma.ContactWhereInput[],
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        return data;
    }
}
