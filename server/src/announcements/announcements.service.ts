import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { Cause } from '../causes/entities/cause.entity';
import { Organizer } from '../organizations/entities/organizer.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { CauseNotFoundException, OrganizerNotFoundException } from '../common/exceptions';

@Injectable()
export class AnnouncementsService {
    constructor(
        @InjectRepository(Announcement)
        private readonly announcementRepository: Repository<Announcement>,
        @InjectRepository(Cause)
        private readonly causeRepository: Repository<Cause>,
        @InjectRepository(Organizer)
        private readonly organizerRepository: Repository<Organizer>,
    ) {}

    async create(causeId: number, user: any, createAnnouncementDto: CreateAnnouncementDto): Promise<Announcement> {
        const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name;

        if (userRole !== 'admin') {
            // 1. Find organizer associated with the authenticated user
            const organizer = await this.organizerRepository.findOne({
                where: { user_id: user?.id },
            });

            if (!organizer) {
                throw new OrganizerNotFoundException(undefined, 'ORGANIZER_NOT_FOUND');
            }

            // 2. Find cause by causeId
            const cause = await this.causeRepository.findOne({
                where: { id: causeId },
            });

            if (!cause) {
                throw new CauseNotFoundException(causeId);
            }

            // 3. Verify cause ownership
            if (cause.organizer_id !== organizer.id) {
                throw new ForbiddenException(
                    `Cause with ID '${causeId}' does not belong to the authenticated organizer.`,
                );
            }
        } else {
            // For admin, verify cause exists
            const cause = await this.causeRepository.findOne({
                where: { id: causeId },
            });

            if (!cause) {
                throw new CauseNotFoundException(causeId);
            }
        }

        // 4. Create and persist announcement with default likes = 0
        const announcement = this.announcementRepository.create({
            cause_id: causeId,
            title: createAnnouncementDto.title,
            text: createAnnouncementDto.text,
            likes: 0,
        });

        return await this.announcementRepository.save(announcement);
    }

    async findAllByCause(causeId: number): Promise<Announcement[]> {
        const cause = await this.causeRepository.findOne({
            where: { id: causeId },
        });

        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }

        return await this.announcementRepository.find({
            where: { cause_id: causeId },
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Announcement> {
        const announcement = await this.announcementRepository.findOne({
            where: { id },
            relations: ['cause', 'images'],
        });

        if (!announcement) {
            throw new NotFoundException(`Announcement with ID '${id}' not found.`);
        }

        return announcement;
    }
}
