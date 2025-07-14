import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../database/entities/account.entity';
import { AccountStatement } from '../../database/entities/account-statement.entity';
import { AccountController } from './controllers/account/account.controller';
import { EventController } from './controllers/event/event.controller';
import { MovementsController } from './controllers/movements/movements.controller';
import { AccountRepository } from './repositories/account/account.repository';
import { StatementRepository } from './repositories/statement/statement.repository';
import { ListAccountsService } from './services/account/list-accounts/list-accounts.service';
import { CreateAccountService } from './services/account/create-account/create-account.service';
import { GetAccountBalanceService } from './services/account/get-account-balance/get-account-balance.service';
import { ListMovementsService } from './services/movements/list-movements.service';
import { TransactionEventService } from './services/transaction/transaction-event.service';
import { DepositProcessor } from './services/transaction/processors/deposit-processor.service';
import { WithdrawProcessor } from './services/transaction/processors/withdraw-processor.service';
import { TransferProcessor } from './services/transaction/processors/transfer-processor.service';
import { TransactionProcessorFactory } from './services/transaction/factories/transaction-processor.factory';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, AccountStatement], 'lw'),
    CommonModule,
  ],
  controllers: [AccountController, EventController, MovementsController],
  providers: [
    {
      provide: 'IAccountRepository',
      useClass: AccountRepository,
    },
    {
      provide: 'IStatementRepository',
      useClass: StatementRepository,
    },
    {
      provide: 'IListAccountsService',
      useClass: ListAccountsService,
    },
    {
      provide: 'ICreateAccountService',
      useClass: CreateAccountService,
    },
    {
      provide: 'IGetAccountBalanceService',
      useClass: GetAccountBalanceService,
    },
    {
      provide: 'ITransactionEventService',
      useClass: TransactionEventService,
    },
    {
      provide: 'ITransactionProcessorFactory',
      useClass: TransactionProcessorFactory,
    },
    {
      provide: 'IListMovementsService',
      useClass: ListMovementsService,
    },
    DepositProcessor,
    WithdrawProcessor,
    TransferProcessor,
  ],
})
export class AccountsModule {}
