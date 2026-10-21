import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as dataDisplay from '..';

const testDirectory = dirname(fileURLToPath(import.meta.url));

describe('SarakDataDisplay public lazy boundary', () => {
    it('keeps the lazy grids public and their implementations private', () => {
        expect(dataDisplay.SarakDataTable).toBeDefined();
        expect(dataDisplay.SarakDataGrid).toBeDefined();
        expect(dataDisplay).not.toHaveProperty('SarakDataTableImpl');
        expect(dataDisplay).not.toHaveProperty('SarakDataGridImpl');
    });

    it('reaches both implementations only through dynamic imports', () => {
        const tableSource = readFileSync(resolve(testDirectory, '../SarakDataTable/index.ts'), 'utf8');
        const gridSource = readFileSync(resolve(testDirectory, '../SarakDataGrid/index.ts'), 'utf8');

        expect(tableSource).toContain("lazy(() => import('./SarakDataTableImpl'))");
        expect(gridSource).toContain("lazy(() => import('./SarakDataGridImpl'))");
    });
});
