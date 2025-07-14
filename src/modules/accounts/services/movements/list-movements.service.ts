import { Injectable, Inject, Logger } from '@nestjs/common';
import { IListMovementsService } from './list-movements.service.interface';
import { IStatementRepository } from '../../repositories/statement/statement.repository.interface';
import { ListMovementsRequestDto } from '../../dtos/movements/list-movements.request.dto';
import { ListMovementsResponseDto } from '../../dtos/movements/list-movements.response.dto';
import { MovementResponseDto } from '../../dtos/movements/movement.response.dto';

@Injectable()
export class ListMovementsService implements IListMovementsService {
  private readonly logger = new Logger(ListMovementsService.name);

  constructor(
    @Inject('IStatementRepository')
    private readonly statementRepository: IStatementRepository,
  ) {}

  async perform(
    userId: string,
    params: ListMovementsRequestDto,
  ): Promise<ListMovementsResponseDto> {
    this.logger.log(
      `ListMovementsService.perform: Listando movimentações para usuário ${userId}`,
    );

    const [statements, total] =
      await this.statementRepository.findMovementsWithFilters(userId, params);

    const limit = params.limit || 10;

    const data: MovementResponseDto[] = statements.map((statement) => ({
      id: statement.id,
      accountId: statement.originAccount?.id,
      accountName: statement.originAccount?.name,
      accountNumber: statement.originAccount?.accountNumber,
      destinationAccountId: statement.destinationAccount?.id,
      destinationAccountName: statement.destinationAccount?.name,
      destinationAccountNumber: statement.destinationAccount?.accountNumber,
      transactionType: statement.transactionType,
      category: statement.category,
      balance: statement.balance,
      description: statement.description,
      externalReference: statement.externalReference,
      processedAt: statement.processedAt,
      createdAt: statement.createdAt,
    }));

    return {
      data,
      meta: {
        total,
        page: params.page || 1,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
