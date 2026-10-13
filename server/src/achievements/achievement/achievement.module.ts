import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { Achievement } from '../entities/achievement.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([Achievement]), AuthModule],
    controllers: [AchievementController],
    providers: [AchievementService],
    exports: [AchievementService],
})
export class AchievementModule {}
