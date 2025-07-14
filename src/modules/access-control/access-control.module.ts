import { Module } from '@nestjs/common';
import { GetRoleService } from './services/role/get-role/get-role.service';
import { RoleRepository } from './repositories/role/role.repository';

@Module({
  providers: [
    {
      provide: 'IGetRoleService',
      useClass: GetRoleService,
    },
    {
      provide: 'IRoleRepository',
      useClass: RoleRepository,
    },
  ],
  exports: ['IGetRoleService', 'IRoleRepository'],
})
export class AccessControlModule {}
