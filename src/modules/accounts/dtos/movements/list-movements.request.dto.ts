import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsString,
} from 'class-validator';
import { BasePaginationRequestDto } from '../../../../common/core/dtos/base-pagination.dto';
import {
  TransactionType,
  TransactionCategory,
} from '../../../../database/entities/account-statement.entity';

export class ListMovementsRequestDto extends BasePaginationRequestDto {
  @ApiPropertyOptional({
    description: 'ID da conta para filtro',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  accountId?: string;

  @ApiPropertyOptional({
    description: 'Tipo da transação para filtro',
    enum: TransactionType,
    example: TransactionType.DEPOSIT,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  transactionType?: TransactionType;

  @ApiPropertyOptional({
    description: 'Categoria da transação para filtro',
    enum: TransactionCategory,
    example: TransactionCategory.DEPOSIT,
  })
  @IsOptional()
  @IsEnum(TransactionCategory)
  category?: TransactionCategory;

  @ApiPropertyOptional({
    description: 'Data inicial para filtro (formato ISO)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Data final para filtro (formato ISO)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Buscar por nome ou número da conta',
    example: 'Conta Principal',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
