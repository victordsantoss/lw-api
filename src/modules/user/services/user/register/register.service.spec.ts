import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { RegisterUserService } from './register.service';
import { IUserRepository } from '../../../repositories/user/user.repository.interface';
import { IPasswordService } from '../../../../password/services/password.interface';
import { IGetRoleService } from '../../../../access-control/services/role/get-role/get-role.service.interface';
import { IRegisterUserRequestDto } from '../../../dtos/user/register.request.dto';
import {
  User,
  ProviderTypes,
} from '../../../../../database/entities/user.entity';
import { Role, RoleTypes } from '../../../../../database/entities/role.entity';

describe('RegisterUserService', () => {
  let service: RegisterUserService;
  let userRepository: jest.Mocked<IUserRepository>;
  let passwordService: jest.Mocked<IPasswordService>;
  let getRoleService: jest.Mocked<IGetRoleService>;

  beforeEach(async () => {
    const mockUserRepository = {
      findOneBy: jest.fn(),
      create: jest.fn(),
    };

    const mockPasswordService = {
      createHash: jest.fn(),
    };

    const mockGetRoleService = {
      perform: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserService,
        { provide: 'IUserRepository', useValue: mockUserRepository },
        { provide: 'IPasswordService', useValue: mockPasswordService },
        { provide: 'IGetRoleService', useValue: mockGetRoleService },
      ],
    }).compile();

    service = module.get<RegisterUserService>(RegisterUserService);
    userRepository = module.get('IUserRepository');
    passwordService = module.get('IPasswordService');
    getRoleService = module.get('IGetRoleService');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('perform', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const userData: IRegisterUserRequestDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        cpf: faker.string.numeric(11),
        password: faker.internet.password(),
      };

      const mockRole = {
        id: faker.string.uuid(),
        name: RoleTypes.USER,
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        users: [],
      } as Role;

      const mockHashedPassword = faker.string.alphanumeric(60);

      const mockCreatedUser = {
        id: faker.string.uuid(),
        name: userData.name,
        email: userData.email,
        cpf: userData.cpf,
        password: mockHashedPassword,
        role: mockRole,
        provider: ProviderTypes.LOCAL,
        isActive: true,
        birthDate: faker.date.birthdate(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deletedAt: null,
        sessions: [],
        accounts: [],
      } as User;

      userRepository.findOneBy.mockResolvedValue(null);
      passwordService.createHash.mockResolvedValue(mockHashedPassword);
      getRoleService.perform.mockResolvedValue(mockRole);
      userRepository.create.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await service.perform(userData);

      // Assert
      expect(userRepository.findOneBy).toHaveBeenCalledWith(
        'email',
        userData.email,
      );
      expect(userRepository.findOneBy).toHaveBeenCalledWith(
        'cpf',
        userData.cpf,
      );
      expect(passwordService.createHash).toHaveBeenCalledWith(
        expect.any(String),
      );
      expect(getRoleService.perform).toHaveBeenCalledWith(RoleTypes.USER);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: mockHashedPassword,
        role: mockRole,
      });
      expect(result).toEqual({
        name: mockCreatedUser.name,
        email: mockCreatedUser.email,
        cpf: mockCreatedUser.cpf,
        role: mockCreatedUser.role,
        provider: mockCreatedUser.provider,
        birthDate: mockCreatedUser.birthDate,
        createdAt: mockCreatedUser.createdAt,
        updatedAt: mockCreatedUser.updatedAt,
      });
    });

    it('should throw BadRequestException when email already exists', async () => {
      // Arrange
      const userData: IRegisterUserRequestDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        cpf: faker.string.numeric(11),
        password: faker.internet.password(),
      };

      const existingUser = {
        id: faker.string.uuid(),
        email: userData.email,
      } as User;

      userRepository.findOneBy.mockResolvedValueOnce(existingUser);

      // Act & Assert
      await expect(service.perform(userData)).rejects.toThrow(
        new BadRequestException('Usuário com este Email já existe'),
      );
      expect(userRepository.findOneBy).toHaveBeenCalledWith(
        'email',
        userData.email,
      );
    });

    it('should throw BadRequestException when CPF already exists', async () => {
      // Arrange
      const userData: IRegisterUserRequestDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        cpf: faker.string.numeric(11),
        password: faker.internet.password(),
      };

      const existingUser = {
        id: faker.string.uuid(),
        cpf: userData.cpf,
      } as User;

      userRepository.findOneBy
        .mockResolvedValueOnce(null) // Email check
        .mockResolvedValueOnce(existingUser); // CPF check

      // Act & Assert
      await expect(service.perform(userData)).rejects.toThrow(
        new BadRequestException('Usuário com este CPF já existe'),
      );
      expect(userRepository.findOneBy).toHaveBeenCalledWith(
        'email',
        userData.email,
      );
      expect(userRepository.findOneBy).toHaveBeenCalledWith(
        'cpf',
        userData.cpf,
      );
    });

    it('should test private findUserByEmail through public interface', async () => {
      // Arrange
      const userData: IRegisterUserRequestDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        cpf: faker.string.numeric(11),
        password: faker.internet.password(),
      };

      const existingUser = {
        id: faker.string.uuid(),
        email: userData.email,
      } as User;

      userRepository.findOneBy.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.perform(userData)).rejects.toThrow(
        'Usuário com este Email já existe',
      );
      expect(userRepository.findOneBy).toHaveBeenCalledWith(
        'email',
        userData.email,
      );
    });

    it('should test private findUserByCpf through public interface', async () => {
      // Arrange
      const userData: IRegisterUserRequestDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        cpf: faker.string.numeric(11),
        password: faker.internet.password(),
      };

      const existingUser = {
        id: faker.string.uuid(),
        cpf: userData.cpf,
      } as User;

      userRepository.findOneBy
        .mockResolvedValueOnce(null) // Email check passes
        .mockResolvedValueOnce(existingUser); // CPF check fails

      // Act & Assert
      await expect(service.perform(userData)).rejects.toThrow(
        'Usuário com este CPF já existe',
      );
      expect(userRepository.findOneBy).toHaveBeenCalledWith(
        'cpf',
        userData.cpf,
      );
    });

    it('should test private normalizeResponse through public interface', async () => {
      // Arrange
      const userData: IRegisterUserRequestDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        cpf: faker.string.numeric(11),
        password: faker.internet.password(),
      };

      const mockRole = {
        id: faker.string.uuid(),
        name: RoleTypes.USER,
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        users: [],
      } as Role;

      const mockCreatedUser = {
        id: faker.string.uuid(),
        name: userData.name,
        email: userData.email,
        cpf: userData.cpf,
        password: faker.string.alphanumeric(60),
        role: mockRole,
        provider: ProviderTypes.LOCAL,
        isActive: true,
        birthDate: faker.date.birthdate(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        deletedAt: null,
        sessions: [],
        accounts: [],
      } as User;

      userRepository.findOneBy.mockResolvedValue(null);
      passwordService.createHash.mockResolvedValue(
        faker.string.alphanumeric(60),
      );
      getRoleService.perform.mockResolvedValue(mockRole);
      userRepository.create.mockResolvedValue(mockCreatedUser);

      // Act
      const result = await service.perform(userData);

      // Assert - Testing private normalizeResponse method
      expect(result).toEqual({
        name: mockCreatedUser.name,
        email: mockCreatedUser.email,
        cpf: mockCreatedUser.cpf,
        role: mockCreatedUser.role,
        provider: mockCreatedUser.provider,
        birthDate: mockCreatedUser.birthDate,
        createdAt: mockCreatedUser.createdAt,
        updatedAt: mockCreatedUser.updatedAt,
      });
      expect(result).not.toHaveProperty('id');
      expect(result).not.toHaveProperty('password');
    });

    it('should handle password service errors', async () => {
      // Arrange
      const userData: IRegisterUserRequestDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        cpf: faker.string.numeric(11),
        password: faker.internet.password(),
      };

      userRepository.findOneBy.mockResolvedValue(null);
      passwordService.createHash.mockRejectedValue(new Error('Hash error'));

      // Act & Assert
      await expect(service.perform(userData)).rejects.toThrow('Hash error');
    });

    it('should handle role service errors', async () => {
      // Arrange
      const userData: IRegisterUserRequestDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        cpf: faker.string.numeric(11),
        password: faker.internet.password(),
      };

      userRepository.findOneBy.mockResolvedValue(null);
      passwordService.createHash.mockResolvedValue(
        faker.string.alphanumeric(60),
      );
      getRoleService.perform.mockRejectedValue(new Error('Role not found'));

      // Act & Assert
      await expect(service.perform(userData)).rejects.toThrow('Role not found');
    });

    it('should handle user creation errors', async () => {
      // Arrange
      const userData: IRegisterUserRequestDto = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        cpf: faker.string.numeric(11),
        password: faker.internet.password(),
      };

      const mockRole = {
        id: faker.string.uuid(),
        name: RoleTypes.USER,
        isActive: true,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        users: [],
      } as Role;

      userRepository.findOneBy.mockResolvedValue(null);
      passwordService.createHash.mockResolvedValue(
        faker.string.alphanumeric(60),
      );
      getRoleService.perform.mockResolvedValue(mockRole);
      userRepository.create.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.perform(userData)).rejects.toThrow('Database error');
    });
  });

  describe('emailField getter', () => {
    it('should return email field name', () => {
      // Act
      const result = service.emailField;

      // Assert
      expect(result).toBe('email');
    });
  });
}); 