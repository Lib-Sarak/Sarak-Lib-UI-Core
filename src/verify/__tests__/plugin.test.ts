// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { Linter } from 'eslint';
import { describe, expect, it } from 'vitest';
import plugin, { rules } from '../plugin';
import { RULE_CATALOG } from '../ruleCatalog';
import { loadVerificationData } from '../data';
import { DEFAULT_THEME_KEY, PALETTE_KEY, THEME_OPTIONS_KEY } from '../rules/names';

const run = (rule: string, code: string, options: unknown = {}, filename = 'src/pages/List.tsx') => {
    const linter = new Linter({ configType: 'flat', cwd: '/proj' });
    return linter.verify(
        code,
        [{
            files: ['**/*.tsx', '**/*.ts'],
            plugins: { sarak: plugin as never },
            languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } } },
            rules: { [`sarak/${rule}`]: ['error', options] },
        }],
        { filename: `/proj/${filename}` },
    );
};

const reproves = (rule: string, code: string, options?: unknown, filename?: string) => {
    const messages = run(rule, code, options, filename);
    expect(messages.length, JSON.stringify(messages)).toBeGreaterThan(0);
    return messages;
};
const passes = (rule: string, code: string, options?: unknown, filename?: string) =>
    expect(run(rule, code, options, filename)).toEqual([]);

describe('catálogo de regras', () => {
    it('toda regra do plugin está no catálogo e a regra de porta só-comando não está no plugin', () => {
        for (const id of Object.keys(rules)) expect(RULE_CATALOG[id].port).not.toBe('comando');
        for (const [id, info] of Object.entries(RULE_CATALOG)) {
            expect(Boolean(rules[id]), id).toBe(info.port !== 'comando');
        }
    });
    it('as chaves que as regras procuram existem no catálogo gerado', () => {
        const { catalog } = loadVerificationData();
        expect(catalog.designTokens.ids.map((token) => token.id)).toContain(PALETTE_KEY);
        expect(catalog.components.SarakUIProvider.props?.map((prop) => prop.name)).toContain('activeThemeId');
        // `defaultTheme` mora nas opções do Provider, que o catálogo não detalha: a fonte é o tipo.
        expect(fs.readFileSync(path.join(process.cwd(), 'src/core/Provider/types.ts'), 'utf-8')).toContain(`${DEFAULT_THEME_KEY}?:`);
        expect(THEME_OPTIONS_KEY).toBe('theme');
        expect(catalog.barrelExports).toContain('sarakRegisterIcons');
    });
    it('o recommended existe e nasce vazio', () => {
        expect((plugin.configs.recommended as { rules: object }).rules).toEqual({});
    });
});

describe('single-entrypoint', () => {
    const allow = { allow: ['packages/ui-kit/src/**'] };
    it('reprova import fora da porta', () => {
        const [message] = reproves('single-entrypoint', "import { SarakButton } from '@sarak/lib-ui-core';", allow, 'modules/a/List.tsx');
        expect(message.line).toBe(1);
        expect(message.message).toContain('SarakButton');
    });
    it('passa na porta, em outro pacote e sem a opção', () => {
        passes('single-entrypoint', "import { SarakButton } from '@sarak/lib-ui-core';", allow, 'packages/ui-kit/src/index.ts');
        passes('single-entrypoint', "import { SarakButton } from '@erp/ui-kit';", allow, 'modules/a/List.tsx');
        passes('single-entrypoint', "import { SarakButton } from '@sarak/lib-ui-core';");
    });
});

describe('no-deep-import', () => {
    it('reprova caminho fora do exports', () => {
        reproves('no-deep-import', "import X from '@sarak/lib-ui-core/dist/components/atomic/Buttons/SarakButton';");
    });
    it('passa raiz e subpaths publicados', () => {
        passes('no-deep-import', "import { A } from '@sarak/lib-ui-core'; import '@sarak/lib-ui-core/sarak.css'; import * as t from '@sarak/lib-ui-core/testing'; import e from '@sarak/lib-ui-core/eslint';");
    });
});

describe('known-css-var', () => {
    it('reprova os cinco nomes reais do ERP e sugere parecidos', () => {
        for (const name of ['border-radius-md', 'border-radius-lg', 'layout-gap-xs', 'card-padding-lg', 'card-border']) {
            const [message] = reproves('known-css-var', `const s = { padding: 'var(--sarak-${name}, 8px)' };`);
            expect(message.message).toContain(`--sarak-${name}`);
        }
    });
    it('passa nome público, variável declarada no arquivo e ignorada', () => {
        passes('known-css-var', "const s = { padding: 'var(--sarak-card-radius, 8px)' };");
        passes('known-css-var', "const s = { '--sarak-meu': 1, padding: 'var(--sarak-meu, 8px)' };");
        passes('known-css-var', "const s = 'var(--sarak-x-y)';", { ignore: ['--sarak-x-y'] });
    });
    it('reprovar tira o teste do chão: sem o nome no catálogo, o público passaria a falhar', () => {
        expect(loadVerificationData().cssVars.has('--sarak-card-radius')).toBe(true);
    });
});

describe('prefer-sarak-component', () => {
    it('reprova h2, fieldset e section com título', () => {
        reproves('prefer-sarak-component', 'const a = <h2 className="t">Pedidos</h2>;');
        reproves('prefer-sarak-component', 'const a = <fieldset>x</fieldset>;');
        const [message] = reproves('prefer-sarak-component', 'const a = <section><h2>Itens</h2></section>;');
        expect(message.message).toContain('SarakSection');
    });
    it('passa componente, section sem título e arquivo permitido', () => {
        passes('prefer-sarak-component', 'const a = <SarakSection title="x" />;');
        passes('prefer-sarak-component', 'const a = <section hidden={x}><div>a</div></section>;');
        passes('prefer-sarak-component', 'const a = <h2>x</h2>;', { allow: ['src/pages/**'] });
    });
    it('nav só reprova com link dentro', () => {
        reproves('prefer-sarak-component', 'const a = <nav><a href="/x">x</a></nav>;');
        passes('prefer-sarak-component', 'const a = <nav><button>x</button></nav>;');
    });
});

