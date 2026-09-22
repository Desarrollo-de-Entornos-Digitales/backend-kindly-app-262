import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cause } from './entities/cause.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cause])],
  exports: [TypeOrmModule],
})
export class CauseSubModule {}

