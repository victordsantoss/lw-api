import { IUserResponseDto } from '../../../dtos/user/user.response.dto';

export interface IGetAuthenticatedUserService {
  perform(token: string): Promise<IUserResponseDto>;
}
