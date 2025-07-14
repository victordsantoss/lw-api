import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { IGetAccountBalanceService } from './get-account-balance.service.interface';
import { IAccountRepository } from '../../../repositories/account/account.repository.interface';
import { IStatementRepository } from '../../../repositories/statement/statement.repository.interface';

@Injectable()
export class GetAccountBalanceService implements IGetAccountBalanceService {
  private readonly logger = new Logger(GetAccountBalanceService.name);

  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
    @Inject('IStatementRepository')
    private readonly statementRepository: IStatementRepository,
  ) {}

  async perform(accountId: string): Promise<number> {
    this.logger.log(
      `GetAccountBalanceService.perform: Obtendo saldo para conta ${accountId}`,
    );

    await this.validateIfAccountExists(accountId);

    const balance = await this.statementRepository.getCurrentBalance(accountId);

    this.logger.log(
      `GetAccountBalanceService.perform: Saldo da conta ${accountId}: ${balance}`,
    );

    return balance;
  }

  private async validateIfAccountExists(accountId: string): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }
  }
}
