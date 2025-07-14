import { DepositRequestDto } from '../../dtos/account/deposit.request.dto';
import { DepositResponseDto } from '../../dtos/account/deposit.response.dto';

export interface ITransactionEventService {
  perform(eventData: DepositRequestDto): Promise<DepositResponseDto>;
}
