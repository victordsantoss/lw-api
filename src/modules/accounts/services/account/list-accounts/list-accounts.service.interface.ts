import { ListAccountsRequestDto } from '../../../dtos/account/list.request.dto';
import { ListAccountsResponseDto } from '../../../dtos/account/list.response.dto';

export interface IListAccountsService {
  perform(
    userId: string,
    filters: ListAccountsRequestDto,
  ): Promise<ListAccountsResponseDto>;
}
