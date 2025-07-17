import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async handleDualMergeProblem(primaryIds: Set<number>) {
    // console.log('Dual merge problem detected with primaryIds:', primaryIds);
    // way to fix

    // fetch contact with primaryIds
    const idA = await this.contactRepository.findContactByPrimaryId(
      Array.from(primaryIds)[0],
    );

    const idB = await this.contactRepository.findContactByPrimaryId(
      Array.from(primaryIds)[1],
    );

    // elect the oldest contact as primary
    if (!idA || !idB) {
      throw new Error('Primary contacts not found for merge.');
    }

    const electedPrimary = idA.createdAt < idB.createdAt ? idA : idB;

    const demotedPrimary = electedPrimary.id === idA.id ? idB : idA;

    // console.log('Elected primary contact:', electedPrimary.id);

    // demote the rest to secondary
    const demotedSecondaryData =
      await this.contactRepository.findContactByPrimaryIdAndUpdate(
        demotedPrimary.id,
        {
          linkPrecedence: 'SECONDARY',
          linkedId: electedPrimary.id,
        },
      );

    // find all secondary contact linked to demoted and update demotedSecondary contacts to link to the new elected primary

    await this.contactRepository.findContactByLinkedIdAndUpdate(
      demotedPrimary.id,
      {
        linkedId: electedPrimary.id,
      },
    );

    //populate the response with the new primary and all secondary contacts and return resp

    const allContacts = await this.contactRepository.findContactsByPrimaryId(
      electedPrimary.id,
    );

    return allContacts;
  }

  async findMatchingContact({
    email,
    phoneNumber,
  }: {
    email?: string;
    phoneNumber?: string;
  }) {
    const matchingData = await this.contactRepository.findContactByEmailOrPhone(
      email,
      phoneNumber,
    );

    // check for dual merge problem
    const primaryIds = new Set<number>();

    for (const contact of matchingData) {
      if (contact.linkPrecedence === 'PRIMARY') {
        primaryIds.add(contact.id);
      } else if (contact.linkedId) {
        primaryIds.add(contact.linkedId);
      }
    }

    // console.log('primaryIds', primaryIds);

    if (primaryIds.size > 1) {
      // dual merge problem
      return this.handleDualMergeProblem(primaryIds);
    }

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

    const allContacts =
      await this.contactRepository.findContactsByPrimaryId(primaryContactId);

    // check if anyContact that has both email and phone number in same else handle new secondary contact

    const emails = new Set(allContacts.map((c) => c.email).filter(Boolean));
    const phones = new Set(
      allContacts.map((c) => c.phoneNumber).filter(Boolean),
    );

    const emailExists = email && emails.has(email);
    const phoneExists = phoneNumber && phones.has(phoneNumber);

    if ((email && !emailExists) || (phoneNumber && !phoneExists)) {
      const newSecondaryContact = await this.handleNewSecondary(
        { email, phoneNumber },
        primaryContactId,
      );
      allContacts.push(newSecondaryContact);
    }

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

  handleNewSecondary(
    { email, phoneNumber }: { email?: string; phoneNumber?: string },
    primaryContactId: number,
  ) {
    return this.contactRepository.createNewSecondaryContact(
      {
        email: email ? email : undefined,
        phoneNumber: phoneNumber ? String(phoneNumber) : undefined,
      },
      primaryContactId,
    );
  }

  async identifyUser(dto: IdentifyDto) {
    try {
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

        // console.log('newPrimaryContact', newPrimaryContact);

        return this.responseMapperUtil([newPrimaryContact]);
      }

      // 2. If only email or phone exists -> create secondary contact and link to primary

      // 3. If both email and phone exist -> return consolidated data -> projection {primaryContactId, emails[], phoneNumbers[], secondaryContactIds[]}

      // 4. If email in one contact and phone in another -> merge keeping older primary and convert other primary to secondary

      // 5. Email and phone are from same secondary refer primary
    } catch (error) {
      throw new InternalServerErrorException('Error identifying user: ' + error.message);
    }
  }
}
