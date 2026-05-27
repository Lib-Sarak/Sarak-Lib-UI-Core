---
name: "Sarak-UI-criar-preset"
description: "Skill especialista em criar presets modulares (parciais) para componentes específicos no Design Engine (Cards, Tipografia, Texturas, etc)."
author: "Sarak System"
version: "1.0.0"
---

# Sarak-UI-criar-preset

## Objetivo
Criar e adicionar novos presets granulares (Modulares) para os pilares do Design Engine da Sarak. Presets modulares não são Temas inteiros; eles alteram **apenas as variáveis específicas** do componente alvo, preservando as cores e o layout globais (Partial Merge).

## Pilares Suportados
Atualmente, os presets modulares estão divididos nos seguintes pilares (localizados em `src/core/Design/presets/components/`):
1. **cards.ts**: Altera bordas, blur, glow e geometria de cartões e superfícies (`CARD_PRESETS`).
2. **atmosphere.ts**: Altera mídias de fundo, opacidade, blend-modes, texturas em tela cheia (`ATMOSPHERE_PRESETS`).
3. **typography.ts**: Altera famílias de fontes tipográficas (`TYPOGRAPHY_PRESETS`).

## Regras Arquiteturais
- **MERGE PARCIAL:** O preset modular DEVE conter apenas as chaves (tokens) que pertencem ao seu escopo. Nunca inclua cores primárias (`colorPrimary`), modo light/dark, ou estilo de navegação dentro de um preset de componente, a menos que ele faça estritamente parte daquele componente específico.
- O campo `id` deve começar com um prefixo identificando o componente (ex: `card-`, `bg-`, `typo-`).

## Passo a Passo para Criar um Preset Modular

1. Identifique o pilar que o usuário solicitou (ex: "Crie um preset de card com vidro hiper-fosco").
2. Abra o arquivo correspondente em `src/core/Design/presets/components/`.
3. Adicione o novo objeto na array respectiva (`CARD_PRESETS`, `ATMOSPHERE_PRESETS`, `TYPOGRAPHY_PRESETS`).
4. Siga estritamente a interface `ComponentPreset`:
   ```typescript
   export interface ComponentPreset {
       id: string;
       name: string;
       description: string;
       design: Partial<DesignVariables>; // Preencher apenas o escopo do componente
   }
   ```
5. Exemplos de Tokens por Pilar:
   - **Cards**: `cardBorderRadius`, `cardBorderWidth`, `cardBorderColor`, `cardShadow`, `cardBackdropBlur`, `cardTextureType`, `cardClipPath`, `cardGlowColor`.
   - **Atmosphere**: `globalBackgroundImageUrl`, `globalBackgroundOpacity`, `globalBackgroundBlur`, `globalBackgroundBlendMode`.
   - **Typography**: `fontFamily`.

6. Salve o arquivo. O `PresetsCatalog` e as visualizações em miniatura (`CardsCatalog`, etc) irão automaticamente ler e exibir a representação fiel (1:1) do preset para o usuário testar!
