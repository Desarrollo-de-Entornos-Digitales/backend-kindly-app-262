import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Reaction } from './reaction.entity';
import { Announcement } from './announcement.entity';
import { User } from '../../users/entities/user.entity';

@Entity('announcement_reactions')
export class AnnouncementReaction {
    @PrimaryColumn({ name: 'reaction_id' })
    reaction_id!: number;

    @PrimaryColumn({ name: 'announcement_id' })
    announcement_id!: number;

    @PrimaryColumn({ name: 'user_id' })
    user_id!: number;

    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at!: Date;

    @ManyToOne(() => Reaction, (reaction) => reaction.announcementReaction)
    @JoinColumn({ name: 'reaction_id' })
    reaction!: Reaction;

    @ManyToOne(() => Announcement, (announcement) => announcement.announcementReaction)
    @JoinColumn({ name: 'announcement_id' })
    announcement!: Announcement;

    @ManyToOne(() => User, (user) => user.announcementReaction)
    @JoinColumn({ name: 'user_id' })
    user!: User;
}
