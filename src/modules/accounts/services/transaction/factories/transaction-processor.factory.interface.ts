import { ITransactionProcessor } from '../processors/transaction-processor.interface';
import { EventType } from '../../../dtos/account/deposit.request.dto';

export interface ITransactionProcessorFactory {
  createProcessor(eventType: EventType): ITransactionProcessor;
}
