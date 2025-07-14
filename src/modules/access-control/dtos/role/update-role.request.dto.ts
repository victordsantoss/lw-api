import { ApiProperty } from '@nestjs/swagger';
import { RoleTypes } from '../../../../database/entities/role.entity';

export class UpdateRoleRequestDto {
  @ApiProperty({
    description: 'Nome do Perfil',
  })
  name: RoleTypes;

  @ApiProperty({
    description: 'Status da Perfil',
  })
  isActive: boolean;
}
