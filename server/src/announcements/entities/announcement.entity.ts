import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cause } from '../../causes/entities/cause.entity';
import { Image } from '../../media/entities/image.entity';
import { AnnouncementReaction } from './announcement-reaction.entity';

@Entity('announcements')
export class Announcement {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'cause_id' })
    cause_id!: number;

    @Column()
    title!: string;

    @Column()
    text!: string;

    @Column()
    likes!: number;

    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at!: Date;

    @ManyToOne(() => Cause, (cause) => cause.announcements)
    @JoinColumn({ name: 'cause_id' })
    cause!: Cause;

    @OneToMany(() => Image, (image) => image.announcement)
    images!: Image[];

    @OneToMany(() => AnnouncementReaction, (announcementReaction) => announcementReaction.announcement)
    announcementReaction!: AnnouncementReaction[];
}
