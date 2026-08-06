// -------------------------------------------------------------------------
// LIMITES DECLARADOS (R18) — o que este auditor NÃO vê
// -------------------------------------------------------------------------
// Wrapper fino sobre `gates/scripts/contrato/check-section-pointers.mjs` —
// só para entrar em `run_audit.mjs` com o nome `auditor_*.mjs` que
// `scripts/dev-kit/buildDevState.mjs:91` espera ao derivar a lista de
// auditores (regex restrita a esse prefixo, de propósito — não confunde
// "auditor do agregador" com qualquer script de `gates/`). Os limites REAIS
// do detector estão declarados no próprio `check-section-pointers.mjs`.
// -------------------------------------------------------------------------
import { spawnSync } from 'child_process';
import path from 'path';

const script = path.resolve('gates/scripts/contrato/check-section-pointers.mjs');
const result = spawnSync('node', [script], { stdio: 'inherit' });
process.exit(result.status ?? 1);
