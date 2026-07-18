/**
 * Exceções DECLARADAS de alcançabilidade via manifesto (gate de paridade do Registry).
 *
 * Contrato do gate (`RegistryParity.test.ts`): todo componente React visível na API
 * pública (`src/index.ts`) ou vivo em `src/components/atomic/**` DEVE estar no
 * `NATIVE_COMPONENTS` — OU listado aqui, com o motivo escrito. Silêncio = build
 * vermelho. Foi a ausência deste gate que deixou SarakButton, SarakTypography, os
 * Cards/Templates e o CustomizationPanel nascerem inalcançáveis via `type`.
 *
 * Regras de manutenção:
 *  - Registrar um componente no `NATIVE_COMPONENTS` → REMOVA a entrada daqui.
 *  - Criar um componente que NÃO deve ser manifestável → adicione-o AQUI, com motivo.
 *  - Entrada obsoleta (nome que não existe mais) também derruba o gate.
 */

/** Motivo pelo qual um componente exportado não é (nem deve ser) um `type` nativo. */
export const MANIFEST_EXCLUSIONS: Readonly<Record<string, string>> = {
    // --- Infraestrutura do motor (nunca são nós de manifesto) ---
    SarakUIProvider: 'Provider raiz da biblioteca — envolve o Renderer, não é um nó.',
    DeviceProvider: 'Provider de dispositivo — infra do SarakUIProvider.',
    SarakToastProvider: 'Host de toasts — montado automaticamente pelo SarakUIProvider.',
    SarakOverlayProvider: 'Host de overlays — montado automaticamente pelo SarakUIProvider.',
    SarakManifestRenderer: 'O próprio motor de renderização (Spec 30).',
    SarakManifestRendererDefault: 'Alias default do motor (Spec 30).',
    SarakErrorBoundary: 'Infra de resiliência por nó (Spec 27) — aplicada pelo renderNode.',
    SarakFallback: 'Fallback de type desconhecido (Spec 22, Regra 2) — uso interno do motor.',
    SarakErrorFallback: 'Tela de recuperação padrão (Spec 27) — uso interno do motor.',
    SarakMissingManifestScreen: 'Tela DX de payload ausente (Spec 17) — renderizada pelo próprio motor.',
    SarakInvalidManifestScreen: 'Tela DX de payload inválido (Spec 17) — renderizada pelo próprio motor.',
    DesignScope: 'Aplicado internamente pela diretiva `theme` do nó (Onda 6) — não por `type`.',

    // --- Sistema legado (Spec 04 — Shell/Discovery). Consumidores novos usam shell/routes ---
    SarakShell: 'Shell legado (Spec 04). No motor atual o shell é dado: `shell`/`routes` + SarakShellNav.',
    DynamicRenderer: 'Renderer legado do Discovery (Spec 04).',
    ThemeToggle: 'Legado do shell antigo com catálogo vazio (TODO no código) — tema troca via CustomizationPanel.',
    LanguageSelector: 'Peça do shell legado (Controls) acoplada ao lib-translator via cookie.',
    UserMenu: 'Peça do shell legado (Controls) — exige callbacks imperativos de auth do host.',
    ModuleSelector: 'Peça do shell legado (Controls) — navegação era do Discovery, hoje é `routes`.',

    // --- Internos com fachada própria já manifestável ---
    SarakChartEngine: 'Motor interno de gráficos — alcançável via type `SarakChart`.',
    IconMap: 'Catálogo de dados de ícones — consumido pelo type `SarakIcon`.',
    SarakDataGridImpl: 'Implementação interna do type lazy `SarakDataGrid` (vaza pelo barrel).',
    SarakDataTableImpl: 'Implementação interna do type lazy `SarakDataTable` (vaza pelo barrel).',
};

/**
 * Paridade Discovery ↔ Manifesto: todo id legado registrado pela PRÓPRIA biblioteca
 * via `registerLocalComponent` precisa de um `type` equivalente no Registry do motor
 * atual. Foi exatamente este elo que faltou para o Design Engine (CustomizationPanel
 * registrado só no Discovery → inalcançável via manifesto).
 */
export const LEGACY_DISCOVERY_TYPE_MAP: Readonly<Record<string, string>> = {
    'mx-customization': 'CustomizationPanel',
    personalization: 'CustomizationPanel',
};
