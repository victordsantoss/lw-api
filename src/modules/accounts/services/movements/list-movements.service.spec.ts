import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { ListMovementsService } from './list-movements.service';
import { IStatementRepository } from '../../repositories/statement/statement.repository.interface';
import { ListMovementsRequestDto } from '../../dtos/movements/list-movements.request.dto';
import {
  TransactionType,
  TransactionCategory,
} from '../../../../database/entities/account-statement.entity';

describe('ListMovementsService', () => {
  let service: ListMovementsService;
  let statementRepository: jest.Mocked<IStatementRepository>;

  beforeEach(async () => {
    const mockStatementRepository = {
      findMovementsWithFilters: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListMovementsService,
        {
          provide: 'IStatementRepository',
          useValue: mockStatementRepository,
        },
      ],
    }).compile();

    service = module.get<ListMovementsService>(ListMovementsService);
    statementRepository = module.get('IStatementRepository');

    jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('perform', () => {
    it('should list movements with pagination and filters', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const params: ListMovementsRequestDto = {
        page: 1,
        limit: 10,
        accountId: faker.string.uuid(),
        transactionType: TransactionType.DEPOSIT,
        category: TransactionCategory.DEPOSIT,
        startDate: faker.date.past().toISOString(),
        endDate: faker.date.recent().toISOString(),
        search: faker.lorem.word(),
      };

      const mockOriginAccount = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        accountNumber: faker.string.numeric(8),
      };

      const mockDestinationAccount = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        accountNumber: faker.string.numeric(8),
      };

      const mockStatement = {
        id: faker.string.uuid(),
        originAccount: mockOriginAccount,
        destinationAccount: mockDestinationAccount,
        transactionType: TransactionType.DEPOSIT,
        category: TransactionCategory.DEPOSIT,
        balance: parseFloat(faker.commerce.price({ min: 100, max: 10000 })),
        description: faker.lorem.sentence(),
        externalReference: faker.string.uuid(),
        processedAt: faker.date.recent(),
        createdAt: faker.date.past(),
      };

      const total = 1;

      statementRepository.findMovementsWithFilters.mockResolvedValue([
        [mockStatement as any],
        total,
      ]);

      // Act
      const result = await service.perform(userId, params);

      // Assert
      expect(statementRepository.findMovementsWithFilters).toHaveBeenCalledWith(
        userId,
        params,
      );
      expect(result).toEqual({
        data: [
          {
            id: mockStatement.id,
            accountId: mockStatement.originAccount?.id,
            accountName: mockStatement.originAccount?.name,
            accountNumber: mockStatement.originAccount?.accountNumber,
            destinationAccountId: mockStatement.destinationAccount?.id,
            destinationAccountName: mockStatement.destinationAccount?.name,
            destinationAccountNumber:
              mockStatement.destinationAccount?.accountNumber,
            transactionType: mockStatement.transactionType,
            category: mockStatement.category,
            balance: mockStatement.balance,
            description: mockStatement.description,
            externalReference: mockStatement.externalReference,
            processedAt: mockStatement.processedAt,
            createdAt: mockStatement.createdAt,
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    it('should use default pagination when not provided', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const params: ListMovementsRequestDto = {};

      const mockOriginAccount = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        accountNumber: faker.string.numeric(8),
      };

      const mockStatement = {
        id: faker.string.uuid(),
        originAccount: mockOriginAccount,
        destinationAccount: null,
        transactionType: TransactionType.DEBIT,
        category: TransactionCategory.WITHDRAW,
        balance: parseFloat(faker.commerce.price({ min: 100, max: 10000 })),
        description: faker.lorem.sentence(),
        externalReference: faker.string.uuid(),
        processedAt: faker.date.recent(),
        createdAt: faker.date.past(),
      };

      statementRepository.findMovementsWithFilters.mockResolvedValue([
        [mockStatement as any],
        1,
      ]);

      // Act
      const result = await service.perform(userId, params);

      // Assert
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should handle empty movements list', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const params: ListMovementsRequestDto = { page: 1, limit: 10 };

      statementRepository.findMovementsWithFilters.mockResolvedValue([[], 0]);

      // Act
      const result = await service.perform(userId, params);

      // Assert
      expect(result).toEqual({
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
    });

    it('should handle null destination account', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const params: ListMovementsRequestDto = { page: 1, limit: 10 };

      const mockOriginAccount = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        accountNumber: faker.string.numeric(8),
      };

      const mockStatement = {
        id: faker.string.uuid(),
        originAccount: mockOriginAccount,
        destinationAccount: null,
        transactionType: TransactionType.DEBIT,
        category: TransactionCategory.WITHDRAW,
        balance: parseFloat(faker.commerce.price({ min: 100, max: 10000 })),
        description: faker.lorem.sentence(),
        externalReference: faker.string.uuid(),
        processedAt: faker.date.recent(),
        createdAt: faker.date.past(),
      };

      statementRepository.findMovementsWithFilters.mockResolvedValue([
        [mockStatement as any],
        1,
      ]);

      // Act
      const result = await service.perform(userId, params);

      // Assert
      expect(result.data[0]).toEqual({
        id: mockStatement.id,
        accountId: mockStatement.originAccount?.id,
        accountName: mockStatement.originAccount?.name,
        accountNumber: mockStatement.originAccount?.accountNumber,
        destinationAccountId: undefined,
        destinationAccountName: undefined,
        destinationAccountNumber: undefined,
        transactionType: mockStatement.transactionType,
        category: mockStatement.category,
        balance: mockStatement.balance,
        description: mockStatement.description,
        externalReference: mockStatement.externalReference,
        processedAt: mockStatement.processedAt,
        createdAt: mockStatement.createdAt,
      });
    });

    it('should handle repository errors', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const params: ListMovementsRequestDto = { page: 1, limit: 10 };

      statementRepository.findMovementsWithFilters.mockRejectedValue(
        new Error('Database error'),
      );

      // Act & Assert
      await expect(service.perform(userId, params)).rejects.toThrow(
        'Database error',
      );
    });

    it('should handle multiple movements with different transaction types', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const params: ListMovementsRequestDto = { page: 1, limit: 10 };

      const mockOriginAccount1 = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        accountNumber: faker.string.numeric(8),
      };

      const mockOriginAccount2 = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        accountNumber: faker.string.numeric(8),
      };

      const mockDestinationAccount = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        accountNumber: faker.string.numeric(8),
      };

      const mockStatements = [
        {
          id: faker.string.uuid(),
          originAccount: mockOriginAccount1,
          destinationAccount: null,
          transactionType: TransactionType.DEPOSIT,
          category: TransactionCategory.DEPOSIT,
          balance: 1000,
          description: faker.lorem.sentence(),
          externalReference: faker.string.uuid(),
          processedAt: faker.date.recent(),
          createdAt: faker.date.past(),
        },
        {
          id: faker.string.uuid(),
          originAccount: mockOriginAccount2,
          destinationAccount: mockDestinationAccount,
          transactionType: TransactionType.DEBIT,
          category: TransactionCategory.TRANSFER,
          balance: 2000,
          description: faker.lorem.sentence(),
          externalReference: faker.string.uuid(),
          processedAt: faker.date.recent(),
          createdAt: faker.date.past(),
        },
      ];

      statementRepository.findMovementsWithFilters.mockResolvedValue([
        mockStatements as any,
        2,
      ]);

      // Act
      const result = await service.perform(userId, params);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data[0].transactionType).toBe(TransactionType.DEPOSIT);
      expect(result.data[1].transactionType).toBe(TransactionType.DEBIT);
      expect(result.data[0].destinationAccountId).toBeUndefined();
      expect(result.data[1].destinationAccountId).toBe(
        mockStatements[1].destinationAccount?.id,
      );
    });

    it('should calculate correct total pages', async () => {
      // Arrange
      const userId = faker.string.uuid();
      const params: ListMovementsRequestDto = { page: 1, limit: 5 };

      const mockOriginAccount = {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        accountNumber: faker.string.numeric(8),
      };

      const mockStatements = Array.from({ length: 3 }, () => ({
        id: faker.string.uuid(),
        originAccount: mockOriginAccount,
        destinationAccount: null,
        transactionType: TransactionType.DEPOSIT,
        category: TransactionCategory.DEPOSIT,
        balance: parseFloat(faker.commerce.price({ min: 100, max: 10000 })),
        description: faker.lorem.sentence(),
        externalReference: faker.string.uuid(),
        processedAt: faker.date.recent(),
        createdAt: faker.date.past(),
      }));

      statementRepository.findMovementsWithFilters.mockResolvedValue([
        mockStatements as any,
        13, // Total of 13 records
      ]);

      // Act
      const result = await service.perform(userId, params);

      // Assert
      expect(result.meta).toEqual({
        total: 13,
        page: 1,
        limit: 5,
        totalPages: 3, // ceil(13/5) = 3
      });
    });
  });
}); 