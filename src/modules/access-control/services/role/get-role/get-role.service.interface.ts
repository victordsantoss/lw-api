import { Role, RoleTypes } from '../../../../../database/entities/role.entity';

export interface IGetRoleService {
  perform(name: RoleTypes): Promise<Role>;
}
