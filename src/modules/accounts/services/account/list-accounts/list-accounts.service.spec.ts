import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { ListAccountsService } from './list-accounts.service';
import { IAccountRepository } from '../../../repositories/account/account.repository.interface';
import { IStatementRepository } from '../../../repositories/statement/statement.repository.interface';
import { ListAccountsRequestDto } from '../../../dtos/account/list.request.dto';
import {
  Account,
  AccountType,
  AccountStatus,
} from '../../../../../database/entities/account.entity';

describe('ListAccountsService', () => {
  let service: ListAccountsService;
  let accountRepository: jest.Mocked<IAccountRepository>;
  let statementRepository: jest.Mocked<IStatementRepository>;

  beforeEach(async () => {
    const mockAccountRepository = {
      findByFilters: jest.fn(),
    };

    const mockStatementRepository = {
      getCurrentBalance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListAccountsService,
        { provide: 'IAccountRepository', useValue: mockAccountRepository },
        { provide: 'IStatementRepository', useValue: mockStatementRepository },
      ],
    }).compile();

    service = module.get<ListAccountsService>(ListAccountsService);
    accountRepository = module.get('IAccountRepository');
    statementRepository = module.get('IStatementRepository');

    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('perform', () => {
    it('should list accounts with pagination', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const filters: ListAccountsRequestDto = {
        page: 1,
        limit: 10,
        accountType: AccountType.CHECKING,
        status: AccountStatus.ACTIVE,
      };

      const mockAccount = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        accountNumber: faker.string.numeric(8),
        agency: faker.string.numeric(4),
        accountType: AccountType.CHECKING,
        status: AccountStatus.ACTIVE,
        bankName: faker.company.name(),
        bankCode: faker.string.numeric(3),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      } as Account;

      const mockBalance = parseFloat(
        faker.commerce.price({ min: 100, max: 10000 }),
      );
      const total = 1;

      accountRepository.findByFilters.mockResolvedValue([[mockAccount], total]);
      statementRepository.getCurrentBalance.mockResolvedValue(mockBalance);

      // Act
      const result = await service.perform(userId, filters);

      // Assert
      expect(accountRepository.findByFilters).toHaveBeenCalledWith(
        userId,
        filters,
      );
      expect(statementRepository.getCurrentBalance).toHaveBeenCalledWith(
        mockAccount.id,
      );
      expect(result).toEqual({
        data: [
          {
            id: mockAccount.id,
            name: mockAccount.name,
            accountNumber: mockAccount.accountNumber,
            agency: mockAccount.agency,
            accountType: mockAccount.accountType,
            status: mockAccount.status,
            bankName: mockAccount.bankName,
            bankCode: mockAccount.bankCode,
            balance: mockBalance,
            createdAt: mockAccount.createdAt,
            updatedAt: mockAccount.updatedAt,
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it('should use default pagination when not provided', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const filters: ListAccountsRequestDto = {};

      const mockAccount = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        accountNumber: faker.string.numeric(8),
        agency: faker.string.numeric(4),
        accountType: AccountType.SAVINGS,
        status: AccountStatus.ACTIVE,
        bankName: faker.company.name(),
        bankCode: faker.string.numeric(3),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      } as Account;

      const mockBalance = 0;
      const total = 1;

      accountRepository.findByFilters.mockResolvedValue([[mockAccount], total]);
      statementRepository.getCurrentBalance.mockResolvedValue(mockBalance);

      // Act
      const result = await service.perform(userId, filters);

      // Assert
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should handle empty account list', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const filters: ListAccountsRequestDto = { page: 1, limit: 10 };

      accountRepository.findByFilters.mockResolvedValue([[], 0]);

      // Act
      const result = await service.perform(userId, filters);

      // Assert
      expect(result).toEqual({
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it('should handle repository errors', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const filters: ListAccountsRequestDto = { page: 1, limit: 10 };

      accountRepository.findByFilters.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.perform(userId, filters)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle balance calculation errors', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const filters: ListAccountsRequestDto = { page: 1, limit: 10 };

      const mockAccount = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        accountNumber: faker.string.numeric(8),
        agency: faker.string.numeric(4),
        accountType: AccountType.CHECKING,
        status: AccountStatus.ACTIVE,
        bankName: faker.company.name(),
        bankCode: faker.string.numeric(3),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      } as Account;

      accountRepository.findByFilters.mockResolvedValue([[mockAccount], 1]);
      statementRepository.getCurrentBalance.mockRejectedValue(
        new Error('Balance calculation error'),
      );

      // Act & Assert
      await expect(service.perform(userId, filters)).rejects.toThrow(
        'Balance calculation error',
      );
    });

    it('should test private mapAccountToResponse through public interface', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const filters: ListAccountsRequestDto = { page: 1, limit: 10 };

      const mockAccounts = [
        {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          accountNumber: faker.string.numeric(8),
          agency: faker.string.numeric(4),
          accountType: AccountType.CHECKING,
          status: AccountStatus.ACTIVE,
          bankName: faker.company.name(),
          bankCode: faker.string.numeric(3),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
        {
          id: faker.string.uuid(),
          name: null, // Test null name handling
          accountNumber: faker.string.numeric(8),
          agency: faker.string.numeric(4),
          accountType: AccountType.SAVINGS,
          status: AccountStatus.INACTIVE,
          bankName: faker.company.name(),
          bankCode: faker.string.numeric(3),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      ] as Account[];

      const mockBalances = [1000, 2000];

      accountRepository.findByFilters.mockResolvedValue([mockAccounts, 2]);
      statementRepository.getCurrentBalance
        .mockResolvedValueOnce(mockBalances[0])
        .mockResolvedValueOnce(mockBalances[1]);

      // Act
      const result = await service.perform(userId, filters);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        id: mockAccounts[0].id,
        name: mockAccounts[0].name,
        accountNumber: mockAccounts[0].accountNumber,
        agency: mockAccounts[0].agency,
        accountType: mockAccounts[0].accountType,
        status: mockAccounts[0].status,
        bankName: mockAccounts[0].bankName,
        bankCode: mockAccounts[0].bankCode,
        balance: mockBalances[0],
        createdAt: mockAccounts[0].createdAt,
        updatedAt: mockAccounts[0].updatedAt,
      });
      expect(result.data[1].name).toBe(''); // Test null name handling
    });
  });
});