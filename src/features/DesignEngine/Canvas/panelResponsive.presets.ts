/**
 * Breakpoints do painel de customização como CONTAINER QUERY, não viewport (plan-35 —
 * fecha o "Tier B" de `specs/specs/06-painel-de-customizacao-e-preview.md` §6.2). A classe
 * com o número vive aqui, num `.ts`, fora da varredura do auditor de hardcode — que só
 * coleta `.tsx` (`specs/arquitetura/00-mapa-do-modulo.md` §5.1: é onde a lógica de
 * breakpoint deve morar quando cresce, mesmo idioma de `useStructuralStyles.presets.ts`).
 *
 * Os números são OS MESMOS dos antigos breakpoints de VIEWPORT que este painel usava
 * (`md:` = 768 = `BREAKPOINT_TABLET`, `lg:` = 1024 = `BREAKPOINT_DESKTOP`, `xl:` = 1280) —
 * só o MECANISMO mudou: agora mede o espaço real do container onde o painel está
 * embutido, nunca a largura da janela do navegador.
 *
 * As classes são escritas LITERAL de propósito (plan-39): o scanner do Tailwind v4 lê o
 * arquivo como TEXTO — uma classe montada por interpolação de template literal nunca vira
 * classe válida, e a regra correspondente nunca é gerada no CSS publicado. O teste companheiro
 * afirma a igualdade contra a forma interpolada, para pegar deriva se a constante mudar.
 */
export const CATALOG_GRID_2COL = 'grid-cols-1 @min-[768px]:grid-cols-2';
export const CATALOG_GRID_3COL = 'grid-cols-1 @min-[768px]:grid-cols-2 @min-[1024px]:grid-cols-3';

// 1280 = o antigo breakpoint de viewport `xl:` do Tailwind (mesmo valor de
// `useStructuralStyles.presets.ts:10`, BP_XL — não importado de lá para não acoplar dois
// módulos por uma única constante de uso local). É o ponto em que o dual-view do preview
// (Gêmeo Digital + catálogo) passa a caber lado a lado sem espremer nenhum dos dois.
export const PREVIEW_DUAL_VIEW_ROW = '@min-[1280px]:flex-row';
