import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IRegisterUserRequestDto } from '../../../dtos/user/register.request.dto';
import { IUserRepository } from '../../../repositories/user/user.repository.interface';
import { IUserResponseDto } from '../../../dtos/user/user.response.dto';
import { User } from '../../../../../database/entities/user.entity';
import { IRegisterUserService } from './register.interface';
import { IPasswordService } from '../../../../password/services/password.interface';
import { IGetRoleService } from '../../../../access-control/services/role/get-role/get-role.service.interface';
import { RoleTypes } from '../../../../../database/entities/role.entity';

@Injectable()
export class RegisterUserService implements IRegisterUserService {
  private readonly _emailField: keyof User = 'email';
  private readonly _cpfField: keyof User = 'cpf';

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPasswordService')
    private readonly passwordService: IPasswordService,
    @Inject('IGetRoleService')
    private readonly getRoleService: IGetRoleService,
  ) {}

  async perform(userData: IRegisterUserRequestDto): Promise<IUserResponseDto> {
    await this.findUserByEmail(userData.email);
    await this.findUserByCpf(userData.cpf);
    userData.password = await this.passwordService.createHash(
      userData.password,
    );
    const role = await this.getRoleService.perform(RoleTypes.USER);
    userData.role = role;
    const createdUser = await this.userRepository.create(userData);
    return this.normalizeResponse(createdUser);
  }

  private async findUserByEmail(email: string) {
    const existingUserByEmail = await this.userRepository.findOneBy(
      this.emailField,
      email,
    );
    if (existingUserByEmail) {
      throw new BadRequestException('Usuário com este Email já existe');
    }
  }

  private async findUserByCpf(cpf: string) {
    const existingUserByCpf = await this.userRepository.findOneBy(
      this._cpfField,
      cpf,
    );
    if (existingUserByCpf) {
      throw new BadRequestException('Usuário com este CPF já existe');
    }
  }

  private normalizeResponse(user: User): IUserResponseDto {
    return {
      name: user.name,
      email: user.email,
      cpf: user.cpf,
      role: user.role,
      provider: user.provider,
      birthDate: user.birthDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  get emailField(): keyof User {
    return this._emailField;
  }
}
