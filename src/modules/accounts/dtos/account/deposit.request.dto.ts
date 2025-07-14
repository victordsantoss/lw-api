import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsEnum, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum EventType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
}

export class DepositRequestDto {
  @ApiProperty({
    description: 'Tipo do evento',
    enum: EventType,
    example: EventType.DEPOSIT,
  })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({
    description: 'ID da conta de destino (para deposit)',
    example: '100',
    required: false,
  })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiProperty({
    description: 'ID da conta de origem (para withdraw)',
    example: '100',
    required: false,
  })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiProperty({
    description: 'Descrição da transação',
    example: 'Descrição da transação',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Valor da transação',
    example: 10,
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  balance: number;
}
