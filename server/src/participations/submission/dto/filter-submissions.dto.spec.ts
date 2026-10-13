import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FilterSubmissionsDto } from './filter-submissions.dto';
import { SubmissionStatus } from '../submission-status.enum';

describe('FilterSubmissionsDto', () => {
    it('should validate valid status enum', async () => {
        const dto = plainToInstance(FilterSubmissionsDto, { status: SubmissionStatus.ACCEPTED });
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.status).toBe(SubmissionStatus.ACCEPTED);
    });

    it('should fail on invalid status enum value', async () => {
        const dto = plainToInstance(FilterSubmissionsDto, { status: 'INVALID_STATUS' });
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
    });
});

