import { Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
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
