import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VolunteersService } from './volunteers.service';
import { VolunteersController } from './volunteers.controller';

import { Volunteer } from './entities/volunteer.entity';
import { Skill } from './entities/skill.entity';
import { Category } from './entities/category.entity';
import { VolunteerSkill } from './entities/volunteer-skill.entity';
import { VolunteerCategory } from './entities/volunteer-category.entity';
import { User } from '../users/entities/user.entity';

import { VolunteerModule } from './volunteer/volunteer.module';
import { SkillModule } from './skill/skill.module';
import { CategoryModule } from './category/category.module';
import { VolunteerSkillModule } from './volunteer-skill/volunteer-skill.module';
import { VolunteerCategoryModule } from './volunteer-category/volunteer-category.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Volunteer, Skill, Category, VolunteerSkill, VolunteerCategory, User]),
        VolunteerModule,
        SkillModule,
        CategoryModule,
        VolunteerSkillModule,
        VolunteerCategoryModule,
        AuthModule,
    ],
    controllers: [VolunteersController],
    providers: [VolunteersService],
    exports: [
        VolunteersService,
        VolunteerModule,
        SkillModule,
        CategoryModule,
        VolunteerSkillModule,
        VolunteerCategoryModule,
    ],
})
export class VolunteersModule {}
