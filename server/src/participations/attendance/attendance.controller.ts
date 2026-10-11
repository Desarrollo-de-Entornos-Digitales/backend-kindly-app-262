import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PositiveIntPipe } from '../../common/pipes/positive-int.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permission.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @Get('causes/:causeId/qr-code')
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles('organizer')
    @Permissions('manage_causes')
    getCauseQrCode(@Param('causeId', PositiveIntPipe) causeId: number, @CurrentUser('id') userId: number) {
        return this.attendanceService.getCauseQrCode(causeId, userId);
    }

    @Post('check-in')
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles('volunteer')
    @Permissions('participate_causes')
    checkIn(@CurrentUser('id') userId: number, @Body() createAttendanceDto: CreateAttendanceDto) {
        return this.attendanceService.checkIn(userId, createAttendanceDto);
    }
}
