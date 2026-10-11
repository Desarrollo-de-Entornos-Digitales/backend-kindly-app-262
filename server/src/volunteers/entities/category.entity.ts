import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cause } from '../../causes/entities/cause.entity';
import { VolunteerCategory } from './volunteer-category.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({ name: 'description', type: 'varchar', nullable: true, default: null })
    description?: string | null;

    @OneToMany(() => Cause, (cause) => cause.category)
    causes!: Cause[];

    @OneToMany(() => VolunteerCategory, (volunteerCategory) => volunteerCategory.category)
    volunteerCategories!: VolunteerCategory[];
}
