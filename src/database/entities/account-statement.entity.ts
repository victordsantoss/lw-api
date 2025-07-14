import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Account } from './account.entity';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT', // Crédito (entrada)
  DEBIT = 'DEBIT', // Débito (saída)
}

export enum TransactionCategory {
  DEPOSIT = 'DEPOSIT', // Depósito
  WITHDRAW = 'WITHDRAW', // Saque
  TRANSFER = 'TRANSFER', // Transferência recebida
  PAYMENT = 'PAYMENT', // Pagamento
  FEE = 'FEE', // Taxa
  INTEREST = 'INTEREST', // Juros
  REFUND = 'REFUND', // Estorno
  OTHER = 'OTHER', // Outros
}

@Entity({ name: 'tb_account_statement' })
@Index(['originAccount', 'createdAt'])
@Index(['destinationAccount', 'createdAt'])
export class AccountStatement {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    comment: 'ID único do extrato (UUID)',
  })
  id: string;

  @Column({
    name: 'transaction_type',
    type: 'enum',
    enum: TransactionType,
    nullable: false,
    comment: 'Tipo da transação (crédito ou débito)',
  })
  transactionType: TransactionType;

  @Column({
    name: 'category',
    type: 'enum',
    enum: TransactionCategory,
    nullable: false,
    comment: 'Categoria da transação',
  })
  category: TransactionCategory;

  @Column({
    name: 'balance',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: false,
    comment: 'Valor da transação',
  })
  balance: number;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'Descrição da transação',
  })
  description?: string;

  @Column({
    name: 'external_reference',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Referência externa (ex: número do documento)',
  })
  externalReference?: string;

  @Column({
    name: 'processed_at',
    type: 'timestamp',
    nullable: true,
    comment: 'Data e hora do processamento da transação',
  })
  processedAt?: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: 'Data de criação do registro',
  })
  createdAt: Date;

  /**
   * RELACIONAMENTOS
   */
  @ManyToOne(() => Account, (account) => account.originStatements)
  @JoinColumn({
    name: 'id_origin_account',
    referencedColumnName: 'id',
  })
  originAccount: Account;

  @ManyToOne(() => Account, (account) => account.destinationStatements)
  @JoinColumn({
    name: 'id_destination_account',
    referencedColumnName: 'id',
  })
  destinationAccount?: Account;
}
