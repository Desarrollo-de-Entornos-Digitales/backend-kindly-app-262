import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AnnouncementReaction } from './announcement-reaction.entity';

@Entity('reactions')
export class Reaction {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    icon!: string;

    @OneToMany(() => AnnouncementReaction, (announcementReaction) => announcementReaction.reaction)
    announcementReaction!: AnnouncementReaction[];
}
