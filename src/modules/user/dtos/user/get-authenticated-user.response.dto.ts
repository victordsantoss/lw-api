import { IUserResponseDto } from './user.response.dto';

export interface IGetAuthenticatedUserResponseDto {
  id: string;
  token: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date | null;
  user: IUserResponseDto;
}
