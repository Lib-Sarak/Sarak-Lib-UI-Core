---
tipo: "spec"
titulo: "Teste Real — o ERP readota Sarak como ui-kit + Design Engine central (apps separados, React puro)"
dominio: "Teste de aceitação em consumidor real / Prova de produção / Modelo componente-kit + tema central"
status: "🟡 Parcial (2026-07-24 v5 executada — Propostas passou NO HARNESS; importação prática revelou gaps; correções no ciclo 40.x)"
prioridade: "Máxima"
tags: ["spec", "teste-de-aceitacao", "teste-real", "erp", "producao", "ui-kit", "design-engine", "monorepo"]
relacionados: ["43-design-system-primeiro", "44-temas-json-e-persistencia", "45-scaffolder-react-e-skills", "46-remover-motor-de-manifesto"]
---

> **Histórico de reescritas:**
> - **1ª:** "montar o ERP 100% via manifesto" → FALHOU (4 paredes numa tela simples).
> - **2ª:** "importar componentes à la MUI" → descartada (premissa "MyService roda esse modelo" era falsa).
> - **3ª (2026-07-22):** "ERP como módulos-plugin no `SarakShell`" → descartada (o ERP não usa `SarakShell`).
> - **4ª (2026-07-24):** "ui-kit + Design Engine, composição **mono-SPA**" → **corrigida**: a auditoria real do conector (Explore agent) mostrou que a Task 3.0 partia de leitura errada. O conector do ERP **não** é um host — ele faz **redirect de página inteira** (`window.location.replace`) entre apps Vite **separados**. O front do ERP JÁ É "apps separados". mono-SPA exigiria **reescrever o conector** = mexer no importador = quebrar o isolamento que o dono vetou. Também: o "runtime unificado" do ADR 011 é o **processo de servidor único**, não uma árvore React única.
> - **5ª (2026-07-24 — esta):** composição = **apps separados (a que o ERP já é)**; o Sarak entra como `packages/ui-kit` consumido por cada `web`; a "central atinge todas as telas" sai quase toda de **código compartilhado** (o catálogo de temas mora no `ui-kit`) + `localStorage` mesma-origem no deploy único. **NÃO** se reescreve o conector. Readoção **condicional** ("se funcionar"): prova em UM módulo (Propostas) primeiro, blast radius mínimo, reversível. Item errado do `SarakCoreCard` removido (é decisão deliberada da Spec 42, não uma lacuna).

# 1. Visão Geral e Objetivo

Provar que a Sarak-Lib-UI-Core, como **caixa de componentes + tokens + central de tema (Design Engine)**, sustenta um sistema de PRODUÇÃO real **sem impor sua arquitetura de app ao consumidor e sem tocar na mecânica do importador**. O ERP Earendel mantém sua estrutura decidida (monorepo modular, React puro, apps `web` separados, conector-redirect) e **readota** o Sarak como o `packages/ui-kit` que os ADRs 007/011 já previram e ninguém construiu. As telas reais passam a ser escritas em React com componentes Sarak + `var(--sarak-*)`, e o tema de TODAS as telas é controlado pela **central (Design Engine)**. É o gate empírico que libera a remoção do #2 (Spec 46).

