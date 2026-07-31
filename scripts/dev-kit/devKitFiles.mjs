/**
 * Caminhos, marcadores e carimbo do kit do MANTENEDOR — `sarak-dev/` (Spec 14).
 *
 * Mesmo desenho híbrido do `sarak-ui/`: a prosa é estável e editada à mão, e o
 * gerador só reescreve o miolo entre marcadores. A mecânica de injeção e o hash de
 * conteúdo são IMPORTADOS do kit do consumidor — são a mesma regra, e ter duas
 * implementações seria a porta para os dois kits divergirem em silêncio.
 *
 * ⚠️ `sarak-dev/` é INTERNO: não entra no campo `files` do `package.json` e é
 * PROIBIDO no tarball (`scripts/check-package-contents.mjs`). Quem consome a lib
 * recebe o `sarak-ui/`; quem a EDITA usa este.
 */

import { ROOT } from '../catalogAst.mjs';
import { injectBlock, kitHashOf } from '../consumer-kit/kitFiles.mjs';
import path from 'node:path';

export { injectBlock, kitHashOf };

export const DEV_KIT_DIR = path.join(ROOT, 'sarak-dev');
export const DEV_START_HERE = path.join(DEV_KIT_DIR, 'START-HERE.md');
export const DEV_GUIDE = path.join(DEV_KIT_DIR, 'GUIA-MANUTENCAO.md');
export const DEV_STATE = path.join(DEV_KIT_DIR, 'state.json');

export const DEV_APPENDIX_MARKER = 'SARAK-DEV:APENDICE-GERADO';
export const DEV_STAMP_MARKER = 'SARAK-DEV:CARIMBO';

/**
 * Carimbo do START-HERE: os números que envelhecem primeiro. Se algum deles estiver
 * diferente do repositório, o `dev-kit:check` acusa — é o que impede o guia de
 * afirmar "14 categorias atômicas" seis meses depois de a décima quinta nascer.
 */
export const renderDevStamp = ({ state, devKitHash }) =>
    [
        `- **Versão da lib:** \`${state.lib.version}\` · **carimbo do estado:** \`${devKitHash}\``,
        `- **Design:** ${state.design.schemaFiles.count} schemas · ` +
            `${state.design.tokens.mapeamento.idsUnicos} tokens únicos no catálogo · ` +
            `MASTER_DESIGN_MAP v${state.design.masterMapVersion}`,
        `- **Componentes:** ${state.componentes.publicos.count} públicos · ` +
            `${state.componentes.categoriasAtomicas.length} categorias atômicas · ` +
            `${state.componentes.categoriasDeEngine.length} categorias de engine`,
        `- **Gates:** ${state.gates.length} registrados · ${state.auditores.length} auditores em \`run_audit.mjs\``,
        `- **Base de specs:** ${state.base.adr.length} ADRs · ` +
            `${state.base.arquitetura.length} documentos de arquitetura · ${state.base.specs.length} specs`,
        `- **Baseline dos auditores medido em:** ${state.baseline.medidoEm}`,
    ].join('\n');
