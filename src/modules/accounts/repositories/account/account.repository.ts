import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Account,
  AccountStatus,
} from '../../../../database/entities/account.entity';
import { IAccountRepository } from './account.repository.interface';
import { BaseRepository } from '../../../../common/core/repositories/base.repository';
import { ListAccountsRequestDto } from '../../dtos/account/list.request.dto';
import { CreateAccountRequestDto } from '../../dtos/account/create-account.request.dto';
import { User } from 'src/database/entities/user.entity';
import {
  AccountStatement,
  TransactionCategory,
  TransactionType,
} from 'src/database/entities/account-statement.entity';

@Injectable()
export class AccountRepository
  extends BaseRepository<Account>
  implements IAccountRepository {
  private readonly logger = new Logger(AccountRepository.name);

  constructor(dataSource: DataSource) {
    super(dataSource, Account);
  }

  async findByFilters(
    userId: string,
    filters: ListAccountsRequestDto,
  ): Promise<[Account[], number]> {
    this.logger.log('AccountRepository.findByFilters: Aplicando filtros');

    const {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      sortBy = 'DESC',
      accountType,
      status,
    } = filters;

    const qb = this.repository
      .createQueryBuilder('account')
      .select([
        'account.id',
        'account.name',
        'account.accountNumber',
        'account.agency',
        'account.accountType',
        'account.status',

        'account.bankName',
        'account.bankCode',
        'account.createdAt',
        'account.updatedAt',
      ]);

    if (accountType) {
      qb.andWhere('account.accountType = :accountType', { accountType });
    }

    if (status) {
      qb.andWhere('account.status = :status', { status });
    }

    if (userId) {
      qb.andWhere('account.id_user = :userId', { userId });
    }

    qb.orderBy(`account.${orderBy}`, sortBy.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return qb.getManyAndCount();
  }

  async findUserAccountByAccountNumber(
    userId: string,
    accountNumber: string,
  ): Promise<Account | null> {
    return this.repository.findOne({
      where: { accountNumber, user: { id: userId } },
    });
  }

  async createAccountWithInitialStatement(
    accountData: CreateAccountRequestDto,
    balance: number,
    userId: string,
  ): Promise<{ account: Account; balance: number }> {
    return this.dataSource.transaction(async (manager) => {
      const account = await manager.save(Account, {
        accountNumber: accountData.accountNumber,
        agency: accountData.agency,
        accountType: accountData.accountType,
        status: AccountStatus.ACTIVE,
        bankName: accountData.bankName,
        bankCode: accountData.bankCode,
        user: { id: userId } as User,
      });

      if (balance > 0) {
        await manager.save(AccountStatement, {
          destinationAccount: account,
          balance: balance || 0,
          transactionType: TransactionType.DEPOSIT,
          category: TransactionCategory.DEPOSIT,
          description: 'Depósito inicial',
          processedAt: new Date(),
        });
      }
      return {
        account,
        balance,
      };
    });
  }
}
