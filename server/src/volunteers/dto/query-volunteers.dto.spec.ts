import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QueryVolunteersDto } from './query-volunteers.dto';

describe('QueryVolunteersDto', () => {
    it('should transform numeric strings to numbers and retain default values', async () => {
        const plain = {
            page: '4',
            limit: '25',
            skill_id: '5',
            category_id: '2',
            search: 'volunteer',
        };

        const dto = plainToInstance(QueryVolunteersDto, plain);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.page).toBe(4);
        expect(dto.limit).toBe(25);
        expect(dto.skill_id).toBe(5);
        expect(dto.category_id).toBe(2);
        expect(dto.search).toBe('volunteer');
    });

    it('should use default values when omitted', () => {
        const dto = new QueryVolunteersDto();
        expect(dto.page).toBe(1);
        expect(dto.limit).toBe(10);
    });
});

