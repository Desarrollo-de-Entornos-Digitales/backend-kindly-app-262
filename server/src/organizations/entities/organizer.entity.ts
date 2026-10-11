import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cause } from '../../causes/entities/cause.entity';
import { User } from '../../users/entities/user.entity';
import { OrganizationType } from './organization-type.entity';

@Entity('organizers')
export class Organizer {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'user_id' })
    user_id!: number;

    @Column({ name: 'is_organization' })
    is_organization!: boolean;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column({ nullable: true })
    website!: string;

    @Column({ name: 'verification_file', nullable: true })
    verification_file!: string;

    @Column({ name: 'verification_status', type: 'varchar' })
    verification_status!: string;

    @Column({ name: 'organization_type_id' })
    organization_type_id!: number;

    @ManyToOne(() => OrganizationType, (organizationType) => organizationType.organizers)
    @JoinColumn({ name: 'organization_type_id' })
    organizationType!: OrganizationType;

    @OneToOne(() => User, (user) => user.organizer)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @OneToMany(() => Cause, (cause) => cause.organizer)
    causes!: Cause[];
}
