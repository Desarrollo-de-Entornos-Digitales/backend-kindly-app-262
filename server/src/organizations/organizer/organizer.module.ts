import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organizer } from './entities/organizer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organizer])],
  exports: [TypeOrmModule],
})
export class OrganizerSubModule {}

