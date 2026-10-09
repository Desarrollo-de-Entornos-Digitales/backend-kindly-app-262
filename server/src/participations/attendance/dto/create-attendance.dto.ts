import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateAttendanceDto {
    @IsInt()
    @IsPositive()
    volunteer_id!: number;

    @IsString()
    @IsNotEmpty()
    qr_code!: string;
}
