import { DepositRequestDto } from '../../../dtos/account/deposit.request.dto';
import { DepositResponseDto } from '../../../dtos/account/deposit.response.dto';

export interface ITransactionProcessor {
  process(eventData: DepositRequestDto): Promise<DepositResponseDto>;
}
