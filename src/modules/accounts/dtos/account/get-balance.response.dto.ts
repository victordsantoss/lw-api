import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetBalanceResponseDto {
  @ApiProperty({
    description: 'Saldo atual da conta',
    example: 150.5,
  })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  balance: number;
}
