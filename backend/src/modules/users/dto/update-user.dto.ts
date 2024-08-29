import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';
export class UpdateUserDto {
  @ApiProperty({
    example: 'password321',
    description: 'La nueva contraseña del usuario',
  })
  @IsNotEmpty()
  @IsInt()
  password: string;
}
