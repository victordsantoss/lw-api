import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsNumber, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';
import { AccountStatus } from '../../../../database/entities/account.entity';
import { IAccountDto } from './account.dto';

export class IAccountResponseDto extends IAccountDto {
  @ApiProperty({
    description: 'ID único da conta',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'Status da conta',
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
  })
  @IsEnum(AccountStatus)
  status: AccountStatus;

  @ApiProperty({
    description: 'Saldo atual da conta',
    example: 1500.75,
  })
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  balance: number;

  @ApiProperty({
    description: 'Data de criação da conta',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt?: Date;

  @ApiProperty({
    description: 'Data de atualização da conta',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  updatedAt?: Date;
}
