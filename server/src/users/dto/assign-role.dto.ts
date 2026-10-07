import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
    @IsInt({ message: 'role_id must be an integer' })
    @IsNotEmpty({ message: 'role_id is required' })
    role_id!: number;
}
