import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCauseDto } from './create-cause.dto';

export class UpdateCauseDto extends PartialType(OmitType(CreateCauseDto, ['organizer_id'] as const)) {}
