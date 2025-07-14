import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { CpfValidator } from '../core/utils/cpf.utils';

@Injectable()
export class CpfGuard implements CanActivate {
  constructor(private readonly cpfValidator: CpfValidator) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cpf = request.params.cpf || request.body.cpf;

    if (!cpf) {
      throw new BadRequestException('CPF é obrigatório');
    }

    const isValid = this.cpfValidator.validateCpf(cpf);

    if (!isValid) {
      throw new BadRequestException('CPF inválido');
    }
    return true;
  }
}
