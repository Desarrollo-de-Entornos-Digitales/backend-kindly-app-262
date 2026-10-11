import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { OrganizerModule } from './organizer/organizer.module';
import { OrganizationTypeModule } from './organization-type/organization-type.module';

@Module({
    controllers: [OrganizationsController],
    providers: [OrganizationsService],
    imports: [OrganizerModule, OrganizationTypeModule],
})
export class OrganizationsModule {}