## 1.1 Contexto real do ERP (auditado 2026-07-24 — NÃO re-descobrir)
- **Monorepo pnpm + Turborepo, deploy único (monólito modular, ADR 011).** `Modulos/<mod>/{web,api,core}`; `web` = Vite+React SPA **independente**; `api` = Express (montada sob `/api/v1/<mod>` no processo único); `core` = domínio. `packages/*` é o slot compartilhado — **`packages/ui-kit` ainda NÃO existe** (a pasta física nunca foi criada; o glob já está no `pnpm-workspace.yaml`).
- **O conector (`Modulos/conector/web`) é um LANÇADOR, não um host.** Ele navega entre módulos por **redirect de página inteira** (`window.location.replace(urlWeb)`) — cada módulo carrega como app próprio. NÃO há `react-router`, NÃO monta módulos como filhos. É por isso que o front já é "apps separados".
- **Sarak-UI foi 100% removido** por decisão formal já executada: **ADR 009** ("Remoção Total do Sarak-UI", Aceito) — nenhum `package.json` referencia `@sarak/lib-ui-core`; `node_modules/@sarak` vazio; `src/main.tsx` da raiz é placeholder. Não há ADR 012+ reabrindo isso (o dono registrará depois — §1.2).
- **Estado dos módulos:** `Modulos/Propostas/web` **funcional e é o alvo** — `Lista.tsx`/`Detalhe.tsx` em React cru, `api-client/index.ts` com os 4 campos-parede, hooks e testes já existem. `Projetos/web` funcional simples (só `Lista`). `Contratos/web` é stub (`.gitkeep`). `_template` é scaffold.
- **As 4 paredes já estão no dado real de Propostas** (`web/src/api-client/index.ts`): `dados_extras: unknown` (JSONB — parede 1), `link_proposta` (link clicável — parede 2), `moeda` por registro (parede 3), `status_proposta` (parede 4).
- **Achado colateral (não do Sarak, reportar):** o `pnpm-workspace.yaml` referencia `modulos/*` (minúsculo) mas a pasta real é `Modulos/` (maiúsculo) — funciona só por acidente no Windows case-insensitive. Anotar; não corrigir sem combinar.

## 1.2 Governança: o ADR de superação do 009 (do dono, DEPOIS)
Readotar o Sarak **supera o ADR 009**. O dono decidiu readotar **condicionalmente** ("se funcionar") e **escreverá o ADR de superação depois** do teste provar o valor. Portanto: o executor **prossegue com o código** deste teste (criar `packages/ui-kit`, adotar em Propostas), tratando a readoção como **provisória/experimental**; o ADR formal é follow-up do dono, fora deste repo, e **não** é gate para começar. Nada é commitado sem autorização (§ regra geral).

## 1.3 Estado real da 1ª importação prática (2026-07-24) — PARCIAL; correções em 40.x
A v5 foi executada (relatório `RELATORIO-TESTE-REAL.md`). **O que passou:** Propostas ficou funcional sobre dado real, as 4 paredes caíram em React, e o **isolamento se manteve** (Sarak em 1 `package.json`, conector não reescrito, nenhum import lateral). **Mas a validação prática do dono (browser real) mostrou que o "R5 PASS" foi RASO** — provou só `--sarak-accent-color` atravessando; a config do Design Engine **não propaga por inteiro**. O que NÃO funcionou na prática:
- **Abas quebram (`ERR_CONNECTION_REFUSED :5176`):** o conector redireciona para dev servers de módulos em portas próprias que o `npm run dev` não sobe e que são de **outra origem** → nav quebra e `localStorage` não é compartilhado (o tema não cruza em dev). *(Correção já speccada no ERP: `plan-20.2-gateway-origem-unica` — gateway de origem única no `src/server.ts`; é o E1 da Spec 40.1.)*
- **Topbar/sidebar não aparece:** ninguém renderiza o cromo — o modelo apps-separados não usa `SarakShell`, e os tokens de topbar/sidebar (Spec 18) ficam **sem consumidor**.
- **Fontes não mudam:** os `ERP_THEMES` só têm ~10 chaves de **cor** (sem token de fonte) e o texto das telas não consome `var(--font-*)` — falha nas duas pontas.
- **Distribuição não-real:** o Sarak entra por `.tgz` em `vendor/`, não por `file:`/`github:` (Spec 39) — `sarak:update` não vale.
- **Exposição incompleta (o achado que virou requisito):** 6 inputs básicos faltavam no barril público (corrigidos na marra), sinal de um problema **sistêmico** — o consumidor **não alcança TODAS as funcionalidades** da lib (composição granular de layout, multi-dispositivo, engines) porque `src/index.ts` fica atrás do Registry do #2. O produto exige o inverso: **tudo exposto e utilizável**.

