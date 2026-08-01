---
tipo: "spec"
titulo: "Dívida conhecida — o registro dos defeitos medidos e ainda não corrigidos"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida técnica"
status: "🟢 Vigente"
prioridade: "Máxima"
tags: ["spec", "divida-tecnica", "achados", "auditoria", "roteamento"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[00-contexto]]"]
---

# 1. Propósito

O registro **único** dos defeitos que já foram **verificados no código** e ainda não corrigidos. Um agente que
leia esta spec para de "descobrir" o que já está catalogado — e para de propor conserto para o que já foi
decidido manter.

Três coisas que este documento **não** é:

- **Não é lista de desejos.** Todo item tem `arquivo:linha` e exposição medida. Suspeita sem medição não entra.
- **Não é backlog de prioridade.** A ordem de execução vive em [[00-indice]]; aqui a ordem é a de descoberta.
- **Não é histórico.** Item fechado **sai** desta spec (o histórico é o `git` e o veredito da plan que o fechou).

> **Regra de manutenção:** toda plan que fecha um achado **remove a linha dele aqui**, na mesma execução. Achado
> que sobrevive à sua própria correção vira ruído, e ruído faz a spec inteira perder credibilidade.

---

# 2. Origem e numeração

Os achados 1–31 vêm da campanha de reescrita da base de specs (2026-07-28 → 2026-08-01), em quatro rodadas de
auditoria. **A numeração é definitiva e nunca reaproveitada** — achado fechado não devolve o número.

Eles não são erros das specs antigas: são **defeitos e ambiguidades do módulo**, encontrados porque alguém foi
conferir no código em vez de copiar do material anterior.

**Estado em 2026-08-01:** 31 numerados · **9 fechados** · **22 abertos**.

---

# 3. Achados ABERTOS

## 3.1 🔴 Capaz de destruir dado de terceiro

| # | Achado | Onde |
|---|---|---|
| 8 | **`localStorage.clear()`** apaga a **origem inteira** do consumidor — token de sessão, preferências, tudo — não só as chaves da lib, e recarrega a página. O `confirm()` promete "configurações visuais". **Hoje inalcançável**: o componente é importado e nunca renderizado | `src/features/DesignEngine/Panels/AdvancedTab.tsx:21` |

> ⚠️ **Acoplamento que impõe ordem de execução.** O `CustomizationPanel` importa 7 abas e renderiza **uma**
> (`CustomizationPanel.tsx:3-9` × `:40`); uma das mortas é justamente a `AdvancedTab`. Logo: **restaurar as abas
> ATIVA a perda de dados.** Consertar o `clear()` vem **primeiro**; decidir se as abas voltam vem depois.
> Decidir na ordem inversa é a única forma de transformar código morto em bug de produção.

## 3.2 🔴 Artefato gerado que publica número falso

| # | Achado | Onde |
|---|---|---|
| 22 | **Tipo público defasado em 105 tokens** (304 publicados × 409 reais) e o gerador **não está registrado em script, hook ou skill nenhuma**. Nenhum gate acusa: o `auditor_paridade` cruza schema × mapping × partições, e o tipo gerado **não é uma das três fontes**. O número falso **vaza para o consumidor** via `sarak-ui/catalog.json` (`designTokens.count = 304`) | `src/core/Provider/generated/design-token-ids.ts` · gerador `scripts/generate-token-types.ts` |

> Conserto em **duas metades obrigatórias**: regenerar **e** registrar o gerador num pipeline. Só a primeira
> metade apodrece de novo, e da próxima vez ninguém vai saber por quê.

## 3.3 Lacunas de gate — *o escopo do gate é menor que o escopo da regra*

| # | Achado | Onde |
|---|---|---|
| 1 | `--sx-*` vivo como fallback de 2º nível, e o `auditor_ghostvars` **não varre `src/styles/`**. Resolve para vazio: a declaração cai por terra se o token principal faltar | `src/styles/_utilities.css:80,89` |
| 13 | `src/shared/` **fora do escopo** do `auditor_coverage`: 3 arquivos sem teste, incluindo `useSarakRouter` e `api.ts`. **Gate verde, regra violada** | `auditor_coverage.mjs:52-60` |
| 14 | **O gate anti-acoplamento de auth NÃO EXISTE.** O plano antigo o previu, marcou-se concluído, e nenhum arquivo `AuthCoupling*` foi criado | — |
| 15 | Cobertura em % — `@vitest/coverage-v8` instalado e **nunca medido** | — |
| 23 | **`sarak-ui/templates/` fora de todo gate de conteúdo**: não está no plano de saída do `guide:check` e o `tsconfig` não o compila (`include: ['src']`). O `package:check` só cobra **presença de caminho**. Template citando componente removido sai verde em tudo | `sarak-ui/templates/` |
| 26 | **Nenhum teste automatizado exercita um `install` de verdade.** As provas de npm/pnpm/yarn foram feitas à mão, uma vez, e nenhum gate as repete. Idem o `check --notify` no `predev` — o comando que mais executa na vida do importador é o menos coberto | — |
| 29 | Bloco **gerado** manda "regenere com o script do §5.1 do guia" — **o guia não tem §5.1**. Prosa dentro de bloco gerado, invisível ao `dev-kit:check`, que só verifica caminho/gate/comando | gerador `scripts/dev-kit/renderDevAppendix.mjs` |
| 30 | Ponteiro para `arquitetura/04 §9` — **o arquivo é o certo, o §9 não existe** (vai até §8.3). O alvo real é **§4.5**. Trocou-se um ponteiro morto por outro, mais discreto, **no próprio conserto do anterior** | `.agents/skills/ui-auditoria-modulo/scripts/verify_presets.ts:16` |
| 31 | **A ponte para a base de specs é SOFT.** `CLAUDE.md` → `.agents/index.md` → **0 referências a `specs/`**. A ponte real depende de uma skill ser acionada pela `description`, não de ponteiro duro | `CLAUDE.md` · `.agents/index.md` |

