import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cause } from '../../causes/entities/cause.entity';
import { Volunteer } from '../../volunteers/entities/volunteer.entity';

@Entity('submission')
export class Submission {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'volunteer_id' })
    volunteer_id!: number;

    @Column({ name: 'cause_id' })
    cause_id!: number;

    @Column()
    status!: string;

    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at!: Date;

    @Column({ nullable: true })
    justification!: string;

    @ManyToOne(() => Volunteer, (volunteer) => volunteer.submissions)
    @JoinColumn({ name: 'volunteer_id' })
    volunteer!: Volunteer;

    @ManyToOne(() => Cause, (cause) => cause.submissions)
    @JoinColumn({ name: 'cause_id' })
    cause!: Cause;
}
