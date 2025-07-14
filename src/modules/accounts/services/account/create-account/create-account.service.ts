import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ICreateAccountService } from './create-account.service.interface';
import { IAccountRepository } from '../../../repositories/account/account.repository.interface';
import { CreateAccountRequestDto } from '../../../dtos/account/create-account.request.dto';
import { CreateAccountResponseDto } from '../../../dtos/account/create-account.response.dto';
import { Account } from 'src/database/entities/account.entity';
import { AccountStatement } from 'src/database/entities/account-statement.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class CreateAccountService implements ICreateAccountService {
  private readonly logger = new Logger(CreateAccountService.name);
  private _userId: string;

  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
    private readonly dataSource: DataSource,
  ) {}

  async perform(
    userId: string,
    accountData: CreateAccountRequestDto,
  ): Promise<CreateAccountResponseDto> {
    this.userId = userId;
    this.logger.log(
      `CreateAccountService.perform: Criando conta ${accountData.accountNumber} para usuário ${userId}`,
    );

    await this.validateIfAccountAlreadyExists(
      userId,
      accountData.accountNumber,
    );

    const { account, balance } =
      await this.accountRepository.createAccountWithInitialStatement(
        accountData,
        accountData.balance,
        userId,
      );

    return this.mapAccountToResponse(account, balance);
  }

  private async validateIfAccountAlreadyExists(
    userId: string,
    accountNumber: string,
  ): Promise<void> {
    this.logger.log(
      `CreateAccountService.validateIfAccountAlreadyExists: Validando se a conta ${accountNumber} já existe para o usuário ${userId}`,
    );

    const account = await this.accountRepository.findUserAccountByAccountNumber(
      userId,
      accountNumber,
    );

    if (account) {
      throw new BadRequestException(`Conta ${accountNumber} já existe`);
    }
  }

  private mapAccountToResponse(
    account: Account,
    balance: number,
  ): CreateAccountResponseDto {
    this.logger.log(
      `CreateAccountService.mapAccountToResponse: Mapeando conta ${account.id} para response`,
    );

    return {
      destination: {
        id: account.id,
        balance,
      },
    };
  }

  get userId(): string {
    return this._userId;
  }

  set userId(userId: string) {
    this._userId = userId;
  }
}
