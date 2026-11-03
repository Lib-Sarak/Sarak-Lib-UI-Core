// Mapa de cobertura dos presets: quantos tokens estéticos sem cor algum preset escreve, por família (schema).
// Rode antes e depois de mexer em presets: `npx tsx scripts/measure-preset-coverage.ts`.
// Com `--missing`, lista também o token de cada família que nenhum preset escreve.
//
// LIMITES DECLARADOS (R18): mede a ESCRITA (a chave está em algum preset), não o efeito — se o token tem leitor é do
// `token-reader:check`; e só enxerga os presets do registro (`ALL_COMPONENT_PRESETS`), não o tema do consumidor.
import { MASTER_DESIGN_MAP } from '../src/core/Design/master-map';
import { measurePresetCoverage } from '../src/core/Design/presets/components/coverage';
import { ALL_COMPONENT_PRESETS } from '../src/core/Design/presets/components/registry';

const showMissing = process.argv.includes('--missing');
const coverage = measurePresetCoverage(MASTER_DESIGN_MAP.components, ALL_COMPONENT_PRESETS);

console.log(`presets: ${ALL_COMPONENT_PRESETS.length}`);
console.log(`tokens estéticos sem cor escritos por algum preset: ${coverage.covered}/${coverage.total} (${(coverage.ratio * 100).toFixed(1)}%)`);
coverage.families.forEach((family) => {
    console.log(`  ${family.family.padEnd(14)} ${String(family.covered).padStart(3)}/${String(family.total).padEnd(3)}${showMissing && family.missing.length > 0 ? `  falta: ${family.missing.join(', ')}` : ''}`);
});
