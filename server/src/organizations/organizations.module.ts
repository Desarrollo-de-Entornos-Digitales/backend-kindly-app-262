import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { OrganizerModule } from './organizer/organizer.module';
import { OrganizationTypeModule } from './organization-type/organization-type.module';

import { Organizer } from './entities/organizer.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([Organizer]), OrganizerModule, OrganizationTypeModule, AuthModule],
    controllers: [OrganizationsController],
    providers: [OrganizationsService],
    exports: [OrganizationsService, OrganizerModule, OrganizationTypeModule],
})
export class OrganizationsModule {}
