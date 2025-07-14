import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { CreateAccountService } from './create-account.service';
import { IAccountRepository } from '../../../repositories/account/account.repository.interface';
import { CreateAccountRequestDto } from '../../../dtos/account/create-account.request.dto';
import {
  Account,
  AccountType,
} from '../../../../../database/entities/account.entity';
import { TransactionType } from '../../../../../database/entities/account-statement.entity';

describe('CreateAccountService', () => {
  let service: CreateAccountService;
  let accountRepository: jest.Mocked<IAccountRepository>;

  const mockAccountRepository = {
    findUserAccountByAccountNumber: jest.fn(),
    createAccountWithInitialStatement: jest.fn(),
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAccountService,
        {
          provide: 'IAccountRepository',
          useValue: mockAccountRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<CreateAccountService>(CreateAccountService);
    accountRepository = module.get('IAccountRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('perform', () => {
    const userId = faker.string.uuid();
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

    const mockAccount: Account = {
      id: faker.string.uuid(),
      name: mockAccountData.name,
      accountNumber: mockAccountData.accountNumber,
      agency: mockAccountData.agency,
      accountType: mockAccountData.accountType,
      bankName: mockAccountData.bankName,
      bankCode: mockAccountData.bankCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Account;

    it('should create account successfully', async () => {
      // Arrange
      const expectedBalance = mockAccountData.balance;
      accountRepository.findUserAccountByAccountNumber.mockResolvedValue(null);
      accountRepository.createAccountWithInitialStatement.mockResolvedValue({
        account: mockAccount,
        balance: expectedBalance,
      });

      // Act
      const result = await service.perform(userId, mockAccountData);

      // Assert
      expect(
        accountRepository.findUserAccountByAccountNumber,
      ).toHaveBeenCalledWith(userId, mockAccountData.accountNumber);
      expect(
        accountRepository.createAccountWithInitialStatement,
      ).toHaveBeenCalledWith(mockAccountData, mockAccountData.balance, userId);
      expect(result).toEqual({
        destination: {
          id: mockAccount.id,
          balance: expectedBalance,
        },
      });
    });

    it('should throw BadRequestException when account already exists', async () => {
      // Arrange
      accountRepository.findUserAccountByAccountNumber.mockResolvedValue(
        mockAccount,
      );

      // Act & Assert
      await expect(service.perform(userId, mockAccountData)).rejects.toThrow(
        BadRequestException,
      );
      expect(
        accountRepository.findUserAccountByAccountNumber,
      ).toHaveBeenCalledWith(userId, mockAccountData.accountNumber);
      expect(
        accountRepository.createAccountWithInitialStatement,
      ).not.toHaveBeenCalled();
    });

    it('should call private validation method through public method', async () => {
      // Arrange - This tests the private method indirectly
      const existingAccount = { ...mockAccount, id: faker.string.uuid() };
      accountRepository.findUserAccountByAccountNumber.mockResolvedValue(
        existingAccount,
      );

      // Act & Assert
      await expect(service.perform(userId, mockAccountData)).rejects.toThrow(
        `Conta ${mockAccountData.accountNumber} já existe`,
      );
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      accountRepository.findUserAccountByAccountNumber.mockRejectedValue(
        repositoryError,
      );

      // Act & Assert
      await expect(service.perform(userId, mockAccountData)).rejects.toThrow(
        repositoryError,
      );
    });

    it('should map account response correctly', async () => {
      // Arrange
      const balance = 100.5;
      accountRepository.findUserAccountByAccountNumber.mockResolvedValue(null);
      accountRepository.createAccountWithInitialStatement.mockResolvedValue({
        account: mockAccount,
        balance,
      });

      // Act
      const result = await service.perform(userId, mockAccountData);

      // Assert - Testing the private mapAccountToResponse method indirectly
      expect(result).toHaveProperty('destination');
      expect(result.destination).toHaveProperty('id', mockAccount.id);
      expect(result.destination).toHaveProperty('balance', balance);
    });
  });
}); 