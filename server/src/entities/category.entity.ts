import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cause } from './cause.entity';
import { VolunteerCategory } from './volunteer-category.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => Cause, (cause) => cause.category)
  causes: Cause[];

  @OneToMany(
    () => VolunteerCategory,
    (volunteerCategory) => volunteerCategory.category,
  )
  volunteerCategories: VolunteerCategory[];
}
