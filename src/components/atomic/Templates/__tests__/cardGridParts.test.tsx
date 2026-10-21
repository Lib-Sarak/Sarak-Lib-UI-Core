import { describe, expect, it } from 'vitest';
import { filterCardGridRecords } from '../cardGridParts';

describe('filterCardGridRecords', () => {
    it('matches nested labels, search text, and active filters', () => {
        const records = [
            { profile: { name: 'Ana' }, group: 'alpha' },
            { profile: { name: 'Bia' }, group: 'beta' },
        ];
        const filtered = filterCardGridRecords({
            records,
            mapping: { title: 'profile.name' },
            filters: [{ id: 'group', label: 'Grupo', type: 'SELECT', field: 'group' }],
            search: 'an',
            activeFilters: { group: 'alpha' },
        });

        expect(filtered).toEqual([records[0]]);
    });
});
