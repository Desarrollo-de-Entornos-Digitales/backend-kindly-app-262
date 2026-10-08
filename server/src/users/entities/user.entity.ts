import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Organizer } from '../../organizations/entities/organizer.entity';
import { Role } from './role.entity';
import { Volunteer } from '../../volunteers/entities/volunteer.entity';
import { AnnouncementReaction } from '../../announcements/entities/announcement-reaction.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ name: 'role_id' })
    role_id!: number;

    @Column({ unique: true })
    username!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    contact!: string;

    @Column()
    password!: string;

    @Column({ name: 'is_active', default: true })
    is_active!: boolean;

    @Column({ name: 'profile_picture', type: 'varchar', nullable: true, default: null })
    profile_picture?: string | null;

    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at!: Date;

    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @OneToMany(() => AnnouncementReaction, (announcementReaction) => announcementReaction.user)
    announcementReaction!: AnnouncementReaction[];

    @OneToOne(() => Volunteer, (volunteer) => volunteer.user)
    volunteer!: Volunteer;

    @OneToOne(() => Organizer, (organizer) => organizer.user)
    organizer!: Organizer;
}
