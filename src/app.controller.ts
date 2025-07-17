import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getLandingDetails() {
    return {
      project: 'Bitespeed Backend Task: Identity Reconciliation',
      projectDetails: {
        hostedOn: 'Render',
        techStack: 'NestJs, TypeScript, PostgreSQL(supabase), Prisma',
        githubLink: 'https://github.com/NILESHD2003/Bitespeed_Assessment_Reconciliation'
      },
      developedBy: 'Nilesh Deshpande',
      contact: {
        email: 'nileshdeshpandework@gmail.com',
        phoneNumber: '+91 93073 94304',
        linkedIn: 'https://www.linkedin.com/in/nilesh-deshpande2003/',
        resume: 'https://nileshdeshpande.dev/resume',
        github: 'https://github.com/NILESHD2003',
        portfolio: 'https://nileshdeshpande.dev',
      } 
    };
  }

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
