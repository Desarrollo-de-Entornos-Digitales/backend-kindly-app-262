import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VolunteerAchievement } from '../../volunteer-achievement/entities/volunteer-achievement.entity';

@Entity('achievements')
export class Achievement {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    color!: string;

    @Column()
    icon!: string;

    @Column()
    description!: string;

    @OneToMany(() => VolunteerAchievement, (volunteerAchievement) => volunteerAchievement.achievement)
    volunteerAchievements!: VolunteerAchievement[];
}

