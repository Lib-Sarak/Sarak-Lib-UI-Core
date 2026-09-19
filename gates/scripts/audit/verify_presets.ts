// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este verificador NÃO vê
// -------------------------------------------------------------------------
// Mede AUSÊNCIA DE CHAVE ÓRFÃ nos temas/presets EMBARCADOS — não mede
// completude por tema (chave faltando, sem estar órfã, passa aqui) e não
// vê tema escrito pelo consumidor. `verify_theme_parity.ts` cobre
// completude, mas por UM tema de cada vez, e nada o invoca em pipeline.
// -------------------------------------------------------------------------
import { getScaffold } from '../../../src/core/Design/master-map.ts';
import { GLOBAL_THEMES } from '../../../src/core/Design/presets/themes/index.ts';
import { CARD_PRESETS } from '../../../src/core/Design/presets/components/cards.ts';
import { BUTTON_PRESETS } from '../../../src/core/Design/presets/components/buttons.ts';
import { INPUT_PRESETS } from '../../../src/core/Design/presets/components/inputs.ts';
import { ATMOSPHERE_PRESETS } from '../../../src/core/Design/presets/components/atmosphere.ts';
import { TYPOGRAPHY_PRESETS } from '../../../src/core/Design/presets/components/typography.ts';
import { PAYLOAD_EXTRA_KEYS } from '../../../src/core/Provider/payloadExtraKeys.ts';

// ==========================================================================
// Auditor de Drift de Presets/Temas — cobra a regra R5.
// Compara as chaves de cada Tema/Preset real contra o Gabarito Dinâmico
// (getScaffold, sempre vivo) — nunca contra uma cópia estática. Uma chave usada
// num preset que não existe mais no dicionário é uma "chave órfã": em runtime ela
// é descartada com aviso por `validateDesign` (src/core/Provider/utils/validation.ts),
// então o tema PARECE completo e não é. Contrato em
// specs/arquitetura/04-contrato-de-tokens-e-paridade.md §9.
//
// O Gabarito Dinâmico só conhece TOKEN VISUAL (`MASTER_DESIGN_MAP`). Chave de
// payload legítima fora dele (branding/estrutura — `enabledLanguages` e as
// demais de `PAYLOAD_EXTRA_KEYS`, a mesma lista que `validateDesign` usa em
// runtime) não é órfã: é a OUTRA metade do contrato, não um drift. Sem esta
// distinção, todo tema que declarasse uma dessas chaves reprovaria aqui, por
// este auditor não conhecer a lista.
// ==========================================================================

const KNOWN_EXTRA_KEYS = new Set<string>(PAYLOAD_EXTRA_KEYS);

export interface AuditableItem {
    id: string;
    label: string;
    design: Record<string, unknown>;
}

/** Chave que não está no gabarito visual E não é payload extra conhecido. */
export function findOrphanKeys(design: Record<string, unknown>, scaffold: Record<string, unknown>): string[] {
    return Object.keys(design).filter((key) => !(key in scaffold) && !KNOWN_EXTRA_KEYS.has(key));
}

export function collect(): AuditableItem[] {
    const items: AuditableItem[] = [];
    GLOBAL_THEMES.forEach(t => items.push({ id: t.id, label: `Tema: ${t.name}`, design: t.design }));
    CARD_PRESETS.forEach(p => items.push({ id: p.id, label: `Preset Card: ${p.name}`, design: p.design }));
    BUTTON_PRESETS.forEach(p => items.push({ id: p.id, label: `Preset Botão: ${p.name}`, design: p.design }));
    INPUT_PRESETS.forEach(p => items.push({ id: p.id, label: `Preset Input: ${p.name}`, design: p.design }));
    ATMOSPHERE_PRESETS.forEach(p => items.push({ id: p.id, label: `Preset Atmosfera: ${p.name}`, design: p.design }));
    TYPOGRAPHY_PRESETS.forEach(p => items.push({ id: p.id, label: `Preset Tipografia: ${p.name}`, design: p.design }));
    return items;
}

function runAudit() {
    console.log('--- Auditor de Drift de Presets/Temas (Gabarito Dinâmico) ---\n');

    const fullScaffold = getScaffold();
    console.log(`Gabarito vivo (getScaffold()): ${Object.keys(fullScaffold).length} chaves reais.\n`);

    const items = collect();
    const distinctOrphans = new Set<string>();
    let itemsWithOrphans = 0;

    items.forEach(item => {
        const orphans = findOrphanKeys(item.design, fullScaffold);
        if (orphans.length > 0) {
            itemsWithOrphans++;
            orphans.forEach(o => distinctOrphans.add(o));
            console.error(`❌ ${item.label} (${item.id}): ${orphans.length} chave(s) órfã(s) — ${orphans.join(', ')}`);
        }
    });

    console.log(`\nItens auditados: ${items.length} (${GLOBAL_THEMES.length} temas + ${items.length - GLOBAL_THEMES.length} presets de componente).`);

    if (distinctOrphans.size === 0) {
        console.log('\n✅ Nenhuma chave órfã encontrada. Todos os Presets/Temas estão em paridade com o Gabarito Dinâmico.');
        process.exit(0);
    }

    console.log(`\n❌ ${itemsWithOrphans} item(ns) com chave(s) órfã(s); ${distinctOrphans.size} chave(s) distinta(s) não existem mais no dicionário:`);
    console.log(`   ${[...distinctOrphans].sort().join(', ')}`);
    console.log('\nCorrija removendo/substituindo essas chaves nos arquivos de preset/tema, ou reintroduza o token no schema se ele ainda for válido.');
    process.exit(1);
}

// Guarda de execução direta — sem isto, o teste do próprio gate (que importa
// `findOrphanKeys`/`collect`) rodaria `runAudit()` como efeito colateral do
// import (mesmo padrão de `verify_contrast.ts`).
const isMain = /verify_presets\.ts$/.test(process.argv[1] ?? '');
if (isMain) {
    runAudit();
}
