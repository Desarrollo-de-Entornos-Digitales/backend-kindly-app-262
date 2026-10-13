import { IsEnum, IsOptional } from 'class-validator';
import { SubmissionStatus } from '../submission-status.enum';

export class FilterSubmissionsDto {
    @IsOptional()
    @IsEnum(SubmissionStatus)
    status?: SubmissionStatus;
}
