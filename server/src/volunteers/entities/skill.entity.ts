import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VolunteerSkill } from './volunteer-skill.entity';

@Entity('skills')
export class Skill {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @OneToMany(() => VolunteerSkill, (volunteerSkill) => volunteerSkill.skill)
    volunteerSkills!: VolunteerSkill[];
}
