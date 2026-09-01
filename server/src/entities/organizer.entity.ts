import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cause } from './cause.entity';
import { User } from './user.entity';

@Entity('organizers')
export class Organizer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'is_organization' })
  is_organization: boolean;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  website: string;

  @Column({ name: 'verification_file', nullable: true })
  verification_file: string;

  @Column({ name: 'verification_status', type: 'varchar' })
  verification_status: string;

  @OneToOne(() => User, (user) => user.organizer)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Cause, (cause) => cause.organizer)
  causes: Cause[];
}
