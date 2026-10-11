import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Cause } from '../../causes/entities/cause.entity';
import { Volunteer } from '../../volunteers/entities/volunteer.entity';

@Entity('attendance')
export class Attendance {
    @PrimaryColumn({ name: 'cause_id' })
    cause_id!: number;

    @PrimaryColumn({ name: 'volunteer_id' })
    volunteer_id!: number;

    @Column({
        name: 'checked_in_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    checked_in_at!: Date;

    @ManyToOne(() => Cause, (cause) => cause.attendances)
    @JoinColumn({ name: 'cause_id' })
    cause!: Cause;

    @ManyToOne(() => Volunteer, (volunteer) => volunteer.attendances)
    @JoinColumn({ name: 'volunteer_id' })
    volunteer!: Volunteer;
}
