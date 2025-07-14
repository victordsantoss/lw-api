import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../../../common/core/repositories/base.repository';
import { Role, RoleTypes } from '../../../../database/entities/role.entity';
import { IRoleRepository } from './role.repository.interface';

@Injectable()
export class RoleRepository
  extends BaseRepository<Role>
  implements IRoleRepository
{
  constructor(dataSource: DataSource) {
    super(dataSource, Role);
  }

  public async findRoleByName(name: RoleTypes): Promise<Role> {
    return this.repository.findOne({
      where: {
        name: name,
        isActive: true,
      },
    });
  }
}
