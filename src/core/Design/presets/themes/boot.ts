/**
 * O ÚNICO tema embarcado que vive no boot do consumidor: o padrão do sistema.
 *
 * Os demais chegam por `import()` (`loaders.ts`) quando são escolhidos. Importar
 * outro módulo de tema aqui, ou no barril, devolve o peso ao boot de todo
 * consumidor — a trava estrutural (`themeBootClosure.test.ts`) falha nesse caso.
 */
import { sarakSovereignTheme } from './sarak-sovereign';
import type { SarakThemePreset } from './index';

export const SARAK_BOOT_THEMES: readonly SarakThemePreset[] = [sarakSovereignTheme];
