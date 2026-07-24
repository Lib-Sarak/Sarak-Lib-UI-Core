---
tipo: "spec"
titulo: "Teste Real — o ERP adota Sarak como ui-kit + Design Engine central (React puro, monorepo modular)"
dominio: "Teste de aceitação em consumidor real / Prova de produção / Modelo componente-kit + tema central"
status: "🔴 Planejada (REESCRITA 2026-07-24 — modelo ui-kit + Design Engine; executar DEPOIS de 43/44/45)"
prioridade: "Máxima"
tags: ["spec", "teste-de-aceitacao", "teste-real", "erp", "producao", "ui-kit", "design-engine", "monorepo"]
relacionados: ["43-design-system-primeiro", "44-temas-json-e-persistencia", "45-scaffolder-react-e-skills", "46-remover-motor-de-manifesto"]
---

> **Histórico de reescritas:**
> - **1ª:** "montar o ERP 100% via manifesto" → FALHOU (4 paredes numa tela simples).
> - **2ª:** "importar componentes à la MUI" → descartada (premissa "MyService roda esse modelo" era falsa).
> - **3ª (2026-07-22):** "ERP como módulos-plugin no `SarakShell` (modelo MyService)".
> - **4ª (2026-07-24 — esta):** a auditoria do ERP real invalidou a 3ª. O ERP **removeu o Sarak-UI por completo** (ADR 009, Aceito) e virou um **monorepo modular React puro** (ADRs 006/007/011): cada módulo é o próprio web app (`Modulos/<mod>/web`), o **conector** é a casca, e o UI compartilhado seria **um** pacote (`packages/ui-kit`) — hoje **vazio**. Forçar o `SarakShell` como dono do app recontraria os ADRs 007/011 que o dono ratificou. Esta versão testa o encaixe que a arquitetura real do ERP admite: **Sarak entra como `packages/ui-kit` (componentes atômicos + tokens) + Design Engine central**, e as telas reais são escritas em **React** usando esses componentes/tokens. Ainda prova tudo que a lib precisa (as 4 paredes em React + a central tematizando todas as telas), mas na forma real do ERP.

# 1. Visão Geral e Objetivo

Provar que a Sarak-Lib-UI-Core, como **caixa de componentes + tokens + central de tema (Design Engine)**, sustenta um sistema de PRODUÇÃO real **sem impor sua arquitetura de app ao consumidor**. O ERP Earendel (Propostas, Contratos, Projetos) mantém sua estrutura decidida (monorepo modular, React puro, conector como casca) e adota o Sarak como o `packages/ui-kit` que os ADRs 007/011 já previram e ninguém construiu. As telas reais de cada módulo passam a ser escritas em React com componentes Sarak + `var(--sarak-*)`, e o layout de TODAS as telas é controlado pela **central de tema/template**. É o gate empírico que libera a remoção do #2 (Spec 46).

## 1.1 Contexto real do ERP (auditado 2026-07-24 — NÃO re-descobrir)
- **Monorepo pnpm + Turborepo.** `Modulos/<mod>/{web,api,core}`; `web` = Vite+React SPA independente; `api` = Express; `core` = domínio/motor. O **conector** (`Modulos/conector/web`) é a casca (nav por History API + Home agregada). `packages/*` é o slot compartilhado — **`packages/ui-kit` ainda NÃO existe**.
- **Sarak-UI foi 100% removido** por decisão formal: **ADR 009** ("Remoção Total do Sarak-UI", Aceito) — `@sarak/lib-ui-core` fora de todo `package.json`, `/design` removido, nenhuma tela em renderizador. Motivos: manifesto revogado (ADR 006 — React puro) + doutrina de **módulo autossuficiente/extraível** (ADR 011) + "a lib não acompanhava o ritmo".
- **Estado das telas:** `src/main.tsx` da raiz é placeholder ("Hub em reconstrução"); `Modulos/Propostas/web` já tem `Lista`/`Detalhe` em **React cru** (`<ul>`/`<li>`/`<a>`, zero design system); demais módulos são stubs (`temWeb: false`, "em construção").
- **As 4 paredes já estão no dado real de Propostas** (`web/src/api-client/index.ts`): `dados_extras: unknown` (JSONB — parede 1), `link_proposta` (link clicável — parede 2), `moeda` por registro (parede 3), `status_proposta` (parede 4). Alvo natural do teste.