describe('no-reimplemented-piece', () => {
    it('reprova nome igual (S1), apelido (S2) e dublê em caminho de teste', () => {
        reproves('no-reimplemented-piece', 'export function errorMessage(c) { return String(c); }', {}, 'packages/ui-kit/src/x.ts');
        reproves('no-reimplemented-piece', 'export const isValidBrazilianCnpj = (v) => true;');
        reproves('no-reimplemented-piece', 'export function LinkPagination() { return null; }');
        const [message] = reproves('no-reimplemented-piece', 'export const SarakDataTable = () => null;', {}, 'packages/ui-kit/testing/index.tsx');
        expect(message.message).toContain('createSarakKitMock');
    });
    it('passa variável local, nome sem par e re-export', () => {
        passes('no-reimplemented-piece', 'const errorMessage = sarakErrorMessage(e); export const x = errorMessage;');
        passes('no-reimplemented-piece', 'export function formatarTudoDeOutroJeito() {}', {}, 'src/zz.ts');
        passes('no-reimplemented-piece', "export { SarakButton } from '@sarak/lib-ui-core';", {}, 'src/zz.ts');
    });
    it('acusa pelo nome do arquivo quando nenhum export acusou', () => {
        reproves('no-reimplemented-piece', 'export default 1;', {}, 'src/errorMessage.ts');
    });
});

describe('no-literal-color-font', () => {
    it('reprova cor e fonte literais', () => {
        reproves('no-literal-color-font', "const a = <div style={{ background: '#fff' }} />;");
        reproves('no-literal-color-font', "const a = <div style={{ fontFamily: \"'Inter', sans-serif\" }} />;");
    });
    it('passa var com reserva, palavras-chave e glob permitido', () => {
        passes('no-literal-color-font', "const a = <div style={{ color: 'var(--sarak-primary-color, #19e3f0)', background: 'transparent', borderColor: 'currentColor' }} />;");
        passes('no-literal-color-font', "const a = <div style={{ background: '#fff' }} />;", { allow: ['src/pages/**'] });
    });
});

describe('no-direct-wrapped-lib', () => {
    it('reprova echarts-for-react e aponta o componente', () => {
        const [message] = reproves('no-direct-wrapped-lib', "import ReactECharts from 'echarts-for-react';");
        expect(message.message).toContain('SarakChartEngine');
    });
    it('passa componente e peer comum', () => {
        passes('no-direct-wrapped-lib', "import { SarakChartEngine } from '@sarak/lib-ui-core'; import clsx from 'clsx';");
    });
});

describe('no-internal-class-selector', () => {
    it('reprova classe interna em seletor', () => {
        reproves('no-internal-class-selector', "page.locator('.sarak-card');");
        reproves('no-internal-class-selector', "document.querySelector('[class*=\"sarak\"]');");
    });
    it('passa alvos estáveis', () => {
        passes('no-internal-class-selector', "page.locator('[data-sarak-content]'); page.getByTestId('sarak-panel-apply'); el.querySelector('[data-theme-id=\"x\"]');");
    });
});

describe('valid-spacing-value', () => {
    it('reprova gap="md" e sugere o token', () => {
        const [message] = reproves('valid-spacing-value', 'const a = <SarakFlex gap="md" />;');
        expect(message.message).toContain('spacing-md');
    });
    it('passa token, comprimento, var e variável', () => {
        passes('valid-spacing-value', 'const a = <><SarakFlex gap="spacing-md" /><SarakFlex gap="16px" /><SarakFlex gap="var(--sarak-layout-gap-md, 16px)" /><SarakFlex gap={gap} /></>;');
    });
});

describe('known-icon-name', () => {
    it('reprova nome inexistente em SarakIcon e em navItems', () => {
        reproves('known-icon-name', 'const a = <SarakIcon name="Rocketship" />;');
        reproves('known-icon-name', "const a = <SarakAppChrome navItems={[{ id: 'a', label: 'A', icon: 'Dashbord' }]} />;");
    });
    it('passa nome do catálogo, variável e nome liberado', () => {
        passes('known-icon-name', 'const a = <SarakIcon name="Home" />;');
        passes('known-icon-name', 'const a = <SarakIcon name={nome} />;');
        passes('known-icon-name', 'const a = <SarakIcon name="MeuIcone" />;', { allow: ['MeuIcone'] });
    });
});

describe('known-theme-id', () => {
    it('reprova tema e paleta desconhecidos', () => {
        reproves('known-theme-id', 'const a = <SarakUIProvider activeThemeId="synthwave-neon" />;');
        reproves('known-theme-id', "const o = { theme: { defaultTheme: 'nao-existe' } };");
        reproves('known-theme-id', "const d = { colorPalette: 'matrix' };");
    });
    it('passa embarcado, custom, variável e liberado', () => {
        passes('known-theme-id', 'const a = <SarakUIProvider activeThemeId="cyberpunk-neon" initialTheme={x} />;');
        passes('known-theme-id', "const d = { colorPalette: 'oceano' }; const e = { colorPalette: 'custom:triadic:#336699' };");
        passes('known-theme-id', 'const a = <SarakUIProvider activeThemeId="erp-corporativo" />;', { allow: ['erp-corporativo'] });
    });
});
