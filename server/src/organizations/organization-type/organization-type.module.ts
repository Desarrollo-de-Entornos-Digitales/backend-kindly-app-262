import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationTypeService } from './organization-type.service';
import { OrganizationTypeController } from './organization-type.controller';
import { OrganizationType } from '../entities/organization-type.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([OrganizationType]), AuthModule],
    controllers: [OrganizationTypeController],
    providers: [OrganizationTypeService],
    exports: [OrganizationTypeService, TypeOrmModule],
})
export class OrganizationTypeModule {}
