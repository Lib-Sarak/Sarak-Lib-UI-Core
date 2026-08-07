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

Quatro coisas que este documento **não** é:

- **Não é lista de desejos.** Todo item tem `arquivo:linha` e exposição medida. Suspeita sem medição não entra.
- **Não é backlog de prioridade.** A ordem de execução vive em [[00-indice]]; aqui a ordem é a de descoberta.
- **Não é histórico.** Item fechado **sai** da §3 (o histórico é o `git` e o veredito da plan que o fechou).
- **Não é a fila de gates a construir.** Verificação que nunca existiu **não é dívida** — é implementação
  posterior, e mora na §4. A §3 é só código que viola regra **já formada**.

**Como ler:** §3 é a dívida. §4 é o trabalho de gate que ainda não teve a sua vez. §5 e §6 guardam os números
que saíram, para que nenhum seja reaproveitado.

> **Regra de manutenção:** toda plan que fecha um achado **remove a linha dele aqui**, na mesma execução. Achado
> que sobrevive à sua própria correção vira ruído, e ruído faz a spec inteira perder credibilidade.

---

# 2. Origem e numeração

Os achados 1–31 vêm da campanha de reescrita da base de specs (2026-07-28 → 2026-08-01), em quatro rodadas de
auditoria. **A numeração é definitiva e nunca reaproveitada** — achado fechado não devolve o número.

Eles não são erros das specs antigas: são **defeitos e ambiguidades do módulo**, encontrados porque alguém foi
conferir no código em vez de copiar do material anterior.

**Estado em 2026-08-01, após a triagem (plan-03):** 31 numerados · **10 fechados** (§6) · **2 aceitos como
característica** (§5) · **5 movidos para implementação posterior** (§4) · **14 abertos** (§3). Soma: 31.

> ⚠️ **Correção de contagem.** Até esta triagem o cabeçalho declarava *"9 fechados · 22 abertos"*. Contado item
> a item: eram **8 fechados e 23 abertos** (8 + 23 = 31). Os dois números estavam errados; a numeração, não.

**Estado em 2026-08-07, após a síntese das plans 06/07/09/12 (`/spec-atualizar`):** as plans de conserto e de
construção de gate fecharam 12 achados de código e 2 gates de "implementação posterior" (§4.1), e mediram um
achado novo. **32 numerados** (o 32 é novo) · **24 fechados** (§6) · **2 aceitos como característica** (§5) ·
**3 em implementação posterior** (§4) · **3 abertos** (§3). Soma: 32.

---

# 3. Achados ABERTOS — a dívida de verdade

> **Reduzida de 14 para 3 em 2026-08-07** (síntese das plans 06/07/09/12): 12 achados fecharam por conserto de
> código, e 1 achado novo (32) entrou, medido de passagem pela `plan-12`. O detalhe de cada fechamento está em
> §6.

## 3.1 Segurança e medição

| # | Achado | Onde | Regra | Destino |
|---|---|---|---|---|
| 17 | `testDir: './e2e'` — **a pasta não existe**; `playwright test` não acha nada e **sai verde**. As specs E2E reais vivem em `src/core/Provider/__e2e__/` e `src/features/DesignEngine/__e2e__/` | `playwright.config.ts:7` | **nenhuma** | **Corrigir** — defeito de configuração, 1 linha. Ligar o Playwright ao pipeline é a plan-11 |

## 3.2 Violação de regra **já formada** que o gate agora vê, mas não corrige sozinho

| # | Achado | Onde | Regra | Destino |
|---|---|---|---|---|
| 29 | Bloco **gerado** manda "regenere com o script do **§5.1 do guia**". Medido de novo em 2026-08-05 (`plan-12`, gate de ponteiro de seção): `GUIA-MANUTENCAO.md` **continua sem `§5.1`**; o alvo real é o §2 (paridade). ✅ **A metade de gate fechou** — `check-section-pointers.mjs` (construído pela `plan-12`) agora **acusa** este ponteiro entre os 27 mortos que mede. A metade de **código** (corrigir o texto) segue aberta | `sarak-dev/GUIA-MANUTENCAO.md:308` · `sarak-dev/state.json:44` · gerador `scripts/dev-kit/renderDevAppendix.mjs` | **R17** | **Corrigir** — o texto do gerador. É a única linha que falta para o `check-section-pointers.mjs` não acusar mais este caso |

