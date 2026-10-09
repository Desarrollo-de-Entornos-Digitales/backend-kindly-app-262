import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PositiveIntPipe } from '../../common/pipes/positive-int.pipe';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { PermissionsGuard } from '../../auth/guards/permission.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permission.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { FilterSubmissionsDto } from './dto/filter-submissions.dto';

@Controller('submissions')
export class SubmissionController {
    constructor(private readonly submissionService: SubmissionService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles('volunteer')
    @Permissions('participate_causes')
    create(@CurrentUser('id') userId: number, @Body() createSubmissionDto: CreateSubmissionDto) {
        return this.submissionService.create(userId, createSubmissionDto);
    }

    @Get('volunteer/:volunteerId')
    findByVolunteer(@Param('volunteerId', PositiveIntPipe) volunteerId: number, @Query() filter: FilterSubmissionsDto) {
        return this.submissionService.findByVolunteer(volunteerId, filter);
    }

    @Get('cause/:causeId')
    findByCause(@Param('causeId', PositiveIntPipe) causeId: number, @Query() filter: FilterSubmissionsDto) {
        return this.submissionService.findByCause(causeId, filter);
    }

    @Get(':id')
    findOne(@Param('id', PositiveIntPipe) id: number) {
        return this.submissionService.findOne(id);
    }

    @Patch(':id/accept')
    accept(@Param('id', PositiveIntPipe) id: number) {
        return this.submissionService.accept(id);
    }

    @Patch(':id/reject')
    reject(@Param('id', PositiveIntPipe) id: number) {
        return this.submissionService.reject(id);
    }
}
