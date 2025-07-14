import { User } from '../../../../../database/entities/user.entity';
import { IUserResponseDto } from '../../../dtos/user/user.response.dto';

export interface IRegisterUserService {
  perform(user: Partial<User>): Promise<IUserResponseDto>;
}