## 1.2 Pré-requisito de governança (do lado do ERP)
Reintroduzir o Sarak **supera o ADR 009**. Antes de instalar, o ERP registra um **novo ADR** (ex.: "Adoção do Sarak-UI como ui-kit + Design Engine, superando 009") — a objeção "não acompanhava o ritmo" está endereçada porque a lib evolui agora sob o mesmo dono, com `sarak:update`. Isto é decisão/execução DO ERP; a spec só a exige como pré-condição, não a executa neste repo.

# 2. Regra de Ouro

> **O ERP mantém a arquitetura dele; o Sarak entra como caixa de componentes + central de tema — NÃO como dono do app.** O Sarak é instalado **uma vez**, dentro de `packages/ui-kit`; cada `web` que usa UI depende de `@erp/ui-kit` (não do Sarak direto). As telas reais são **React do próprio módulo**, usando componentes Sarak + tokens para serem tematizáveis. O conector segue sendo a casca; o `SarakShell`/`registerSarakModule` **não** são usados como host. Falta um componente? Caminho default (opção A): React próprio com **tokens** (`var(--sarak-*)`). Bug/lacuna REAL de componente Sarak → corrige NA LIB (fix + gates + `sarak:update`), não hackeia no ERP. O layout global (tema/template) é alterado **só pela central (Design Engine)**, e a troca atinge **todas** as telas de todos os módulos.

# 3. Protocolo do Teste

## 3.1 Pré-condições
- **Specs 43, 44, 45 executadas** — barril público de componentes, Design Engine central sem backend, skills reescritas.
- ERP registrou o ADR que supera o 009 (§1.2).
- Sarak instalado **uma vez** em `packages/ui-kit` (porta única; re-exporta `@sarak/lib-ui-core` e pode acrescentar componentes/tokens do ERP). `npm run sarak:check` no ERP → "Atualizado".
- Porta de dados apontável ao Supabase real do ERP (via `api/` de cada módulo — o front NÃO fala Supabase direto).

## 3.2 Task 3.0 — Fixar o modelo de composição e propagação de tema (o ponto em aberto)
Antes das telas, **decidir e implementar** como o conector compõe um módulo quando `temWeb` vira `true`, porque isso define como a central atinge N web apps:
- **Opção mono-SPA (recomendada p/ o teste):** o conector monta os módulos no MESMO SPA (um `SarakUIProvider` no topo do conector; módulos como componentes filhos). A troca de tema repinta tudo instantaneamente — uma árvore, CSS vars descem para todos. Mais simples de provar o R5.
- **Opção bundles separados (preserva ADR 011 ao extremo):** cada `web` é bundle próprio com seu `SarakUIProvider`; a central propaga por **fonte de verdade compartilhada** — a mesma chave `localStorage` que todo Provider lê no `initialTheme`, com `storage` event sincronizando apps abertos. Mesmo tema, todas as telas, sem backend.
Registrar a opção escolhida e o porquê no relatório; ambas usam o mesmo mecanismo do Spec 44 (CSS vars + localStorage validado).

## 3.3 O que construir (features REAIS, em React usando o kit)
Por módulo de negócio (Propostas primeiro — já tem `web` e dado real; depois Contratos/Projetos), no `web` do próprio módulo:
1. **Listagem real:** a `Lista` real sobre dado REAL do Supabase (via `api/`), com estados loading/empty/error, reescrita com componentes Sarak (`SarakCardGrid`/`SarakDataTable`/`SarakTable`) + tokens. Nada de mock. A lógica/hook de dados **não muda** — troca só a camada de apresentação.
2. **Detalhe/leitura:** exibe TODOS os campos reais — as 4 paredes explicitamente: `dados_extras` (JSONB) formatado em JS, `link_proposta` clicável, `moeda` do registro, `status`. Triviais em React.
3. **Formulário real (create/edit):** grava de verdade via `api/` do módulo, com validação e feedback; `curl`/consulta confirmando persistência.
4. **Composição densa real:** ≥1 tela com grid/cards/tabela densa sobre dado real.
5. **Central de layout:** o Design Engine (`/design`, montado no conector via `CustomizationPanel`) altera tema/template e **todas as telas do ERP** respondem (conforme o modelo da Task 3.0); tema persiste (localStorage) e recarrega mantendo.

