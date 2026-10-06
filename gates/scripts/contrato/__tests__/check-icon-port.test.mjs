import { expect, it } from 'vitest';
import { findForbiddenIconImports } from '../check-icon-port.mjs';

const THIRD_IMPORT_LINE = 3;
const FOURTH_IMPORT_LINE = 4;

it('falha para import, reexport, require e import() estáticos das três famílias', () => {
    const files = {
        'components/Example.tsx': "import { Search } from 'lucide-react';\nexport { Icon } from '@phosphor-icons/react';\nconst icons = require('@tabler/icons-react');\nconst lazy = import('lucide-react');",
    };
    expect(findForbiddenIconImports({ files })).toEqual([
        { file: 'components/Example.tsx', packageName: 'lucide-react', line: 1 },
        { file: 'components/Example.tsx', packageName: '@phosphor-icons/react', line: 2 },
        { file: 'components/Example.tsx', packageName: '@tabler/icons-react', line: THIRD_IMPORT_LINE },
        { file: 'components/Example.tsx', packageName: 'lucide-react', line: FOURTH_IMPORT_LINE },
    ]);
});

it('passa para as pastas de família e autoria e ignora JS/JSX', () => {
    const files = {
        'components/atomic/Icon/families/lucideIcons.ts': "import { Search } from 'lucide-react';",
        'features/DesignEngine/Panel.tsx': "import { Search } from 'lucide-react';",
        'components/Legacy.js': "import { Search } from 'lucide-react';",
        'components/Legacy.jsx': "import { Search } from 'lucide-react';",
    };
    expect(findForbiddenIconImports({ files })).toEqual([]);
});

it('ignora TypeScript fora da raiz src', () => {
    const files = {
        '../outside/Legacy.tsx': "import { Search } from 'lucide-react';",
    };
    expect(findForbiddenIconImports({ files })).toEqual([]);
});

it('falha fora das exceções e passa para um nome de pacote calculado em runtime', () => {
    const files = {
        'components/Allowed.tsx': "const packageName = 'lucide-react';\nimport(packageName);",
        'core/Provider.ts': "import { Search } from '@tabler/icons-react';",
    };
    expect(findForbiddenIconImports({ files })).toEqual([
        { file: 'core/Provider.ts', packageName: '@tabler/icons-react', line: 1 },
    ]);
});

it('falha para subpaths e passa para pacotes alternativos', () => {
    const files = {
        'components/Example.tsx': "import { Search } from 'lucide-react/dynamic';\nimport { Search } from 'vendor-lucide-react';",
    };
    expect(findForbiddenIconImports({ files })).toEqual([
        { file: 'components/Example.tsx', packageName: 'lucide-react/dynamic', line: 1 },
    ]);
});
