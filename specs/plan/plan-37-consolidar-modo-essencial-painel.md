---
tipo: "plan"
titulo: "Consolidar o modo essencial do painel Design Engine — rótulo, curadoria e o Command Center solto"
dominio: "Sarak-Lib-UI-Core / Design Engine / Painel"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "painel", "modo-essencial", "folksonomia", "ux"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]"]
depende_de: ""
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md"
objetivo: "O painel expõe dois modos claramente nomeados — Essencial e Avançado — e o Essencial cobre de fato os tokens de maior impacto visual, sem lacuna de dados"
---

# 1. Objetivo

Quem abre o painel de customização entende, sem ambiguidade, que existem dois modos — **Essencial** e
**Avançado** — o rótulo do controle diz o que ele faz, e o modo Essencial cobre de verdade os tokens de
maior impacto visual (cards, cores, fontes, fundo), sem tokens órfãos por falta de dado.

# 2. Contexto

O pedido original ("criar um modo essencial") revelou, na investigação, que **o mecanismo já existe** —
só está mal exposto e com uma lacuna de dado. `arquivo:linha`:

- `src/features/DesignEngine/Main/hooks/usePreviewUIState.ts:11` — `isEssentialMode: true` é o **default**.
- `src/features/DesignEngine/Main/components/ThemeSidebarHeader.tsx:100-111` — o switch visível no painel
  hoje se apresenta como **"Modo Avançado (Hyper-Granular)"**, com a posição "ligada" correspondendo a
  `!isEssentialMode` — ou seja, comunica o oposto do que seria mais claro ("aqui está o Essencial").
- `src/features/DesignEngine/Main/components/ThemePillarsList.tsx:82` — o filtro esconde **token a token**:
  `visibleTokens = tokens.filter(token => !isEssentialMode || dynamicEssentialTokens.has(token.id))`.
- `src/features/DesignEngine/Main/hooks/useThemeCustomizationData.ts:29-34` —
  `dynamicEssentialTokens = new Set(TokenCatalog.filter(t => (t.importance || 0) >= 80).map(...))` — a
  curadoria já usa um campo `importance` que já existe na maioria das partições do catálogo
  (`src/core/Design/catalog/partitions/*.json`).
- **A lacuna medida:** `components_base.json` tem só **45 de 73** tokens com `importance` — os outros **28**
  caem em `0` via `t.importance || 0` e **nunca** aparecem no modo Essencial, mesmo que devessem.

  > ✅ **Reconferido pelo revisor em 2026-08-12, e o dado reforça a plan:** varrendo as **13** partições
  > (`tokenId` × `importance`, arquivo a arquivo), **doze estão 100% preenchidas** — `cards_engine` 94/94,
  > `colors_and_atmosphere` 63/63, `layout_and_navigation` 48/48, `data_and_charts` 40/40, `typography`
  > 34/34, `branding_config` 30/30, `motion_and_animation` 17/17, `specialized_engines` 16/16, `structural`
  > 11/11 e as três de valor único 1/1. **Só `components_base` diverge (45/73).**
  >
  > Isso muda a leitura do achado: não é curadoria incompleta por toda parte — é **uma anomalia isolada num
  > arquivo só**, o que torna o passo 3 da §3.1 um preenchimento de lacuna, não um projeto de curadoria. E
  > confirma a linha vermelha da §3.2: **não há o que mexer fora de `components_base.json`.**
- **O terceiro painel desconectado:** `src/features/DesignEngine/Panels/HyperGranularityTab.tsx` — um
  "Command Center" com busca livre sobre 200+ tokens (`:62`) — **ignora `isEssentialMode`/
  `dynamicEssentialTokens` por completo**. Não é o mesmo componente do switch do print; é um sistema à parte.

**Decisão desta plan (revisor, não redesenho do zero):** consertar o que existe — corrigir rótulo, fechar a
lacuna de dado, e dar ao Command Center uma entrada própria e claramente nomeada em vez de deixá-lo solto e
sem relação com o toggle Essencial/Avançado. Não se reescreve a folksonomia dinâmica
(`dynamic-categories.ts`) nem se introduz taxonomia nova — o campo `importance` já é a fonte certa.

# 3. Escopo

## 3.1 Dentro
1. **Medir a curadoria atual, primeiro passo, antes de qualquer mudança de dado.** Para os domínios que o
   dono citou como exemplo — cards (`cards.ts`), cores (`colors.ts`/`atmosphere.ts`), tipografia
   (`typography.ts`), fundo/atmosfera (`atmosphere.ts`) — listar quais tokens têm `importance >= 80` hoje.
   Esta lista entra no resumo **antes** do passo 3 — é o "loop de completude" desta plan.
2. **`ThemeSidebarHeader.tsx:100-111`** — trocar o rótulo/posição do switch para comunicar dois estados
   nomeados (**Essencial** / **Avançado**), não um switch binário de "modo avançado".
3. **Preencher `importance` nos 28 tokens de `components_base.json` sem o campo** — usando como referência o
   padrão de `importance` dos tokens irmãos na mesma categoria daquele arquivo. Declarar a lista completa
   (token → valor atribuído → motivo) no resumo.
4. **Dar ao `HyperGranularityTab` uma entrada própria e nomeada** — em vez de um terceiro sistema
   desconectado, ele passa a ser acessível por um ponto de entrada explícito (ex.: "Buscar token (avançado)")
   dentro do painel, separado do toggle Essencial/Avançado, sem fingir ser o mesmo mecanismo. **Não fundir**
   o Command Center com o filtro de `isEssentialMode` — são interações diferentes (busca livre vs. navegação
   por pilar) e forçar a fusão é redesenho, fora do escopo desta plan.
