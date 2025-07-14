import { ListMovementsRequestDto } from '../../dtos/movements/list-movements.request.dto';
import { ListMovementsResponseDto } from '../../dtos/movements/list-movements.response.dto';

export interface IListMovementsService {
  perform(
    userId: string,
    params: ListMovementsRequestDto,
  ): Promise<ListMovementsResponseDto>;
}
