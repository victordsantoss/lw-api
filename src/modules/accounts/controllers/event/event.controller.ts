import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ITransactionEventService } from '../../services/transaction/transaction-event.service.interface';
import { DepositRequestDto } from '../../dtos/account/deposit.request.dto';
import { DepositResponseDto } from '../../dtos/account/deposit.response.dto';

@ApiTags('Events')
@Controller('event')
export class EventController {
  constructor(
    @Inject('ITransactionEventService')
    private readonly transactionEventService: ITransactionEventService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Processar eventos de depósito, saque e transferência',
  })
  @ApiResponse({
    status: 201,
    description: 'Transação realizada com sucesso',
    type: DepositResponseDto,
  })
  @ApiBody({
    type: DepositRequestDto,
    description: 'Dados do evento de transação',
  })
  async processEvent(
    @Body() eventData: DepositRequestDto,
  ): Promise<DepositResponseDto> {
    return await this.transactionEventService.perform(eventData);
  }
}
