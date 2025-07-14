import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '../../../common/core/repositories/base.repository';
import { ISessionRepository } from './session.repository.interface';
import { Session } from '../../../database/entities/session.entity';
import { IGetAuthenticatedUserResponseDto } from '../../user/dtos/user/get-authenticated-user.response.dto';

@Injectable()
export class SessionRepository
  extends BaseRepository<Session>
  implements ISessionRepository
{
  constructor(dataSource: DataSource) {
    super(dataSource, Session);
  }

  async findActiveSessionsByUserId(userId: string): Promise<Session[]> {
    return this.repository.find({
      where: {
        user: { id: userId },
        endDate: null,
        isActive: true,
      },
      relations: ['user'],
    });
  }

  async findActiveUserByToken(
    token: string,
  ): Promise<IGetAuthenticatedUserResponseDto> {
    return this.repository.findOne({
      where: {
        token: token,
        endDate: null,
        isActive: true,
      },
      relations: ['user', 'user.role'],
      select: {
        id: true,
        token: true,
        isActive: true,
        startDate: true,
        endDate: true,
        user: {
          name: true,
          email: true,
          cpf: true,
          provider: true,
          birthDate: true,
          createdAt: true,
          updatedAt: true,
          role: {
            name: true,
            id: true,
          },
        },
      },
    });
  }
}
