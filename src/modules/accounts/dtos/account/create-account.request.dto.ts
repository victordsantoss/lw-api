import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IAccountDto } from './account.dto';
import { TransactionType } from 'src/database/entities/account-statement.entity';

export class CreateAccountRequestDto extends IAccountDto {
  @ApiProperty({
    description: 'Tipo do evento',
    enum: TransactionType,
    example: TransactionType.DEPOSIT,
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Saldo inicial da conta',
    example: 10,
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Transform(({ value }) => parseFloat(value))
  balance: number;
}
