import type { DesignScaffoldToken } from '@sarak/lib-ui-core/backend/node';

/**
 * Fatiamento do gabarito por família (revisão da Spec 02 — substitui o retrieval
 * semântico, que atacava o estágio errado: o estouro sempre foi na SAÍDA da
 * Chamada B, nunca na entrada). Cada fatia agrupa `ComponentSchema.id`s
 * (`schemaId` de `getDesignScaffold()`) por afinidade, pra que uma chamada de
 * LLM devolva só ~1/6 do catálogo — pequeno o bastante pra nunca truncar por
 * `max_tokens`, por construção, não por sorte.
 *
 * `schemaIds` é a ÚNICA lista hardcoded desta arquitetura — e é hardcode de
 * ORQUESTRAÇÃO (quais famílias formam uma fatia), não de valor de design token
 * (Zero Hardcode do módulo é sobre CSS/tokens, não sobre agrupamento de um
 * agente consumidor). `assertSliceCoverage` abaixo é o que impede essa lista de
 * ficar desatualizada silenciosamente: roda em teste e falha alto se uma
 * família nova aparecer em `MASTER_DESIGN_MAP` sem entrar em nenhuma fatia.
 */
export interface ThemeSlice {
    key: string;
    label: string;
    schemaIds: string[];
}

export const THEME_SLICES: ThemeSlice[] = [
    { key: 'foundations', label: 'Fundações', schemaIds: ['colors', 'typography', 'global', 'system'] },
    { key: 'surfaces', label: 'Superfícies', schemaIds: ['cards', 'cardAction', 'cardSearch', 'cardTitle', 'layers', 'overlays'] },
    { key: 'controls', label: 'Controles', schemaIds: ['buttons', 'inputs', 'switches'] },
    { key: 'data-navigation', label: 'Dados e Navegação', schemaIds: ['tables', 'data', 'navigation', 'scrollbars'] },
    { key: 'atmosphere-motion', label: 'Atmosfera e Movimento', schemaIds: ['atmosphere', 'media', 'motion', 'animations'] },
    { key: 'specialized', label: 'Especializados', schemaIds: ['chat', 'status', 'specialized', 'advanced', 'branding', 'engineering', 'structural'] },
];

/**
 * Confere que toda família presente no gabarito real está coberta por
 * exatamente uma fatia — nem faltando (tema nasceria incompleto), nem
 * duplicada (dois LLMs disputando a mesma chave). Lança erro descritivo se
 * algo estiver fora de sincronia; chamada em teste (não a cada request, pra
 * não pagar o custo em runtime) e, defensivamente, uma vez no boot.
 */
export function assertSliceCoverage(scaffold: DesignScaffoldToken[]): void {
    const realSchemaIds = new Set(scaffold.map((token) => token.schemaId));
    const sliceSchemaIds = THEME_SLICES.flatMap((slice) => slice.schemaIds);

    const seen = new Set<string>();
    const duplicated = new Set<string>();
    for (const id of sliceSchemaIds) {
        if (seen.has(id)) duplicated.add(id);
        seen.add(id);
    }
    if (duplicated.size > 0) {
        throw new Error(`[theme_slices] Família(s) duplicada(s) em mais de uma fatia: ${[...duplicated].join(', ')}.`);
    }

    const missing = [...realSchemaIds].filter((id) => !seen.has(id));
    if (missing.length > 0) {
        throw new Error(`[theme_slices] Família(s) do gabarito sem fatia correspondente: ${missing.join(', ')}. O tema nasceria incompleto.`);
    }

    const unknown = [...seen].filter((id) => !realSchemaIds.has(id));
    if (unknown.length > 0) {
        throw new Error(`[theme_slices] Fatia referencia família inexistente no gabarito: ${unknown.join(', ')}.`);
    }
}

/** Tokens do gabarito que pertencem a uma fatia específica. */
export function getSliceTokens(slice: ThemeSlice, scaffold: DesignScaffoldToken[]): DesignScaffoldToken[] {
    const schemaIds = new Set(slice.schemaIds);
    return scaffold.filter((token) => schemaIds.has(token.schemaId));
}