Correções e re-validação vivem na **Spec 40.1** (e 40.2… se preciso), no **ciclo iterativo da §8**.

### Rodada 1 (Spec 40.1) executada — 2026-07-24
Todos os gaps da lista acima foram corrigidos **na ponta certa** (LIB para defeito de lib; ERP só ações normais de consumidor):
- **Abas quebrando** → era `plan-20.2` (ERP, já commitada `7c2a723`); a nav do conector já usa caminho relativo sob origem única — **reconfirmação em browser pendente com o dono (E2)**.
- **Topbar/sidebar ausente** → LIB: criado `SarakAppChrome` (cromo apresentacional temável, sem host/registro — `SarakShell` NÃO roda apresentacional). ERP: conector envolto nele, mecânica de redirect preservada.
- **Fontes não mudam** → causa real era o **tema sem token de fonte** (não "nada liga a var" — as regras CSS já existiam e auto-injetam). LIB: `SarakUIProvider` agora ancora a fonte do tema INLINE no seu escopo (vence reset de scaffold, zero CSS do consumidor); ERP: `ERP_THEMES` agora partem dos temas COMPLETOS da lib.
- **Exposição incompleta** → LIB: gate de **paridade de barril público** (`barrel:check`, permanente) + tudo consumidor-facing exportado (componente+`Props`).
- **Distribuição `.tgz`** → ERP: `file:` local; rebuild da lib reflete sem re-pack; ambos os `web` fazem `tsc` verde.
- **PresetsCatalog não persistia / não repintava** → LIB: aplicar tema completo pelo catálogo agora comita ao sistema **e** persiste (não só preview).
- **Temas incompletos** → LIB: `SARAK_REFERENCE_THEMES` (par completo) exportado; export de tema completo; aviso de eixo omitido.

**Estado após a 40.1:** o R5 amplo e o R10 estão **code-complete e com gates verdes** (lib 925/925; ERP typecheck verde; zero-gambiarra vazio). Falta **só a prova prática do dono no browser** (E2 + R5 amplo sob o gateway). Se algo ainda falhar lá, vira **Spec 40.2**.

### Rodada 2 (Spec 40.2) executada — 2026-07-25
A validação prática do dono após a 40.1 confirmou grande evolução, mas achou **3 gaps estruturais** — corrigidos nesta rodada na ponta certa:
- **Cromo sumia ao entrar em Propostas** (só o conector tinha cromo) → LIB: `SarakAppChrome` ganhou navegação estruturada com **ícone first-class** (`navItems: SarakNavItem[]` — ícone via `SarakIcon`/`IconMap`, `aria-current`, foco por teclado). ERP: os **4 apps** (conector + Propostas/Projetos/Contratos) passam a renderizar o **MESMO** cromo (`ErpChrome` no `@erp/ui-kit`, nav+ícones compartilhados como código) → o cromo não some mais ao trocar de aba e é idêntico.
- **Cromo sem ícones** (nav text-only) → coberto pelo `navItems` (L1) + ERP passando os ícones (E2), iguais em todo app por construção.
- **`SarakDataTable` transbordava no mobile** (zero lógica responsiva) → LIB: **denso é mobile-usável por padrão** — no smartphone (`useSarakDevice`) a tabela colapsa para **cards empilhados** (`SarakDataCards`), scroll só vertical contido no container (sem overflow da página); desktop com `maxWidth:100%`. Risco dos vizinhos densos registrado como follow-up.
- **Liberdade de composição** (E3): a listagem de Propostas foi reescrita de tabela para **cards** (`SarakGrid` + card por tokens + `SarakBadge`/`SarakLink`), editando só `Lista.tsx`, hook de dados intocado — melhora o mobile de Propostas de brinde.

