/**
 * Manifesto-starter oficial (Spec 08 §3.1 — Instalação Completa).
 *
 * A MESMA árvore vive em `templates/app-starter.manifest.json` (arquivo que o
 * consumidor copia na instalação — skill ui-integra-consumidor) e aqui como
 * export tipado, para quem prefere importar direto:
 *   `<SarakManifestRenderer payload={SARAK_STARTER_MANIFEST} ... />`
 *
 * Contrato do template (gate: StarterManifest.test):
 *  - todo `type`/ação usados existem no Registry/Dispatcher;
 *  - a rota `/design` entrega o `CustomizationPanel` (Design Engine) e o menu
 *    (`SarakShellNav`) tem o item correspondente — a personalização visual é
 *    parte inseparável do módulo, presente desde o primeiro boot do consumidor.
 */

import starter from '../../../../templates/app-starter.manifest.json';
import type { ManifestRoot } from '../types';

/** Manifesto inicial completo (shell + navegação + rotas + Design Engine). */
export const SARAK_STARTER_MANIFEST = starter as unknown as ManifestRoot;
