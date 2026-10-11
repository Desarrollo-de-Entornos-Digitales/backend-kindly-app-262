import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateImageDto } from '../media/image/dto/create-image.dto';
import { PositiveIntPipe } from '../common/pipes/positive-int.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('announcements/:announcementId/images')
export class AnnouncementImagesController {
    constructor(private readonly announcementsService: AnnouncementsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles('organizer', 'admin')
    @Permissions('manage_announcements')
    create(
        @Param('announcementId', PositiveIntPipe) announcementId: number,
        @CurrentUser() user: any,
        @Body() createImageDto: CreateImageDto,
    ) {
        return this.announcementsService.addImage(announcementId, user, createImageDto);
    }

    @Get()
    findAll(@Param('announcementId', PositiveIntPipe) announcementId: number) {
        return this.announcementsService.findImagesByAnnouncement(announcementId);
    }
}
