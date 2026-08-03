---
name: ui-refatorar-componente
description: Orquestra a refatoração, deleção ou modificação de tipagem de propriedades e tokens no Sarak-Lib-UI-Core. Use APENAS quando precisar deletar um token existente ou alterar sua assinatura sem quebrar a paridade das três fontes. NÃO acione proativamente.
---

# Skill: Refatorar/Deletar Token ou Componente (Paridade Inversa)

> **Esta skill ORQUESTRA; ela não define regra.** Quando divergir de uma spec, **a spec vence**:
> - O dicionário e o que "paridade" significa hoje → `specs/arquitetura/04-contrato-de-tokens-e-paridade.md`
> - Superfície pública, barril e o que é breaking change → `specs/arquitetura/03-superficie-publica.md`
> - Regras R4 (paridade) e R14 (barril) → `specs/specs/00-regras-e-invariantes.md`
> - Versionamento e nota de migração → `specs/specs/03-versionamento-e-release.md`
>
> **Dependência:** é a irmã gêmea de `ui-novo-componente`. Enquanto aquela cria a chave nas três
> fontes do dicionário, esta orquestra a remoção ou modificação, blindando o repositório contra
> chave órfã no roteamento de persistência e no catálogo.

## Quando usar
- Quando for solicitado remover um token do sistema de design.
- Quando for solicitado renomear um token (ex.: de `oldColor` para `newColor`).
- Quando for solicitado alterar os tipos permitidos de um token, exigindo reflexo nas interfaces.
- Quando for solicitado remover ou renomear um componente público.
- Use APENAS quando o usuário solicitar diretamente. NÃO acione proativamente.

## Workflow

### 1. Validação de Impacto
- Antes de remover qualquer chave do Schema, mapeie via busca se algum arquivo de
  `src/components/`, `src/features/` ou `src/core/` ainda a consome — inclusive por CSS
  (`var(--sarak-<kebab-id>)`), que é o consumo mais fácil de esquecer.
- Verifique também os **temas e presets embarcados** (`src/core/Design/presets/`): remover um
  token do schema sem limpar os temas produz **chave órfã**, que é exatamente o que o
  `auditor_presets` reprova.
- Caso encontre consumidores, exija autorização do usuário antes de prosseguir.

### 2. Refatoração nas TRÊS fontes (a purga)
Remova ou atualize a chave **simultaneamente** em:

| # | Fonte | Arquivo |
| --- | --- | --- |
| 1 | **Schema** | `src/core/Design/schema/` (e `src/core/Design/types.ts` se a assinatura mudar) |
| 2 | **Roteamento de persistência** | `src/core/Design/catalog/theme_table_mapping.json` |
| 3 | **Partição do catálogo** | `src/core/Design/catalog/partitions/` |

E, se a mudança for de **componente público**, a superfície:
- `src/index.ts` — o export do valor **e** do `<Nome>Props`;
- `gates/allowlists/barrelExclusions.mjs` — o gate derruba **exclusão obsoleta** (nome já exportado ou
  componente que não existe mais), então limpe a entrada junto.

> ⚠️ **A "6ª camada" NÃO existe mais.** Não há **NATIVE_COMPONENTS**, não há
> **src/core/Manifest/Registry/**, e o **RegistryParity.test.tsx** foi removido com o motor de
> manifesto (`specs/adr/002-remocao-motor-manifesto.md`). Nenhum `type` de manifesto precisa ser
> migrado, porque manifesto de consumidor não existe mais.

### 3. O que É breaking change (e exige nota de migração)
Renomear ou remover um **token** muda o contrato do payload de tema do consumidor; renomear ou
remover um **componente/prop público** muda o contrato de import. Nos dois casos, a mudança exige
entrada em `docs/migracoes.md`, com antes/depois e como migrar. Ver
`specs/specs/03-versionamento-e-release.md`.

Um token removido do schema mas ainda presente em temas antigos do consumidor é descartado com
aviso por `validateDesign` — degrada, não quebra. Isso **não** dispensa a nota de migração.

### 4. Validação de Integridade
```bash
npm run audit           # auditor_paridade (3 fontes) + auditor_presets (chave órfã)
npm run barrel:check    # se mexeu em componente público
npm run catalog         # regenera docs/component-catalog.{json,md} — COMMITE
npm run guide           # kit do consumidor
npm run dev-kit         # kit do mantenedor
npx vitest run          # a suíte INTEIRA
```
- Para rodar só a paridade do dicionário:
  `node gates/scripts/audit/auditor_paridade.mjs`.
- **Compare o `npm run audit` com o BASELINE** de `specs/specs/01-gates-e-baseline.md` — ele
  **não** está em zero, e acusar regressão onde há dívida conhecida custa uma rodada inteira.

### 5. Finalização
Informe os arquivos alterados, o laudo do `auditor_paridade`, se a mudança é breaking e onde a
nota de migração foi escrita.

## Regras Críticas
- **NUNCA** apague só da interface TypeScript. Apagar do Schema sem apagar do roteamento e do
  catálogo produz falha de paridade e lixo no roteamento de persistência.
- **Rename = exclusão do velho + injeção do novo**, nas três fontes, na mesma entrega.
- **NUNCA** afrouxe um auditor nem exclua pasta do escopo dele para fazer o número fechar.
- Removeu token consumido em CSS? Confira o `auditor_ghostvars`: o consumo que sobrou vira
  variável-fantasma, que resolve para vazio **sem erro no console**.

## Checklist
- [ ] Mapeou os consumidores do token no código atual (TSX, hooks **e** CSS)?
- [ ] Limpou os temas e presets embarcados que carregavam a chave?
- [ ] Aplicou a alteração nas **três** fontes do dicionário?
- [ ] Se é componente público: barril e `barrelExclusions.mjs` atualizados, `barrel:check` verde?
- [ ] `auditor_paridade` e `auditor_presets` sem falha?
- [ ] Catálogo/guia/dev-kit regenerados e commitados?
- [ ] A quebra de contrato tem entrada em `docs/migracoes.md`?
