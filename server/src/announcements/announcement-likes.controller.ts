import { Controller, Post, Param, HttpCode, HttpStatus, UseGuards, Body } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { LikeAnnouncementDto } from './dto/like-announcement.dto';
import { PositiveIntPipe } from '../common/pipes/positive-int.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('announcements/:announcementId/like')
export class AnnouncementLikesController {
    constructor(private readonly announcementsService: AnnouncementsService) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles('volunteer', 'organizer', 'admin')
    @Permissions('react_announcements')
    like(
        @Param('announcementId', PositiveIntPipe) announcementId: number,
        @CurrentUser() user: any,
        @Body() _dto?: LikeAnnouncementDto,
    ) {
        return this.announcementsService.like(announcementId, user);
    }
}

