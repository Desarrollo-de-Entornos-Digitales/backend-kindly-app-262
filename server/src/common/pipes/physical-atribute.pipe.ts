import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface PhysicalAttributes {
    bloodType: string;
    size: string;
    height: number;
}

@Injectable()
export class PhysicalAttributesPipe implements PipeTransform {
    transform(value: PhysicalAttributes) {
        if (!value.bloodType || !value.size || !value.height) {
            throw new BadRequestException('Todos los campos (bloodType, size, height) son requeridos');
        }

        const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        if (!validBloodTypes.includes(value.bloodType)) {
            throw new BadRequestException('Tipo de sangre inválido');
        }

        const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        if (!validSizes.includes(value.size)) {
            throw new BadRequestException('Talla invalida');
        }

        if (value.height < 50 || value.height > 280) {
            throw new BadRequestException('Altura inválida');
        }

        return value;
    }
}
