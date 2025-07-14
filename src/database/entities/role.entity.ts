import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';

export enum RoleTypes {
  SADMIN = 'SADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
  MANAGER = 'MANAGER',
  GUEST = 'GUEST',
}

@Entity({ name: 'tb_role' })
export class Role {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    comment: 'ID único da Perfil (UUID)',
  })
  id: string;

  @Column({
    type: 'varchar',
    enum: RoleTypes,
    default: RoleTypes.USER,
    comment: 'Nome do perfil identificador do usuário',
  })
  name: RoleTypes;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: 'Se o usuário está ativo ou inativo',
  })
  isActive: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    comment: 'Data de criação do perfil',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    comment: 'Data de última atualização do perfil',
  })
  updatedAt: Date;

  /**
   * RELACIONAMENTOS
   */
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
