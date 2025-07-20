import PrismaService from '../prisma/prisma.service';
import { Logger, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma';

@Injectable()
export class ContactRepository {
  private readonly logger = new Logger(ContactRepository.name);

  constructor(public readonly prisma: PrismaService) {}

  async findContactByPrimaryId(primaryContactId: number) {
    try {
      return this.prisma.contact.findFirst({
        where: { id: primaryContactId },
        orderBy: { createdAt: 'asc' },
      });
    } catch (error) {
      this.logger.error(
        `Error in findContactByPrimaryId: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findContactsByPrimaryId(primaryContactId: number) {
    try {
      const data = await this.prisma.contact.findMany({
        where: {
          OR: [{ id: primaryContactId }, { linkedId: primaryContactId }],
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
      return data;
    } catch (error) {
      this.logger.error(
        `Error in findContactsByPrimaryId: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findContactByEmailOrPhone(email?: string, phoneNumber?: string) {
    try {
      return this.prisma.contact.findMany({
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
    } catch (error) {
      this.logger.error(
        `Error in findContactByEmailOrPhone: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findContactByPrimaryIdAndUpdate(primaryContactId: number, data) {
    try {
      return this.prisma.contact.update({
        where: { id: primaryContactId },
        data: {
          ...data,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error in findContactByPrimaryIdAndUpdate: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findContactByLinkedIdAndUpdate(linkedId: number, data) {
    try {
      return this.prisma.contact.updateMany({
        where: { linkedId },
        data: {
          ...data,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error in findContactByLinkedIdAndUpdate: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async createNewPrimaryContact(data: {
    email?: string;
    phoneNumber?: string;
  }) {
    try {
      return this.prisma.contact.create({
        data: {
          email: data.email || null,
          phoneNumber: data.phoneNumber || null,
          linkPrecedence: 'PRIMARY',
          linkedId: null,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error in createNewPrimaryContact: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async createNewSecondaryContact(
    data: { email?: string; phoneNumber?: string },
    primaryContactId: number,
  ) {
    try {
      return this.prisma.contact.create({
        data: {
          email: data.email || null,
          phoneNumber: data.phoneNumber || null,
          linkPrecedence: 'SECONDARY',
          linkedId: primaryContactId,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error in createNewSecondaryContact: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
