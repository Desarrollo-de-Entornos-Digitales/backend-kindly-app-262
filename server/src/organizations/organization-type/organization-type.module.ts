import { Module } from '@nestjs/common';
import { OrganizationTypeService } from './organization-type.service';
import { OrganizationTypeController } from './organization-type.controller';

@Module({
  controllers: [OrganizationTypeController],
  providers: [OrganizationTypeService],
})
export class OrganizationTypeModule {}
