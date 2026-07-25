---
tipo: "spec"
titulo: "Kit de uso do consumidor — artefato `sarak-ui/` na raiz, dinâmico, genérico, shippado no install"
dominio: "Habilitação do consumidor / Empacotamento / Documentação viva / Skill de integração"
status: "🔴 Planejada (2026-07-25; renumerada de 40.4 → 50 em 2026-07-25) — ÚLTIMA da execução (após a Spec 42); produz o kit de autoria do front (spec+skill+catálogo)"
prioridade: "Máxima"
tags: ["spec", "consumidor", "kit", "documentacao-viva", "skill", "empacotamento", "ciclo-40x"]
relacionados: ["40-teste-real", "40.1-correcoes-importacao", "40.3-multidispositivo-por-padrao", "45-scaffolder-react-e-skills", "39-importacao-e-atualizacao", "08-consumo-externo-e-integracao"]
---

> **Contexto:** as rodadas 40.1–40.3 fecharam a CAPACIDADE (expor tudo, cromo, fonte, temas, responsividade). Falta a HABILITAÇÃO: explicar **exatamente como escrever o frontend** depois de instalar a lib — em todos os casos e todas as topologias — de um jeito que **viaja no pacote** e **nunca fica desatualizado**. Aprovada quando um **módulo novo** for construído seguindo SÓ o kit.
>
> **Renumeração (2026-07-25):** esta spec nasceu como **40.4** ("kit de uso", fase de enablement do ciclo 40.x) e foi **renumerada para Spec 50** por decisão do dono — é a **ÚLTIMA da fila de execução** (após 46/41/42), pois enablement do consumidor só faz sentido depois da lib estar estruturalmente fechada. O número **40.4** foi reaproveitado para a *Reconciliação do contrato de tokens da Design Engine* (achado de browser da 40.3). O log é append-only; o de→para está registrado no `00-progresso.md`.

# 1. Visão Geral e Objetivo

Produzir um artefato de raiz **`sarak-ui/`** — o "kit de uso do consumidor" — contido no pacote publicado. Ele reúne **tudo o que o importador precisa para usar o módulo**: o guia (spec) de autoria do front, a skill de uso prático, e o **catálogo vivo** (JSON) do que a lib expõe. É **genérico** (o ERP é apenas um importador comum — nada específico dele), cobre **as 4 topologias** e **as regras/casos** de autoria, e é **dinâmico**: gerado do código, com gate que impede publicar desatualizado.

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
- **`sarak-ui/catalog.json`** — o **catálogo vivo GERADO** (componentes + props + tokens + contrato de responsividade), a verdade da versão instalada.
- **`sarak-ui/VERSION`** — carimbo (versão da lib + hash) para o importador saber quando re-sincronizar.

# 4. O motor dinâmico (gerador + gate)
## L-A. Gerador `npm run guide` (ou `sarak-ui`)
- Lê as fontes vivas — barril/`docs/manifest-catalog.json` (AST), `design-token-ids`, o contrato de responsividade (40.3) — e **monta** `sarak-ui/catalog.json` + **injeta o apêndice gerado** no `GUIA-FRONTEND.md` + grava o `VERSION`. Reusa o pipeline do `npm run catalog` existente (não reinventa AST).
## L-B. Gate `guide:check`
- Regenera e faz diff; **falha o build/CI** se o kit estiver desatualizado (mesma família de `catalog:check`/`barrel:check`). Consequência: **impossível publicar uma versão cujo kit não bata com a API**. É o dinamismo do lado do autor — não depende de ninguém lembrar.

# 5. O documento único `GUIA-FRONTEND.md` (4 topologias + todos os casos)
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
  - **Extrair TODAS as funcionalidades** → o **catálogo vivo** (`sarak-ui/catalog.json`) lista tudo: átomos, layouts, navegação, inputs, data-display, media, engines, Design Engine central, primitivas multidispositivo, temas-JSON. Sempre o catálogo, nunca memória.
  - **Tema** → temas como JSON, Design Engine central, temas completos, fonte automática.
  - **Multidispositivo** → o **contrato de responsividade** (40.3): o que adapta sozinho, onde refinar com `ResponsiveValue`.
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
- [ ] `sarak-ui/` na raiz com START-HERE + guia único (4 topologias + todos os casos) + skill + `catalog.json` + VERSION; nos `files`; `package:check` exige.
- [ ] Gerador `npm run guide` monta o kit das fontes vivas; **gate `guide:check`** falha o build se stale (na CI/build).
- [ ] O guia NÃO hardcoda listas — o apêndice é gerado; a prosa aponta para o catálogo.
- [ ] `ui-integra-consumidor` reescrita (fonte + espelho); versão consumidor em `sarak-ui/skill/` com a regra "leia o catálogo".
- [ ] Genérico (grep: zero menção ao ERP no `sarak-ui/`).
- [ ] Integrado a `init` (copia o kit) e `sarak:update` (refresca).
- [ ] Gates da lib verdes (incl. `guide:check`); Spec 40 atualizada; entrada no `00-progresso.md`.

# 9. Validação (o teste de verdade)
- **Aprovada quando um MÓDULO NOVO do sistema importador for construído seguindo SÓ o `sarak-ui/`** — sem consultar nada fora dele. Se faltar alguma instrução, o buraco volta como correção ao guia (dinâmico) — não como gambiarra no importador.

# 10. Fronteiras (não fazer)
- Não escrever à mão o que é gerável (listas) — só prosa estável aponta para o gerado.
- Não acoplar ao ERP (genérico).
- Não duplicar o pipeline de AST (reusar `npm run catalog`).
- Não fazer o teste do módulo novo aqui — é a validação (§9), pelo dono, após o kit existir.
