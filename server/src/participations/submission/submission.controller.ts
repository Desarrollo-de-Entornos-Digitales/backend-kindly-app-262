import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PositiveIntPipe } from '../../common/pipes/positive-int.pipe';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { FilterSubmissionsDto } from './dto/filter-submissions.dto';

@Controller('submissions')
export class SubmissionController {
    constructor(private readonly submissionService: SubmissionService) {}

    @Post()
    create(@Body() createSubmissionDto: CreateSubmissionDto) {
        return this.submissionService.create(createSubmissionDto);
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
