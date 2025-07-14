import { IBaseRepository } from '../../../common/core/repositories/base.repository.interface';
import { Session } from '../../../database/entities/session.entity';
import { CreateSessionRequestDto } from '../dtos/session/create-session.request.dto';
import { UpdateSessionRequestDto } from '../dtos/session/update-session.request.dto';
import { IGetAuthenticatedUserResponseDto } from '../../user/dtos/user/get-authenticated-user.response.dto';

export interface ISessionRepository
  extends IBaseRepository<
    Session,
    CreateSessionRequestDto,
    UpdateSessionRequestDto
  > {
  findActiveSessionsByUserId(userId: string): Promise<Session[]>;
  findActiveUserByToken(
    token: string,
  ): Promise<IGetAuthenticatedUserResponseDto>;
}
