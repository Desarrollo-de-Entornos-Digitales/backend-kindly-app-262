import { Injectable } from '@nestjs/common';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

@Injectable()
export class MediaService {
    create(_createMediaDto: CreateMediaDto) {
        return 'This action adds a new media';
    }

    findAll() {
        return `This action returns all media`;
    }

    findOne(id: number) {
        return `This action returns a #${id} media`;
    }

    update(id: number, _updateMediaDto: UpdateMediaDto) {
        return `This action updates a #${id} media`;
    }

    remove(id: number) {
        return `This action removes a #${id} media`;
    }
}
