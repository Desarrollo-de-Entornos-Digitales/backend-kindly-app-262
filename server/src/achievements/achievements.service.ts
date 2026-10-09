import { Injectable } from '@nestjs/common';
import { CreateAchievementDto } from './achievement/dto/create-achievement.dto';
import { UpdateAchievementDto } from './achievement/dto/update-achievement.dto';
import { QueryAchievementsDto } from './dto/query-achievements.dto';

@Injectable()
export class AchievementsService {
    create(_createAchievementDto: CreateAchievementDto) {
        return 'This action adds a new achievement';
    }

    findAll(_query?: QueryAchievementsDto) {
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
