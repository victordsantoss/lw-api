import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../database/entities/user.entity';
import { UserController } from './controllers/user/user.controller';
import { RegisterUserService } from './services/user/register/register.service';
import { UserRepository } from './repositories/user/user.repository';
import { CommonModule } from '../../common/common.module';
import { PasswordModule } from '../password/password.module';
import { AuthModule } from '../auth/auth.module';
import { GetAuthenticatedUserService } from './services/user/get-authenticated-user/get-authenticated-user.service';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User], 'lw'),
    CommonModule,
    PasswordModule,
    AccessControlModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: 'IRegisterUserService',
      useClass: RegisterUserService,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IGetAuthenticatedUserService',
      useClass: GetAuthenticatedUserService,
    },
  ],
  exports: [
    'IRegisterUserService',
    'IUserRepository',
    'IGetAuthenticatedUserService',
    TypeOrmModule,
  ],
})
export class UserModule {}
