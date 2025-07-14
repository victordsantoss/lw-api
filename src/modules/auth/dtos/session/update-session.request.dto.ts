import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsDate } from 'class-validator';

export class UpdateSessionRequestDto {
  @ApiProperty({
    description: 'Token de autenticação',
  })
  @IsEmail()
  token: string;

  @ApiProperty({
    description: 'Data de término da sessão',
  })
  @IsDate()
  endDate: Date;
}
