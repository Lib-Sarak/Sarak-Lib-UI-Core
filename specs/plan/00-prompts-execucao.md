# Prompts de Execução — PENDENTES

Cada bloco abaixo é um prompt COMPLETO para iniciar a execução de uma spec **numa conversa nova** (agente sem contexto anterior). Copie e cole o bloco inteiro. A numeração (`P21`…) corresponde ao item no Roteiro de Execução do `00-indice.md`. Prompts de itens concluídos são removidos (P18/Spec 43 — concluída 2026-07-23; P20/Spec 45 — concluída 2026-07-24, executada fora de ordem antes da 44 a pedido do mantenedor; P19/Spec 44 — concluída 2026-07-24).

Regras comuns já embutidas: acionar `ui-contexto-repositorio` primeiro; ler `00-indice.md`, `00-progresso.md` e a spec inteira; ao terminar, atualizar status/checkbox/progresso; gates (`catalog:check`, `npm run build`, testes por pasta, `run_audit.mjs` — comparar com o baseline conhecido, não esperar 0; `RegistryParity` é do #2 e vale até a Spec 46).

> ⚠️ **VIRADA (2026-07-22) + correção (2026-07-24):** a lib tem 3 arquiteturas — **#1 módulos-plugin** (`Shell`+`Discovery`, o que o `Sarak-MyService` USA), **#2 renderizador de páginas por manifesto** (`Manifest`, FALHOU/ninguém usa), **#3 componentes atômicos+Provider+Design Engine**. **Remove só o #2 e o backend.** O Design Engine é a central de layout que aplica ao sistema inteiro; atômicos são os blocos.
> **Nuance de consumo (auditoria do ERP real, 2026-07-24):** há DOIS modos legítimos de consumir, conforme a arquitetura do consumidor. **#1 (Shell host)** — o MyService usa: o importador registra módulos no `SarakShell`. **#3 (ui-kit + central)** — o ERP Earendel usa: monorepo React puro, cada módulo é seu web app, o Sarak entra como `packages/ui-kit` (componentes+tokens) + Design Engine central, SEM `SarakShell` como host (removeu o Sarak por ADR 009 e o reintroduz como kit). A Spec 40 testa o **#3** (a forma real do ERP). Ambos partilham o mesmo núcleo (Provider + tokens + central). Ver `00-indice.md` (Fase 6) e `40-teste-real.md` §1.1.

## Ordem de execução

| Prompt | Spec | Item | Observação |
|---|---|---|---|
| **P21** | 40 — Teste Real (ERP readota Sarak como ui-kit, apps separados) | 21 | 🟡 v5 executada PARCIAL. Gate empírico do #2. Correções no ciclo 40.x. |
| **P21.1** | 40.1 — Correções de Importação (rodada 1) | 21.1 | 🟡 Executada (gates verdes); validação prática achou 3 gaps → rodada 2. |
| **P21.2** | 40.2 — Correções de Importação (rodada 2) | 21.2 | 🟡 Executada (gates verdes, browser ok); validação achou o gap multidispositivo → rodada 3. |
| **P21.3** | 40.3 — Multidispositivo por padrão | 21.3 | Adaptação de layout abrangente zero-config: cromo reflui por dispositivo + primitivas mobile-first + densos do ERP + contrato de responsividade. Fix de lib (ERP herda). Escopo delimitado. Depois: atualiza a 40 → dono valida → aprova o Teste Real ou abre 40.4. |
| **P22** | 46 — Remover o renderizador de páginas (#2) | 22 | ⚠️ SÓ depois do Teste Real. Mantém o #1. |
| **P23** | 41 — Piso de Bundle | 23 | Depois da 46 (muda a base) e antes da 42. |
| **P24** | 42 — Generalizar CardGrid | 24 | Depois da 41. |

---

## P21 — Spec 40: Teste Real (o ERP adota Sarak como ui-kit + Design Engine — GATE EMPÍRICO)

```
Execute a spec `specs/plan/40-teste-real.md` da Sarak-Lib-UI-Core (leia a v5 INTEIRA — ela foi corrigida). O ERP Earendel (`...\Code\Earendel\ERP`) é um MONOREPO MODULAR REACT PURO, DEPLOY ÚNICO (ADR 011), que removeu o Sarak por completo (ADR 009). Ponto CRÍTICO que já foi auditado: o front do ERP JÁ É "apps separados" — cada `Modulos/<mod>/web` é um SPA Vite independente e o conector é um LANÇADOR que navega por REDIRECT DE PÁGINA INTEIRA (`window.location.replace`), NÃO um host. Este teste readota o Sarak como `packages/ui-kit` consumido por cada `web`, SEM reescrever o conector e SEM mono-SPA. É o gate empírico que libera a remoção do #2 (Spec 46).

PRIORIDADE INEGOCIÁVEL: adotar o Sarak NÃO pode mexer na mecânica do importador nem quebrar o isolamento. Se algum passo forçar um módulo a depender de outro, exigir reescrever o conector, ou tornar um módulo não-extraível → PARE e reveja: a integração está errada, não o ERP. Readoção é CONDICIONAL ("se funcionar") e REVERSÍVEL.

Preparação: (1) acione `ui-contexto-repositorio`; (2) leia `00-indice.md`, `00-progresso.md` e a spec 40 v5 INTEIRA (esp. §1.1 contexto real, §3.0 fases, §3.2 composição e a RESSALVA de mesma-origem); (3) confirme por auditoria como o conector resolve o alvo do redirect (`urlWeb`) e se o deploy único serve os fronts em MESMA ORIGEM. CONFIRMAÇÃO ANTES: Specs 43/44/45 executadas; lacuna `SarakLink` fechada na lib (commit 7eaf77d). NÃO exportar `SarakCoreCard` (é decisão deliberada da Spec 42, não lacuna). O ADR do ERP superando o 009 NÃO é gate para começar — é follow-up do dono; trate a readoção como experimental.

COMPOSIÇÃO — DECIDIDA: apps separados (o que o ERP já é). NÃO reescreva o conector; NÃO use mono-SPA. A "central atinge todas as telas" vem de: (a) o CATÁLOGO DE TEMAS (JSON) morar no `@erp/ui-kit` → todo `web` importa o mesmo → temas/‌default idênticos por CÓDIGO COMPARTILHADO, zero sync; (b) a SELEÇÃO ativa em `localStorage` → cada `web` lê no `SarakUIProvider initialTheme` ao carregar. Como a navegação é page-load e o deploy é único (mesma origem), trocar no `/design` e navegar já traz o tema. NÃO precisa do listener de `storage`. ⚠️ localStorage só compartilha em MESMA ORIGEM — prove o R5 no BUILD/DEPLOY ÚNICO (`src/server.ts` já serve os fronts), não no `vite dev` isolado de cada app.

INVARIANTES DE ISOLAMENTO (verificar a cada fatia — quebrou uma, a integração está errada):
- Sarak num só `package.json`: o de `packages/ui-kit`. Todo `web`/conector depende de `@erp/ui-kit` (`workspace:*`), NUNCA de `@sarak/lib-ui-core` direto (sem phantom dep; pnpm estrito).
- Nenhum `Modulos/<a>/web` importa `Modulos/<b>/*` nem o conector (regra dura ADR 007). Cola única = conector→módulo por URL/redirect; jamais módulo→conector/módulo.
- Cada `web` continua extraível/rodável standalone: mantém seu `main.tsx` + `createRoot` + `SarakUIProvider`. A adoção é ADITIVA (uma dep + um wrapper), reversível removendo a dep. O conector NÃO é reescrito.
- Design Engine/`CustomizationPanel` no CONECTOR (a casca), nunca em módulo de negócio.
- Fronteira de dados: cada `web` fala só com seu `api/` (nunca Supabase direto, nunca `api/` alheio).
- Env único na raiz, prefixado por módulo (ADR 011): o `ui-kit` não introduz env/segredo novo.

EXECUTE EM FASES (§3.0), gate verde entre elas: Fase 0 — criar `packages/ui-kit` (única porta do Sarak; re-exporta componentes + exporta catálogo de temas JSON + default; corrigir casing `modulos/`→`Modulos/` no workspace SÓ se o pnpm exigir, combinando antes). Fase 1 — Propostas: `web` depende de `@erp/ui-kit`, `main.tsx` embrulha em `SarakUIProvider`, `Lista`/`Detalhe` reescritas com componentes+tokens, formulário real gravando via `api/` (confirme persistência via `curl`), ≥1 composição densa; as 4 PAREDES resolvidas (JSONB `dados_extras` em JS, `link_proposta` com `SarakLink`, `moeda` do registro, `status`). Fase 2 — `/design` no app do conector montando `CustomizationPanel`. Fase 3 — prove o R5 no deploy único (troca de tema atinge Propostas + conector; persiste no localStorage). Fase 4 — SÓ se Propostas convenceu, adotar em `Projetos/web`; `Contratos` (stub) por último/fora.

REGRA DO CICLO: falta componente → React próprio com TOKENS (`var(--sarak-*)`) — opção A — ou demanda na lib. Bug/lacuna REAL de componente → corrige NA LIB (fix + gates + `sarak:update`, o `ui-kit` herda), NUNCA hackeia no ERP.

Entregue: `RELATORIO-TESTE-REAL.md` na raiz do ERP + na conversa, com: como o conector resolve `urlWeb` e se o deploy único é mesma-origem; a PROVA DE ISOLAMENTO (grep: nenhum módulo importa outro/o conector; Sarak num único `package.json`; cada `web` builda/roda standalone; conector inalterado; pnpm sem phantom dep); features reais (dado real + persistência via curl); as 4 PAREDES cada uma resolvida em React; a prova do R5 no deploy único; bugs/lacunas corrigidos NA LIB; fricções de tokens; matriz R1-R9; VEREDITO CONDICIONAL (Propostas convenceu? expandir ou parar?). `npm run build` do ERP verde. Atualize o `00-progresso.md`. NÃO commite sem autorização.
```

---

## P21.1 — Spec 40.1: Correções de Importação (rodada 1) — expor TODA a API + propagação completa

```
Execute a spec `specs/plan/40.1-correcoes-importacao.md` da Sarak-Lib-UI-Core. É a RODADA 1 do ciclo iterativo 40.x: a 1ª importação prática do ERP (Spec 40 v5, ver `RELATORIO-TESTE-REAL.md`) passou RASO — o Design Engine só propagou `--sarak-accent-color`, e a validação do dono no browser expôs 3 falhas (abas quebrando, topbar/sidebar ausente, fontes não mudando) + 1 requisito de produto: o consumidor precisa alcançar TODAS as funcionalidades da lib (composição granular de layout, multi-dispositivo, engines). Corrija nas 2 pontas (LIB e ERP) e feche o R5 amplo + o R10 da Spec 40.

PRINCÍPIO INEGOCIÁVEL (Spec 40.1 §1.1): isto é um teste DA BIBLIOTECA. ZERO gambiarra no importador — nenhum problema do módulo-UI pode ser contornado no ERP; corrige-se NA LIB. O consumidor só faz AÇÕES NORMAIS: instalar, envolver no `SarakUIProvider`, escolher tema, (opcional) usar o cromo, servir o próprio app. Se você se pegar escrevendo CSS, fiando token à mão, ou montando andaime no ERP para a lib funcionar → PARE: é defeito da lib, conserte no lado LIB. A lib tem que funcionar plug-and-play em QUALQUER módulo que a importe.

ORDEM DE EXECUÇÃO (Spec 40.1 §3.0 — CRÍTICA): (1) E1 PRIMEIRO — trocar `.tgz`→`file:` no ERP, senão cada fix da lib exige re-pack; (2) E2 — reconfirmar o gateway `plan-20.2` verde (já commitada, `7c2a723`); (3) LIB L1–L6, rebuildando o `dist` a cada entrega para o ERP herdar via `file:`; (4) ERP E3/E4 (dependem de L6/L2); (5) validação ampla do R5 sob o gateway.

ESTADO REAL DOS REPOS (auditado 2026-07-24, ponto de partida): LIB `main`, HEAD `7eaf77d` (SarakLink commitado); working tree da LIB SUJO/não commitado — `src/index.ts` (os 6 inputs exportados na v5) + `dist/*` (rebuild) + as specs; a suíte completa pós-6-inputs ainda não foi reconfirmada verde (rode `npx vitest run` cedo). ERP `main`, HEAD `7c2a723` (gateway plan-20.2 commitado, tela branca resolvida), working tree limpo; `packages/ui-kit` existe consumindo o Sarak por `.tgz` (por isso o E1). (`RELATORIO-TESTE-REAL.md` da v5 ficou em `specs/plan/` da LIB, não na raiz do ERP.) NÃO commite sem autorização; trate o working tree sujo como a baseline.

Preparação: (1) acione `ui-contexto-repositorio`; (2) leia `00-indice.md`, `00-progresso.md`, a Spec 40 INTEIRA (esp. §1.3 estado real + §8 o ciclo) e a Spec 40.1 INTEIRA (o §1.1 princípio, o §3.0 ordem, o diagnóstico da §2 e as tarefas L1–L6 / E1–E4); (3) confirme os sintomas no código real antes de corrigir (não tome como dado). Skills: `sarak:padrao-typescript`, `ui-refatorar-componente`.

LADO DA LIB (Sarak-Lib-UI-Core), tarefas L1–L6:
- L1 (coração): PARIDADE DE BARRIL PÚBLICO. Crie um gate automatizado (script/teste, análogo ao `RegistryParity`) que falhe se qualquer componente consumidor-facing (átomos, Templates, Layouts, Navigation, Inputs, DataDisplay, Media, Modals, Feedback, UX, engines, Provider/Design API, multi-dispositivo) NÃO estiver exportado em `src/index.ts` (componente + tipo `Props`). Exporte tudo que faltar. Exclusões deliberadas (primitivas internas do #2; `SarakCoreCard` até a Spec 42; `SarakTabs` duplicado) numa ALLOWLIST com motivo — nunca silenciosas.
- L2: CROMO APRESENTACIONAL temável (topbar/sidebar) SEM Shell-host. Investigue se `SarakShell` roda em modo apresentacional (cromo + children, sem registro/discovery); se não, exponha um `SarakAppChrome` leve que consome os tokens de navegação (Spec 18). Presentacional e isolado — cada app o renderiza sozinho. Exporte (entra no gate L1). DECISÃO DE ARQUITETURA: se ambíguo, PARE e reporte as opções (HITL), não escolha sozinho.
- L3: MULTI-DISPOSITIVO público e documentado (`DeviceProvider`/`useDevice`, `SarakHidden`, `ResponsiveValue`, tokens responsivos) + exemplo mínimo no catálogo/skill.
- L4: BUG do Design Engine — investigue e corrija por que o card do `PresetsCatalog` não persiste (só `TemplatesTab` aplica) e por que não repinta ao vivo sem reload (`applyFullConfig`). Meta: aplicar tema reflete IMEDIATAMENTE e persiste por qualquer caminho da UI.
- L5 (era gambiarra do ERP, agora é da LIB): a FONTE aplica SOZINHA. O `SarakUIProvider` (Modo App) deve aplicar a família de fonte do tema ao SEU ESCOPO por padrão — texto sob o Provider herda `var(--font-main)`/títulos `var(--font-heading)` SEM o consumidor escrever CSS. Investigue por que hoje não aplica (o token emite a var, mas nada liga o escopo a ela). Modo Embarcado: escopado, nunca `body` do host.
- L6: TEMAS COMPLETOS vindos da LIB. A lib fornece ≥1 par de temas de referência COMPLETOS (cor+fonte+cromo+raio+espaçamento) que o consumidor customiza; o `CustomizationPanel` "Exportar JSON" exporta o conjunto COMPLETO de tokens; schema de tema documentado; opcional: `validateDesign` avisa quando um tema omite eixos.
- Gates da lib a cada fatia: `catalog:check`, `npm run build` (DTS), suíte COMPLETA `npx vitest run`, `package:check`, `run_audit.mjs` no baseline (sem regressão; valor visual só como token). O novo gate L1 entra no conjunto.

LADO DO ERP (`...\Code\Earendel\ERP`) — SÓ AÇÕES NORMAIS DE CONSUMIDOR, tarefas E1–E4 (nesta ordem):
- E1 (PRIMEIRO): DISTRIBUIÇÃO — em `packages/ui-kit/package.json`, trocar `@sarak/lib-ui-core` de `file:./vendor/sarak-lib-ui-core-3.0.0.tgz` para `file:../../Sarak-Lib-UI-Core` (ajuste o caminho relativo real). Depois: rebuild da lib + limpar `.vite` dos apps + reinstalar o workspace uma vez. Sem isso, cada fix de L1–L6 exige `npm pack`+reinstalar. NÃO migre para `github:` nesta rodada.
- E2: CONFIRMAR o gateway — a `plan-20.2` já está commitada (`7c2a723`) e a tela branca foi resolvida. Reconfirme antes de validar tema: abrir só `:3000`, navegar conector → `/propostas` → `/projetos` sem `ERR_CONNECTION_REFUSED` nem tela branca; HMR de pé. Se algo do gateway falhar → é da `plan-20.2` (ERP), não desta 40.1. A lib só DOCUMENTA o requisito de mesma-origem.
- E3: USAR os temas COMPLETOS que a lib fornece (L6) — `ERP_THEMES` parte deles, só ajusta valores; NÃO adivinhe tokens.
- E4: envolver cada app no `SarakUIProvider` (+ opcional o cromo de L2). A fonte aplica sozinha (L5) — o ERP NÃO escreve `body{font-family}` nem CSS de token. Se faltar algo além disso, é defeito da lib → conserte na lib.

CHECK DE ZERO-GAMBIARRA: ao final, grep no ERP confirmando que nenhum `web`/`ui-kit` fia CSS de token à mão (`font-family: var(--font`, tokens de cromo, etc.) para a lib funcionar — tudo tem que vir da lib.

FRONTEIRAS (não fazer): não reescrever o conector p/ host/mono-SPA; não exportar `SarakCoreCard` avulso (Spec 42); não fazer deploy; não resolver o piso de bundle do `export *` (Spec 41).

VALIDAÇÃO AMPLA (substitui a prova rasa da v5): sob origem única, trocar tema no `/design` tem que repintar COR **E FONTE E CROMO topbar/sidebar E RAIO** em Propostas + conector, e persistir no reload; abas navegam sem `ERR_CONNECTION_REFUSED`; toda funcionalidade da lib alcançável (gate L1 verde).

Entregue: relatório na conversa por tarefa (L1–L6, E1–E4) com evidência (gates da lib verdes com números; grep do zero-gambiarra; prova do R5 amplo sob o gateway, com screenshot); ATUALIZE a Spec 40 (§1.3 + matriz R5/R10) com o novo estado real; atualize o `00-progresso.md`. NÃO commite sem autorização. Ao fim, deixe claro o que o dono deve VALIDAR na prática (browser) e o que, se ainda falhar, vira a Spec 40.2.
```

---

## P21.2 — Spec 40.2: Correções de Importação (rodada 2) — cromo em todos os apps + ícones + responsividade

```
Execute a spec `specs/plan/40.2-correcoes-importacao-r2.md` da Sarak-Lib-UI-Core. É a RODADA 2 do ciclo 40.x: a rodada 1 (40.1) fechou o EXPOR/FORNECER (barril completo, `SarakAppChrome`, fonte automática, temas completos, Design Engine corrigido — gates verdes), mas a validação prática do dono no browser achou 3 gaps estruturais. Corrija-os mantendo os princípios da 40.1.

PRINCÍPIOS (Spec 40.2 §1.1): (a) ZERO gambiarra — defeito do módulo-UI corrige-se NA LIB; o consumidor só faz ações normais. (b) A lib é um RENDERIZADOR GENÉRICO — tem que renderizar um sistema monolito, monolito modular OU microsserviço; portanto o cromo e os componentes NÃO pressupõem host único. COMPOSIÇÃO já decidida pelo dono (§1.2): Opção 1 — cada app renderiza o MESMO `SarakAppChrome` (cromo por-app; reload entre abas é aceito; NÃO adotar host/mono-SPA).

Preparação: (1) acione `ui-contexto-repositorio`; (2) leia `00-indice.md`, `00-progresso.md`, a Spec 40 (§1.3 + §8) e a Spec 40.2 INTEIRA (o §2 diagnóstico e as tarefas L1–L3 / E1–E3); (3) confirme no código real antes de corrigir. ESTADO: o ERP já consome a lib por `file:` (40.1 E1); `SarakAppChrome` já existe em `src/components/Layout/SarakAppChrome.tsx` (só o conector o usa hoje). Skills: `sarak:padrao-typescript`, `ui-refatorar-componente`.

LADO DA LIB (tarefas L1–L3):
- L1: `SarakAppChrome` com NAVEGAÇÃO ESTRUTURADA + ícones first-class. Adicione uma prop `navItems: {id,label,icon?,href,active?}[]` que renderiza ÍCONE (via `SarakIcon`/`IconMap` curado) + label, temável por token, com estado ativo acessível (`aria-current`, foco por teclado); mantenha `children` para nav custom. Entra no gate de barril.
- L2: COMPONENTES DENSOS RESPONSIVOS por padrão, começando pelo `SarakDataTable`/`SarakDataTableImpl` (confirmado: HOJE não tem lógica responsiva nenhuma — zero breakpoint/overflow/stack/`useSarakDevice`). No mobile (via `useSarakDevice`/breakpoint da Spec 16): barra mínima = sem sobreposição nem overflow horizontal da PÁGINA (scroll contido no container); alvo recomendado = colapsar para linhas/cards empilhados. Tem que ficar legível/utilizável no celular. Documente o princípio "denso é mobile-usável por padrão" e registre o mesmo risco nos vizinhos (`SarakTable`/`SarakManagementGrid`/`SarakDataGrid`) — corrija os que o ERP usa, registre os demais.
- L3: teste provando que TODOS os tokens de topbar/sidebar (não só `--sarak-topbar-bg`) repintam o `SarakAppChrome` (fecha o "cromo diferente do Design Engine").
- Gates a cada fatia: `catalog:check`, `barrel:check`, `npm run build` (DTS), suíte COMPLETA `npx vitest run`, `package:check`, `run_audit.mjs` no baseline.

LADO DO ERP (`...\Code\Earendel\ERP`) — SÓ AÇÕES NORMAIS DE CONSUMIDOR (E1–E3):
- E1: envolver TODOS os módulos (`Propostas/web`, `Projetos/web`, `Contratos/web` + o conector) no MESMO `SarakAppChrome`, com a MESMA nav → o cromo não some ao trocar de aba. A definição de nav (itens+ícones+rotas) vive como CÓDIGO COMPARTILHADO em `@erp/ui-kit` (igual ao catálogo de temas), importada por cada app — código compartilhado, não import lateral (isolamento intacto).
- E2: passar os ÍCONES nos `navItems` (suporte de L1), iguais em todos os apps.
- E3: (liberdade) reescrever a listagem de Propostas de tabela para CARDS (`SarakCardGrid`+`SarakCoreCard`/`SarakBadge`/`SarakLink`), editando só `Modulos/Propostas/web/src/pages/Lista.tsx`, hook de dados intocado.

FRONTEIRAS: não adotar host/mono-SPA; não reescrever a mecânica do conector; não exportar `SarakCoreCard` avulso (Spec 42); não mexer no piso de bundle (Spec 41); não boilar o oceano da responsividade (corrija os densos do ERP + registre o resto).

VALIDAÇÃO (o que o dono confere no browser): cromo presente e IDÊNTICO em todas as abas COM ícones; trocar tema repinta cromo (todos os tokens) + telas em todas as abas; mobile de Propostas/densas utilizável sem sobreposição; Propostas em cards.

ENTREGUE: relatório por tarefa (L1–L3, E1–E3) com evidência (gates verdes com números; grep zero-gambiarra; screenshots do cromo com ícones em ≥2 abas e do mobile ok); ATUALIZE a Spec 40 (§1.3 + matriz) e o `00-progresso.md`; deixe explícito o que o dono valida e o que, se falhar, vira a Spec 40.3. NÃO commite sem autorização.
```

---

## P21.3 — Spec 40.3: Multidispositivo por padrão — adaptação de layout abrangente (zero-config)

```
Execute a spec `specs/plan/40.3-multidispositivo-por-padrao.md` da Sarak-Lib-UI-Core. É a RODADA 3 do ciclo 40.x: a validação da 40.2 apontou o gap CENTRAL — a adaptação de layout multidispositivo (celular/tablet/desktop) ainda é PONTUAL (só `SarakDataTable`→cards). Torne-a ABRANGENTE e ZERO-CONFIG. ATENÇÃO: o menu hambúrguer é apenas UM exemplo do cromo não-adaptado, NÃO o pedido — o pedido é "layout multidispositivo por padrão".

PRINCÍPIOS: zero-gambiarra (o consumidor NÃO escreve CSS/media query; se precisar, é defeito da lib); renderizador GENÉRICO (adapta em qualquer deploy; cromo por-app); zero-config COM controle opcional (defaults mobile-first sensatos + aceitar `ResponsiveValue<T>`, nunca EXIGIR o consumidor passar valores).

ESCOPO DELIMITADO (não boilar o oceano — §1.2): DENTRO = cromo + primitivas de layout + densos que o ERP usa + contrato documentado. FORA = reescrever a responsividade de TODOS os componentes; o que o ERP não usa fica REGISTRADO, não corrigido.

Preparação: (1) `ui-contexto-repositorio`; (2) leia `00-indice.md`, `00-progresso.md`, a Spec 40 (§1.3+§8) e a Spec 40.3 INTEIRA (esp. §1.2 escopo e §2 estado atual confirmado); (3) confirme no código antes de mexer. ESTADO: `SarakAppChrome` existe mas NÃO reflui no mobile (sidebar fixa 240px, topbar só rola); a lib TEM as primitivas (Spec 16: `useSarakDevice`/`SarakHidden`/`ResponsiveValue`/breakpoints) mas cromo/componentes não as consomem por padrão.

LADO DA LIB (L1–L4):
- L1 (central): `SarakAppChrome` responsivo por padrão (zero-config) via `useSarakDevice`/breakpoints — desktop: sidebar/topbar atual; tablet: tier intermediário; CELULAR: a nav COLAPSA (não come a tela), acessível. Padrão recomendado = nav atrás de um toggle (drawer/hambúrguer) ou bottom-nav — DECISÃO DE DESIGN: resolva pela árvore de decisão da lib; se ambíguo, PARE e reporte (HITL). O importante é a nav ficar acessível e não comer a tela, não um widget específico. Acessível (`aria-expanded`, foco), temável, presentacional/por-app.
- L2: primitivas `SarakGrid`/`SarakFlex`/`SarakSplitPane` (+ grids de Template usados pelo ERP) com DEFAULT mobile-first (grid→1 col no celular; splitpane→empilha; flex→wrap) + aceitar `ResponsiveValue`. Nenhum `grid-template-columns` fixo que estoure.
- L3: aplicar o tratamento mobile do `SarakDataTable` aos densos que o ERP EFETIVAMENTE usa (checar: provável `SarakTable`); os não-usados ficam registrados.
- L4: documentar o CONTRATO de responsividade (o que adapta automático por dispositivo, onde refinar com `ResponsiveValue`).
- Gates a cada fatia: `catalog:check`, `barrel:check`, `npm run build` (DTS), suíte COMPLETA `npx vitest run` (incl. testes por viewport), `package:check`, `run_audit.mjs` no baseline.

LADO DO ERP (herança mínima): o ERP NÃO escreve CSS de layout — herda via `ErpChrome`/componentes. No máximo passa `ResponsiveValue` onde quiser um layout específico (opcional). Verifique as telas utilizáveis em celular/tablet/desktop SEM CSS próprio.

FRONTEIRAS: não reescrever a responsividade de todos os componentes; não host/mono-SPA; não reescrever o conector; não exportar `SarakCoreCard` (Spec 42); não mexer no bundle (Spec 41).

VALIDAÇÃO (dono, browser + viewports): cromo reflui em celular/tablet/desktop (nav acessível no celular sem comer a tela); telas legíveis/utilizáveis sem overflow horizontal; tema continua repintando.

ENTREGUE: relatório por tarefa (L1–L4) com evidência (gates verdes com números; grep zero-gambiarra incl. `@media`/`grid-template-columns` fiado à mão = vazio; screenshots dos 3 viewports); ATUALIZE a Spec 40 (§1.3 + matriz) e o `00-progresso.md`; deixe explícito o que o dono valida e o que, se falhar, vira a Spec 40.4. NÃO commite sem autorização.
```

---

## P22 — Spec 46: Remover o renderizador de páginas (#2) — ⚠️ SÓ depois do Teste Real

```
Execute a spec `specs/plan/46-remover-motor-de-manifesto.md` da Sarak-Lib-UI-Core. Remove APENAS o #2 — o renderizador de PÁGINAS por manifesto (`src/core/Manifest/`, que falhou e ninguém usa). MANTÉM o #1 (`src/core/Shell/` + `src/core/Discovery/` — o modelo de módulos oficial) e o #3.

PRÉ-CONDIÇÃO INEGOCIÁVEL: o Teste Real (Spec 40) precisa estar CONCLUÍDO E VERDE — o modelo de módulos provado no ERP. Não se remove antes. Se o teste revelou que a camada declarativa é necessária, PARE e reavalie. Confirme também: persistência de tema já migrada para o Provider (Spec 44); API/skills/starter no lugar (43/45).

Preparação: (1) acione `ui-contexto-repositorio`; (2) leia `00-indice.md`, `00-progresso.md` e a spec 46 INTEIRA (a tabela das 3 arquiteturas — o que sai e o que FICA); (3) confirme por grep o escopo real. Skills: `sarak:padrao-typescript`, `ui-refatorar-componente`, `sarak:code-limpeza-projeto`.

Entregue (seções 3/5), em FATIAS com gate verde a cada uma: parar de exportar o renderer/tipos do #2 → remover templates/skills/catálogo do #2 → remover `src/core/Manifest/` → remover gates do #2 (`RegistryParity` etc.; a paridade de tokens de DESIGN fica) → limpar deps que só o #2 usava. Grep-zero de `SarakManifestRenderer`/manifesto-de-página. CONFIRMAR que `SarakShell`/`registerSarakModule`/`registerLocalComponent`/Design Engine/componentes seguem intactos e exportados; MyService intacto. MEDIR o bundle antes/depois (a saída do Registry ansioso muda a base da Spec 41). Nota de descontinuação no progresso.

Ao terminar: `npm run build` verde; suíte restante verde; `npm pack` menor; números de bundle no progresso; frontmatter + checkbox (item 22). NÃO commite sem autorização.
```

---

## P23 — Spec 41: Piso de Bundle / barris de ícone (depois da 46, antes da 42)

```
Execute a spec `specs/plan/41-piso-de-bundle-barris-de-icone.md` da Sarak-Lib-UI-Core.

Preparação, nesta ordem: (1) acione `ui-contexto-repositorio`; (2) leia `00-indice.md`, `00-progresso.md` (incl. os números de bundle que a Spec 46 registrou — a linha de base MUDOU com a saída do Registry ansioso do #2) e a spec 41 INTEIRA; (3) leia a `specs/plan/42-generalizar-cardgrid-corecard.md` (vem depois, toca 2 dos mesmos arquivos — não invada). Skills: `sarak:otimizacao-nivel-1` (medir antes/depois — o coração) e `sarak:padrao-typescript`.

Contexto: 6 arquivos fazem `import * as LucideIcons from 'lucide-react'` com acesso por índice DINÂMICO (`LucideIcons[nome]`), impedindo tree-shaking (~1500 ícones). Os 5 cards burlam o átomo `SarakIcon`/`IconMap` curado. `lucide-react` é peerDep+external (incha o bundle do consumidor); `@phosphor-icons/react`/`@tabler/icons-react` são deps não-external (podem estar inteiras no `dist/` — verificar). Com o #2 REMOVIDO (Spec 46), re-meça: a base é outra.

REGRA DURA: meça ANTES de refatorar; se o ganho for irrelevante, feche com a conclusão negativa documentada. Entregue os itens 2.1-2.4 (medição; zero `import * as *Icons` dinâmico; `IconMap` estendido + warn em nome desconhecido; nomes de ícone no catálogo). Ao terminar: gates verdes; `run_audit.mjs` sem regressão; suítes de Cards/Templates/Icon verdes (snapshots dos 5 cards mudam — revise); checkbox (item 23) + progresso com os NÚMEROS.
```

---

## P24 — Spec 42: Generalizar SarakCoreCard / SarakCardGrid (depois da 41)

```
Execute a spec `specs/plan/42-generalizar-cardgrid-corecard.md` da Sarak-Lib-UI-Core.

Preparação, nesta ordem: (1) acione `ui-contexto-repositorio`; (2) leia `00-indice.md` e `00-progresso.md`; (3) leia a spec 42 inteira e a relacionada `specs/plan/30-fechamento-achados-pos-selo.md` (precedente — mesma solução no `SarakActionCard`). Skills: `sarak:padrao-typescript`, `ui-refatorar-componente` (o tipo público `SarakCardGridProps.mapping` perde campos — quebra de contrato).

Contexto: `SarakCoreCard` (variante `"classic"`, DEFAULT de `SarakCardGrid`) tem o mesmo domínio LLM que o `SarakActionCard` tinha (painel "Custo In/Out (1M)", "Janela de Contexto" com aritmética, "Tokenizer", subtitle default 'Modelo'); `SarakCardGridProps.mapping` declara `price_in?`/`price_out?`/`context?` no TIPO (breaking change ao remover).

Ordem obrigatória: (1) `SarakCoreCard.test.tsx` de caracterização (snapshot) ANTES de tocar; (2) generalizar o painel para `mapping.details` (pares `{label,value}` pré-formatados, sem aritmética de domínio); (3) remover `price_in`/`price_out`/`context` do tipo; (4) nota de migração + remover a nota temporária que a Spec 30 deixou no catálogo/skill. Pré-req: Spec 41 (P23) rodou antes — arquivos em comum; se não, preserve a troca de ícone dela (use `SarakIcon`, nunca barril dinâmico). Ao terminar: gates verdes; `run_audit.mjs` sem regressão; suíte de Templates verde; checkbox (item 24) + progresso.
```
