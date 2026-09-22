import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { Volunteer } from '../../volunteer/entities/volunteer.entity';

@Entity('volunteer_categories')
export class VolunteerCategory {
  @PrimaryColumn({ name: 'volunteer_id' })
  volunteer_id!: number;

  @PrimaryColumn({ name: 'category_id' })
  category_id!: number;

  @ManyToOne(() => Volunteer, (volunteer) => volunteer.volunteerCategories)
  @JoinColumn({ name: 'volunteer_id' })
  volunteer!: Volunteer;

  @ManyToOne(() => Category, (category) => category.volunteerCategories)
  @JoinColumn({ name: 'category_id' })
  category!: Category;
}

