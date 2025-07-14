import {
  Body,
  Controller,
  Inject,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginRequestDto } from '../dtos/auth/login.request.dto';
import { IAuthService } from '../services/auth.interface';
import { JwtAuthGuard } from '../../../common/guards/auth.guard';
import { IAuthenticatedUserRequestDto } from '../../../common/core/dtos/auth.request.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário' })
  @ApiResponse({ status: 201, description: 'Usuário autenticado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro de autenticação.' })
  @ApiBody({
    type: LoginRequestDto,
    description: 'Dados de autenticação do usuário',
  })
  async login(@Body() loginData: LoginRequestDto): Promise<string> {
    return await this.authService.login(loginData.email, loginData.password);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Deslogar usuário' })
  @ApiResponse({ status: 201, description: 'Usuário deslogado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro de logout.' })
  @UseGuards(JwtAuthGuard)
  async logout(
    @Request() req: { user: IAuthenticatedUserRequestDto },
  ): Promise<boolean> {
    return this.authService.logout(req.user);
  }
}