> **Este é o padrão mais caro do repositório.** Os quatro primeiros casos apareceram **por acaso**, não por
> método — e o achado 30 provou que atenção humana não o pega: a classe reapareceu pela mão que a acabara de
> catalogar. Quantos faltam é **desconhecido**.

## 3.4 Comportamento

| # | Achado | Onde |
|---|---|---|
| 9 | `isGlass` é ramo morto que renderizaria nav nenhuma — só é inalcançável porque `validateDesign` descarta o valor | — |
| 10 | `focusRingWidth` ignorado pela regra global de foco | — |
| 11 | Token de breakpoint move só **1 dos 3** caminhos de responsividade | — |
| 12 | `SarakTable` sem opt-out de colapso mobile — o `SarakDataTable` tem `responsive={false}`. Inconsistência de API entre irmãos | — |
| 2 | `upgradeThemePayload(partialMode)` — parâmetro morto | `src/core/Design/master-map.ts:148` |

## 3.5 Superfície pública e higiene

| # | Achado | Onde |
|---|---|---|
| 3 | `CustomizationPanel` sai **eager** do barril — paga custo de boot quem nunca abre o painel | `src/index.ts:50` |
| 24 | O `main.tsx` que **todo consumidor novo recebe** cita o `Sarak-MyService`, obsoleto e inacessível ao importador. Comentário que viaja para o consumidor é documentação pública | `bin/scaffold/generators/mainTsx.mjs:37-40` |
| 25 | Ponteiro morto: afirma que `templates/app-starter.manifest.json` "segue publicado (`SARAK_STARTER_MANIFEST`)". Medido: a pasta **não existe** e o símbolo tem **0 ocorrências** fora do próprio comentário | `bin/scaffold/context.mjs:5-10` |
| 27 | `chromeSlots` gerado conta **9 para as 8 regiões** documentadas: `topbarActions`, alias legado de `topbarEnd`, é prop opcional de `ReactNode` e o coletor captura por **tipo**, não por semântica. Não é erro — é imprecisão de derivação | — |

## 3.6 Segurança e medição

| # | Achado | Onde |
|---|---|---|
| 16 | **5 sinks** de `dangerouslySetInnerHTML`, não "uma exceção". Auditar se os 5 são legítimos (CSS gerado pela engine) ou se algum é vetor real | — |
| 17 | `testDir: './e2e'` — **a pasta não existe**; `playwright test` não acha nada. As specs E2E reais vivem em `src/**/__e2e__/` | `playwright.config.ts:7` |
| 18 | **Contraste WCAG AA não é medido em lugar nenhum.** A lib não pode prometê-lo sem medir | — |

---

# 4. Achados FECHADOS (2026-07-28 → 2026-08-01)

Registrados só para que a numeração não seja reaproveitada. O detalhe está no `git`.

| # | Fechado por |
|---|---|
| 4 | 3 das 4 categorias de `engines/` entraram no barril |
| 5 | `README.md` deixou de mandar instalar `pg` |
| 6 | Decisão do dono: `atomic/Tables/` **fica como está** — o hook é `structuralConsumer` de 2 tokens |
| 7 | Era imprecisão de relatório, não defeito |
| 19 | "A lib nunca controla a URL" era falso (`useSarakRouter.ts:49,51`); a spec nova registra o comportamento real |
| 20 | Status falso na spec antiga de presets |
| 21 | Duplicação entre specs antigas, resolvida pela consolidação |
| 28 | JSDoc citando arquivo de plano inexistente, removido |

---

# 5. Critérios de aceite desta spec

- [x] Todo achado aberto tem **arquivo:linha** ou a declaração explícita de que a localização é o próprio vão.
- [x] Nenhum achado aberto está sem categoria.
- [x] A numeração é contínua de 1 a 31, sem reaproveitamento.
- [ ] Toda plan que fecha um achado **remove a linha** aqui e cita o número no veredito.
- [ ] `00-contexto` §8 aponta para cá em vez de listar achado.

---

# 6. Contrato de manutenção

- **Só entra o que foi medido.** Suspeita vira plan de investigação, não linha nesta spec.
- **Item fechado sai** — na mesma execução que o fechou, não "depois".
- **Numeração definitiva.** Achado novo pega o próximo número livre (a partir de 32).
- Achado que o dono decidir **aceitar como dívida permanente** sai da §3 e vira linha em `00-contexto` §8, com
  o motivo — porque aí deixou de ser dívida e virou característica.
