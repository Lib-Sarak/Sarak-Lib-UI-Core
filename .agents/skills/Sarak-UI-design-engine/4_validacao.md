# Checklist de Validação — Design Engine Data-Driven

Aplique este checklist após adicionar ou modificar qualquer componente no Design Engine.

---

## Schema e Master Map
- [ ] O componente tem um arquivo de schema em `src/core/Design/schema/{componente}.ts`?
- [ ] O schema implementa a interface `ComponentSchema` de `src/core/Design/types.ts`?
- [ ] Todos os tokens do schema possuem `id`, `label`, `type`, `defaultValue` e `cssVars` definidos?
- [ ] O `id` de cada token é prefixado pelo nome do componente em camelCase (ex: `cardBorderRadius`, não `borderRadius`)?
- [ ] O schema está importado e registrado no array `components` de `src/core/Design/master-map.ts`?
- [ ] O `pilar` do schema corresponde a um dos 6 pilares existentes (`brand`, `typography`, `surfaces`, `interaction`, `navigation`, `systems`)?

## Presets
- [ ] Os presets estão localizados exclusivamente em `src/core/Design/presets/{subcategoria}/`?
- [ ] Não existe nenhum preset para este componente em `src/constants/` ou `src/features/.../presets/`?
- [ ] Cada chave no objeto `design` do preset corresponde a um `token.id` existente no Schema?
- [ ] O preset possui a interface tipada com os campos: `id`, `name`, `description`, `design`?
- [ ] O barrel `src/core/Design/presets/{subcategoria}/index.ts` exporta os novos presets?

## Pipeline de Aplicação (Draft → Preview → Apply)
- [ ] Ao selecionar um preset na galeria, os tokens são injetados via `onUpdateDraft(key, val)` sem filtro restritivo?
- [ ] A identidade do preset ativo é persistida com chave própria (ex: `cardPresetId`), sem sobrescrever `layout` ou chaves de outros namespaces?
- [ ] As alterações são visíveis na Preview (Gêmeo Digital) ANTES de serem aplicadas ao sistema real?
- [ ] O sistema real só é atualizado ao clicar "Aplicar ao Sistema" (via `handleApplyToSystem`)?

## Galeria e Specimens
- [ ] O `DesignScope` é a ÚNICA camada de injeção CSS nos specimens (sem `style={variables}` inline duplicado)?
- [ ] O specimen faz merge com o estado real do sistema (`globalTokens`/`tokens`), não com `getDefaultDesignState()`?
- [ ] A galeria está registrada no `GalleryRouter.tsx` com o case correto?

## Design Engine UI
- [ ] Os controles (sliders, selects, inputs) aparecem na seção correta do painel de personalização?
- [ ] Alterar qualquer controle no painel atualiza a Preview em tempo real?

## Compilação e Integridade
- [ ] O projeto compila sem erros novos via `npx tsc --noEmit`?
- [ ] O build de produção completa com sucesso via `npm run build`?
- [ ] As alterações foram registradas para rastreabilidade?
