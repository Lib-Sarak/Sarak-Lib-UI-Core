---
tipo: "spec"
titulo: "Kit de uso do consumidor — artefato `sarak-ui/` na raiz, dinâmico, genérico, shippado no install"
dominio: "Habilitação do consumidor / Empacotamento / Documentação viva / Skill de integração"
status: "🟢 Executada (2026-07-26; renumerada de 40.4 → 50 em 2026-07-25) — kit `sarak-ui/` gerado, gate `guide:check` ligado ao build, skill reescrita, `init`/`sarak:update` integrados. **Falta a validação do dono (§9): construir um MÓDULO NOVO seguindo só o `sarak-ui/`.**"
prioridade: "Máxima"
tags: ["spec", "consumidor", "kit", "documentacao-viva", "skill", "empacotamento", "ciclo-40x"]
relacionados: ["40-teste-real", "40.1-correcoes-importacao", "40.3-multidispositivo-por-padrao", "45-scaffolder-react-e-skills", "39-importacao-e-atualizacao", "08-consumo-externo-e-integracao"]
---

> **Contexto:** as rodadas 40.1–40.3 fecharam a CAPACIDADE (expor tudo, cromo, fonte, temas, responsividade). Falta a HABILITAÇÃO: explicar **exatamente como escrever o frontend** depois de instalar a lib — em todos os casos e todas as topologias — de um jeito que **viaja no pacote** e **nunca fica desatualizado**. Aprovada quando um **módulo novo** for construído seguindo SÓ o kit.
>
> **Renumeração (2026-07-25):** esta spec nasceu como **40.4** ("kit de uso", fase de enablement do ciclo 40.x) e foi **renumerada para Spec 50** por decisão do dono — é a **ÚLTIMA da fila de execução** (após 46/41/42), pois enablement do consumidor só faz sentido depois da lib estar estruturalmente fechada. O número **40.4** foi reaproveitado para a *Reconciliação do contrato de tokens da Design Engine* (achado de browser da 40.3). O log é append-only; o de→para está registrado no `00-progresso.md`.

# 1. Visão Geral e Objetivo

Produzir um artefato de raiz **`sarak-ui/`** — o "kit de uso do consumidor" — contido no pacote publicado. Ele reúne **TUDO o que o importador precisa para usar o módulo**: as **instruções** (guia de autoria + skill de uso prático), os **templates** (esqueletos de código copiáveis), a **documentação** e o **catálogo vivo** (JSON) do que a lib expõe. É **genérico** (o ERP é apenas um importador comum — nada específico dele), cobre **as 4 topologias** e **as regras/casos** de autoria, e é **dinâmico**: gerado do código, com gate que impede publicar desatualizado. Meta explícita: **o consumidor sabe agir diante de QUALQUER necessidade** — não por enumerar tudo, mas por um procedimento de decisão + fallback + loop de completude (§5.0/§9).

# 2. Princípios
- **Dinâmico (a regra central):** nunca escrever à mão o que muda. As listas (componentes/props/tokens/contrato de responsividade) são **GERADAS** das fontes vivas (barril, catálogo AST, `design-token-ids`, contrato da 40.3); a prosa (regras/topologias/como-fazer) é estável e **aponta** para o gerado, nunca duplica. Um **gate** barra o build se o kit estiver velho.
- **Genérico:** o kit serve QUALQUER importador (monolito, monorepo, monolito modular, microsserviço). Zero menção ao ERP.
- **Zero-gambiarra / plug-and-play** (carrega de 40.1): defeito da lib corrige-se na lib; o consumidor só faz ações normais.
- **Aponte-não-duplique:** a regra nº 1 da skill do consumidor é *"para a lista viva de componentes/tokens, LEIA o catálogo shippado — nunca assuma de memória"* → dinâmico mesmo entre updates.

# 3. O artefato `sarak-ui/` (na raiz do pacote)
Estrutura (nome da pasta: `sarak-ui/`):
- **`sarak-ui/START-HERE.md`** — ponto de entrada para o agente do importador: o que é a pasta, o que mover para onde (a spec → `specs/` do importador; a skill → `.claude/skills/`), a regra "leia o catálogo, não assuma", e a versão/carimbo.
- **`sarak-ui/GUIA-FRONTEND.md`** — o **documento único** de autoria (§5): 4 topologias + todos os casos. Prosa estável + apêndice gerado. É a **spec que o importador incorpora** (vira decisão estrutural dele).
- **`sarak-ui/skill/`** — a **skill de uso** (a `ui-integra-consumidor` reescrita, versão consumidor), para autoria assistida por IA no importador.
- **`sarak-ui/templates/`** — **esqueletos de código copiáveis** (genéricos, por topologia), prontos para o importador adaptar: wiring do `main.tsx` (Provider + tema + cromo); a forma de um `ui-kit` compartilhado (`themes`/`nav`/`index`); uma **tela-exemplo** compondo componentes + tokens, com os 3 estados (loading/erro/vazio); e um **componente próprio temável** de exemplo. Código estável (não é lista gerada); referencia tokens genéricos, nunca lista componentes à mão.
- **`sarak-ui/catalog.json`** — o **catálogo vivo GERADO** (componentes + props + tokens + contrato de responsividade), a verdade da versão instalada.
- **`sarak-ui/VERSION`** — carimbo (versão da lib + hash) para o importador saber quando re-sincronizar.

