import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CausesService } from './causes.service';
import { CausesController } from './causes.controller';
import { CauseModule } from './cause/cause.module';
import { SupplyModule } from './supply/supply.module';
import { Cause } from './entities/cause.entity';
import { Organizer } from '../organizations/entities/organizer.entity';
import { Category } from '../volunteers/entities/category.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Cause, Organizer, Category]), CauseModule, SupplyModule],
    controllers: [CausesController],
    providers: [CausesService],
    exports: [CausesService],
})
export class CausesModule {}