## 3.3 Prosa manual desatualizada por um conserto de outra plan

| # | Achado | Onde | Regra | Destino |
|---|---|---|---|---|
| 32 | `arquitetura/04-contrato-de-tokens-e-paridade.md:52` afirma que a paridade "hoje fecha em `410 = 410`" como estado resolvido (2026-08-03, pela `plan-07`, quando a fusão dos 7 ids duplicados criou o token `--sarak-shell-brand-logo-size` e a soma foi de 409 para 410). A `plan-09` (2026-08-05) removeu o token `mfaQrCodeSize` das 3 fontes, e a paridade real **voltou a 409/409/409** — a prosa não acompanhou. Medido de passagem pela `plan-12`, ao vivo, com `auditor_paridade` | `specs/arquitetura/04-contrato-de-tokens-e-paridade.md:52` | **R17** (metade prosa manual, sem gate) | **Corrigir** — trocar `410 = 410` por `409 = 409` e nomear as duas plans que moveram o número (fusão dos ids → remoção do token de MFA) |

---

# 4. Implementação posterior — os gates que ainda NÃO existem

> 🔒 **Isto não é dívida.** Decisão do dono (plan-03, 2026-08-01): *"tudo que é relacionado ao gate de
> verificação ainda não foi implementado — não é dívida, é implementação posterior. Devemos ter todas as
> regras formadas, para então criar a verificação para o gate."*

A diferença é de sequência, não de rigor. Um gate que **nunca foi construído** não é um defeito do código: é
trabalho que ainda não chegou a sua vez. Construí-lo antes de o conjunto de regras estar fechado produz gate que
cobra a régua errada — e gate errado é mais caro que gate ausente, porque ninguém desconfia dele.

**A ordem é:** fechar o conjunto de regras ([[00-regras-e-invariantes]]) → mapear escopo de gate × escopo de
regra (plan-06) → **só então** construir/ampliar as verificações.

> ✅ **O primeiro degrau foi dado em 2026-08-02 (plan-13):** o conjunto fechou em **32 regras** — 29 verificáveis
> e 3 de conduta. Três achados desta seção **ganharam a regra que lhes faltava** e deixaram de ser "nenhuma":
> **14 → R32** (a lib é indiferente ao sistema de autenticação) · **15 → R8.1** (cobertura em %, piso móvel) ·
> **18 → R31** (contraste AA nos 18 temas shippados). O que falta neles agora é só o gate — plan-12.

## 4.1 Gates integralmente ausentes

> **14 e 15 fecharam em 2026-08-05 (`plan-12`, Lote A/B)** — os gates existem agora; o detalhe está em §6.
> Restam **18, 23, 26**.

