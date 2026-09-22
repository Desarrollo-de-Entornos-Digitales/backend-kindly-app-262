import { Module } from '@nestjs/common';
import { CausesService } from './causes.service';
import { CausesController } from './causes.controller';
import { CauseSubModule } from './cause/cause.module';
import { SupplyModule } from './supply/supply.module';

@Module({
  imports: [CauseSubModule, SupplyModule],
  controllers: [CausesController],
  providers: [CausesService],
  exports: [CauseSubModule, SupplyModule],
})
export class CausesModule {}
