import { Body, Controller, Post } from '@nestjs/common';
import { IdentifyDto } from 'src/dto/identify.dto';
import { IdentityService } from './identity.service';

@Controller('identify')
export class IdentityController {
    constructor(private readonly identityService: IdentityService) {}

    @Post()
    async identify(@Body() body: IdentifyDto) {
        if (!body.email && !body.phoneNumber) {
            throw new Error('At least one of email or phoneNumber must be provided.');
        }

        return this.identityService.identifyUser(body);
    }
}
