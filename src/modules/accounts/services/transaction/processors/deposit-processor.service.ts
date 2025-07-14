import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { ITransactionProcessor } from './transaction-processor.interface';
import { IStatementRepository } from '../../../repositories/statement/statement.repository.interface';
import { DepositRequestDto } from '../../../dtos/account/deposit.request.dto';
import { DepositResponseDto } from '../../../dtos/account/deposit.response.dto';
import { IAccountRepository } from '../../../repositories/account/account.repository.interface';
import { TransactionCategory } from '../../../../../database/entities/account-statement.entity';
import { TransactionType } from '../../../../../database/entities/account-statement.entity';
import { Account } from '../../../../../database/entities/account.entity';

@Injectable()
export class DepositProcessor implements ITransactionProcessor {
  private readonly logger = new Logger(DepositProcessor.name);

  constructor(
    @Inject('IStatementRepository')
    private readonly statementRepository: IStatementRepository,
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) { }

  async process(eventData: DepositRequestDto): Promise<DepositResponseDto> {
    this.logger.log(
      `DepositProcessor.process: Processando depósito de ${eventData.balance} para conta ${eventData.destination}`,
    );

    await this.validateIfAccountExists(eventData.destination);

    await this.statementRepository.create({
      destinationAccount: { id: eventData.destination } as Account,
      transactionType: TransactionType.DEPOSIT,
      category: TransactionCategory.DEPOSIT,
      balance: eventData.balance,
      description: 'Depósito via evento',
      processedAt: new Date(),
    });

    const currentBalance = await this.getCurrentBalance(eventData.destination);

    return {
      destination: {
        id: eventData.destination,
        balance: currentBalance,
      },
    };
  }

  private async getCurrentBalance(accountId: string): Promise<number> {
    return await this.statementRepository.getCurrentBalance(accountId);
  }

  private async validateIfAccountExists(accountId: string): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }
  }
}
