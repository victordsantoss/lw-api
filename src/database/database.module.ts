import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { createDataSource } from './data-source';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: 'lw',
      useFactory: () => {
        const dataSource = createDataSource();
        return {
          ...dataSource.options,
          autoLoadEntities: true,
        };
      },
      dataSourceFactory: async () => {
        const dataSource = createDataSource();
        if (!dataSource.isInitialized) {
          await dataSource.initialize();
        }
        return dataSource;
      },
    }),
  ],
  providers: [
    {
      provide: DataSource,
      useFactory: async () => {
        const dataSource = createDataSource();
        if (!dataSource.isInitialized) {
          await dataSource.initialize();
        }
        return dataSource;
      },
    },
  ],
  exports: [TypeOrmModule, DataSource],
})
export class DatabaseModule {}
