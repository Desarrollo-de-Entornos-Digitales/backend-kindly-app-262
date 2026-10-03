import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnnouncementReactionService } from './announcement-reaction.service';
import { CreateAnnouncementReactionDto } from './dto/create-announcement-reaction.dto';
import { UpdateAnnouncementReactionDto } from './dto/update-announcement-reaction.dto';

@Controller('announcement-reaction')
export class AnnouncementReactionController {
    constructor(private readonly announcementReactionService: AnnouncementReactionService) {}

    @Post()
    create(@Body() createAnnouncementReactionDto: CreateAnnouncementReactionDto) {
        return this.announcementReactionService.create(createAnnouncementReactionDto);
    }

    @Get()
    findAll() {
        return this.announcementReactionService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.announcementReactionService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateAnnouncementReactionDto: UpdateAnnouncementReactionDto) {
        return this.announcementReactionService.update(+id, updateAnnouncementReactionDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.announcementReactionService.remove(+id);
    }
}
