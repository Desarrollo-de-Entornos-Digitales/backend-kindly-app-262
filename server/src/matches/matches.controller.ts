import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { GetDeckQueryDto } from './dto/get-deck-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
}
