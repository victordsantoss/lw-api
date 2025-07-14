import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IResetService } from './reset.service.interface';
import { AccountStatement } from '../../../database/entities/account-statement.entity';
import { Account } from '../../../database/entities/account.entity';
import { User } from '../../../database/entities/user.entity';
import { Session } from 'src/database/entities/session.entity';

@Injectable()
export class ResetService implements IResetService {
  private readonly logger = new Logger(ResetService.name);

  constructor(private readonly dataSource: DataSource) {}

  async perform(): Promise<void> {
    this.logger.log(
      'ResetService.perform: Iniciando limpeza do banco de dados',
    );

    await this.dataSource.transaction(async (manager) => {
      await manager.deleteAll(AccountStatement);
      this.logger.log('ResetService.perform: Tabela account_statement limpa');

      await manager.deleteAll(Account);
      this.logger.log('ResetService.perform: Tabela accounts limpa');

      await manager.deleteAll(User);
      this.logger.log('ResetService.perform: Tabela users limpa');

      await manager.deleteAll(Session);
      this.logger.log('ResetService.perform: Tabela sessions limpa');
    });

    this.logger.log(
      'ResetService.perform: Limpeza do banco de dados concluída',
    );
  }
}
