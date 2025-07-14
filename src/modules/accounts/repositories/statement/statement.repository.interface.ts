import { AccountStatement } from '../../../../database/entities/account-statement.entity';
import { IBaseRepository } from '../../../../common/core/repositories/base.repository.interface';
import { ListMovementsRequestDto } from '../../dtos/movements/list-movements.request.dto';

export interface IStatementRepository
  extends IBaseRepository<AccountStatement> {
  getCurrentBalance(accountId: string): Promise<number>;
  getStatementsByAccount(accountId: string): Promise<AccountStatement[]>;
  getLastStatement(accountId: string): Promise<AccountStatement | null>;
  findMovementsWithFilters(
    userId: string,
    filters: ListMovementsRequestDto,
  ): Promise<[AccountStatement[], number]>;
}