# 4. O motor dinâmico (gerador + gate)
## L-A. Gerador `npm run guide` (ou `sarak-ui`)
- Lê as fontes vivas — barril/`docs/manifest-catalog.json` (AST), `design-token-ids`, o contrato de responsividade (40.3) — e **monta** `sarak-ui/catalog.json` + **injeta o apêndice gerado** no `GUIA-FRONTEND.md` + grava o `VERSION`. Reusa o pipeline do `npm run catalog` existente (não reinventa AST).
## L-B. Gate `guide:check`
- Regenera e faz diff; **falha o build/CI** se o kit estiver desatualizado (mesma família de `catalog:check`/`barrel:check`). Consequência: **impossível publicar uma versão cujo kit não bata com a API**. É o dinamismo do lado do autor — não depende de ninguém lembrar.

# 5. O documento único `GUIA-FRONTEND.md` (4 topologias + todos os casos)

## 5.0 Como agir em QUALQUER necessidade (o topo do guia — a garantia de completude)
Não se enumera o infinito — dá-se um **procedimento + fallback + loop**:
- **Árvore de decisão (índice de necessidades):** *"Preciso de X → seção Y"* — mapeia as necessidades comuns (usar componente · personalizar 1 elemento · tema global · estado de tela · ícone · multidispositivo · dados/formulário · criar componente próprio · escolher topologia) às seções do guia. É a porta de entrada.
- **Regra de fallback universal (decide o que NÃO está mapeado):** (1) é componente da lib? → use do barril. (2) não é, mas é um elemento seu? → React próprio **com tokens**. (3) um lugar só, diferente de propósito? → **sobrescrita LOCAL** (a escada de "Personalização pontual"). (4) a lib deveria fazer e não faz? → **DEMANDA na lib** (defeito), nunca gambiarra. Esse procedimento responde a qualquer caso, mesmo os não listados.
- **Reporte o buraco:** se a necessidade não está no guia E o fallback não resolve limpo, é sinal de **lacuna do GUIA** → reporte, para virar uma seção nova. O guia se completa por **loop** (§9), não por decreto — é isto que sustenta o "qualquer necessidade".

**Prosa estável** (não hardcoda listas):
- **Início:** instalar (`@sarak/lib-ui-core` direto ou via um `ui-kit` próprio), envolver no `SarakUIProvider`, passar temas (JSON), montar o Design Engine (`CustomizationPanel`), opcional `SarakAppChrome`.
- **As 4 topologias** (cada uma com o padrão de Provider/cromo/propagação de tema):
  1. **Monolito** (SPA único): 1 `SarakUIProvider` na raiz; tudo sob ele; cromo + Design Engine na casca.
  2. **Monorepo** (vários apps no mesmo repo): Provider + cromo **por app**; temas/nav como **código compartilhado** num pacote `ui-kit`; dep `file:`/`github:`.
  3. **Monolito modular** (deploy único, apps compostos): idem monorepo + **origem única** para a troca de tema em runtime cruzar (o tema *default* já é consistente por código compartilhado).
  4. **Microsserviço** (apps/deploys independentes): Provider + cromo por serviço; consistência por **pacote de tema compartilhado** (compile-time); ressalva de **mesma-origem** para propagação em runtime documentada.
