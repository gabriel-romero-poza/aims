import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: '12345678', description: 'El DNI del usuario' })
  @IsNotEmpty()
  @IsString()
  dni: string;

  @ApiProperty({
    example: 'password123',
    description: 'La contraseña del usuario',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 1,
    description: 'El ID del rol asociado al usuario',
  })
  @IsNotEmpty()
  @IsInt()
  roleId: number;
}
