import { ApiProperty } from '@nestjs/swagger';
import {
  TransactionType,
  TransactionCategory,
} from '../../../../database/entities/account-statement.entity';

export class MovementResponseDto {
  @ApiProperty({
    description: 'ID único da movimentação',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'ID da conta',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  accountId: string;

  @ApiProperty({
    description: 'Nome da conta',
    example: 'Conta Principal',
  })
  accountName: string;

  @ApiProperty({
    description: 'Número da conta',
    example: '123456789',
  })
  accountNumber: string;

  @ApiProperty({
    description: 'ID da conta de destino',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  destinationAccountId?: string;

  @ApiProperty({
    description: 'Nome da conta de destino',
    example: 'Conta Destino',
    required: false,
  })
  destinationAccountName?: string;

  @ApiProperty({
    description: 'Número da conta de destino',
    example: '987654321',
    required: false,
  })
  destinationAccountNumber?: string;

  @ApiProperty({
    description: 'Tipo da transação',
    enum: TransactionType,
    example: TransactionType.DEPOSIT,
  })
  transactionType: TransactionType;

  @ApiProperty({
    description: 'Categoria da transação',
    enum: TransactionCategory,
    example: TransactionCategory.DEPOSIT,
  })
  category: TransactionCategory;

  @ApiProperty({
    description: 'Valor da transação',
    example: 1000.5,
  })
  balance: number;

  @ApiProperty({
    description: 'Descrição da transação',
    example: 'Depósito via PIX',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Referência externa',
    example: 'PIX-123456',
    required: false,
  })
  externalReference?: string;

  @ApiProperty({
    description: 'Data e hora do processamento',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  processedAt?: Date;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;
}
