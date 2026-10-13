import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { QueryOrganizationsDto } from './query-organizations.dto';

describe('QueryOrganizationsDto', () => {
    it('should transform numeric strings and preserve defaults', async () => {
        const plain = {
            page: '3',
            limit: '15',
            organization_type_id: '2',
            search: 'fundacion',
        };

        const dto = plainToInstance(QueryOrganizationsDto, plain);
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
        expect(dto.page).toBe(3);
        expect(dto.limit).toBe(15);
        expect(dto.organization_type_id).toBe(2);
        expect(dto.search).toBe('fundacion');
    });

    it('should transform is_organization string "true" to true and other values to false', async () => {
        const dtoTrue = plainToInstance(QueryOrganizationsDto, { is_organization: 'true' });
        expect(dtoTrue.is_organization).toBe(true);

        const dtoFalse = plainToInstance(QueryOrganizationsDto, { is_organization: 'false' });
        expect(dtoFalse.is_organization).toBe(false);

        const dtoBool = plainToInstance(QueryOrganizationsDto, { is_organization: true });
        expect(dtoBool.is_organization).toBe(true);
    });

    it('should validate verification_status allowed values', async () => {
        const dtoValid = plainToInstance(QueryOrganizationsDto, { verification_status: 'verified' });
        const errorsValid = await validate(dtoValid);
        expect(errorsValid.length).toBe(0);

        const dtoInvalid = plainToInstance(QueryOrganizationsDto, { verification_status: 'unknown_status' });
        const errorsInvalid = await validate(dtoInvalid);
        expect(errorsInvalid.length).toBeGreaterThan(0);
    });
});

