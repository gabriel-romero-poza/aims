import { IsString, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';

export class UpdateRoleDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;
}
