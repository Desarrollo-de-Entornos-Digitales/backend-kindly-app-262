import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateRolePermissionDto {
    @IsInt({ message: 'The role_id must be an integer' })
    @IsNotEmpty({ message: 'The role_id is required' })
    role_id!: number;

    @IsInt({ message: 'The permission_id must be an integer' })
    @IsNotEmpty({ message: 'The permission_id is required' })
    permission_id!: number;
}
