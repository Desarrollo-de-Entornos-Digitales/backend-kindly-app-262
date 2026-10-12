import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizerService } from './organizer.service';
import { OrganizerController } from './organizer.controller';
import { Organizer } from '../entities/organizer.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([Organizer]), AuthModule],
    controllers: [OrganizerController],
    providers: [OrganizerService],
    exports: [OrganizerService, TypeOrmModule],
})
export class OrganizerModule {}
