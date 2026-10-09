import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { GetDeckQueryDto } from './dto/get-deck-query.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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
}
