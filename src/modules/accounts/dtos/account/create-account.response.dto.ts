import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAccountDestinationDto {
  @ApiProperty({
    description: 'ID da conta criada',
    example: '100',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Saldo inicial da conta',
    example: 10,
  })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  balance: number;
}

export class CreateAccountResponseDto {
  @ApiProperty({
    description: 'Conta criada',
    type: CreateAccountDestinationDto,
  })
  @IsObject()
  destination: CreateAccountDestinationDto;
}
