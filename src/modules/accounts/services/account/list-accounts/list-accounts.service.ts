import { Injectable, Inject, Logger } from '@nestjs/common';
import { IListAccountsService } from './list-accounts.service.interface';
import { IAccountRepository } from '../../../repositories/account/account.repository.interface';
import { ListAccountsRequestDto } from '../../../dtos/account/list.request.dto';
import { ListAccountsResponseDto } from '../../../dtos/account/list.response.dto';
import { IAccountResponseDto } from '../../../dtos/account/account.response.dto';
import { Account } from '../../../../../database/entities/account.entity';
import { IStatementRepository } from 'src/modules/accounts/repositories/statement/statement.repository.interface';

@Injectable()
export class ListAccountsService implements IListAccountsService {
  private readonly logger = new Logger(ListAccountsService.name);

  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
    @Inject('IStatementRepository')
    private readonly statementRepository: IStatementRepository,
  ) {}

  async perform(
    userId: string,
    filters: ListAccountsRequestDto,
  ): Promise<ListAccountsResponseDto> {
    this.logger.log(
      `ListAccountsService.perform: Listando contas para o usuário ${userId}`,
    );

    const [data, total] = await this.accountRepository.findByFilters(
      userId,
      filters,
    );

    return {
      data: await this.mapAccountToResponse(data),
      meta: {
        page: filters.page || 1,
        limit: filters.limit || 10,
        total,
        totalPages: Math.ceil(total / (filters.limit || 10)),
      },
    };
  }

  private async mapAccountToResponse(
    accounts: Account[],
  ): Promise<IAccountResponseDto[]> {
    this.logger.log(
      'ListAccountsService.mapAccountToResponse: Mapeando contas para response',
    );

    return Promise.all(
      accounts.map(async (account) => ({
        id: account.id,
        name: account.name || '',
        accountNumber: account.accountNumber,
        agency: account.agency,
        accountType: account.accountType,
        status: account.status,
        bankName: account.bankName,
        bankCode: account.bankCode,
        balance: await this.statementRepository.getCurrentBalance(account.id),
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })),
    );
  }
}
