import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { BasePaginationRequestDto } from '../../../../common/core/dtos/base-pagination.dto';
import {
  AccountType,
  AccountStatus,
} from '../../../../database/entities/account.entity';

export class ListAccountsRequestDto extends BasePaginationRequestDto {
  @ApiPropertyOptional({
    description: 'Tipo da conta para filtro',
    enum: AccountType,
    example: AccountType.CHECKING,
  })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @ApiPropertyOptional({
    description: 'Status da conta para filtro',
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  status?: AccountStatus;
}
