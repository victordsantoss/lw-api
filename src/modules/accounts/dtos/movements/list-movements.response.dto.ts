import { ApiProperty } from '@nestjs/swagger';
import { BasePaginationResponseDto } from '../../../../common/core/dtos/base-pagination.dto';
import { MovementResponseDto } from './movement.response.dto';

export class ListMovementsResponseDto extends BasePaginationResponseDto<MovementResponseDto> {
  @ApiProperty({
    description: 'Lista de movimentações',
    type: [MovementResponseDto],
  })
  data: MovementResponseDto[];
}
