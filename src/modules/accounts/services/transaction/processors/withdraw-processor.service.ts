import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ITransactionProcessor } from './transaction-processor.interface';
import { IAccountRepository } from '../../../repositories/account/account.repository.interface';
import { IStatementRepository } from '../../../repositories/statement/statement.repository.interface';
import { DepositRequestDto } from '../../../dtos/account/deposit.request.dto';
import { DepositResponseDto } from '../../../dtos/account/deposit.response.dto';
import { Account } from 'src/database/entities/account.entity';
import { TransactionType } from 'src/database/entities/account-statement.entity';
import { TransactionCategory } from 'src/database/entities/account-statement.entity';

@Injectable()
export class WithdrawProcessor implements ITransactionProcessor {
  private readonly logger = new Logger(WithdrawProcessor.name);

  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
    @Inject('IStatementRepository')
    private readonly statementRepository: IStatementRepository,
  ) { }

  async process(eventData: DepositRequestDto): Promise<DepositResponseDto> {
    if (!eventData.origin) {
      throw new BadRequestException('Campo origin é obrigatório para saques');
    }

    this.logger.log(
      `WithdrawProcessor.process: Processando saque de ${eventData.balance} da conta ${eventData.origin}`,
    );

    await this.validateIfAccountExists(eventData.origin);
    await this.validateAccountBalance(eventData.origin, eventData.balance);

    const currentBalance = await this.getCurrentBalance(eventData.origin);
    const newBalance = currentBalance - eventData.balance;

    await this.statementRepository.create({
      originAccount: { id: eventData.origin } as Account,
      transactionType: TransactionType.DEBIT,
      category: TransactionCategory.WITHDRAW,
      balance: eventData.balance,
      description: eventData.description || '',
      processedAt: new Date(),
    });

    return {
      origin: {
        id: eventData.origin,
        balance: newBalance,
      },
    };
  }

  private async validateIfAccountExists(accountId: string): Promise<void> {
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }
  }

  private async getCurrentBalance(accountId: string): Promise<number> {
    return await this.statementRepository.getCurrentBalance(accountId);
  }

  private async validateAccountBalance(
    accountId: string,
    balance: number,
  ): Promise<void> {
    const currentBalance =
      await this.statementRepository.getCurrentBalance(accountId);
    if (currentBalance < balance) {
      throw new BadRequestException(
        `Saldo insuficiente. Saldo atual: ${currentBalance}, valor solicitado: ${balance}`,
      );
    }
  }
}
