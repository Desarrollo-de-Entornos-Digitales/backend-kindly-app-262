import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cause } from './cause.entity';

@Entity('supplies')
export class Supply {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'cause_id' })
    cause_id!: number;

    @Column({ name: 'item_name' })
    item_name!: string;

    @Column({ default: true })
    needed!: boolean;

    @Column({ name: 'quantity_needed' })
    quantity_needed!: number;

    @Column()
    image!: string;

    @ManyToOne(() => Cause, (cause) => cause.supplies)
    @JoinColumn({ name: 'cause_id' })
    cause!: Cause;
}
