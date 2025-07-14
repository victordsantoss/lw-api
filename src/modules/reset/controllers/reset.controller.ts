import { Controller, Post, Inject, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IResetService } from '../services/reset.service.interface';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@ApiTags('Reset')
@Controller('reset')
export class ResetController {
  constructor(
    @Inject('IResetService')
    private readonly resetService: IResetService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Limpar todos os dados do banco de dados' })
  @ApiResponse({
    status: 200,
    description: 'Banco de dados limpo com sucesso',
  })
  async reset(): Promise<void> {
    await this.resetService.perform();
  }
}
