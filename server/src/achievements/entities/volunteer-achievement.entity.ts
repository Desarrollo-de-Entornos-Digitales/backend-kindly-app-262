import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Achievement } from './achievement.entity';
import { Volunteer } from '../../volunteers/entities/volunteer.entity';

@Entity('volunteer_achievements')
export class VolunteerAchievement {
    @PrimaryColumn({ name: 'volunteer_id' })
    volunteer_id!: number;

    @PrimaryColumn({ name: 'achievement_id' })
    achievement_id!: number;

    @Column({
        name: 'obtained_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    obtained_at!: Date;

    @ManyToOne(() => Volunteer, (volunteer) => volunteer.volunteerAchievements)
    @JoinColumn({ name: 'volunteer_id' })
    volunteer!: Volunteer;

    @ManyToOne(() => Achievement, (achievement) => achievement.volunteerAchievements)
    @JoinColumn({ name: 'achievement_id' })
    achievement!: Achievement;
}
