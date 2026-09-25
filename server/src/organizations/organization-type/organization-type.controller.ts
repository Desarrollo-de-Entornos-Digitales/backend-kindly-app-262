import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrganizationTypeService } from './organization-type.service';
import { CreateOrganizationTypeDto } from './dto/create-organization-type.dto';
import { UpdateOrganizationTypeDto } from './dto/update-organization-type.dto';

@Controller('organization-type')
export class OrganizationTypeController {
  constructor(private readonly organizationTypeService: OrganizationTypeService) {}

  @Post()
  create(@Body() createOrganizationTypeDto: CreateOrganizationTypeDto) {
    return this.organizationTypeService.create(createOrganizationTypeDto);
  }

  @Get()
  findAll() {
    return this.organizationTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganizationTypeDto: UpdateOrganizationTypeDto) {
    return this.organizationTypeService.update(+id, updateOrganizationTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationTypeService.remove(+id);
  }
}
