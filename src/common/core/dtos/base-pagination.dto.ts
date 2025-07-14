import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class BasePaginationRequestDto {
  @ApiPropertyOptional({
    description: 'Número da página para paginação',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Limite de registros por página',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Parâmetro de Ordenação',
    example: '',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({
    description: 'Parâmetro que define a direção da ordenação',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'], {
    message: 'A direção da ordenação deve ser ASC ou DESC',
  })
  sortBy?: 'ASC' | 'DESC';
}

export class PaginationMeta {
  @ApiProperty({
    description: 'Limite de registros por página',
    example: 100,
  })
  @IsNumber()
  limit: number;

  @ApiProperty({
    description: 'Número da página atual',
    example: 10,
  })
  @IsNumber()
  page: number;

  @ApiProperty({
    description: 'Número total de registros',
    example: 1,
  })
  @IsNumber()
  total: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 10,
  })
  @IsNumber()
  totalPages: number;
}

export class BasePaginationResponseDto<T> {
  @ApiProperty({
    description: 'Lista de itens da página atual',
    isArray: true,
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: true,
    },
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Object)
  data: T[];

  @ApiProperty({
    description: 'Metadados da paginação',
    type: PaginationMeta,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => PaginationMeta)
  meta: PaginationMeta;
}
