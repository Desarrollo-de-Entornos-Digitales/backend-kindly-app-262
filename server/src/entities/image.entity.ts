import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Announcement } from './announcement.entity';
import { Cause } from './cause.entity';

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cause_id', nullable: true })
  cause_id: number;

  @Column({ name: 'announcement_id', nullable: true })
  announcement_id: number;

  @Column({ name: 'image_url' })
  image_url: string;

  @ManyToOne(() => Cause, (cause) => cause.images, { nullable: true })
  @JoinColumn({ name: 'cause_id' })
  cause: Cause;

  @ManyToOne(() => Announcement, (announcement) => announcement.images, {
    nullable: true,
  })
  @JoinColumn({ name: 'announcement_id' })
  announcement: Announcement;
}