## 3.4 Ciclo de execução
Escrever a tela em React com componentes+tokens do kit → rodar → observar. Falta componente → React+tokens (opção A). Bug/lacuna real de componente → corrige na lib, `sarak:update` (o `packages/ui-kit` herda), retoma. Layout/composição de tela → é do módulo do ERP (livre).

# 4. O que medir

| # | Medição | O que prova |
|---|---|---|
| R1 | `packages/ui-kit` criado como porta única do Sarak; ≥1 módulo (Propostas) com listagem real sobre dado real via componentes do kit | O kit sustenta produção sem virar host |
| R2 | Formulário real grava via `api/` do módulo, com validação/feedback | Ciclo de escrita real |
| R3 | Detalhe exibe JSONB, link e moeda dinâmica — as 4 paredes do manifesto agora triviais em React | **As 4 paredes caíram** |
| R4 | ≥1 composição densa real (grid/tabela) sobre dado real | Componentes além do básico |
| R5 | **A central (Design Engine) altera o layout de TODAS as telas** do ERP conforme o modelo da Task 3.0; tema persiste | **O valor central do produto** |
| R6 | Onde faltou componente, o módulo usou React+tokens (temático); fricções da ergonomia de tokens registradas | Escape hatch (opção A) |
| R7 | Bug/lacuna real de componente → corrigido NA LIB (contagem); telas resolvidas no ERP | Fronteira kit×consumidor respeitada |
| R8 | Sarak instalado **uma vez** (em `ui-kit`); módulos dependem de `@erp/ui-kit`; conector segue a casca (sem `SarakShell` host) | Encaixe respeita ADR 007/011 |
| R9 | `npm run build` do ERP verde; app real de pé no browser | Entrega real |

# 5. Entregável
`RELATORIO-TESTE-REAL.md` na raiz do ERP + na conversa, com: ambiente/tempo; o ADR de superação do 009; o modelo de composição/propagação escolhido (Task 3.0) e o porquê; as features reais por módulo (dado real + persistência via curl); AS 4 PAREDES cada uma resolvida em React (como/qual componente/token); a prova de que a central tematiza todas as telas do ERP (R5, com evidência de troca de tema atingindo os módulos); bugs/lacunas de componente corrigidos NA LIB; fricções da ergonomia de tokens; matriz R1-R9; veredito (o kit + central sustenta o ERP real? nota + próximos gaps de componente).

# 6. Critérios de Aceite
- [ ] `packages/ui-kit` criado como porta única do Sarak; módulos que usam UI dependem de `@erp/ui-kit`; Sarak num único `package.json` (R1/R8).
- [ ] ≥1 módulo (Propostas) com listagem + detalhe + formulário reais, dados reais, persistência confirmada; Contratos/Projetos na medida em que ganharem `web`.
- [ ] Detalhe exibe JSONB formatado, link clicável e moeda do registro — as 4 paredes explicitamente derrubadas (R3).
- [ ] Modelo de composição/propagação decidido e implementado (Task 3.0); **a central altera o layout de todas as telas** (R5) — evidência + persistência.
- [ ] Onde faltou componente, resolvido com React+tokens (temático), não hardcode fora do contrato; fricções registradas.
- [ ] Bug/lacuna real de componente corrigido na lib (gates verdes), nunca hackeado no ERP.
- [ ] `SarakShell`/`registerSarakModule` NÃO usados como host; conector permanece a casca (R8).
- [ ] Matriz R1-R9 com evidência; `npm run build` do ERP verde.
- [ ] Entrada no `00-progresso.md` com o resultado, os componentes demandados e as correções de fonte.

# 7. Pós-teste
- Cada lacuna real de componente vira demanda na lib (ciclo da onda) — o relatório alimenta o roadmap de componentes com base em uso REAL.
- **Gate para a Spec 46:** se o Teste Real passar (o kit + central sustenta o ERP real), está provado que o modelo React é suficiente → libera a remoção do #2. Se revelar que a camada declarativa é necessária, reavaliar ANTES da 46.
- **Nota para o Spec 45 (skills):** a `ui-integra-consumidor` deve incorporar o padrão real confirmado aqui — **kit via `packages/ui-kit` + Design Engine central**, NÃO `SarakShell` como host. O framing "registre módulos no Shell" (herdado do MyService) não é o que o ERP real usa.
