import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Skill } from './skill.entity';
import { Volunteer } from './volunteer.entity';

@Entity('volunteer_skills')
export class VolunteerSkill {
  @PrimaryColumn({ name: 'volunteer_id' })
  volunteer_id: number;

  @PrimaryColumn({ name: 'skill_id' })
  skill_id: number;

  @ManyToOne(() => Volunteer, (volunteer) => volunteer.volunteerSkills)
  @JoinColumn({ name: 'volunteer_id' })
  volunteer: Volunteer;

  @ManyToOne(() => Skill, (skill) => skill.volunteerSkills)
  @JoinColumn({ name: 'skill_id' })
  skill: Skill;
}
