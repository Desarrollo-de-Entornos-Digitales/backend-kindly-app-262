import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { Cause } from '../causes/entities/cause.entity';
import { Volunteer } from '../volunteers/entities/volunteer.entity';
import { Submission } from '../participations/entities/submission.entity';
import { SubmissionService } from '../participations/submission/submission.service';
import { CauseNotFoundException } from '../common/exceptions';
import { CauseCardDto } from './dto/cause-card.dto';
import { GetDeckQueryDto } from './dto/get-deck-query.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { DismissMatchDto } from './dto/dismiss-match.dto';

@Injectable()
export class MatchesService {
    constructor(
        @InjectRepository(Cause)
        private readonly causeRepository: Repository<Cause>,
        @InjectRepository(Volunteer)
        private readonly volunteerRepository: Repository<Volunteer>,
        @InjectRepository(Submission)
        private readonly submissionRepository: Repository<Submission>,
        private readonly submissionService: SubmissionService,
    ) {}

    async getDeck(user: any, queryDto?: GetDeckQueryDto): Promise<CauseCardDto[]> {
        const volunteer = await this.volunteerRepository.findOne({
            where: { user_id: user?.id },
        });

        if (!volunteer) {
            throw new NotFoundException(`Volunteer profile not found for user ID '${user?.id}'.`);
        }

        const volunteerSubmissions = await this.submissionRepository.find({
            where: { volunteer_id: volunteer.id },
            select: ['cause_id'],
        });

        const excludedCauseIds = volunteerSubmissions.map((s) => s.cause_id);

        const now = new Date();
        const queryBuilder = this.causeRepository
            .createQueryBuilder('cause')
            .leftJoinAndSelect('cause.organizer', 'organizer')
            .leftJoinAndSelect('cause.category', 'category')
            .where('cause.is_available = :isAvailable', { isAvailable: true })
            .andWhere('cause.progress = :progress', { progress: 'open' })
            .andWhere('cause.end_date >= :now', { now });

        if (excludedCauseIds.length > 0) {
            queryBuilder.andWhere('cause.id NOT IN (:...excludedCauseIds)', { excludedCauseIds });
        }

        queryBuilder.orderBy('cause.start_date', 'ASC');

        const candidateCauses = await queryBuilder.getMany();

        const limit = queryDto?.limit ?? 10;
        const page = queryDto?.page ?? 1;
        const startIndex = (page - 1) * limit;

        const eligibleCards: CauseCardDto[] = [];

        for (const cause of candidateCauses) {
            const occupied = await this.submissionRepository.count({
                where: {
                    cause_id: cause.id,
                    status: Raw((alias) => `LOWER(${alias}) IN ('approved', 'accepted')`),
                },
            });

            const hasCapacity = cause.capacity !== null && cause.capacity !== undefined;
            const capacity = hasCapacity ? cause.capacity : null;
            const isFull = hasCapacity ? occupied >= capacity! : false;

            if (isFull) {
                continue;
            }

            const spotsAvailable = hasCapacity ? Math.max(0, capacity! - occupied) : null;

            eligibleCards.push({
                id: cause.id,
                title: cause.title,
                description: cause.description,
                cover_image_url: cause.cover_image_url,
                organization: {
                    id: cause.organizer?.id,
                    name: cause.organizer?.name,
                    verification_status: cause.organizer?.verification_status,
                    is_verified: cause.organizer?.verification_status?.toLowerCase() === 'verified',
                },
                category: {
                    id: cause.category?.id,
                    name: cause.category?.name,
                },
                start_date: cause.start_date,
                end_date: cause.end_date,
                location: {
                    address: cause.address,
                    latitude: cause.location_latitude,
                    longitude: cause.location_longitude,
                },
                capacity,
                spots_available: spotsAvailable,
                occupied_spots: occupied,
                is_full: false,
            });
        }

        return eligibleCards.slice(startIndex, startIndex + limit);
    }

    async match(userId: number, createMatchDto: CreateMatchDto): Promise<Submission> {
        const justification =
            createMatchDto.justification && createMatchDto.justification.trim().length > 0
                ? createMatchDto.justification
                : 'Postulación generada automáticamente mediante Match en Kindly.';

        return this.submissionService.create(userId, {
            cause_id: createMatchDto.cause_id,
            justification,
        });
    }

    async dismiss(
        _userId: number,
        dismissMatchDto: DismissMatchDto,
    ): Promise<{ dismissed: boolean; cause_id: number }> {
        const cause = await this.causeRepository.findOneBy({ id: dismissMatchDto.cause_id });
        if (!cause) {
            throw new CauseNotFoundException(dismissMatchDto.cause_id);
        }

        return {
            dismissed: true,
            cause_id: dismissMatchDto.cause_id,
        };
    }
}
