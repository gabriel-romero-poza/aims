import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
