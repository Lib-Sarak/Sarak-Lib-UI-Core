// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este auditor NÃO vê
// -------------------------------------------------------------------------
// Cruza Schema × `theme_table_mapping.json` × `partitions/*.json` — as TRÊS
// fontes de R4. O TIPO GERADO (`design-token-ids.ts`) NÃO é uma das três e
// pode apodrecer com o gate verde (R29 cobre o artefato gerado em si).
// -------------------------------------------------------------------------
import { execSync } from 'child_process';
import path from 'path';

console.log("--- Auditor de Paridade Plena 1:1:1:1:1 ---");
console.log("Invocando o motor estrito de paridade (verify_parity.ts)...\n");

const verifyScript = path.resolve('gates/scripts/audit/verify_parity.ts');

try {
  execSync(`npx tsx "${verifyScript}"`, { stdio: 'inherit' });
  process.exit(0);
} catch (error) {
  process.exit(error.status || 1);
}
