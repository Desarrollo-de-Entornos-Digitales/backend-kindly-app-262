import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { Supply } from '../entities/supply.entity';
import { Cause } from '../entities/cause.entity';
import { Organizer } from '../../organizations/entities/organizer.entity';
import { CauseNotFoundException, OrganizerNotFoundException } from '../../common/exceptions';

@Injectable()
export class SupplyService {
    constructor(
        @InjectRepository(Supply)
        private readonly supplyRepository: Repository<Supply>,
        @InjectRepository(Cause)
        private readonly causeRepository: Repository<Cause>,
        @InjectRepository(Organizer)
        private readonly organizerRepository: Repository<Organizer>,
    ) {}

    private async validateCauseOwnership(causeId: number, organizerId: number): Promise<Cause> {
        // 1. Validar existencia del organizador
        const organizer = await this.organizerRepository.findOne({
            where: { id: organizerId },
        });

        if (!organizer) {
            throw new OrganizerNotFoundException(organizerId);
        }

        // 2. Validar existencia de la causa
        const cause = await this.causeRepository.findOne({
            where: { id: causeId },
        });

        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }

        // 3. Validar pertenencia: la causa debe pertenecer al organizer solicitante
        if (cause.organizer_id !== organizerId) {
            throw new ForbiddenException(
                `Cause with ID '${causeId}' does not belong to organizer with ID '${organizerId}'.`,
            );
        }

        return cause;
    }

    async create(causeId: number, organizerId: number, createSupplyDto: CreateSupplyDto): Promise<Supply> {
        const cause = await this.validateCauseOwnership(causeId, organizerId);

        const supply = this.supplyRepository.create({
            ...createSupplyDto,
            cause_id: causeId,
            cause,
            needed: createSupplyDto.needed ?? true,
        });

        return await this.supplyRepository.save(supply);
    }

    async findAllByCause(causeId: number): Promise<Supply[]> {
        const cause = await this.causeRepository.findOne({
            where: { id: causeId },
        });

        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }

        return await this.supplyRepository.find({
            where: { cause_id: causeId },
        });
    }

    async update(
        causeId: number,
        supplyId: number,
        organizerId: number,
        updateSupplyDto: UpdateSupplyDto,
    ): Promise<Supply> {
        await this.validateCauseOwnership(causeId, organizerId);

        const supply = await this.supplyRepository.findOne({
            where: { id: supplyId },
        });

        if (!supply) {
            throw new NotFoundException(`Supply with ID '${supplyId}' not found.`);
        }

        if (supply.cause_id !== causeId) {
            throw new BadRequestException(
                `Supply with ID '${supplyId}' does not belong to cause with ID '${causeId}'.`,
            );
        }

        Object.assign(supply, updateSupplyDto);

        return await this.supplyRepository.save(supply);
    }

    async remove(causeId: number, supplyId: number, organizerId: number): Promise<{ message: string }> {
        await this.validateCauseOwnership(causeId, organizerId);

        const supply = await this.supplyRepository.findOne({
            where: { id: supplyId },
        });

        if (!supply) {
            throw new NotFoundException(`Supply with ID '${supplyId}' not found.`);
        }

        if (supply.cause_id !== causeId) {
            throw new BadRequestException(
                `Supply with ID '${supplyId}' does not belong to cause with ID '${causeId}'.`,
            );
        }

        await this.supplyRepository.delete(supplyId);

        return {
            message: `Supply with identifier '${supplyId}' removed successfully.`,
        };
    }
}
