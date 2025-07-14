import { ApiProperty } from '@nestjs/swagger';
import { BasePaginationResponseDto } from '../../../../common/core/dtos/base-pagination.dto';
import { IAccountResponseDto } from './account.response.dto';

export class ListAccountsResponseDto extends BasePaginationResponseDto<IAccountResponseDto> {
  @ApiProperty({
    description: 'Lista de contas',
    type: [IAccountResponseDto],
  })
  data: IAccountResponseDto[];
}
