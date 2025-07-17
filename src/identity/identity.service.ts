import { Injectable } from '@nestjs/common';
import { IdentifyDto } from 'src/dto/identify.dto';
import { ContactRepository } from '../repository/contact.repository';

@Injectable()
export class IdentityService {
  constructor(private readonly contactRepository: ContactRepository) {}
  responseMapperUtil(data) {
    const primaryContactId = data.find(
      (contact) => contact.linkPrecedence === 'PRIMARY',
    )?.id;
    const emails = Array.from(
      new Set(data.map((contact) => contact.email).filter((email) => !!email)),
    );
    const phoneNumbers = Array.from(
      new Set(
        data.map((contact) => contact.phoneNumber).filter((phone) => !!phone),
      ),
    );
    const secondaryContactIds = data
      .filter((contact) => contact.linkPrecedence === 'SECONDARY')
      .map((contact) => contact.id);

    const respose = {
      contact: {
        primaryContactId,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    };

    return respose;
  }

  async findMatchingContact({
    email,
    phoneNumber,
  }: {
    email?: string;
    phoneNumber?: string;
  }) {
    const matchingData = await this.contactRepository.findContactByEmailOrPhone(email, phoneNumber);

    if (matchingData.length === 0) {
      return [];
    }

    // get primary id
    let primaryContactId: number | undefined = undefined;

    const primary = matchingData.find(
      (contact) => contact.linkPrecedence === 'PRIMARY',
    );

    if (primary) {
      primaryContactId = primary.id;
    } else {
      primaryContactId = matchingData[0].linkedId!;
    }

    const allContacts = await this.contactRepository.findContactByPrimaryId(primaryContactId);

    return allContacts;
  }

  handleNewPrimary({
    email,
    phoneNumber,
  }: {
    email?: string;
    phoneNumber?: string;
  }) {
    return this.contactRepository.createNewPrimaryContact({
      email: email ? email : undefined,
      phoneNumber: phoneNumber ? String(phoneNumber) : undefined,
    });
  }

  async identifyUser(dto: IdentifyDto) {
    // cases to cover
    // 1. If new phone and email -> create new contact with primary
    const isExistingContact = await this.findMatchingContact({
      email: dto.email ? dto.email : undefined,
      phoneNumber: dto.phoneNumber ? String(dto.phoneNumber) : undefined,
    });

    if (isExistingContact.length > 0) {
      return this.responseMapperUtil(isExistingContact);
    }

    if (isExistingContact.length === 0) {
      const newPrimaryContact = await this.handleNewPrimary({
        email: dto.email ? dto.email : undefined,
        phoneNumber: dto.phoneNumber ? String(dto.phoneNumber) : undefined,
      });

      console.log('newPrimaryContact', newPrimaryContact);

      return this.responseMapperUtil([newPrimaryContact]);
    }

    // 2. If only email or phone exists -> create secondary contact and link to primary

    // 3. If both email and phone exist -> return consolidated data -> projection {primaryContactId, emails[], phoneNumbers[], secondaryContactIds[]}

    // 4. If email in one contact and phone in another -> merge keeping older primary and convert other primary to secondary

    // 5. Email and phone are from same secondary refer primary

    return {
      message: 'Controller & Service are working',
      received: dto,
    };
  }
}