| # | O que falta | Onde | Regra que ele cobraria |
|---|---|---|---|
| 18 | **Medição de contraste WCAG AA.** ✅ **Medida em 2026-08-05 (`plan-12`, Lote C — parada obrigatória)**: **12 de 18 temas shippados falham** em pelo menos 1 dos 4 pares canônicos (texto/fundo), a maioria em `textColorMuted`, mas **4 falhas são de texto primário/secundário** — inclusive `minimalist-airy`, um dos dois `SARAK_REFERENCE_THEMES` que o consumidor clona como ponto de partida. Script de medição preservado fora do repositório (anexo da `plan-12`, reproduzido pelo revisor). **A construção do gate está parada**, aguardando o dono decidir: (1) todos os pares que os componentes realmente produzem — não só os 4 canônicos; (2) se `textColorMuted` é cobrado a 4,5:1 ou 3:1 (simulado: só resgata 1 dos 12); (3) o que fazer com os 19 pares em `rgba()`, pulados na medição | — | **R31** — AA garantido nos 18 temas shippados. Regra escrita, gate pendente de decisão de fronteira |
| 23 | **Gate de conteúdo sobre `sarak-ui/templates/`.** Medido: `kitFiles.mjs:16-22` não lista `templates/`; `tsconfig.json:20` é `include: ["src"]`; `check-package-contents.mjs` cobra **só presença** de 3 dos 5 itens — `componente-proprio.tsx` e `templates/ui-kit/` existem e **nada os cobra**. Template citando componente removido sai verde em tudo | `sarak-ui/templates/` | **R17**, cuja metade de prosa manual não tem gate. O achado 24 (fechado, §6) foi a prova de que já aconteceu |
| 26 | **Automação que exercite um `install` de verdade.** Confirmado: **0 ocorrências** de `child_process`/`execSync` nos testes de `bin/scaffold/`. As provas de npm/pnpm/yarn foram feitas à mão, uma vez. Idem o `check --notify` do `predev` | — | Nenhuma regra escrita. Depende de CI (plan-05) e é o escopo da **plan-11** |

---

# 5. Aceitos como característica — migrados para `00-contexto` §8

Saíram da dívida por decisão do dono: o custo do conserto supera o dano, **e o motivo está escrito** no
destino. Registrados aqui só para a numeração não ser reaproveitada.

| # | O que era | Por que deixou de ser dívida |
|---|---|---|
| 16 | "5 sinks de `dangerouslySetInnerHTML` — auditar se algum é vetor real" | **A auditoria foi feita** (2026-08-01, um a um): os 5 são `<style>` com CSS. Dois são literais estáticos; três derivam de `design`, que já passou por `validateDesign` (R6 bloqueia `[<>{};]`). **Nenhum recebe HTML de origem não confiável.** O achado era uma pergunta, e ela foi respondida |
| 27 | "`chromeSlots` conta 9 para as 8 regiões" | `topbarActions` é alias legado de `topbarEnd`, e o **próprio `doc` do slot diz isso** ao consumidor no `catalog.json`. Imprecisão de derivação por tipo, autodeclarada no artefato |

---

