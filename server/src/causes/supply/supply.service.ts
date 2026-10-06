import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSupplyDto } from './dto/create-supply.dto';
import { UpdateSupplyDto } from './dto/update-supply.dto';
import { Supply } from '../entities/supply.entity';
import { Cause } from '../entities/cause.entity';
import { CauseNotFoundException } from '../../common/exceptions';

@Injectable()
export class SupplyService {
    constructor(
        @InjectRepository(Supply)
        private readonly supplyRepository: Repository<Supply>,
        @InjectRepository(Cause)
        private readonly causeRepository: Repository<Cause>,
    ) {}

    async create(causeId: number, createSupplyDto: CreateSupplyDto): Promise<Supply> {
        const cause = await this.causeRepository.findOne({
            where: { id: causeId },
        });

        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }

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

    async update(causeId: number, supplyId: number, updateSupplyDto: UpdateSupplyDto): Promise<Supply> {
        const cause = await this.causeRepository.findOne({
            where: { id: causeId },
        });

        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }

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

    async remove(causeId: number, supplyId: number): Promise<{ message: string }> {
        const cause = await this.causeRepository.findOne({
            where: { id: causeId },
        });

        if (!cause) {
            throw new CauseNotFoundException(causeId);
        }

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
