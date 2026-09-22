import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Reaction } from '../../reaction/entities/reaction.entity';
import { Announcement } from '../../announcement/entities/announcement.entity';
import { User } from '../../../users/user/entities/user.entity';

@Entity('announcementReactions')
export class AnnouncementReaction {
    @PrimaryColumn('reaction_id')
    reaction_id!: number;

    @PrimaryColumn('announcement_id')
    announcement_id!: number;

    @PrimaryColumn('user_id')
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

