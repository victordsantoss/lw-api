import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { Session } from './entities/session.entity';
import { Role } from './entities/role.entity';
import { Account } from './entities/account.entity';
import { AccountStatement } from './entities/account-statement.entity';

export const entities = [User, Session, Role, Account, AccountStatement];

export const createDataSource = () => {
  const port = process.env.DATABASE_PORT
    ? parseInt(process.env.DATABASE_PORT, 10)
    : 5432;

  return new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: true,
    entities,
  });
};

export const lwForFeature: EntityClassOrSchema[] = entities;
