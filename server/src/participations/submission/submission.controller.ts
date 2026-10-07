import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PositiveIntPipe } from '../../common/pipes/positive-int.pipe';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { FilterSubmissionsDto } from './dto/filter-submissions.dto';

// TODO: proteger con JwtAuthGuard + RolesGuard (voluntario / organizador) cuando auth esté en develop
@Controller('submissions')
export class SubmissionController {
    constructor(private readonly submissionService: SubmissionService) {}

    // US-4.1.1, US-4.1.2
    @Post()
    create(@Body() createSubmissionDto: CreateSubmissionDto) {
        return this.submissionService.create(createSubmissionDto);
    }

    // US-4.1.3
    @Get('volunteer/:volunteerId')
    findByVolunteer(@Param('volunteerId', PositiveIntPipe) volunteerId: number, @Query() filter: FilterSubmissionsDto) {
        return this.submissionService.findByVolunteer(volunteerId, filter);
    }

    // US-4.2.1, US-4.2.2, US-4.2.3
    @Get('cause/:causeId')
    findByCause(@Param('causeId', PositiveIntPipe) causeId: number, @Query() filter: FilterSubmissionsDto) {
        return this.submissionService.findByCause(causeId, filter);
    }

    // US-4.1.4
    @Get(':id')
    findOne(@Param('id', PositiveIntPipe) id: number) {
        return this.submissionService.findOne(id);
    }

    // US-4.2.4, US-4.2.6
    @Patch(':id/accept')
    accept(@Param('id', PositiveIntPipe) id: number) {
        return this.submissionService.accept(id);
    }

    // US-4.2.5
    @Patch(':id/reject')
    reject(@Param('id', PositiveIntPipe) id: number) {
        return this.submissionService.reject(id);
    }
}
