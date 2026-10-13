import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { PositiveIntPipe } from '../common/pipes/positive-int.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('causes/:causeId/announcements')
export class AnnouncementsController {
    constructor(private readonly announcementsService: AnnouncementsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles('organizer', 'admin')
    @Permissions('manage_announcements')
    create(
        @Param('causeId', PositiveIntPipe) causeId: number,
        @CurrentUser() user: any,
        @Body() createAnnouncementDto: CreateAnnouncementDto,
    ) {
        return this.announcementsService.create(causeId, user, createAnnouncementDto);
    }

    @Get()
    findAllByCause(@Param('causeId', PositiveIntPipe) causeId: number) {
        return this.announcementsService.findAllByCause(causeId);
    }
}
