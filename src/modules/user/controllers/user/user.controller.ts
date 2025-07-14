import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CpfGuard } from '../../../../common/guards/cpf.guard';
import { IRegisterUserRequestDto } from '../../dtos/user/register.request.dto';
import { IUserResponseDto } from '../../dtos/user/user.response.dto';
import { IRegisterUserService } from '../../services/user/register/register.interface';
import { JwtAuthGuard } from '../../../../common/guards/auth.guard';
import { IGetAuthenticatedUserService } from '../../services/user/get-authenticated-user/get-authenticated-user.interface';

@Controller('user')
export class UserController {
  constructor(
    @Inject('IRegisterUserService')
    private readonly registerUserService: IRegisterUserService,
    @Inject('IGetAuthenticatedUserService')
    private readonly getAuthenticatedUserService: IGetAuthenticatedUserService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro de validação.' })
  @ApiBody({
    type: IRegisterUserRequestDto,
    description: 'Dados de registro do usuário',
  })
  @UseGuards(CpfGuard)
  async create(
    @Body() userData: IRegisterUserRequestDto,
  ): Promise<IUserResponseDto> {
    return await this.registerUserService.perform(userData);
  }

  @Get('')
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário autenticado retornados com sucesso.',
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou expirado.' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  async getAuthenticatedUser(@Request() req: any): Promise<IUserResponseDto> {
    return this.getAuthenticatedUserService.perform(req.user.token);
  }
}
