import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VolunteerService } from './volunteer.service';
import { Volunteer } from '../entities/volunteer.entity';
import { User } from '../../users/entities/user.entity';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { VolunteerNotFoundException, UserNotFoundException } from '../../common/exceptions';

describe('VolunteerService', () => {
    let service: VolunteerService;
    let volunteerRepository: jest.Mocked<Repository<Volunteer>>;
    let userRepository: jest.Mocked<Repository<User>>;

    const mockUser: User = {
        id: 1,
        name: 'Ana Gomez',
        username: 'anagomez',
        email: 'ana@kindly.org',
        contact: '+573001112233',
        password: 'hashedpassword',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
    } as unknown as User;

    const mockVolunteer: Volunteer = {
        id: 1,
        user_id: 1,
        description: 'Volunteer bio',
        shirt_size: 'M',
        height: '170',
        health_center: 'Centro de Salud',
        blood_type: 'O+',
        emergency_contact: '+573112223344',
        user: { ...mockUser },
        volunteerSkills: [],
        volunteerCategories: [],
        volunteerAchievements: [],
    } as unknown as Volunteer;

    beforeEach(() => {
        volunteerRepository = {
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        } as unknown as jest.Mocked<Repository<Volunteer>>;

        userRepository = {
            findOneBy: jest.fn(),
        } as unknown as jest.Mocked<Repository<User>>;

        service = new VolunteerService(volunteerRepository, userRepository);
    });

    describe('create', () => {
        const createDto: CreateVolunteerDto = {
            user_id: 1,
            description: 'Volunteer bio',
            shirt_size: 'M',
            height: '170',
            health_center: 'Centro de Salud',
            blood_type: 'O+',
            emergency_contact: '+573112223344',
        };

        it('should throw UserNotFoundException when user does not exist', async () => {
            userRepository.findOneBy.mockResolvedValue(null);

            await expect(service.create(createDto)).rejects.toThrow(UserNotFoundException);
        });

        it('should throw ConflictException when volunteer profile already exists for user', async () => {
            userRepository.findOneBy.mockResolvedValue(mockUser);
            volunteerRepository.findOneBy.mockResolvedValue(mockVolunteer);

            await expect(service.create(createDto)).rejects.toThrow(ConflictException);
        });

        it('should successfully create and return a sanitized volunteer', async () => {
            userRepository.findOneBy.mockResolvedValue(mockUser);
            volunteerRepository.findOneBy.mockResolvedValue(null);
            volunteerRepository.create.mockReturnValue(mockVolunteer);
            volunteerRepository.save.mockResolvedValue(mockVolunteer);
            volunteerRepository.findOne.mockResolvedValue({ ...mockVolunteer, user: { ...mockUser } });

            const result = await service.create(createDto);

            expect(result.id).toBe(1);
            expect(result.user?.password).toBeUndefined();
            expect(volunteerRepository.save).toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return all volunteers sanitized without password', async () => {
            const list = [{ ...mockVolunteer, user: { ...mockUser } }];
            volunteerRepository.find.mockResolvedValue(list);

            const result = await service.findAll();

            expect(result).toHaveLength(1);
            expect(result[0].user?.password).toBeUndefined();
        });

        it('should handle volunteers without user property when sanitizing', async () => {
            const volunteerWithoutUser: Volunteer = {
                id: 2,
                user_id: 2,
                shirt_size: 'S',
                height: '160',
                health_center: 'Hospital',
                blood_type: 'A+',
                emergency_contact: '123',
            } as Volunteer;

            volunteerRepository.find.mockResolvedValue([volunteerWithoutUser]);

            const result = await service.findAll();

            expect(result).toHaveLength(1);
            expect(result[0].user).toBeUndefined();
        });
    });

    describe('findOne', () => {
        it('should throw VolunteerNotFoundException when volunteer is not found', async () => {
            volunteerRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(VolunteerNotFoundException);
        });

        it('should return sanitized volunteer when found', async () => {
            volunteerRepository.findOne.mockResolvedValue({ ...mockVolunteer, user: { ...mockUser } });

            const result = await service.findOne(1);

            expect(result.id).toBe(1);
            expect(result.user?.password).toBeUndefined();
        });
    });

    describe('update', () => {
        const updateDto: UpdateVolunteerDto = {
            shirt_size: 'L',
        };

        it('should update volunteer details and return updated entity', async () => {
            volunteerRepository.findOne.mockResolvedValue({ ...mockVolunteer, user: { ...mockUser } });
            volunteerRepository.update.mockResolvedValue({ raw: [], generatedMaps: [], affected: 1 });

            const result = await service.update(1, updateDto);

            expect(result.id).toBe(1);
            expect(volunteerRepository.update).toHaveBeenCalledWith(1, { shirt_size: 'L' });
        });
    });

    describe('remove', () => {
        it('should find and delete the volunteer by id', async () => {
            volunteerRepository.findOne.mockResolvedValue({ ...mockVolunteer, user: { ...mockUser } });
            volunteerRepository.delete.mockResolvedValue({ raw: [], affected: 1 });

            await service.remove(1);

            expect(volunteerRepository.delete).toHaveBeenCalledWith(1);
        });
    });
});