# 6. Achados FECHADOS (2026-07-28 → 2026-08-05)

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
| 30 | **Não se reproduz** (verificado 2026-08-01). Dizia que `verify_presets.ts:16` apontava para um `arquitetura/04 §9` inexistente. O alvo existe e é o certo: `04-contrato-de-tokens-e-paridade.md:252` = `# 9. Anti-drift de tema e preset` — exatamente o assunto do script. A reescrita da base (plan-01) criou o §9 |
| 31 | **Não se reproduz** (verificado 2026-08-01). Dizia que a ponte para `specs/` era SOFT. `CLAUDE.md:3` hoje aponta **duro** para `specs/00-contexto.md`, os dois prompts e o `00-indice`. `.agents/index.md` segue com 0 referências a `specs/`, mas a ponte não passa mais por ele |
| 8 | **`plan-08` F1 (2026-08-04).** `clearSarakStorage()` remove só as chaves da lib; texto do `confirm()` alinhado. Teste prova que chave alheia sobrevive ao reset |
| 22 | **`plan-12` Lote A (2026-08-05).** `design-token-ids.ts` regenerado (304→409) **e** `generate-token-types.ts --check` registrado no `build` e no Anel 1 — as duas metades fecharam juntas |
| 1 | **`plan-07` (código, 2026-08-03) + `plan-12` vão 2 (gate, 2026-08-05).** `--sx-*` encadeado num token real (`--theme-primary`); `auditor_ghostvars` passou a tratar `src/styles/` como consumidora |
| 13 | **`plan-07` (código, 2026-08-03) + `plan-12` vão 6 (gate, 2026-08-05).** Testes escritos para `useSarakRouter`/`useModuleDiscovery`; `auditor_coverage` ampliado a `shared/`/`effects/`/`constants/` |
| 10 | **`plan-08` F4 (2026-08-04).** `_utilities.css:58` passou a ler `var(--sarak-focus-width, 2px)` |
| 11 | **`plan-08` F5 (2026-08-04).** `DeviceProvider` passou a receber os breakpoints do tema via contexto. A metade Tailwind (`@min-[768px]`, build-time, sem `var()`) já havia sido aceita como característica na triagem (`00-contexto` §8) |
| 12 | **`plan-08` F6 (2026-08-04).** `SarakTable` ganhou `responsive?: boolean`, espelhando `SarakDataTableImpl` |
| 9 | **`plan-08` F3 (2026-08-04).** Ramo `isGlass` removido; `isSidebar` passou a ser o fallback explícito de qualquer valor fora de topbar/dock |
| 2 | **`plan-09` operação 3 (2026-08-05).** `partialMode` removido de `upgradeThemePayload`; zero chamador afetado |
| 3 | **`plan-09` operação 1 (2026-08-05).** `CustomizationPanel` virou `React.lazy` com `Suspense` interno (padrão `SarakChartEngine`), preservando o tipo público `React.FC`. Boot: **−75,1%** |
| 24 | **`plan-07` item 8 (2026-08-03).** `main.tsx` do scaffold deixou de citar `Sarak-MyService` |
| 25 | **`plan-07` item 8 (2026-08-03).** `context.mjs` deixou de citar `templates/app-starter.manifest.json` |
| 14 | **`plan-12` Lote A (2026-08-05).** `auditor_authcoupling.mjs` construído (R32); nasce verde — o único violador (`SarakSecurityOrchestrator`) já havia saído na `plan-09` |
| 15 | **`plan-12` Lote B (2026-08-05).** `check-coverage-floor.mjs` construído (R8.1); piso móvel gravado em 70,66% |

---

# 7. Critérios de aceite desta spec

- [x] Todo achado aberto tem **arquivo:linha** ou a declaração explícita de que a localização é o próprio vão.
- [x] Nenhum achado aberto está sem categoria.
- [x] A numeração é contínua de 1 a 32, sem reaproveitamento.
- [x] Todo achado aberto tem **regra nomeada** — ou a declaração explícita de que **nenhuma regra o cobre**.
- [x] Todo achado aberto tem **destino decidido pelo dono** (plan-03, 2026-08-01).
- [x] **Soma fechada:** 3 abertos (§3) + 3 implementação posterior (§4) + 2 aceitos (§5) + 24 fechados (§6) = **32**.
- [ ] Toda plan que fecha um achado **remove a linha** aqui e cita o número no veredito.
- [x] `00-contexto` §8 aponta para cá em vez de listar achado.

---

# 8. Contrato de manutenção

- **Só entra o que foi medido.** Suspeita vira plan de investigação, não linha nesta spec.
- **Item fechado sai** — na mesma execução que o fechou, não "depois".
- **Numeração definitiva.** Achado novo pega o próximo número livre (a partir de 33).
- Achado que o dono decidir **aceitar como dívida permanente** sai da §3 e vira linha em `00-contexto` §8, com
  o motivo — porque aí deixou de ser dívida e virou característica. O §5 desta spec guarda só o número.
- **Gate que nunca existiu não é dívida** — vai para a §4. Dívida é código que viola regra **já formada**;
  gate ausente é trabalho em fila, e a fila começa depois de as regras fecharem. Misturar os dois faz a lista
  de dívida crescer com trabalho que ninguém prometeu, e a métrica perde o sentido.
- **Achado com duas metades declara as duas** (§4.2). Fechar só a de código deixa o vão aberto para a próxima
  violação; apagar a de gate destrói trabalho que ninguém fez e ninguém vai lembrar de refazer.
- **`nenhuma` na coluna *Regra* é resultado, não lacuna de preenchimento.** É o sinal de que estamos cobrando
  algo que não está escrito — leia como candidato a regra nova, não como achado de segunda classe.
