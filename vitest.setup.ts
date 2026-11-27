import '@testing-library/jest-dom/vitest';
import { loadLazyCatalogs } from './src/core/i18n/lazyCatalogs';

// Os catálogos de texto das peças opcionais chegam por `import()` em produção; nos testes já
// estão carregados, para o texto da peça sair no primeiro quadro como sempre. Os testes da
// própria carga zeram o estado (`resetLazyCatalogsForTest`).
await loadLazyCatalogs();
