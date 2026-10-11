import { Injectable } from '@nestjs/common';
import { CreateOrganizationTypeDto } from './dto/create-organization-type.dto';
import { UpdateOrganizationTypeDto } from './dto/update-organization-type.dto';

@Injectable()
export class OrganizationTypeService {
    create(_createOrganizationTypeDto: CreateOrganizationTypeDto) {
        return 'This action adds a new organizationType';
    }

    findAll() {
        return `This action returns all organizationType`;
    }

    findOne(id: number) {
        return `This action returns a #${id} organizationType`;
    }

    update(id: number, _updateOrganizationTypeDto: UpdateOrganizationTypeDto) {
        return `This action updates a #${id} organizationType`;
    }

    remove(id: number) {
        return `This action removes a #${id} organizationType`;
    }
}
