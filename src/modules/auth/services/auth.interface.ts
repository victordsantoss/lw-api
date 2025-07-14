import { IAuthenticatedUserRequestDto } from '../../../common/core/dtos/auth.request.dto';

export interface IAuthService {
  login(email: string, password: string): Promise<string>;
  logout(authenticatedUserData: IAuthenticatedUserRequestDto): Promise<boolean>;
}
