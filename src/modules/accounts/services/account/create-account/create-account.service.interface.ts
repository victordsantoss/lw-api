import { CreateAccountRequestDto } from '../../../dtos/account/create-account.request.dto';
import { CreateAccountResponseDto } from '../../../dtos/account/create-account.response.dto';

export interface ICreateAccountService {
  perform(
    userId: string,
    accountData: CreateAccountRequestDto,
  ): Promise<CreateAccountResponseDto>;
}
