import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CauseNotFoundException, OrganizerNotFoundException } from '../../common/exceptions';
import { Cause } from '../../causes/entities/cause.entity';
import { Organizer } from '../../organizations/entities/organizer.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(Cause)
        private readonly causeRepository: Repository<Cause>,
        @InjectRepository(Organizer)
        private readonly organizerRepository: Repository<Organizer>,
    ) {}

    async getCauseQrCode(causeId: number, userId: number): Promise<{ cause_id: number; qr_code: string }> {
        const cause = await this.causeRepository.findOneBy({ id: causeId });
        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }
        const organizer = await this.organizerRepository.findOneBy({ user_id: userId });
        if (!organizer) {
            throw new OrganizerNotFoundException();
        }
        if (cause.organizer_id !== organizer.id) {
            throw new ForbiddenException(`Cause with ID '${causeId}' does not belong to the current organizer.`);
        }
        return { cause_id: cause.id, qr_code: cause.qr_code };
    }

    create(_createAttendanceDto: CreateAttendanceDto) {
        return 'This action adds a new attendance';
    }

    findAll() {
        return `This action returns all attendance`;
    }

    findOne(id: number) {
        return `This action returns a #${id} attendance`;
    }

    remove(id: number) {
        return `This action removes a #${id} attendance`;
    }
}
