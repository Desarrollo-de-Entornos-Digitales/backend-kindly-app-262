import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Announcement } from './announcement.entity';
import { Attendance } from './attendance.entity';
import { Category } from './category.entity';
import { Image } from './image.entity';
import { Organizer } from './organizer.entity';
import { Submission } from './submission.entity';
import { Supply } from './supply.entity';

@Entity('causes')
export class Cause {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'organizer_id' })
    organizer_id!: number;

    @Column({ name: 'category_id' })
    category_id!: number;

    @Column()
    title!: string;

    @Column({ name: 'cover_image_url' })
    cover_image_url!: string;

    @Column()
    description!: string;

    @Column({ nullable: true })
    capacity!: number;

    @Column({
        name: 'created_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    created_at!: Date;

    @Column({ name: 'start_date', type: 'timestamp' })
    start_date!: Date;

    @Column({ name: 'end_date', type: 'timestamp' })
    end_date!: Date;

    @Column()
    address!: string;

    @Column({ name: 'is_available', default: true })
    is_available!: boolean;

    @Column({ name: 'location_latitude' })
    location_latitude!: string;

    @Column({ name: 'location_longitude' })
    location_longitude!: string;

    @Column({ type: 'varchar' })
    progress!: string;

    @Column({ name: 'qr_code' })
    qr_code!: string;

    @ManyToOne(() => Organizer, (organizer) => organizer.causes)
    @JoinColumn({ name: 'organizer_id' })
    organizer!: Organizer;

    @ManyToOne(() => Category, (category) => category.causes)
    @JoinColumn({ name: 'category_id' })
    category!: Category;

    @OneToMany(() => Supply, (supply) => supply.cause)
    supplies!: Supply[];

    @OneToMany(() => Announcement, (announcement) => announcement.cause)
    announcements!: Announcement[];

    @OneToMany(() => Image, (image) => image.cause)
    images!: Image[];

    @OneToMany(() => Submission, (submission) => submission.cause)
    submissions!: Submission[];

    @OneToMany(() => Attendance, (attendance) => attendance.cause)
    attendances!: Attendance[];
}
