import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationTypeDto } from './create-organization-type.dto';

export class UpdateOrganizationTypeDto extends PartialType(CreateOrganizationTypeDto) {}
