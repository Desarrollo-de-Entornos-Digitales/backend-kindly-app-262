import { Module } from '@nestjs/common';
import { CausesService } from './causes.service';
import { CausesController } from './causes.controller';
import { CauseModule } from './cause/cause.module';
import { SupplyModule } from './supply/supply.module';

@Module({
    controllers: [CausesController],
    providers: [CausesService],
    imports: [CauseModule, SupplyModule],
})
export class CausesModule {}
