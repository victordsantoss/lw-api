import { Account } from '../../../../database/entities/account.entity';
import { IBaseRepository } from '../../../../common/core/repositories/base.repository.interface';
import { ListAccountsRequestDto } from '../../dtos/account/list.request.dto';
import { CreateAccountRequestDto } from '../../dtos/account/create-account.request.dto';

export interface IAccountRepository extends IBaseRepository<Account> {
  findByFilters(
    userId: string,
    filters: ListAccountsRequestDto,
  ): Promise<[Account[], number]>;

  findUserAccountByAccountNumber(
    userId: string,
    accountNumber: string,
  ): Promise<Account | null>;

  createAccountWithInitialStatement(
    accountData: CreateAccountRequestDto,
    balance: number,
    userId: string,
  ): Promise<{ account: Account; balance: number }>;
}
