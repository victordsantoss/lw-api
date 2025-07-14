import {
  Repository,
  EntityTarget,
  DataSource,
  DeepPartial,
  UpdateResult,
} from 'typeorm';
import { IBaseRepository } from './base.repository.interface';

export abstract class BaseRepository<
  Entity,
  CreateInput extends DeepPartial<Entity> = DeepPartial<Entity>,
  UpdateInput = DeepPartial<Entity>,
> implements IBaseRepository<Entity, CreateInput, UpdateInput>
{
  protected readonly repository: Repository<Entity>;

  constructor(
    protected readonly dataSource: DataSource,
    protected readonly entity: EntityTarget<Entity>,
  ) {
    this.repository = this.dataSource.getRepository(this.entity);
  }

  public async findAll(): Promise<Entity[]> {
    return this.repository.find();
  }

  public async findById(id: string): Promise<Entity | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  public async create(data: CreateInput): Promise<Entity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  public async update(id: string, data: any): Promise<UpdateResult> {
    return this.repository.update(id, data);
  }
  public async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  public async findOneBy<K extends keyof Entity>(
    field: K,
    value: Entity[K],
  ): Promise<Entity | null> {
    return this.repository.findOne({ where: { [field]: value } as any });
  }

  public async deleteAll(): Promise<void> {
    await this.repository.clear();
  }
}