5. Testes ao lado de cada arquivo tocado (R8).

## 3.2 Fora
- ⛔ Reescrever `dynamic-categories.ts` ou a folksonomia dinâmica em si.
- ⛔ Adicionar campo novo ao schema de tokens — usar o `importance` já existente.
- ⛔ Fundir `HyperGranularityTab` com o filtro de `isEssentialMode` — ver §3.1 item 4.
- ⛔ Layout/CSS (`plan-35`) ou performance (`plan-36`).
- ⛔ Mudar `importance` de qualquer token **fora** de `components_base.json` — a lacuna medida é só ali; se a
  auditoria do passo 1 achar curadoria errada em outro schema, **relate, não corrija** — vira achado.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §2 | a folksonomia dinâmica — o mecanismo que esta plan documenta pela primeira vez |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R11 | Configuração × Expansão — preencher `importance` é dado (Configuração), não código novo |
| **Skill** | `padrao-escrita` · `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | sempre |
| Código | `src/features/DesignEngine/Main/hooks/useThemeCustomizationData.ts`, `ThemeSidebarHeader.tsx`, `ThemePillarsList.tsx`, `Panels/HyperGranularityTab.tsx` | ler antes de editar |
| Código | `src/core/Design/catalog/partitions/components_base.json` | os 28 tokens sem `importance` |

# 5. Instruções de execução

1. **Passo 1 da §3.1** — auditar e listar a curadoria atual dos 4 domínios citados. Apresentar a lista no
   resumo **antes** de tocar em código.
2. **Corrigir o rótulo do switch** em `ThemeSidebarHeader.tsx:100-111`.
3. **Preencher os 28 `importance` faltantes** em `components_base.json`, um a um, com o valor e o motivo
   declarados no resumo — não um valor arbitrário genérico para todos.
4. **Dar entrada própria ao Command Center** — botão/link nomeado, fora do fluxo do toggle Essencial/
   Avançado.
5. Testes: cobrir o novo rótulo/estado do switch, a leitura correta de `importance` nos 28 tokens antes
   órfãos, e a entrada nova do Command Center.
6. **Fechar.** Rodar, nesta ordem, e colar a saída real no resumo: `npx vitest run` (INTEIRA) ·
   `node gates/scripts/audit/run_audit.mjs` (`auditor_presets` cruza contra o gabarito vivo — confirmar que
   preencher `importance` não quebra a paridade) ·
   `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` · `npx tsc --noEmit` · `git diff --stat`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-37-consolidar-modo-essencial-painel.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/06-painel-de-customizacao-e-preview.md §2 (folksonomia dinâmica),
specs/specs/00-regras-e-invariantes.md R11 (Configuração × Expansão).
Skills a aplicar: padrao-escrita, padrao-typescript, test-unitario.

PASSO 1, ANTES DE QUALQUER EDIÇÃO: audite e liste quais tokens de cards/colors/
atmosphere/typography têm importance >= 80 hoje. Cole a lista no resumo. Só depois
disso toque em código.

O MECANISMO JÁ EXISTE — isEssentialMode, dynamicEssentialTokens, o campo importance no
catálogo. Você NÃO está criando um modo novo do zero: está consertando rótulo,
preenchendo lacuna de dado, e dando entrada própria ao HyperGranularityTab.

LINHAS VERMELHAS:
  · Você NÃO reescreve dynamic-categories.ts nem a folksonomia.
  · Você NÃO adiciona campo novo ao schema — usa importance, que já existe.
  · Você NÃO funde o HyperGranularityTab com o filtro de isEssentialMode — são
    interações diferentes.
  · Você NÃO mexe em importance fora de components_base.json. Achou curadoria errada
    noutro schema? RELATE, não corrija.
  · Você NÃO mexe em layout/CSS (plan-35) nem em performance (plan-36).

Todo conserto leva teste ao lado (R8).

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] A lista de curadoria atual (4 domínios) está no resumo, **datada antes** das edições de código.
- [ ] O switch comunica claramente dois estados nomeados — evidência: captura ou descrição do texto/aria
      novo.
- [ ] Os 28 tokens de `components_base.json` têm `importance` preenchido, cada um com o valor e o motivo
      listados.
- [ ] O `HyperGranularityTab` tem entrada própria, nomeada, separada do toggle Essencial/Avançado.
- [ ] `auditor_presets` continua em paridade (0 chaves órfãs) depois de preencher `importance`.
- [ ] `npx vitest run` inteira, verde, não encolheu.
- [ ] `run_audit` sem regressão; `npx tsc --noEmit` → 0 erros.
- [ ] `git diff --stat` — só os arquivos de §3.1 (mais os testes correspondentes).

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff
grep -c "importance" src/core/Design/catalog/partitions/components_base.json
npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
```

O terceiro comando tem de subir — hoje são 45 de 73; depois desta plan, os 73 têm `importance`. Confira a
lista do passo 1 do resumo contra o `grep` real do catálogo antes de aprovar — é a mesma disciplina de
"medição, não alegação" das outras plans desta leva.

# 9. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md`

**Texto pronto para transporte:** a §2 (folksonomia dinâmica) ganha uma subseção nova documentando o modo
Essencial/Avançado — o campo `importance`, o limiar `>= 80`, `dynamicEssentialTokens`, e a entrada separada
do Command Center — que hoje existe no código e não é mencionado em spec nenhuma.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
