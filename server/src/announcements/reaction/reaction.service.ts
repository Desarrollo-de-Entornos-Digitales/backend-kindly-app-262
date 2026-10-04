import { Injectable } from '@nestjs/common';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';

@Injectable()
export class ReactionService {
    create(_createReactionDto: CreateReactionDto) {
        return 'This action adds a new reaction';
    }

    findAll() {
        return `This action returns all reaction`;
    }

    findOne(id: number) {
        return `This action returns a #${id} reaction`;
    }

    update(id: number, _updateReactionDto: UpdateReactionDto) {
        return `This action updates a #${id} reaction`;
    }

    remove(id: number) {
        return `This action removes a #${id} reaction`;
    }
}
