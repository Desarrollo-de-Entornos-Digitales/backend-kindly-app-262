import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';
import { Cause } from '../causes/entities/cause.entity';
import { Organizer } from '../organizations/entities/organizer.entity';
import { Image } from '../media/entities/image.entity';
import { AnnouncementReaction } from './entities/announcement-reaction.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { CreateImageDto } from '../media/image/dto/create-image.dto';
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
        @InjectRepository(Image)
        private readonly imageRepository: Repository<Image>,
        @InjectRepository(AnnouncementReaction)
        private readonly announcementReactionRepository: Repository<AnnouncementReaction>,
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

    async addImage(announcementId: number, user: any, createImageDto: CreateImageDto): Promise<Image> {
        const userRole = typeof user?.role === 'string' ? user.role : user?.role?.name;

        let organizer: Organizer | null = null;
        if (userRole !== 'admin') {
            organizer = await this.organizerRepository.findOne({
                where: { user_id: user?.id },
            });

            if (!organizer) {
                throw new OrganizerNotFoundException(undefined, 'ORGANIZER_NOT_FOUND');
            }
        }

        const announcement = await this.announcementRepository.findOne({
            where: { id: announcementId },
            relations: ['cause'],
        });

        if (!announcement) {
            throw new NotFoundException(`Announcement with ID '${announcementId}' not found.`);
        }

        if (userRole !== 'admin') {
            if (!announcement.cause || announcement.cause.organizer_id !== organizer!.id) {
                throw new ForbiddenException(
                    `Announcement with ID '${announcementId}' does not belong to the authenticated organizer.`,
                );
            }
        }

        const image = this.imageRepository.create({
            image_url: createImageDto.image_url,
            announcement_id: announcementId,
            cause_id: null as any,
        });

        return await this.imageRepository.save(image);
    }

    async findImagesByAnnouncement(announcementId: number): Promise<Image[]> {
        const announcement = await this.announcementRepository.findOne({
            where: { id: announcementId },
        });

        if (!announcement) {
            throw new NotFoundException(`Announcement with ID '${announcementId}' not found.`);
        }

        return await this.imageRepository.find({
            where: { announcement_id: announcementId },
        });
    }

    async like(
        announcementId: number,
        user: any,
    ): Promise<{ message: string; announcement_id: number; likes: number }> {
        const announcement = await this.announcementRepository.findOne({
            where: { id: announcementId },
        });

        if (!announcement) {
            throw new NotFoundException(`Announcement with ID '${announcementId}' not found.`);
        }

        const existingReaction = await this.announcementReactionRepository.findOne({
            where: {
                announcement_id: announcementId,
                user_id: user?.id,
            },
        });

        if (existingReaction) {
            throw new ConflictException(`User has already liked announcement with ID '${announcementId}'.`);
        }

        const announcementReaction = this.announcementReactionRepository.create({
            announcement_id: announcementId,
            user_id: user?.id,
            reaction_id: 2,
        });

        try {
            await this.announcementReactionRepository.save(announcementReaction);
        } catch (error: any) {
            if (error?.code === '23505') {
                throw new ConflictException(`User has already liked announcement with ID '${announcementId}'.`);
            }
            throw error;
        }

        announcement.likes = (announcement.likes || 0) + 1;
        await this.announcementRepository.save(announcement);

        return {
            message: 'Announcement liked successfully',
            announcement_id: announcement.id,
            likes: announcement.likes,
        };
    }
}
