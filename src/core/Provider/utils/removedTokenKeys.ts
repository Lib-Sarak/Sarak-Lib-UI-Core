/**
 * Chaves de tema REMOVIDAS do schema (breaking change, ver docs/migracoes.md) que
 * `validateDesign` ainda pode receber de um payload persistido antigo. Arquivo à
 * parte só para não estourar o teto de linhas do auditor de Clean Code em
 * `validation.ts` — mesmo precedente de `payloadExtraKeys.ts`.
 */
export const REMOVED_TOKEN_KEYS = new Set<string>([
    'globalBackgroundBlendMode',
    // Os três controles de ruído viraram um (`bgNoiseDensity`); o valor salvo dos outros dois cai no padrão.
    'atmosphereNoiseOpacity',
    'noiseIntensity',
    // Fundidos no token que de fato desenha (ver docs/migracoes.md, `## 8.0.0`): o valor salvo cai no padrão.
    'colorPalette',        // preset de primária/secundária/terciária — as três cores já são tokens
    'borderRadiusSm',      // escala sem leitor: o raio é `borderRadius` e os raios por componente
    'borderRadiusMd',
    'borderRadiusLg',
    'contrastCurve',       // o único mecanismo de contraste do CSS é `globalContrast`
    'scrollbarWidth',      // duplicatas de `scrollWidth`/`scrollThumbColor`, que o CSS lê
    'scrollbarThumbColor',
    // Família de movimento única (ver docs/migracoes.md, `## 8.0.0`): `motion*` sobrevive; o valor salvo cai no padrão.
    'animInstant',
    'animFast',
    'animNormal',
    'animSlow',
    'easeMain',
    'easeOut',
    // Fundidos no token que já desenha: o valor salvo cai no padrão do destino.
    'formLayoutDirection', // → formLabelPosition
    'layerElevationFactor', // → layeredShadows
    'matrixSearchBg', // → tokens de campo (a busca da matriz é um SarakInput)
    'layerBackdropBlur', // → modalOverlayBlur (nenhum componente lia o véu das camadas)
    'layerBackdropOpacity', // → modalOverlayColor
    // Retirados: peça interna do painel da lib, ou propriedade da aplicação que não é de tema.
    'aiPanelBg',
    'inputSuccessColor', // nenhum campo tem estado de sucesso
    'identityRedirectUrl',
    'industrialRegistry',
    'managementGroupDescMaxWidth',
    'presetCardHoverShadowBlur',
    'presetCardHoverShadowSpread',
    'devicePhoneWidth',
    'kbdMinWidth',
    'themeDropdownMaxHeight',
    'visualPerspective',
    'visualTranslateOffsetSm',
    'visualTranslateZMd',
    'visualDotGridSize',
    'visualOrbBlur',
    // Sem componente da lib que os leia (só a pré-visualização do painel): saem do schema; o valor salvo cai fora.
    'securityShieldGlow',
    'securityPulseSpeed',
    'trackingSubtle',
    'typeScaleDisplay',
    'cardHoverLift', // fundido em `cardHoverTranslate`, que é o hover real dos cartões
    // Oferecidos pelo painel e sem leitor (ver docs/migracoes.md, `## 8.0.0`): o valor salvo cai no padrão, com aviso.
    'cardContentAlignment', // redundante: `cardTextAlign` já distribui o conteúdo do cartão
    'tableActionPosition', // a `SarakTable` não tem coluna de ações
    'cardImagePosition', // só `right` com direção em linha mudava algo; a ordem dos blocos é do `className` do importador
]);

// Aviso ÚNICO por sessão (precedente: persistenceStrategy.ts, hasWarnedRemoteWithoutPort).
let hasWarned = false;

export const warnRemovedTokenKeyOnce = (key: string, value: unknown): void => {
    if (hasWarned) return;
    hasWarned = true;
    console.warn(`[Sarak:Design] Token "${key}" foi removido do schema (ver docs/migracoes.md) — descartado.`, value);
};
