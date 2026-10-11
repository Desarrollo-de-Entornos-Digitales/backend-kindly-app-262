import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizerService } from './organizer.service';
import { OrganizerController } from './organizer.controller';
import { Organizer } from '../entities/organizer.entity';
import { OrganizationType } from '../entities/organization-type.entity';
import { User } from '../../users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Organizer, User, OrganizationType])],
    controllers: [OrganizerController],
    providers: [OrganizerService],
    exports: [OrganizerService, TypeOrmModule],
})
export class OrganizerModule {}
