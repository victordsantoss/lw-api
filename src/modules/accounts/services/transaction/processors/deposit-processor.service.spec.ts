import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { DepositProcessor } from './deposit-processor.service';
import { IStatementRepository } from '../../../repositories/statement/statement.repository.interface';
import { IAccountRepository } from '../../../repositories/account/account.repository.interface';
import {
  DepositRequestDto,
  EventType,
} from '../../../dtos/account/deposit.request.dto';
import { Account } from '../../../../../database/entities/account.entity';
import {
  TransactionType,
  TransactionCategory,
} from '../../../../../database/entities/account-statement.entity';

describe('DepositProcessor', () => {
  let processor: DepositProcessor;
  let statementRepository: jest.Mocked<IStatementRepository>;
  let accountRepository: jest.Mocked<IAccountRepository>;

  const mockStatementRepository = {
    create: jest.fn(),
    getCurrentBalance: jest.fn(),
  };

  const mockAccountRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepositProcessor,
        {
          provide: 'IStatementRepository',
          useValue: mockStatementRepository,
        },
        {
          provide: 'IAccountRepository',
          useValue: mockAccountRepository,
        },
      ],
    }).compile();

    processor = module.get<DepositProcessor>(DepositProcessor);
    statementRepository = module.get('IStatementRepository');
    accountRepository = module.get('IAccountRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('process', () => {
    const mockEventData: DepositRequestDto = {
      type: EventType.DEPOSIT,
      destination: faker.string.uuid(),
      balance: parseFloat(faker.finance.amount()),
    };

    const mockAccount: Account = {
      id: mockEventData.destination,
      accountNumber: faker.finance.accountNumber(),
      name: faker.finance.accountName(),
    } as Account;

    it('should process deposit successfully', async () => {
      // Arrange
      const currentBalance = 1000.0;
      accountRepository.findById.mockResolvedValue(mockAccount);
      statementRepository.getCurrentBalance.mockResolvedValue(currentBalance);

      // Act
      const result = await processor.process(mockEventData);

      // Assert
      expect(accountRepository.findById).toHaveBeenCalledWith(
        mockEventData.destination,
      );
      expect(statementRepository.create).toHaveBeenCalledWith({
        destinationAccount: { id: mockEventData.destination },
        transactionType: TransactionType.DEPOSIT,
        category: TransactionCategory.DEPOSIT,
        balance: mockEventData.balance,
        description: 'Depósito via evento',
        processedAt: expect.any(Date),
      });
      expect(statementRepository.getCurrentBalance).toHaveBeenCalledWith(
        mockEventData.destination,
      );
      expect(result).toEqual({
        destination: {
          id: mockEventData.destination,
          balance: currentBalance,
        },
      });
    });

    it('should throw NotFoundException when account does not exist', async () => {
      // Arrange
      accountRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(processor.process(mockEventData)).rejects.toThrow(
        NotFoundException,
      );
      expect(accountRepository.findById).toHaveBeenCalledWith(
        mockEventData.destination,
      );
      expect(statementRepository.create).not.toHaveBeenCalled();
    });

    it('should test private validation method through public method', async () => {
      // Arrange - This tests the private validateIfAccountExists method
      accountRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(processor.process(mockEventData)).rejects.toThrow(
        'Conta não encontrada',
      );
    });

    it('should test private getCurrentBalance method through public method', async () => {
      // Arrange - This tests the private getCurrentBalance method
      const expectedBalance = 2500.75;
      accountRepository.findById.mockResolvedValue(mockAccount);
      statementRepository.getCurrentBalance.mockResolvedValue(expectedBalance);

      // Act
      const result = await processor.process(mockEventData);

      // Assert - Testing the private method indirectly
      expect(result.destination.balance).toBe(expectedBalance);
      expect(statementRepository.getCurrentBalance).toHaveBeenCalledWith(
        mockEventData.destination,
      );
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      accountRepository.findById.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(processor.process(mockEventData)).rejects.toThrow(
        repositoryError,
      );
    });

    it('should create statement with correct transaction data', async () => {
      // Arrange
      const currentBalance = 500.0;
      accountRepository.findById.mockResolvedValue(mockAccount);
      statementRepository.getCurrentBalance.mockResolvedValue(currentBalance);

      // Act
      await processor.process(mockEventData);

      // Assert - Verify the statement creation with specific data
      expect(statementRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          destinationAccount: { id: mockEventData.destination },
          transactionType: TransactionType.DEPOSIT,
          category: TransactionCategory.DEPOSIT,
          balance: mockEventData.balance,
          description: 'Depósito via evento',
        }),
      );
    });
  });
}); 