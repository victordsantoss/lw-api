import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { AccountType } from '../../../../database/entities/account.entity';

export class IAccountDto {
  @ApiProperty({
    description: 'Nome ou apelido da conta',
    example: 'Conta do João',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Número da conta bancária',
    example: '12345-6',
  })
  @IsString()
  accountNumber: string;

  @ApiProperty({
    description: 'Agência da conta',
    example: '1234',
  })
  @IsString()
  agency: string;

  @ApiProperty({
    description: 'Tipo da conta',
    enum: AccountType,
    example: AccountType.CHECKING,
  })
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty({
    description: 'Nome do banco',
    example: 'Banco do Brasil',
  })
  @IsString()
  bankName: string;

  @ApiProperty({
    description: 'Código do banco',
    example: '001',
  })
  @IsString()
  bankCode: string;
}
