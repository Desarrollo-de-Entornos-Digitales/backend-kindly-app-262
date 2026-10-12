import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { GetDeckQueryDto } from './dto/get-deck-query.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { DismissMatchDto } from './dto/dismiss-match.dto';
import { NearbyCausesQueryDto } from './dto/nearby-causes-query.dto';
import { MapAreaQueryDto } from './dto/map-area-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PositiveIntPipe } from '../common/pipes/positive-int.pipe';

@Controller('matches')
export class MatchesController {
    constructor(private readonly matchesService: MatchesService) {}

    @Get('deck')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('volunteer')
    getDeck(@CurrentUser() user: any, @Query() queryDto?: GetDeckQueryDto) {
        return this.matchesService.getDeck(user, queryDto);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles('volunteer')
    @Permissions('participate_causes')
    match(@CurrentUser('id') userId: number, @Body() createMatchDto: CreateMatchDto) {
        return this.matchesService.match(userId, createMatchDto);
    }

    @Post('dismiss')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('volunteer')
    dismiss(@CurrentUser('id') userId: number, @Body() dismissMatchDto: DismissMatchDto) {
        return this.matchesService.dismiss(userId, dismissMatchDto);
    }

    @Get('map/pins')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('volunteer')
    getMapPins() {
        return this.matchesService.getMapPins();
    }

    @Get('for-you')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('volunteer')
    getForYouFeed(@CurrentUser('id') userId: number, @Query() queryDto?: GetDeckQueryDto) {
        return this.matchesService.getForYouFeed(userId, queryDto);
    }

    @Get('map/nearby')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('volunteer')
    getNearbyPins(@Query() queryDto: NearbyCausesQueryDto) {
        return this.matchesService.getNearbyPins(queryDto);
    }

    @Get('map/area')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('volunteer')
    getPinsInArea(@Query() queryDto: MapAreaQueryDto) {
        return this.matchesService.getPinsInArea(queryDto);
    }

    @Get('map/preview/:causeId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('volunteer')
    getCausePreview(@Param('causeId', PositiveIntPipe) causeId: number) {
        return this.matchesService.getCausePreview(causeId);
    }
}