**Estado após a 40.2:** cromo idêntico-por-app com ícones + densos mobile-usáveis estão **code-complete e com gates verdes** (lib 299 arq·942 testes; `run_audit` no baseline; 4 web apps do ERP `tsc --noEmit` verdes; Propostas builda; zero-gambiarra vazio). Falta **só a prova de browser do dono** (cromo com ícones em todas as abas + repintura de cromo/telas ao trocar tema + mobile de Propostas). Se algo ainda falhar → **Spec 40.3**.

# 2. Regra de Ouro

> **Mexer no mínimo do importador.** O ERP mantém a arquitetura dele — apps `web` separados + conector-redirect, **sem reescrita**. O Sarak entra **uma vez**, em `packages/ui-kit`; cada `web` (e o app do conector) depende de `@erp/ui-kit`, nunca do Sarak direto. As telas reais são **React do próprio módulo** usando componentes Sarak + tokens. `SarakShell`/`registerSarakModule` **não** são usados. Falta componente? Opção A: React próprio com **tokens** (`var(--sarak-*)`). Bug/lacuna REAL de componente → corrige NA LIB (fix + gates + `sarak:update`, o `ui-kit` herda), **nunca** hackeia no ERP. O tema global é alterado **só pela central (Design Engine)** e atinge todas as telas. Se algum passo forçar um módulo a depender de outro, ou exigir reescrever o conector, ou tornar um módulo não-extraível → **PARE**: a integração está errada, não o ERP.

# 3. Protocolo do Teste

## 3.0 Execução em FASES (staged — readoção condicional)
Como a readoção é "se funcionar", o teste é encenado para blast radius crescente e reversível. Ao fim de cada fase, gate verde antes da próxima.
- **Fase 0 — `packages/ui-kit`:** criar o pacote (a porta única do Sarak). Depende de `@sarak/lib-ui-core` (o ÚNICO lugar); re-exporta os componentes; **exporta o catálogo de temas do ERP (JSON) + o tema default** (ver §3.2). Corrigir o casing `modulos/`→`Modulos/` no workspace SE necessário para o pnpm resolver o pacote (combinar antes; senão anotar).
- **Fase 1 — Propostas (o alvo pronto):** `Modulos/Propostas/web` passa a depender de `@erp/ui-kit`; `main.tsx` embrulha em `SarakUIProvider`; `Lista`/`Detalhe` reescritas com componentes+tokens; formulário real. É a prova principal (R1–R4).
- **Fase 2 — Central no conector:** o app do conector ganha uma rota/visão `/design` montando `CustomizationPanel` sob um `SarakUIProvider`. A central vive na casca.
- **Fase 3 — Prova do R5 (tema atinge tudo):** trocar tema no `/design` e verificar que Propostas (e o próprio conector) respondem, no **build/deploy único** (mesma origem — ver ressalva §3.2). Persistência via `localStorage`.
- **Fase 4 — Expansão condicional:** SÓ se Propostas ficou bom, adotar em `Projetos/web`. `Contratos` (stub) por último ou fora do teste. Se Propostas NÃO convenceu → parar, relatar, e a readoção não avança.

## 3.1 Pré-condições
- **Specs 43, 44, 45 executadas** — barril público de componentes, Design Engine central sem backend, skills reescritas.
- **Lacuna `SarakLink` fechada na lib** (commit `7eaf77d`, já no HEAD). *(NÃO exportar `SarakCoreCard` — é decisão deliberada da Spec 42; não é pré-condição.)*
- O ADR de superação do 009 **NÃO** é gate para começar (é follow-up do dono — §1.2).
- Porta de dados apontável ao Supabase real do ERP (via `api/` de cada módulo — o front NÃO fala Supabase direto).

