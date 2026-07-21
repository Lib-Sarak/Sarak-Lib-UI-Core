// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readInstalledCommit } from '../readInstalledCommit.mjs';

describe('readInstalledCommit', () => {
    it('lockfile v2/v3: lê o resolved de packages["node_modules/<pkg>"]', () => {
        const lock = JSON.stringify({
            packages: {
                'node_modules/@sarak/lib-ui-core': {
                    resolved: 'git+ssh://git@github.com/Lib-Sarak/Sarak-Lib-UI-Core.git#7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223',
                },
            },
        });
        expect(readInstalledCommit(lock)).toBe('7fd0bd1dda35570ee0ed53291b15a5fc0ccd3223');
    });

    it('lockfile v1 legado: cai no fallback dependencies[<pkg>].resolved', () => {
        const lock = JSON.stringify({
            dependencies: {
                '@sarak/lib-ui-core': {
                    resolved: 'git+https://github.com/Lib-Sarak/Sarak-Lib-UI-Core.git#599341cc9aefad8e55a0c18c97ccc45fc81b945f',
                },
            },
        });
        expect(readInstalledCommit(lock)).toBe('599341cc9aefad8e55a0c18c97ccc45fc81b945f');
    });

    it('sem entrada da lib no lockfile -> null', () => {
        expect(readInstalledCommit(JSON.stringify({ packages: {} }))).toBeNull();
    });

    it('resolved sem "#" (não é dependência git) -> null', () => {
        const lock = JSON.stringify({
            packages: { 'node_modules/@sarak/lib-ui-core': { resolved: 'https://registry.npmjs.org/@sarak/lib-ui-core/-/lib-ui-core-3.0.0.tgz' } },
        });
        expect(readInstalledCommit(lock)).toBeNull();
    });
});
