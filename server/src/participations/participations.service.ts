import { Injectable } from '@nestjs/common';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';

@Injectable()
export class ParticipationsService {
  create(createParticipationDto: CreateParticipationDto) {
    return 'This action adds a new participation';
  }

  findAll() {
    return `This action returns all participations`;
  }

  findOne(id: number) {
    return `This action returns a #${id} participation`;
  }

  update(id: number, updateParticipationDto: UpdateParticipationDto) {
    return `This action updates a #${id} participation`;
  }

  remove(id: number) {
    return `This action removes a #${id} participation`;
  }
}
