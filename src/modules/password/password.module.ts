import { Module } from '@nestjs/common';
import { PasswordService } from './services/password.service';

@Module({
  providers: [
    {
      provide: 'IPasswordService',
      useClass: PasswordService,
    },
  ],
  exports: ['IPasswordService'],
})
export class PasswordModule {}
