import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateAttendanceDto {
    // TODO: tomar el voluntario del JWT cuando auth (Persona 1) esté integrado a develop
    @IsInt()
    @IsPositive()
    volunteer_id!: number;

    // Código leído del QR de la causa; identifica la causa (Cause.qr_code)
    @IsString()
    @IsNotEmpty()
    qr_code!: string;
}
