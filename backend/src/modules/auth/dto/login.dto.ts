import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '40456123',
    description: 'El DNI del usuario',
  })
  @IsString()
  @MinLength(1)
  dni: string;

  @ApiProperty({
    example: 'password321',
    description: 'La contraseña del usuario',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
