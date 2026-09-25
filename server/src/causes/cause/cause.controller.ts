import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CauseService } from './cause.service';
import { CreateCauseDto } from './dto/create-cause.dto';
import { UpdateCauseDto } from './dto/update-cause.dto';

@Controller('cause')
export class CauseController {
  constructor(private readonly causeService: CauseService) {}

  @Post()
  create(@Body() createCauseDto: CreateCauseDto) {
    return this.causeService.create(createCauseDto);
  }

  @Get()
  findAll() {
    return this.causeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.causeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCauseDto: UpdateCauseDto) {
    return this.causeService.update(+id, updateCauseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.causeService.remove(+id);
  }
}
