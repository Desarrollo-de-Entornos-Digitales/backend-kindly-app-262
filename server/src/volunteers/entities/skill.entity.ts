import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VolunteerSkill } from './volunteer-skill.entity';

@Entity('skills')
export class Skill {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ name: 'description', type: 'varchar', nullable: true, default: null })
    description?: string | null;

    @OneToMany(() => VolunteerSkill, (volunteerSkill) => volunteerSkill.skill)
    volunteerSkills!: VolunteerSkill[];
}
