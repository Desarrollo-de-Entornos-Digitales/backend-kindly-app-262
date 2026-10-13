import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class MapAreaQueryDto {
    @Type(() => Number)
    @IsNumber({}, { message: 'north must be a number' })
    @Min(-90, { message: 'north must be between -90 and 90' })
    @Max(90, { message: 'north must be between -90 and 90' })
    north!: number;

    @Type(() => Number)
    @IsNumber({}, { message: 'south must be a number' })
    @Min(-90, { message: 'south must be between -90 and 90' })
    @Max(90, { message: 'south must be between -90 and 90' })
    south!: number;

    @Type(() => Number)
    @IsNumber({}, { message: 'east must be a number' })
    @Min(-180, { message: 'east must be between -180 and 180' })
    @Max(180, { message: 'east must be between -180 and 180' })
    east!: number;

    @Type(() => Number)
    @IsNumber({}, { message: 'west must be a number' })
    @Min(-180, { message: 'west must be between -180 and 180' })
    @Max(180, { message: 'west must be between -180 and 180' })
    west!: number;
}
