import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';

@Entity()
export class Role {
  @ApiProperty({ example: 1, description: 'El ID del rol' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Admin', description: 'El nombre del rol' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    type: () => User,
    description: 'Usuarios asociados con este rol',
  })
  @ManyToMany(() => User, (user) => user.roles)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
