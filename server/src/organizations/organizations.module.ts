import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { OrganizerSubModule } from './organizer/organizer.module';
import { OrganizationTypesModule } from './organization-types/organization-types.module';

@Module({
  imports: [OrganizerSubModule, OrganizationTypesModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizerSubModule, OrganizationTypesModule],
})
export class OrganizationsModule {}
