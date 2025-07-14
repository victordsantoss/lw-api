import {
  Controller,
  Get,
  Query,
  Inject,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../common/guards/auth.guard';
import { IListMovementsService } from '../../services/movements/list-movements.service.interface';
import { ListMovementsRequestDto } from '../../dtos/movements/list-movements.request.dto';
import { ListMovementsResponseDto } from '../../dtos/movements/list-movements.response.dto';

@ApiTags('Movements')
@Controller('movements')
export class MovementsController {
  constructor(
    @Inject('IListMovementsService')
    private readonly listMovementsService: IListMovementsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar movimentações/statements de contas',
    description:
      'Lista movimentações financeiras com filtros por conta, tipo, categoria, data e busca por nome/número da conta',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de movimentações retornada com sucesso',
    type: ListMovementsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado' })
  async list(
    @Query() query: ListMovementsRequestDto,
    @Request() req: any,
  ): Promise<ListMovementsResponseDto> {
    return await this.listMovementsService.perform(req.user.id, query);
  }
}
