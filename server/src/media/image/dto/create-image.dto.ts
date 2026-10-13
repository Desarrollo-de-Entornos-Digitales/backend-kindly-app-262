import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateImageDto {
    @IsUrl({}, { message: 'image_url must be a URL address' })
    @IsNotEmpty({ message: 'image_url should not be empty' })
    image_url!: string;
}
