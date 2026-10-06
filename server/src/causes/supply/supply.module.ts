import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplyService } from './supply.service';
import { SupplyController } from './supply.controller';
import { Supply } from '../entities/supply.entity';
import { Cause } from '../entities/cause.entity';
import { Organizer } from '../../organizations/entities/organizer.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Supply, Cause, Organizer])],
    controllers: [SupplyController],
    providers: [SupplyService],
    exports: [SupplyService],
})
export class SupplyModule {}
