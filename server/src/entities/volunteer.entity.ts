import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Attendance } from './attendance.entity';
import { Submission } from './submission.entity';
import { User } from './user.entity';
import { VolunteerAchievement } from './volunteer-achievement.entity';
import { VolunteerCategory } from './volunteer-category.entity';
import { VolunteerSkill } from './volunteer-skill.entity';

@Entity('volunteers')
export class Volunteer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @Column()
  description: string;

  @Column({ name: 'shirt_size', type: 'varchar' })
  shirt_size: string;

  @Column()
  height: string;

  @Column({ name: 'health_center' })
  health_center: string;

  @Column({ name: 'blood_type', type: 'varchar' })
  blood_type: string;

  @Column({ name: 'emergency_contact' })
  emergency_contact: string;

  @Column({ name: 'completed_causes' })
  completed_causes: number;

  @OneToOne(() => User, (user) => user.volunteer)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => VolunteerSkill, (volunteerSkill) => volunteerSkill.volunteer)
  volunteerSkills: VolunteerSkill[];

  @OneToMany(
    () => VolunteerCategory,
    (volunteerCategory) => volunteerCategory.volunteer,
  )
  volunteerCategories: VolunteerCategory[];

  @OneToMany(
    () => VolunteerAchievement,
    (volunteerAchievement) => volunteerAchievement.volunteer,
  )
  volunteerAchievements: VolunteerAchievement[];

  @OneToMany(() => Submission, (submission) => submission.volunteer)
  submissions: Submission[];

  @OneToMany(() => Attendance, (attendance) => attendance.volunteer)
  attendances: Attendance[];
}
