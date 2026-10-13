import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';

import { OrganizationsService } from './organizations.service';
import { OrganizationTypeService } from './organization-type/organization-type.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { SubmitVerificationDto } from './dto/submit-verification.dto';
import { ReviewVerificationDto } from './dto/review-verification.dto';
import { QueryOrganizationsDto } from './dto/query-organizations.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permission.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('organizations')
export class OrganizationsController {
    constructor(
        private readonly organizationsService: OrganizationsService,
        private readonly organizationTypeService: OrganizationTypeService,
    ) {}

    @Get('types')
    async getTypes() {
        return await this.organizationTypeService.findAll();
    }

    @Get('me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('organizer')
    async getMyProfile(@CurrentUser('id') userId: number) {
        return await this.organizationsService.findByUserId(userId);
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('organizer')
    async updateMyProfile(@CurrentUser('id') userId: number, @Body() updateDto: UpdateOrganizationDto) {
        return await this.organizationsService.updateByUserId(userId, updateDto);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('organizer')
    @HttpCode(HttpStatus.CREATED)
    async createMyProfile(@CurrentUser('id') userId: number, @Body() createDto: CreateOrganizationDto) {
        return await this.organizationsService.create(userId, createDto);
    }

    @Post('me/verification-document')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('organizer')
    async submitVerificationDocument(@CurrentUser('id') userId: number, @Body() dto: SubmitVerificationDto) {
        return await this.organizationsService.submitVerification(userId, dto);
    }

    @Get('me/verification-status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('organizer')
    async getVerificationStatus(@CurrentUser('id') userId: number) {
        return await this.organizationsService.getVerificationStatus(userId);
    }

    @Get('admin/pending')
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles('admin')
    @Permissions('manage_organizations')
    async getPendingVerifications() {
        return await this.organizationsService.findPendingVerifications();
    }

    @Patch(':id/verify')
    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles('admin')
    @Permissions('manage_organizations')
    async reviewVerification(@Param('id', ParseIntPipe) id: number, @Body() dto: ReviewVerificationDto) {
        return await this.organizationsService.reviewVerification(id, dto);
    }

    @Get()
    async findAll(@Query() query: QueryOrganizationsDto) {
        return await this.organizationsService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return await this.organizationsService.findOne(id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.organizationsService.remove(id);
    }
}
