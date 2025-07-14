import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsObject, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class AccountTransactionDto {
  @ApiProperty({
    description: 'ID da conta',
    example: '100',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Saldo atual da conta após a transação',
    example: 20,
  })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  balance: number;
}

export class DepositResponseDto {
  @ApiProperty({
    description: 'Dados da conta após o depósito',
    type: AccountTransactionDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  destination?: AccountTransactionDto;

  @ApiProperty({
    description: 'Dados da conta após o saque',
    type: AccountTransactionDto,
    required: false,
  })
  @IsOptional()
  @IsObject()
  origin?: AccountTransactionDto;
}
