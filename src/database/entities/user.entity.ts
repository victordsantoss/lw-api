import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Session } from './session.entity';
import { Role } from './role.entity';
import { Account } from './account.entity';

export enum ProviderTypes {
  LOCAL = 'LOCAL',
}

@Entity({ name: 'tb_user' })
export class User {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    comment: 'ID único do usuário (UUID)',
  })
  id: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'Nome do usuário',
  })
  name: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'Nome da ação',
  })
  email: string;

  @Column({
    name: 'cpf',
    type: 'varchar',
    length: 14,
    nullable: false,
    comment: 'CPF do usuário (apenas números)',
  })
  cpf: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'Senha criptografada do usuário',
  })
  password: string;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: 'Se o usuário está ativo ou inativo',
  })
  isActive: boolean;

  @Column({
    name: 'provider',
    enum: ProviderTypes,
    default: ProviderTypes.LOCAL,
    nullable: false,
    comment: 'Provedor de autenticação (e.g., local, Google, Facebook)',
  })
  provider: ProviderTypes;

  @Column({
    name: 'birth_date',
    type: 'date',
    nullable: true,
    comment: 'Data de nascimento do usuário',
  })
  birthDate: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: 'Data de criação do usuário',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    comment: 'Data de última atualização do usuário',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    comment: 'Data de deleção lógica do usuário',
  })
  deletedAt: Date;

  /**
   * RELACIONAMENTOS
   */

  @OneToMany(() => Session, (session) => session.user, { cascade: true })
  sessions: Session[];

  @OneToMany(() => Account, (account) => account.user, { cascade: true })
  accounts: Account[];

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({
    name: 'id_role',
    referencedColumnName: 'id',
  })
  role: Role;
}