- **Casos de autoria:**
  - **Componente existe** → importe do barril; componha com `var(--sarak-*)`; liberdade total (ex.: trocar tabela por cards).
  - **Falta componente** → **Opção A:** React próprio **com tokens** (continua temável) OU demanda na lib (ciclo de rodada). **Nunca** hardcode fora do contrato de tokens (não é tematizado) → zero-gambiarra.
  - **Personalização pontual** (a cor de um card, a fonte de um texto, um elemento específico) → a **escada**, da mais temável à mais fixa: (1) **prop do componente** (`variant`/`color`) se existir; (2) **sobrescrever o TOKEN localmente** num wrapper (`style={{ ['--sarak-card-bg']: 'var(--sarak-accent-color)' }}`) → o elemento continua seguindo o tema; (3) **`style`/`className` com VALOR DE TOKEN** (`var(--sarak-*)`) → one-off ainda temável; (4) **`style` com valor FIXO** → one-off consciente que **não** segue o tema (ok se for a intenção). Régua: **um** lugar = local; o **mesmo** override em muitos lugares = variação faltando → **demanda**. **Pontual ≠ gambiarra** (gambiarra é tapar buraco da lib; personalizar um elemento seu é liberdade sua).
  - **Estados de tela** (loading/erro/vazio) → sempre os **três**; use os componentes de skeleton/feedback do barril, ou React próprio com tokens.
  - **Ícones** → o `IconMap` curado via `SarakIcon`; o catálogo lista os nomes válidos; nome desconhecido → warn (não invente).
  - **Criar componente próprio TEMÁVEL** → para o Design Engine alcançá-lo, estilize por `var(--sarak-*)`; nunca hardcode fora do contrato. (É a mesma regra da Opção A, aqui como caso de "eu vou compor algo novo".)
  - **Dados / formulários / eventos** → é o **seu** React: hooks e a **`api/` do próprio módulo** (nunca dado externo direto nem `api` alheia); a lib dá inputs/validação visual, você liga a lógica.
  - **Extrair TODAS as funcionalidades** → o **catálogo vivo** (`sarak-ui/catalog.json`) lista tudo: átomos, layouts, navegação, inputs, data-display, media, engines, Design Engine central, primitivas multidispositivo, temas-JSON. Sempre o catálogo, nunca memória.
  - **Tema** → temas como JSON, Design Engine central, temas completos, fonte automática.
  - **Multidispositivo** → o **contrato de responsividade** (40.3): o que adapta sozinho, onde refinar com `ResponsiveValue`.
  - **Extensibilidade de layout — adicionar imagem/animação/qualquer conteúdo** → DOIS níveis (Spec 48, **EXECUTADA em 2026-07-26**): (a) fundo/atmosfera **global por tema** (Design Engine, sem código — tokens `globalBackgroundImageUrl`/`texture`/`bgNoiseAnimation`…); (b) conteúdo **por região** via **slots do `SarakAppChrome`** (`logo`/`topbarStart|End`/`sidebarHeader|Footer`/`banner`/`footer`/`decoration`) — o consumidor põe imagem/componente animado/qualquer React; opcionais e aditivos (`topbarEnd` é alias de `topbarActions`); refluem no mobile (faixas full-width; regiões de sidebar migram para o drawer) e `decoration` é `aria-hidden`/sem foco/toque. **Fonte a absorver:** `docs/extensibilidade-de-layout.md` (guia dos 2 níveis + mapa de região por dispositivo, já shippado em `docs/`); as 8 props novas **já estão no `component-catalog`** (gerado por AST), então o apêndice vivo do kit as pega sozinho — basta a 50 rodar DEPOIS da 48 (ordem do roteiro, mantida).
  - **Identidade da página** (nome da aba, favicon, marca) → é **do importador** (Spec 47): no Modo App a lib preserva o `<title>` do host por padrão; para controlar, passe `options.branding.initial.tabName`/`logoBase64` ou `systemName`. A lib nunca impõe a própria marca.
  - **Estrutura/isolamento** → Provider por app, cromo por app, sem import lateral, código compartilhado num `ui-kit`.
**Apêndice gerado** (§4): a lista viva de componentes/props/tokens/contrato — regenerada a cada build.

# 6. A skill reescrita
- Reescrever `ui-integra-consumidor` (fonte autoritativa em `.agents/skills/`) para a realidade atual (é pré-40.x, defasada); a versão consumidor é shippada em `sarak-ui/skill/` pelo gerador. Regra nº 1: **leia o `catalog.json`, nunca assuma**. Espelho `.claude` (symlink) conferido.

# 7. Empacotamento e entrega
- `sarak-ui/` entra nos **`files`** do `package.json` (vai no tarball publicado). `scripts/check-package-contents.mjs` passa a **exigir** `sarak-ui/` (+ START-HERE, guia, skill, catalog.json).
- **Install:** o importador acha `node_modules/@sarak/lib-ui-core/sarak-ui/`; o START-HERE guia o agente a mover a spec/skill para os lugares certos e a ler o catálogo.
- **`init`** (Spec 45): o scaffolder copia o `sarak-ui/` para o projeto novo, destacando a topologia escolhida.
- **`sarak:update`** (Spec 39): ao atualizar a lib, o novo `sarak-ui/` refresca a spec/skill movidas (pelo `VERSION`).

