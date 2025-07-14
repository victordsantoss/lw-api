import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AccountStatement,
  TransactionType,
  TransactionCategory,
} from '../../../../database/entities/account-statement.entity';
import { IStatementRepository } from './statement.repository.interface';
import { BaseRepository } from '../../../../common/core/repositories/base.repository';
import { ListMovementsRequestDto } from '../../dtos/movements/list-movements.request.dto';

@Injectable()
export class StatementRepository
  extends BaseRepository<AccountStatement>
  implements IStatementRepository
{
  private readonly logger = new Logger(StatementRepository.name);

  constructor(dataSource: DataSource) {
    super(dataSource, AccountStatement);
  }

  async getCurrentBalance(accountId: string): Promise<number> {
    this.logger.log(
      `StatementRepository.getCurrentBalance: Obtendo saldo atual para conta ${accountId}`,
    );

    const currentBalanceResult = await this.repository
      .createQueryBuilder('statement')
      .select(
        `COALESCE(
          SUM(
            CASE 
              -- Caso 1: Conta é destino + DEPOSIT = +balance (entrou dinheiro)
              WHEN statement.id_destination_account = :accountId AND statement.transaction_type = :deposit 
                THEN statement.balance
              
              -- Caso 2: Conta é origem + DEBIT (não transfer) = -balance (saiu dinheiro)
              WHEN statement.id_origin_account = :accountId AND statement.transaction_type = :debit AND statement.category != :transfer
                THEN -statement.balance
              
              -- Caso 3: Conta é destino + TRANSFER = +balance (entrou dinheiro)
              WHEN statement.id_destination_account = :accountId AND statement.category = :transfer 
                THEN statement.balance
              
              -- Caso 4: Conta é origem + TRANSFER = -balance (saiu dinheiro)
              WHEN statement.id_origin_account = :accountId AND statement.category = :transfer 
                THEN -statement.balance
              
              ELSE 0
            END
          ), 0
        )`,
        'balance',
      )
      .where(
        '(statement.id_origin_account = :accountId OR statement.id_destination_account = :accountId)',
        { accountId },
      )
      .setParameters({
        accountId,
        deposit: TransactionType.DEPOSIT,
        debit: TransactionType.DEBIT,
        transfer: TransactionCategory.TRANSFER,
      })
      .getRawOne();

    return parseFloat(currentBalanceResult?.balance || '0');
  }

  async getStatementsByAccount(accountId: string): Promise<AccountStatement[]> {
    this.logger.log(
      `StatementRepository.getStatementsByAccount: Obtendo statements para conta ${accountId}`,
    );

    return this.repository.find({
      where: [
        { originAccount: { id: accountId } },
        { destinationAccount: { id: accountId } },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getLastStatement(accountId: string): Promise<AccountStatement | null> {
    this.logger.log(
      `StatementRepository.getLastStatement: Obtendo último statement para conta ${accountId}`,
    );

    return this.repository.findOne({
      where: [
        { originAccount: { id: accountId } },
        { destinationAccount: { id: accountId } },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findMovementsWithFilters(
    userId: string,
    filters: ListMovementsRequestDto,
  ): Promise<[AccountStatement[], number]> {
    this.logger.log(
      `StatementRepository.findMovementsWithFilters: Buscando movimentações com filtros para usuário ${userId}`,
    );

    const queryBuilder = this.repository
      .createQueryBuilder('statement')
      .leftJoinAndSelect('statement.originAccount', 'originAccount')
      .leftJoinAndSelect('statement.destinationAccount', 'destinationAccount')
      .where(
        '(originAccount.id_user = :userId OR destinationAccount.id_user = :userId)',
        { userId },
      );

    // Filtro por conta específica
    if (filters.accountId) {
      queryBuilder.andWhere(
        '(statement.id_origin_account = :accountId OR statement.id_destination_account = :accountId)',
        { accountId: filters.accountId },
      );
    }

    // Filtro por tipo de transação
    if (filters.transactionType) {
      queryBuilder.andWhere('statement.transaction_type = :transactionType', {
        transactionType: filters.transactionType,
      });
    }

    // Filtro por categoria
    if (filters.category) {
      queryBuilder.andWhere('statement.category = :category', {
        category: filters.category,
      });
    }

    // Filtro por data inicial
    if (filters.startDate) {
      queryBuilder.andWhere('statement.created_at >= :startDate', {
        startDate: filters.startDate,
      });
    }

    // Filtro por data final
    if (filters.endDate) {
      queryBuilder.andWhere('statement.created_at <= :endDate', {
        endDate: filters.endDate,
      });
    }

    // Busca por nome ou número da conta (origem ou destino)
    if (filters.search) {
      queryBuilder.andWhere(
        '(originAccount.name ILIKE :search OR originAccount.account_number ILIKE :search OR destinationAccount.name ILIKE :search OR destinationAccount.account_number ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Ordenação
    queryBuilder.orderBy('statement.created_at', 'DESC');

    // Paginação
    const limit = filters.limit || 10;
    const offset = ((filters.page || 1) - 1) * limit;

    return await queryBuilder.limit(limit).offset(offset).getManyAndCount();
  }
}
