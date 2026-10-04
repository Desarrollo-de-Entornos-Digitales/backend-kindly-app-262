import { Injectable } from '@nestjs/common';
import { CreateAchievementDto } from './dto/create-achievement.dto';
import { UpdateAchievementDto } from './dto/update-achievement.dto';

@Injectable()
export class AchievementsService {
    create(_createAchievementDto: CreateAchievementDto) {
        return 'This action adds a new achievement';
    }

    findAll() {
        return `This action returns all achievements`;
    }

    findOne(id: number) {
        return `This action returns a #${id} achievement`;
    }

    update(id: number, _updateAchievementDto: UpdateAchievementDto) {
        return `This action updates a #${id} achievement`;
    }

    remove(id: number) {
        return `This action removes a #${id} achievement`;
    }
}