# 8. Critérios de Aceite
- [x] `sarak-ui/` na raiz com START-HERE + guia único (4 topologias + todos os casos) + skill + **`templates/`** + `catalog.json` + VERSION; nos `files`; `package:check` exige (incl. `templates/`).
- [x] O guia tem, no topo (§5.0), a **árvore de decisão** + a **regra de fallback universal** + a instrução de **reportar buraco**; e os casos incluem **personalização pontual** (a escada), **estados de tela**, **ícones**, **componente próprio temável** e **dados/formulários/eventos** — além dos já previstos.
- [x] `sarak-ui/templates/` com esqueletos copiáveis: wiring (`main.tsx`), forma de `ui-kit`, tela-exemplo (com os 3 estados) e componente próprio temável.
- [x] Gerador `npm run guide` monta o kit das fontes vivas; **gate `guide:check`** falha o build se stale (na CI/build).
- [x] O guia NÃO hardcoda listas — o apêndice é gerado; a prosa aponta para o catálogo. (A árvore de decisão, o fallback e os templates são **prosa/código estáveis**, não listas geradas.)
- [x] `ui-integra-consumidor` reescrita (fonte + espelho); versão consumidor em `sarak-ui/skill/` com a regra "leia o catálogo".
- [x] Genérico (grep: zero menção ao ERP no `sarak-ui/`).
- [x] **Casos de autoria herdados absorvidos:** `docs/migracoes.md` (Spec 42), `docs/identidade-do-host.md` (Spec 47) e `docs/extensibilidade-de-layout.md` (Spec 48 — os 2 níveis de imagem/animação: tema global + slots do cromo). Os três já estão em `docs/` e vão no pacote; o kit os incorpora em vez de reescrevê-los do zero.
- [x] Integrado a `init` (copia o kit) e `sarak:update` (refresca).
- [x] Gates da lib verdes (incl. `guide:check`); entrada no `00-progresso.md`. *(A Spec 40 não precisou de atualização: o ciclo 40.x já está fechado e aprovado.)*

## 8.1 Como o kit é montado (decisões de execução, 2026-07-26)
- **Reuso do AST, sem duplicação:** o pipeline do `npm run catalog` foi FATIADO em `scripts/catalogAst.mjs` (coletores) + `scripts/componentCatalog.mjs` (montagem) + a CLI fina; o gerador do kit importa os mesmos módulos. Saída do `catalog:check` byte a byte idêntica antes/depois do fatiamento.
- **Híbrido por marcadores:** a prosa do guia é editada à mão e o gerado entra entre `<!-- SARAK-KIT:APENDICE-GERADO:… -->` / `<!-- SARAK-KIT:CARIMBO:… -->`. O gerador falha ALTO se o marcador sumir.
- **`kitHash` é hash de CONTEÚDO do `catalog.json`, nunca commit git** — um carimbo por commit deixaria o `guide:check` vermelho a cada commit.
- **A skill é ESPELHADA** de `.agents/skills/ui-integra-consumidor/` para `sarak-ui/skill/` pelo gerador: fonte única, e editar a fonte sem rodar `npm run guide` deixa o gate vermelho.
- **Fontes vivas extras** (além do catálogo de componentes): `design-token-ids.ts` (chaves de tema), `THEME_PRESET_IDS`/`reference.ts` (temas), `breakpoints.ts` (limiares), uso REAL de `useSarakDevice` + resolução de wrappers `lazy(() => import(...))` (o que adapta sozinho), props com `ResponsiveValue` (refino) e as props `ReactNode` opcionais do `SarakAppChrome` (slots). O catálogo do kit também cobre a API de `core/` (Provider/Shell/…), que o `component-catalog` não varre.

# 9. Validação (o teste de verdade) + o loop de completude
- **Aprovada quando um MÓDULO NOVO do sistema importador for construído seguindo SÓ o `sarak-ui/`** — sem consultar nada fora dele.
- **Loop de completude (o mecanismo do "qualquer necessidade"):** o guia NUNCA é declarado completo por decreto. Toda necessidade real que surgir na construção do módulo novo **e não estiver coberta** vira uma **seção nova no guia** (ou um template novo) — nunca uma gambiarra no importador. Assim a cobertura cresce por uso real, e o fallback universal (§5.0) segura os casos entre uma rodada e outra. Cada buraco absorvido é registrado no `00-progresso.md`.

# 10. Fronteiras (não fazer)
- Não escrever à mão o que é gerável (listas) — só prosa estável aponta para o gerado.
- Não acoplar ao ERP (genérico).
- Não duplicar o pipeline de AST (reusar `npm run catalog`).
- Não fazer o teste do módulo novo aqui — é a validação (§9), pelo dono, após o kit existir.
