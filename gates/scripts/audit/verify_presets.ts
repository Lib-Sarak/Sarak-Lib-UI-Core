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

// ==========================================================================
// Auditor de Drift de Presets/Temas — cobra a regra R5.
// Compara as chaves de cada Tema/Preset real contra o Gabarito Dinâmico
// (getScaffold, sempre vivo) — nunca contra uma cópia estática. Uma chave usada
// num preset que não existe mais no dicionário é uma "chave órfã": em runtime ela
// é descartada com aviso por `validateDesign` (src/core/Provider/utils/validation.ts),
// então o tema PARECE completo e não é. Contrato em
// specs/arquitetura/04-contrato-de-tokens-e-paridade.md §9.
// ==========================================================================

interface AuditableItem {
    id: string;
    label: string;
    design: Record<string, unknown>;
}

function collect(): AuditableItem[] {
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
        const orphans = Object.keys(item.design).filter(key => !(key in fullScaffold));
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

runAudit();