## 3.2 Composição e propagação de tema — **DECIDIDO: apps separados (o que o ERP já é)**
NÃO se reescreve o conector. A "central atinge todas as telas" tem duas camadas, e a maior é **código compartilhado, não estado de runtime**:
- **Definições de tema (catálogo + default) → vivem no `@erp/ui-kit`.** Todo `web` importa o MESMO catálogo. Logo os temas disponíveis e o padrão são idênticos em todo o sistema **por construção** — zero sync, zero acoplamento de runtime. (O `CustomizationPanel` exporta JSON — Spec 44 — que o dev cola no catálogo do `ui-kit`.)
- **Seleção ativa do usuário → `localStorage`.** Cada `web`, ao carregar (navegação é page-load no conector-redirect), lê a seleção e aplica via `SarakUIProvider` `initialTheme`. Trocar no `/design` e navegar a qualquer módulo já traz o tema certo. **Não precisa de mono-SPA nem do listener de `storage`** (esse só sincronizaria abas simultâneas — fora do teste).
- **⚠️ Ressalva a VERIFICAR (não presumir):** o compartilhamento de `localStorage` depende de **mesma origem**. No **deploy único** (produção, o alvo real) é mesma origem → funciona. Em **dev**, cada `web` é um Vite em porta própria → origem diferente → não compartilha. Portanto o R5 (Fase 3) deve ser provado no **build/deploy único** (`src/server.ts` já serve os fronts) ou atrás de um proxy de origem única. Confirmar como o conector resolve `urlWeb` antes de escrever.
- **Por que NÃO mono-SPA:** o conector é redirect, não host; mono-SPA exigiria reescrevê-lo = mexer no importador = quebrar o isolamento (vetado). Fica como caminho futuro apenas se algum módulo precisar virar host de micro-frontend — o ERP não precisa.

## 3.2.1 Invariantes de isolamento (não quebrar ao adotar o Sarak)
Verificar a cada fatia:
- **Sarak em UM só `package.json`** (o de `packages/ui-kit`); todo `web`/conector depende de `@erp/ui-kit` (`workspace:*`), nunca de `@sarak/lib-ui-core` direto (sem phantom dep; pnpm estrito).
- **Nenhum `Modulos/<a>/web` importa `Modulos/<b>/*` nem o conector** (regra dura ADR 007). Cola única = conector→módulo (por URL/redirect); jamais módulo→conector/módulo.
- **Cada `web` continua extraível/rodável standalone:** mantém seu próprio `main.tsx` + `createRoot` + `SarakUIProvider`. A adoção do kit é aditiva (uma dependência + um wrapper), reversível removendo a dep.
- **Design Engine/`CustomizationPanel` no CONECTOR** (a casca), nunca dentro de módulo de negócio.
- **Fronteira de dados:** cada `web` fala só com seu `api/`; nunca Supabase direto nem `api/` alheio.
- **Env único na raiz, prefixado por módulo** (ADR 011): o `ui-kit` não introduz env/segredo compartilhado.

## 3.3 O que construir (features REAIS, em React usando o kit)
Em `Modulos/Propostas/web` (Fase 1; depois `Projetos/web` na Fase 4):
1. **Listagem real:** a `Lista` real sobre dado REAL do Supabase (via `api/`), com estados loading/empty/error, reescrita com componentes Sarak (`SarakCardGrid`/`SarakDataTable`/`SarakTable`) + tokens. Nada de mock. O hook de dados **não muda** — troca só a apresentação.
2. **Detalhe/leitura:** exibe TODOS os campos reais — as 4 paredes explicitamente: `dados_extras` (JSONB) formatado em JS, `link_proposta` clicável (usar `SarakLink`), `moeda` do registro, `status`. Triviais em React.
3. **Formulário real (create/edit):** grava de verdade via `api/` do módulo, com validação e feedback; `curl`/consulta confirmando persistência.
4. **Composição densa real:** ≥1 tela com grid/cards/tabela densa sobre dado real.
5. **Central de layout:** o `/design` no conector (Fase 2) altera tema/template e **todas as telas** respondem (§3.2); tema persiste (`localStorage`) e recarrega mantendo.