/**
 * Regra de desempate ÚNICA para `id`s duplicados no gabarito (Spec 02 §5.1) —
 * mantém a PRIMEIRA ocorrência (ordem de `MASTER_DESIGN_MAP.components`,
 * já que `getDesignScaffold()`/`getDesignCatalog()` são ambos
 * `MASTER_DESIGN_MAP.components.flatMap(...)`, mesma ordem). Genérica por
 * `id` — não depende de `schemaId`, então serve tanto pro gabarito
 * (`DesignScaffoldToken`, usado por quem PREENCHE uma fatia) quanto pro
 * catálogo puro (`DesignCatalogToken`, usado por `ThemeValidator`, quem
 * VALIDA o resultado).
 *
 * **Por que uma função só, compartilhada, e não duas implementações
 * equivalentes:** as duas pontas precisam concordar sobre o dono de cada id
 * duplicado — achado real (2026-07-12): antes desta função existir,
 * `deduplicateScaffoldById` mantinha a primeira ocorrência mas
 * `ThemeValidator.loadDynamicCatalog` construía um `Map` ingênuo
 * (`new Map(tokens.map(t => [t.id, t]))`), que mantém a ÚLTIMA — as duas
 * pontas discordavam sobre o dono de `zIndexModal` (`engineering.ts` vs.
 * `layers.ts`, domínios de validação diferentes: `engineering` não tem
 * min/max, `layers` tem `min: 1000, max: 5000`). Um valor como `500`,
 * plenamente válido pelo domínio mostrado na fatia (se `engineering`
 * vencesse ali) podia ser reprovado na validação final (se `layers`
 * vencesse lá) — falha graciosa (Regra 4 da Spec 03 segurava), mas espúria:
 * a fatia inteira falhava por um token que o LLM preencheu corretamente
 * segundo o que foi apresentado a ele. Corrigido fazendo os dois
 * consumidores importarem esta mesma função — não pode mais divergir.
 */
export function deduplicateById<T extends { id: string }>(items: T[]): T[] {
    const seenIds = new Set<string>();
    const deduplicated: T[] = [];
    for (const item of items) {
        if (seenIds.has(item.id)) continue;
        seenIds.add(item.id);
        deduplicated.push(item);
    }
    return deduplicated;
}

/**
 * Achado durante a implementação desta arquitetura, não introduzido por ela:
 * `getDesignScaffold()` tem 7 `id`s que aparecem em DUAS famílias/schemas
 * diferentes ao mesmo tempo (`bgBaseColor` em `system`+`atmosphere`,
 * `cardBackgroundColor`/`cardBorderColor` em `cards`+`colors`,
 * `colorBgBody`/`colorBgLayer1`/`colorBgLayer2` em `colors`+`atmosphere`,
 * `zIndexModal` em `engineering`+`layers` — já documentado como pendência de
 * higiene de schema no backlog da Spec 01, fora do escopo desta correção).
 * Sem deduplicar, um `id` assim entraria em DUAS fatias ao mesmo tempo — duas
 * chamadas de LLM recebendo instrução de preencher a mesma chave, resultado
 * imprevisível (a última a mesclar no `theme_orchestrator.ts` vence).
 *
 * Mantém a PRIMEIRA ocorrência via `deduplicateById` — a MESMA regra que
 * `ThemeValidator.loadDynamicCatalog()` agora usa pro seu Map interno (ver
 * docblock de `deduplicateById`), então o dono efetivo de cada `id`
 * duplicado é garantidamente consistente entre "quem preenche" e "quem
 * valida". Reduz os 416 registros do gabarito bruto pra 409 chaves únicas —
 * o número real de chaves que um tema completo precisa preencher.
 */
export function deduplicateScaffoldById(scaffold: DesignScaffoldToken[]): DesignScaffoldToken[] {
    return deduplicateById(scaffold);
}
