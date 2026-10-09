import { Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export const VALID_PROGRESS_STATES = ['open', 'in_progress', 'completed'] as const;
export type ProgressState = (typeof VALID_PROGRESS_STATES)[number];

export class UpdateProgressDto {
    @Type(() => Object)
    @IsString({ message: 'progress must be a string' })
    @IsNotEmpty({ message: 'progress is required' })
    @IsIn(VALID_PROGRESS_STATES, {
        message: `progress must be one of: ${VALID_PROGRESS_STATES.join(', ')}`,
    })
    progress!: ProgressState;
}
