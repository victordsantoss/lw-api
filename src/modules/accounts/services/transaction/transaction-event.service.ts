import { Injectable, Logger, Inject } from '@nestjs/common';
import { ITransactionEventService } from './transaction-event.service.interface';
import { ITransactionProcessorFactory } from './factories/transaction-processor.factory.interface';
import { DepositRequestDto } from '../../dtos/account/deposit.request.dto';
import { DepositResponseDto } from '../../dtos/account/deposit.response.dto';

@Injectable()
export class TransactionEventService implements ITransactionEventService {
  private readonly logger = new Logger(TransactionEventService.name);

  constructor(
    @Inject('ITransactionProcessorFactory')
    private readonly transactionProcessorFactory: ITransactionProcessorFactory,
  ) {}

  async perform(eventData: DepositRequestDto): Promise<DepositResponseDto> {
    this.logger.log(
      `TransactionEventService.perform: Processando evento ${eventData.type}`,
    );

    const processor = this.transactionProcessorFactory.createProcessor(
      eventData.type,
    );

    return await processor.process(eventData);
  }
}
