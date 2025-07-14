import { DeepPartial, UpdateResult } from 'typeorm';

export interface IBaseRepository<
  Entity,
  CreateInput = DeepPartial<Entity>,
  UpdateInput = DeepPartial<Entity>,
> {
  findAll(): Promise<Entity[]>;
  findById(id: string): Promise<Entity | null>;
  create(data: CreateInput): Promise<Entity>;
  update(id: string, data: UpdateInput): Promise<UpdateResult>;
  delete(id: string): Promise<void>;
  findOneBy<K extends keyof Entity>(
    field: K,
    value: Entity[K],
  ): Promise<Entity | null>;
}
