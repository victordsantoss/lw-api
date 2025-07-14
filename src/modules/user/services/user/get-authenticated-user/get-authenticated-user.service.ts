import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IGetAuthenticatedUserService } from './get-authenticated-user.interface';
import { ISessionRepository } from '../../../../auth/repositories/session.repository.interface';

@Injectable()
export class GetAuthenticatedUserService
  implements IGetAuthenticatedUserService
{
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async perform(token: string): Promise<any> {
    return this.findActiveUserByToken(token);
  }

  private async findActiveUserByToken(token: string) {
    const user = await this.sessionRepository.findActiveUserByToken(token);

    if (!user) {
      throw new UnauthorizedException(
        `Token inválido ou sessão inativa. Verifique se o token fornecido é válido e tente novamente.`,
      );
    }
    return user;
  }
}
