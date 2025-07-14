import { IBaseRepository } from '../../../../common/core/repositories/base.repository.interface';
import { User } from '../../../../database/entities/user.entity';
import { IRegisterUserRequestDto } from '../../dtos/user/register.request.dto';

export interface IUserRepository
  extends IBaseRepository<User, IRegisterUserRequestDto> {}
