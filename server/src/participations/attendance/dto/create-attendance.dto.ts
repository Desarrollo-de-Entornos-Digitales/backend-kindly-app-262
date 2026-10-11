import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAttendanceDto {
    @IsString()
    @IsNotEmpty()
    qr_code!: string;
}
