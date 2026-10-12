import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class NearbyCausesQueryDto {
    @Type(() => Number)
    @IsNumber({}, { message: 'lat must be a number' })
    @Min(-90, { message: 'lat must be between -90 and 90' })
    @Max(90, { message: 'lat must be between -90 and 90' })
    lat!: number;

    @Type(() => Number)
    @IsNumber({}, { message: 'lng must be a number' })
    @Min(-180, { message: 'lng must be between -180 and 180' })
    @Max(180, { message: 'lng must be between -180 and 180' })
    lng!: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'radius_km must be a number' })
    @Min(0.1, { message: 'radius_km must be at least 0.1' })
    @Max(100, { message: 'radius_km must not exceed 100' })
    radius_km?: number;
}
