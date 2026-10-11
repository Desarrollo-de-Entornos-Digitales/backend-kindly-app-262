import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { SkillService } from './skill.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillNotFoundException } from '../../common/exceptions';

@Controller(['skills', 'skill'])
export class SkillController {
    constructor(private readonly skillService: SkillService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createSkillDto: CreateSkillDto) {
        return await this.skillService.create(createSkillDto);
    }

    @Get()
    async findAll() {
        return await this.skillService.findAll();
    }

    @Get('name/:name')
    async findByName(@Param('name') name: string) {
        const skill = await this.skillService.findByName(name);
        if (!skill) {
            throw new SkillNotFoundException(name);
        }
        return skill;
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.skillService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateSkillDto: UpdateSkillDto) {
        return await this.skillService.update(id, updateSkillDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.skillService.remove(id);
    }
}
