import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsDate } from 'class-validator';
import { User } from '../../../../database/entities/user.entity';

export class CreateSessionRequestDto {
  @ApiProperty({
    description: 'Usuário',
  })
  user: User;

  @ApiProperty({
    description: 'Token de autenticação',
  })
  @IsEmail()
  token: string;

  @ApiProperty({
    description: 'Data de início da sessão',
  })
  @IsDate()
  startDate: Date;
}
