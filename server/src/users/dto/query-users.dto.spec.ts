import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QueryUsersDto } from './query-users.dto';

describe('QueryUsersDto', () => {
    it('should transform numeric strings to numbers and keep defaults', async () => {
        const plain = {
            page: '2',
            limit: '20',
            role_id: '3',
            search: 'test',
        };

        const dto = plainToInstance(QueryUsersDto, plain);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.page).toBe(2);
        expect(dto.limit).toBe(20);
        expect(dto.role_id).toBe(3);
        expect(dto.search).toBe('test');
    });

    it('should transform is_active string "true" to boolean true', async () => {
        const dto = plainToInstance(QueryUsersDto, { is_active: 'true' });
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.is_active).toBe(true);
    });

    it('should transform is_active string "false" to boolean false', async () => {
        const dto = plainToInstance(QueryUsersDto, { is_active: 'false' });
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.is_active).toBe(false);
    });

    it('should preserve is_active boolean value and fail on invalid string', async () => {
        const dtoValid = plainToInstance(QueryUsersDto, { is_active: true });
        const errorsValid = await validate(dtoValid);
        expect(errorsValid.length).toBe(0);
        expect(dtoValid.is_active).toBe(true);

        const dtoInvalid = plainToInstance(QueryUsersDto, { is_active: 'invalid' });
        const errorsInvalid = await validate(dtoInvalid);
        expect(errorsInvalid.length).toBeGreaterThan(0);
    });

    it('should fail validation when page or limit is less than 1', async () => {
        const dto = plainToInstance(QueryUsersDto, { page: '0', limit: '-5' });
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThanOrEqual(2);
    });
});

