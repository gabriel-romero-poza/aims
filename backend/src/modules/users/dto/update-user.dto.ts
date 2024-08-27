import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsString()
  @IsOptional()
  readonly password?: string;

  @IsArray()
  @IsOptional()
  readonly roles?: string[];
}
