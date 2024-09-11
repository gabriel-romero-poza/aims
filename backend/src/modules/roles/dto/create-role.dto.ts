import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    example: 'admin',
    description: 'El nombre del rol',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
