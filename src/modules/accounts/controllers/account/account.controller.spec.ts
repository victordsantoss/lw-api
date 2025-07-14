import { Test, TestingModule } from '@nestjs/testing';
import { faker } from '@faker-js/faker';
import { AccountController } from './account.controller';
import { IListAccountsService } from '../../services/account/list-accounts/list-accounts.service.interface';
import { ICreateAccountService } from '../../services/account/create-account/create-account.service.interface';
import { IGetAccountBalanceService } from '../../services/account/get-account-balance/get-account-balance.service.interface';
import { ListAccountsRequestDto } from '../../dtos/account/list.request.dto';
import { CreateAccountRequestDto } from '../../dtos/account/create-account.request.dto';
import {
  AccountType,
  AccountStatus,
} from '../../../../database/entities/account.entity';
import { TransactionType } from '../../../../database/entities/account-statement.entity';

describe('AccountController', () => {
  let controller: AccountController;
  let listAccountsService: jest.Mocked<IListAccountsService>;
  let createAccountService: jest.Mocked<ICreateAccountService>;
  let getAccountBalanceService: jest.Mocked<IGetAccountBalanceService>;

  const mockListAccountsService = {
    perform: jest.fn(),
  };

  const mockCreateAccountService = {
    perform: jest.fn(),
  };

  const mockGetAccountBalanceService = {
    perform: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: 'IListAccountsService',
          useValue: mockListAccountsService,
        },
        {
          provide: 'ICreateAccountService',
          useValue: mockCreateAccountService,
        },
        {
          provide: 'IGetAccountBalanceService',
          useValue: mockGetAccountBalanceService,
        },
      ],
    }).compile();

    controller = module.get<AccountController>(AccountController);
    listAccountsService = module.get('IListAccountsService');
    createAccountService = module.get('ICreateAccountService');
    getAccountBalanceService = module.get('IGetAccountBalanceService');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    const mockUser = { id: faker.string.uuid() };
    const mockRequest = { user: mockUser };
    const mockQuery: ListAccountsRequestDto = {
      page: 1,
      limit: 10,
      accountType: AccountType.CHECKING,
    };

    const mockResponse = {
      data: [
        {
          id: faker.string.uuid(),
          name: faker.finance.accountName(),
          accountNumber: faker.finance.accountNumber(),
          agency: faker.finance.routingNumber(),
          accountType: AccountType.CHECKING,
          status: AccountStatus.ACTIVE,
          bankName: faker.company.name(),
          bankCode: faker.finance.bic(),
          balance: parseFloat(faker.finance.amount()),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };

    it('should list accounts successfully', async () => {
      // Arrange
      listAccountsService.perform.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.list(mockQuery, mockRequest);

      // Assert
      expect(listAccountsService.perform).toHaveBeenCalledWith(
        mockUser.id,
        mockQuery,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle service errors', async () => {
      // Arrange
      const serviceError = new Error('Service error');
      listAccountsService.perform.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.list(mockQuery, mockRequest)).rejects.toThrow(
        serviceError,
      );
    });
  });

  describe('createAccount', () => {
    const mockUser = { id: faker.string.uuid() };
    const mockRequest = { user: mockUser };
    const mockAccountData: CreateAccountRequestDto = {
      name: faker.finance.accountName(),
      accountNumber: faker.finance.accountNumber(),
      agency: faker.finance.routingNumber(),
      accountType: AccountType.CHECKING,
      bankName: faker.company.name(),
      bankCode: faker.finance.bic(),
      type: TransactionType.DEPOSIT,
      balance: parseFloat(faker.finance.amount()),
    };

    const mockResponse = {
      destination: {
        id: faker.string.uuid(),
        balance: mockAccountData.balance,
      },
    };

    it('should create account successfully', async () => {
      // Arrange
      createAccountService.perform.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.createAccount(
        mockAccountData,
        mockRequest,
      );

      // Assert
      expect(createAccountService.perform).toHaveBeenCalledWith(
        mockUser.id,
        mockAccountData,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle service errors during creation', async () => {
      // Arrange
      const serviceError = new Error('Account creation failed');
      createAccountService.perform.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(
        controller.createAccount(mockAccountData, mockRequest),
      ).rejects.toThrow(serviceError);
    });
  });

  describe('getBalance', () => {
    const accountId = faker.string.uuid();
    const mockBalance = 1500.75;

    it('should get account balance successfully', async () => {
      // Arrange
      getAccountBalanceService.perform.mockResolvedValue(mockBalance);

      // Act
      const result = await controller.getBalance(accountId);

      // Assert
      expect(getAccountBalanceService.perform).toHaveBeenCalledWith(accountId);
      expect(result).toEqual({ balance: mockBalance });
    });

    it('should handle service errors during balance retrieval', async () => {
      // Arrange
      const serviceError = new Error('Balance retrieval failed');
      getAccountBalanceService.perform.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.getBalance(accountId)).rejects.toThrow(
        serviceError,
      );
    });
  });

  describe('integration with services', () => {
    it('should delegate to services without business logic', async () => {
      // Arrange
      const mockUser = { id: faker.string.uuid() };
      const mockRequest = { user: mockUser };
      const mockQuery: ListAccountsRequestDto = {
        page: 1,
        limit: 5,
      };

      const mockResponse = {
        data: [],
        meta: { total: 0, page: 1, limit: 5, totalPages: 0 },
      };

      listAccountsService.perform.mockResolvedValue(mockResponse);

      // Act
      const result = await controller.list(mockQuery, mockRequest);

      // Assert - Verify controller acts as a thin layer
      expect(listAccountsService.perform).toHaveBeenCalledTimes(1);
      expect(listAccountsService.perform).toHaveBeenCalledWith(
        mockUser.id,
        mockQuery,
      );
      expect(result).toBe(mockResponse);
    });
  });
}); 