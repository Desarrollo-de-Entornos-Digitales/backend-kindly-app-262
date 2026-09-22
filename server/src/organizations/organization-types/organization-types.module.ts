import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationType } from './entities/organization-types.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationType])],
  exports: [TypeOrmModule],
})
export class OrganizationTypesModule {}

