import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-strategy';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../../database/entities/session.entity';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt-auth') {
  constructor(
    @InjectRepository(Session, 'lw')
    private readonly sessionRepository: Repository<Session>,
  ) {
    super();
  }

  authenticate(req: Request): void {
    const authHeader = req.headers.authorization || req.headers.cookie;

    if (!authHeader) {
      return this.error(new UnauthorizedException('Token não fornecido'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return this.error(new UnauthorizedException('Token inválido'));
    }
    this.sessionRepository
      .findOne({ where: { token, isActive: true }, relations: { user: true } })
      .then((session) => {
        if (!session) {
          return this.error(
            new UnauthorizedException(
              'Sessão expirada. Autentique-se novamente',
            ),
          );
        }
        return this.success({ id: session.user.id, token });
      })
      .catch(() => {
        return this.error(new NotFoundException('Usuário não encontrado'));
      });
  }
}
