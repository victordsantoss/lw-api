import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CpfValidator } from './core/utils/cpf.utils';
import { JwtAuthStrategy } from './strategy/jwt-auth.strategy';
import { JwtAuthGuard } from './guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../database/entities/session.entity';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt-auth' }),
    JwtModule,
    TypeOrmModule.forFeature([Session], 'lw'),
  ],
  providers: [JwtAuthStrategy, JwtAuthGuard, CpfValidator],
  exports: [JwtAuthStrategy, JwtAuthGuard, CpfValidator],
})
export class CommonModule {}
