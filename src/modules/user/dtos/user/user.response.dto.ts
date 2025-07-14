import { Role } from '../../../../database/entities/role.entity';

export interface IUserResponseDto {
  name: string;
  email: string;
  cpf: string;
  role: Role;
  provider: string | null;
  birthDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
