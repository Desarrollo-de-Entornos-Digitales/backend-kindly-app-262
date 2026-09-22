import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Organizer } from '../../organizer/entities/organizer.entity';

@Entity('organization_types')
export class OrganizationType {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @OneToMany(() => Organizer, (organizer) => organizer.organizationType)
    organizers!: Organizer[];
}

