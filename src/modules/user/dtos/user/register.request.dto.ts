import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, Length, IsOptional } from 'class-validator';
import { Role } from '../../../../database/entities/role.entity';

export class IRegisterUserRequestDto {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'John Doe',
  })
  @IsString()
  @Length(3, 255)
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Perfil do usuário',
    nullable: true,
  })
  @IsOptional()
  role?: Role;

  @ApiProperty({
    description: 'CPF do usuário',
    example: '81875359206',
  })
  @IsString()
  cpf: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'Brasil21',
  })
  @IsString()
  @Length(8, 255)
  password: string;
}
