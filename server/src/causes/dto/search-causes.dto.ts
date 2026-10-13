import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchCausesDto {
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString({ message: 'keyword must be a string' })
    @IsNotEmpty({ message: 'keyword should not be empty' })
    @Matches(/^\S+$/, { message: 'keyword must be a single word without spaces' })
    keyword!: string;
}
