import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { AccountStatement } from './account-statement.entity';

export enum AccountType {
  CHECKING = 'CHECKING', // Conta corrente
  SAVINGS = 'SAVINGS', // Poupança
  BUSINESS = 'BUSINESS', // Conta empresarial
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  CLOSED = 'CLOSED',
}

@Unique(['accountNumber', 'agency', 'user.id'])
@Entity({ name: 'tb_account' })
export class Account {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    comment: 'ID único da conta (UUID)',
  })
  id: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Nome ou apelido da conta',
  })
  name: string;

  @Column({
    name: 'account_number',
    type: 'varchar',
    length: 20,
    nullable: false,
    comment: 'Número da conta bancária',
  })
  accountNumber: string;

  @Column({
    name: 'agency',
    type: 'varchar',
    length: 10,
    nullable: false,
    comment: 'Agência da conta',
  })
  agency: string;

  @Column({
    name: 'account_type',
    type: 'enum',
    enum: AccountType,
    default: AccountType.CHECKING,
    nullable: false,
    comment: 'Tipo da conta (corrente, poupança, empresarial)',
  })
  accountType: AccountType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
    nullable: false,
    comment: 'Status da conta',
  })
  status: AccountStatus;

  @Column({
    name: 'bank_name',
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: 'Nome do banco',
  })
  bankName: string;

  @Column({
    name: 'bank_code',
    type: 'varchar',
    length: 10,
    nullable: false,
    comment: 'Código do banco',
  })
  bankCode: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: 'Data de criação da conta',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    comment: 'Data de última atualização da conta',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    comment: 'Data de deleção lógica da conta',
  })
  deletedAt: Date;

  /**
   * RELACIONAMENTOS
   */
  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({
    name: 'id_user',
    referencedColumnName: 'id',
  })
  user: User;

  @OneToMany(() => AccountStatement, (statement) => statement.originAccount, {
    cascade: true,
  })
  originStatements: AccountStatement[];

  @OneToMany(
    () => AccountStatement,
    (statement) => statement.destinationAccount,
    {
      cascade: true,
    },
  )
  destinationStatements: AccountStatement[];
}
