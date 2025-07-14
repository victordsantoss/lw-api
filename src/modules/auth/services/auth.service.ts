import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IAuthService } from './auth.interface';
import { IUserRepository } from '../../user/repositories/user/user.repository.interface';
import { IPasswordService } from '../../password/services/password.interface';
import { JwtService } from '@nestjs/jwt';
import { Cache } from '@nestjs/cache-manager';
import { ISessionRepository } from '../repositories/session.repository.interface';
import { IAuthenticatedUserRequestDto } from '../../../common/core/dtos/auth.request.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject('CACHE_MANAGER') private readonly cacheManager: Cache,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    @Inject('IPasswordService')
    private readonly passwordService: IPasswordService,
    private readonly jwtService: JwtService,
  ) {}

  public async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findOneBy('email', email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isPasswordValid = await this.passwordService.validatePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const existingSessions =
      await this.sessionRepository.findActiveSessionsByUserId(user.id);

    if (existingSessions.length > 0) {
      for (const session of existingSessions) {
        session.endDate = new Date();
        session.isActive = false;
        await this.sessionRepository.update(session.id, session);
      }
    }
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);
    await this.sessionRepository.create({
      user,
      token: token,
      startDate: new Date(),
    });
    return token;
  }

  public async logout(
    authenticatedUserData: IAuthenticatedUserRequestDto,
  ): Promise<boolean> {
    const tokenExpiration = this.jwtService.decode(authenticatedUserData.token)[
      'exp'
    ];
    await this.cacheManager.set(
      `blacklist:${authenticatedUserData.token}`,
      true,
      tokenExpiration - Math.floor(Date.now() / 1000),
    );

    const currSession = await this.sessionRepository.findOneBy(
      'token',
      authenticatedUserData.token,
    );

    currSession.endDate = new Date();
    currSession.isActive = false;

    await this.sessionRepository.update(currSession.id, currSession);
    return true;
  }
}
