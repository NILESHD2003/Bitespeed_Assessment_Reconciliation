import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { ContactModule } from 'src/repository/contact.module';

@Module({
  imports: [ContactModule],
  providers: [IdentityService],
  controllers: [IdentityController]
})
export class IdentityModule {}
