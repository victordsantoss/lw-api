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
export class TransferProcessor implements ITransactionProcessor {
  private readonly logger = new Logger(TransferProcessor.name);

  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
    @Inject('IStatementRepository')
    private readonly statementRepository: IStatementRepository,
  ) {}

  async process(eventData: DepositRequestDto): Promise<DepositResponseDto> {
    this.logger.log(
      `TransferProcessor.process: Processando transferência de ${eventData.balance} da conta ${
        eventData.origin
      } para conta ${eventData.destination}`,
    );

    this.validateAccounts(eventData);
    await this.validateIfAccountExists(eventData.origin);
    await this.validateIfAccountExists(eventData.destination);

    await this.validateAccountBalance(eventData.origin, eventData.balance);

    await this.statementRepository.create({
      originAccount: { id: eventData.origin } as Account,
      destinationAccount: { id: eventData.destination } as Account,
      transactionType: TransactionType.DEBIT,
      category: TransactionCategory.TRANSFER,
      balance: eventData.balance,
      description: `Transferência para conta ${eventData.destination}`,
      processedAt: new Date(),
    });

    const originBalance = await this.getCurrentBalance(eventData.origin);
    const destinationBalance = await this.getCurrentBalance(
      eventData.destination,
    );

    return this.mapResponse(eventData, originBalance, destinationBalance);
  }

  private mapResponse(
    eventData: DepositRequestDto,
    originBalance: number,
    destinationBalance: number,
  ): DepositResponseDto {
    return {
      origin: {
        id: eventData.origin,
        balance: originBalance,
      },
      destination: {
        id: eventData.destination,
        balance: destinationBalance,
      },
    };
  }

  private validateAccounts(eventData: DepositRequestDto): void {
    this.logger.log(
      `TransferProcessor.validateAccounts: Validando contas de origem e destino ${eventData.origin} e ${eventData.destination}`,
    );

    if (!eventData.origin) {
      throw new BadRequestException(
        'Campo origin é obrigatório para transferências',
      );
    }

    if (!eventData.destination) {
      throw new BadRequestException(
        'Campo destination é obrigatório para transferências',
      );
    }

    if (eventData.origin === eventData.destination) {
      throw new BadRequestException(
        'Conta de origem e destino não podem ser iguais',
      );
    }
  }

  private async validateIfAccountExists(accountId: string): Promise<void> {
    this.logger.log(
      `TransferProcessor.validateIfAccountExists: Validando se a conta ${accountId} existe`,
    );

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
    this.logger.log(
      `TransferProcessor.validateAccountBalance: Validando saldo da conta ${accountId}`,
    );

    const currentBalance =
      await this.statementRepository.getCurrentBalance(accountId);
    if (currentBalance < balance) {
      throw new BadRequestException(
        `Saldo insuficiente. Saldo atual: ${currentBalance}, valor solicitado: ${balance}`,
      );
    }
  }
}
