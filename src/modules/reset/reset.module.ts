import { Module } from '@nestjs/common';
import { ResetController } from './controllers/reset.controller';
import { ResetService } from './services/reset.service';

@Module({
  controllers: [ResetController],
  providers: [
    {
      provide: 'IResetService',
      useClass: ResetService,
    },
  ],
})
export class ResetModule {}
