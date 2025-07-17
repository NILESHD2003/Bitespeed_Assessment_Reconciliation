import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getLandingDetails() {
    return {
      message: 'Welcome to the Bitespeed Assessment API',
      instructions: 'Use the /identify endpoint to identify users.',
      developedBy: 'Nilesh Deshpande [nileshdeshpandework@gmail.com]'
    };
  }

  @Get('/health')
  getHealth(): { status: string; message: string } {
    return this.appService.getHealth();
  }
}
