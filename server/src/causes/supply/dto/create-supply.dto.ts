import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplyDto {
    @IsString({ message: 'item_name must be a string' })
    @IsNotEmpty({ message: 'item_name should not be empty' })
    item_name!: string;

    @IsInt({ message: 'quantity_needed must be an integer' })
    @IsPositive({ message: 'quantity_needed must be a positive number' })
    @Type(() => Number)
    quantity_needed!: number;

    @IsUrl({}, { message: 'image must be a URL address' })
    @IsNotEmpty({ message: 'image should not be empty' })
    image!: string;

    @IsOptional()
    @IsBoolean({ message: 'needed must be a boolean' })
    needed?: boolean;
}
