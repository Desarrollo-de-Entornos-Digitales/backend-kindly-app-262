import { Module } from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { VolunteersController } from './volunteers.controller';
import { VolunteerModule } from './volunteer/volunteer.module';
import { SkillModule } from './skill/skill.module';
import { CategoryModule } from './category/category.module';
import { VolunteerSkillModule } from './volunteer-skill/volunteer-skill.module';
import { VolunteerCategoryModule } from './volunteer-category/volunteer-category.module';

@Module({
  imports: [
    VolunteerModule,
    SkillModule,
    CategoryModule,
    VolunteerSkillModule,
    VolunteerCategoryModule,
  ],
  controllers: [VolunteersController],
  providers: [VolunteersService],
  exports: [
    VolunteerModule,
    SkillModule,
    CategoryModule,
    VolunteerSkillModule,
    VolunteerCategoryModule,
  ],
})
export class VolunteersModule {}
