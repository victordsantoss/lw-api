import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Inject,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/auth.guard';
import { IListAccountsService } from '../../services/account/list-accounts/list-accounts.service.interface';
import { ICreateAccountService } from '../../services/account/create-account/create-account.service.interface';
import { IGetAccountBalanceService } from '../../services/account/get-account-balance/get-account-balance.service.interface';
import { ListAccountsRequestDto } from '../../dtos/account/list.request.dto';
import { ListAccountsResponseDto } from '../../dtos/account/list.response.dto';
import { CreateAccountRequestDto } from '../../dtos/account/create-account.request.dto';
import { CreateAccountResponseDto } from '../../dtos/account/create-account.response.dto';
import { GetBalanceResponseDto } from '../../dtos/account/get-balance.response.dto';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
  constructor(
    @Inject('IListAccountsService')
    private readonly listAccountsService: IListAccountsService,
    @Inject('ICreateAccountService')
    private readonly createAccountService: ICreateAccountService,
    @Inject('IGetAccountBalanceService')
    private readonly getAccountBalanceService: IGetAccountBalanceService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar contas de maneira paginada e filtrada' })
  @ApiResponse({
    status: 200,
    description: 'Lista de contas retornada com sucesso',
    type: ListAccountsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  async list(
    @Query() query: ListAccountsRequestDto,
    @Request() req: any,
  ): Promise<ListAccountsResponseDto> {
    return await this.listAccountsService.perform(req.user.id, query);
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obter saldo de uma conta específica' })
  @ApiQuery({
    name: 'account_id',
    description: 'ID da conta',
    required: true,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Saldo da conta retornado com sucesso',
    type: GetBalanceResponseDto,
  })
  async getBalance(
    @Query('account_id') accountId: string,
  ): Promise<GetBalanceResponseDto | number> {
    const balance = await this.getAccountBalanceService.perform(accountId);
    return { balance };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Criar conta bancária com saldo inicial' })
  @ApiResponse({
    status: 201,
    description: 'Conta criada com sucesso',
    type: CreateAccountResponseDto,
  })
  @ApiBody({
    type: CreateAccountRequestDto,
    description: 'Dados para criação da conta',
  })
  async createAccount(
    @Body() accountData: CreateAccountRequestDto,
    @Request() req: any,
  ): Promise<CreateAccountResponseDto> {
    return await this.createAccountService.perform(req.user.id, accountData);
  }
}
