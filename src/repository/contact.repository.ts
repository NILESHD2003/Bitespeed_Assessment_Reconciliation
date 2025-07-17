import PrismaService from '../prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class ContactRepository {
    constructor(private readonly prisma: PrismaService) {}

    async findContactByPrimaryId(primaryContactId: number) {
        return this.prisma.contact.findFirst({
            where: { id: primaryContactId },
            orderBy: { createdAt: 'asc' },
        })
    }

    async findContactsByPrimaryId(primaryContactId: number) {
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

    async findContactByPrimaryIdAndUpdate(primaryContactId: number, data) {
        return this.prisma.contact.update({
            where: { id: primaryContactId },
            data: {
                ...data,
            },
        });
    }

    async findContactByLinkedIdAndUpdate(linkedId: number, data) {
        return this.prisma.contact.updateMany({
            where: { linkedId },
            data: {
                ...data,
            },
        })
    }

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
        return this.prisma.contact.create({
          data: {
                email: data.email || null,
                phoneNumber: data.phoneNumber || null,
                linkPrecedence: 'SECONDARY',
                linkedId: primaryContactId,
            },  
        })
    }
}