## 3.4 Ciclo de execução
Escrever a tela em React com componentes+tokens do kit → rodar → observar. Falta componente → React+tokens (opção A). Bug/lacuna real de componente → corrige na lib, `sarak:update` (o `ui-kit` herda), retoma. Layout/composição de tela → é do módulo do ERP (livre).

# 4. O que medir

| # | Medição | O que prova |
|---|---|---|
| R1 | `packages/ui-kit` criado como porta única do Sarak; Propostas com listagem real sobre dado real via componentes do kit | O kit sustenta produção sem virar host |
| R2 | Formulário real grava via `api/` do módulo, com validação/feedback | Ciclo de escrita real |
| R3 | Detalhe exibe JSONB, link e moeda dinâmica — as 4 paredes do manifesto agora triviais em React | **As 4 paredes caíram** |
| R4 | ≥1 composição densa real (grid/tabela) sobre dado real | Componentes além do básico |
| R5 | **A central (Design Engine) altera o tema de TODAS as telas** via catálogo compartilhado + `localStorage` mesma-origem; provado no deploy único; tema persiste | **O valor central do produto** |
| R6 | Onde faltou componente, o módulo usou React+tokens (temático); fricções da ergonomia de tokens registradas | Escape hatch (opção A) |
| R7 | Bug/lacuna real de componente → corrigido NA LIB (contagem); telas resolvidas no ERP | Fronteira kit×consumidor respeitada |
| R8 | Sarak num único `package.json`; módulos dependem de `@erp/ui-kit`; **conector NÃO reescrito** (segue redirect); cada `web` roda standalone | Encaixe respeita ADR 007/011 e não toca no importador |
| R9 | `npm run build` do ERP verde; app real de pé no browser (deploy único p/ o R5) | Entrega real |
| R10 | **A config INTEIRA do Design Engine propaga** (não só `accentColor`): cor **E fonte E cromo topbar/sidebar E raio** repintam em TODAS as telas; abas não quebram; **todas as funcionalidades da lib alcançáveis** pelo consumidor (barril completo, composição granular, multi-dispositivo) | 🟡 **Code-complete (Spec 40.1 + 40.2)** — cromo agora idêntico-por-app com ícones (4 apps) e densos mobile-usáveis; falta a prova de browser do dono |
| R11 | **Cromo presente e IDÊNTICO em todas as abas, com ícones** (Spec 40.2): os 4 apps renderizam o mesmo `ErpChrome`; nav estruturada com ícone first-class; densos colapsam para cards no mobile sem overflow da página | 🟡 **Code-complete (Spec 40.2)** — gates verdes; falta a prova de browser do dono |

> **Nota (2026-07-24):** na v5 executada, R1–R4/R6–R9 passaram; **R5 passou apenas de forma rasa** (só `accentColor`, no harness) e o **R10 estava em aberto**. A **Spec 40.1** corrigiu ambos nas 2 pontas (barril completo, `SarakAppChrome`, fonte inline, temas completos, apply-que-comita) — com gates verdes (lib 925/925, ERP typecheck, zero-gambiarra vazio). **Resta a validação prática do dono no browser** (R5 amplo sob o gateway `plan-20.2`): trocar tema no `/design` deve repintar cor+fonte+cromo+raio em Propostas + conector e persistir no reload. Se passar → R5 amplo + R10 fechados; se não → Spec 40.2.

# 5. Entregável
`RELATORIO-TESTE-REAL.md` na raiz do ERP + na conversa, com: ambiente/tempo; como o conector resolve `urlWeb` e se o deploy único é mesma-origem (a verificação da §3.2); a **prova de isolamento** (grep: nenhum módulo importa outro/o conector; Sarak num único `package.json`; cada `web` builda/roda standalone; conector inalterado; pnpm sem phantom dep); as features reais por módulo (dado real + persistência via curl); AS 4 PAREDES cada uma resolvida em React (como/qual componente/token); a prova do R5 (troca de tema atingindo os módulos no deploy único); bugs/lacunas de componente corrigidos NA LIB; fricções da ergonomia de tokens; matriz R1-R9; **veredito condicional** (Propostas convenceu? expandir ou parar?) + próximos gaps de componente.

