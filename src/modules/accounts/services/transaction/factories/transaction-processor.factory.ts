import { Injectable, BadRequestException } from '@nestjs/common';
import { ITransactionProcessorFactory } from './transaction-processor.factory.interface';
import { ITransactionProcessor } from '../processors/transaction-processor.interface';
import { DepositProcessor } from '../processors/deposit-processor.service';
import { WithdrawProcessor } from '../processors/withdraw-processor.service';
import { TransferProcessor } from '../processors/transfer-processor.service';
import { EventType } from '../../../dtos/account/deposit.request.dto';

@Injectable()
export class TransactionProcessorFactory
  implements ITransactionProcessorFactory
{
  constructor(
    private readonly depositProcessor: DepositProcessor,
    private readonly withdrawProcessor: WithdrawProcessor,
    private readonly transferProcessor: TransferProcessor,
  ) {}

  createProcessor(eventType: EventType): ITransactionProcessor {
    switch (eventType) {
      case EventType.DEPOSIT:
        return this.depositProcessor;
      case EventType.WITHDRAW:
        return this.withdrawProcessor;
      case EventType.TRANSFER:
        return this.transferProcessor;
      default:
        throw new BadRequestException(
          `Tipo de evento não suportado: ${eventType}`,
        );
    }
  }
}
