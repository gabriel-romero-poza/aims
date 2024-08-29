import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/modules/roles/entities/role.entity';

@Entity()
export class User {
  @ApiProperty({ example: 1, description: 'El ID del usuario' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '12345678', description: 'El DNI del usuario' })
  @Column({ unique: true })
  dni: string;

  @ApiProperty({
    example: 'password123',
    description: 'La contraseña del usuario',
  })
  @Column()
  password: string;

  @ApiProperty({
    type: () => Role,
    description: 'Los roles asociados al usuario',
  })
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