# 6. Critérios de Aceite
- [ ] `packages/ui-kit` criado como porta única do Sarak (re-exporta componentes + catálogo de temas JSON + default); módulos dependem de `@erp/ui-kit`; Sarak num único `package.json` (R1/R8).
- [ ] Propostas com listagem + detalhe + formulário reais, dados reais, persistência confirmada (R1–R3). Projetos só na Fase 4 (condicional).
- [ ] Detalhe exibe JSONB formatado, link clicável (`SarakLink`) e moeda do registro — as 4 paredes explicitamente derrubadas (R3).
- [ ] **A central altera o tema de todas as telas** (R5) via catálogo compartilhado + `localStorage`, provado no **deploy único** (mesma origem verificada), com persistência.
- [ ] Onde faltou componente, resolvido com React+tokens (temático), não hardcode fora do contrato; fricções registradas.
- [ ] Bug/lacuna real de componente corrigido na lib (gates verdes), nunca hackeado no ERP.
- [ ] **Conector NÃO reescrito**; `SarakShell`/`registerSarakModule` NÃO usados (R8).
- [ ] **Invariantes de isolamento (§3.2.1) provadas** por grep no relatório.
- [ ] Matriz R1-R9 com evidência; `npm run build` do ERP verde; veredito condicional registrado.
- [ ] Entrada no `00-progresso.md` com o resultado, os componentes demandados e as correções de fonte.

# 7. Pós-teste
- Cada lacuna real de componente vira demanda na lib (ciclo da onda) — o relatório alimenta o roadmap de componentes com base em uso REAL.
- **Governança:** se o veredito for positivo, o dono registra o ADR do ERP superando o 009 (§1.2) — follow-up fora deste repo.
- **Gate para a Spec 46:** se o Teste Real passar (o kit + central sustenta o ERP real), está provado que o modelo React é suficiente → libera a remoção do #2. Se revelar que a camada declarativa é necessária, reavaliar ANTES da 46.
- **Nota para o Spec 45 (skills):** a `ui-integra-consumidor` deve incorporar o padrão real confirmado aqui — **kit via `packages/ui-kit` consumido por apps separados + catálogo de temas compartilhado + `localStorage`**, NÃO `SarakShell` host nem mono-SPA. O framing "registre módulos no Shell" (herdado do MyService) não é o que o ERP real usa.

# 8. Ciclo iterativo de correção e validação (40.x)
O Teste Real deixou de ser "passa/não passa numa rodada" e virou um **ciclo** — porque a 1ª importação prática (§1.3) mostrou que passar exige corrigir gaps na lib E no ERP, e o dono valida no browser a cada volta:
1. **Executa a Spec 40.N** (correções — lib + ERP; começa na **40.1**).
2. **Atualiza esta Spec 40** (§1.3 + matriz) com o novo estado real da importação — o que passou a funcionar, o que ainda não.
3. **Verificação prática pelo dono** (rodar no browser real, como foi feito nesta rodada).
4. Se **todos** os critérios desejados batem (incl. R5 amplo + R10) → **Teste Real APROVADO** → libera a Spec 46. Senão → cria **Spec 40.(N+1)** com o resíduo e repete.

**Objetivo final do ciclo:** o sistema consumidor **alcança e usa TODAS as funcionalidades da lib** (componentes, composição granular de layout, renderização multi-dispositivo, engines) e o **tema central completo** (cor + fonte + cromo topbar/sidebar + raio + espaçamento) repinta **todas as telas** de todos os módulos, sob **origem única**, sem quebrar o isolamento do ERP.
