---
tipo: "relatorio"
titulo: "Relatório de Achados — Selo da Onda (Spec 26, execução 2026-07-20)"
dominio: "Qualidade da instalação / Erros encontrados no teste real de plug-and-play"
status: "🔴 Achados abertos (nenhuma correção iniciada)"
prioridade: "Alta"
tags: ["relatorio", "bugs", "selo-da-onda", "instalacao"]
relacionados: ["26-instalacao-teste", "25-limpeza-testes-praticos"]
---

# Origem

Teste de instalação real (`Spec 26`, prompt **P10**) executado por agente externo sem contexto da lib, instalando `@sarak/lib-ui-core` do zero em `Earendel/ERP` só pelo caminho oficial. Relatório bruto do executor: `Earendel/ERP/RELATORIO-INSTALACAO-UI.md`. Este documento é a **extração só dos erros**, organizada para virar specs de correção depois — nenhuma correção foi aplicada ainda (regra "não corrigir no calor" da spec 26).

Resultado do teste: **Selo da Onda NÃO concedido** (nota 6,5/10; matriz M1-M10 = PARCIAL·FAIL·PASS·PASS·PASS·FAIL·PASS·PASS·PARCIAL·PASS).

**Atualização pós-relatório (2026-07-20, revisão do usuário):** ao revisar o app rodando, o usuário apontou uma faixa de navegação visualmente quebrada no topo da tela, não capturada como achado autônomo pelo executor do P10 (que classificou o fluxo de tema como M7 PASS-com-fricção). Investigação direta no código-fonte (permitida para mim, vedada ao executor do teste) confirmou uma causa raiz nova e mais grave — ver achado **0** abaixo, agora o mais crítico do documento. Isso reclassifica **M7 de PASS para FAIL** (ver nota na tabela de matriz em `00-progresso.md`, a atualizar).

---

# Erros (ordenados por severidade)

## 0. [CRÍTICO — achado pós-relatório] `navigationStyle: "topbar"` quebra o layout do Shell novo (regressão vs. o Shell legado)
- **Onde:** `src/core/Manifest/nodes/ShellRouterNode.tsx:154-172` (região `shell.sidebar`) vs. `src/components/atomic/Navigation/SarakShellNav.tsx:114-119` (`useNavigationStyle`/orientação).
- **Sintoma:** ao ativar um tema com `navigationStyle: "topbar"` no Design Engine (`/design`, aba Layout — campo real, não é preciso editar banco à mão), a barra de navegação lateral fica visualmente quebrada: uma faixa horizontal estreita e cortada aparece no lugar da sidebar, mostrando só 1-2 itens de navegação em vez da lista completa. Print do usuário confirma o sintoma ao vivo no navegador.
- **Causa raiz confirmada:** `SarakShellNav` muda corretamente seu próprio layout interno para `flexDirection: row` quando `navigationStyle === "topbar"` (linha 116-119 do componente) — mas `ShellRouterNode` (quem monta o chrome do shell a partir do manifesto) **sempre** envolve a região `shell.sidebar` num `<aside>` de largura FIXA (`--sarak-sidebar-width`, 240px por padrão, min 200/max 450), **independentemente** de `navigationStyle`. O resultado é um menu horizontal inteiro espremido dentro de uma coluna de 240px pensada para menu vertical.
- **Por que isto é uma REGRESSÃO, não só um bug novo:** o Shell LEGADO da própria lib (`src/core/Shell/SarakShell.tsx:78-192`) já resolve isso corretamente — `isSidebar`/`isTopbar`/`isDock`/`isGlass` são ramos **mutuamente exclusivos**: quando `isTopbar`, a região de sidebar **nem é renderizada**; em vez disso monta um `<TopbarNav>` dedicado, de largura cheia. O `ShellRouterNode` novo (Spec 18/33, o motor declarativo que a Spec 21/22 escala e que a Spec 26 testou) nunca replicou essa exclusividade mútua — só herdou a adaptação de orientação do item de nav (Spec 18), não a realocação de região.
- **Por que isto importa MUITO além do teste isolado:** `Sarak-MyService` (apontado pelo usuário como referência mínima de funcionalidade, `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Biblioteca\Sarak-MyService`) declara `"navigationStyle": "topbar"` como sua **configuração de produção real** (`src/sarak.manifest.json:11`) — não é um valor exótico do teste, é literalmente como o app de referência da própria Sarak está configurado hoje. Isso só não quebra no MyService porque ele ainda roda sobre o Shell LEGADO, não sobre o `SarakManifestRenderer`/`ShellRouterNode`. **Se o MyService for migrado para o motor novo (o objetivo declarado da onda "Renderizador Genérico"), a navegação dele quebra exatamente como no ERP.**
- **M afetada:** M7 — reclassificar de PASS para **FAIL**. O achado #5 abaixo (fluxo "salvar como novo tema" não documentado) é um problema DIFERENTE e independente, também dentro do Design Engine, mas não é a mesma causa raiz.

## 1. [CRÍTICO] Validação de formulário não bloqueia submit — dado inválido persistido silenciosamente
- **Onde:** motor/Dispatcher, diretiva `validation` (`{"type": "required", "message": "..."}`) num `SarakInput` dentro de um `SarakForm` com `actions: [{ type: "api_call", payload: { submit: true, ... } }]`.
- **Sintoma:** clicar em submit com os 3 campos obrigatórios vazios **não bloqueia o envio**. O `api_call` dispara normalmente, o backend recebe e persiste o registro vazio, e o toast de **sucesso** aparece. Confirmado via `curl` no endpoint real: dois registros `{"cliente_apelido":"","cliente_contato":"","valor_maximo":0,"status_proposta":"em análise"}` foram criados a partir de dois testes de submit vazio.
- **Contradiz:** a skill `ui-integra-escrever-manifesto` documenta explicitamente que "a validação BARRA o envio se houver erro" (item 7) e que "erros aparecem após touch/submit" (item 6).
- **Agravante:** zero warning no console — o mesmo motor que avisa lindamente para token de espaçamento inválido ou `actions` como objeto fica mudo aqui.
- **Causa possível a investigar:** shape de `validation` pode não estar documentado/implementado como a skill descreve, ou o Dispatcher não está checando o resultado da validação antes de disparar `api_call`.
- **M afetada:** M6 (FAIL), M9 (PARCIAL — nenhuma fonte mostra o schema exato de `validation`, é a única diretiva reservada sem exemplo).

## 2. [ALTO] `npm install github:...` sem `package.json` local instala silenciosamente no diretório errado
- **Onde:** primeiro comando do caminho oficial de instalação (`npm install github:Lib-Sarak/Sarak-Lib-UI-Core`), antes de qualquer skill/init entrar em cena.
- **Sintoma:** rodado num diretório do consumidor SEM `package.json` (o caso real de "projeto sem frontend ainda"), o npm sobe a árvore de diretórios até achar o `package.json` mais próximo — no teste, achou `C:\Users\Igor\package.json` (projeto não relacionado do usuário) — e instalou lá: criou `node_modules` com 289 pacotes e injetou `@sarak/lib-ui-core` nas dependencies daquele arquivo alheio. Nenhum erro, nenhum aviso do npm ou da lib.
- **Impacto:** poluição silenciosa de um projeto não relacionado; só descoberto por verificação manual de que `ERP/node_modules` e `ERP/package.json` não existiam após um "added 289 packages" de sucesso.
- **M afetada:** M2 (FAIL).

## 3. [MÉDIO] `init --help` não existe; entrevista interativa falha silenciosa sem TTY
- **Onde:** `npx @sarak/lib-ui-core init` (`bin/sarak-ui.mjs`).
- **Sintoma:** `init --help` não é reconhecido como flag — cai direto na entrevista interativa ("Modo (app | embedded) [app]: "). Em ambiente sem TTY real (pipe de texto, CI, agente), o processo consome a entrada e termina com **exit code 0, sem escrever nenhum arquivo e sem mensagem de erro** — parece ter funcionado, mas não fez nada.
- **Como as flags reais foram descobertas:** por acidente, rodando `npx @sarak/lib-ui-core --help` (sem `init`), que revelou uma mensagem de uso residual: `Uso: npx @sarak/lib-ui-core init [--stack ...] [--storage ...] [--mode ...] [--force] [--yes]`.
- **Impacto:** bloqueia qualquer fluxo não-interativo (scripts, CI, agentes) até descobrir as flags por tentativa e erro; nenhuma skill ou documentação do pacote menciona `--yes`/`--stack`/`--storage`/`--mode`/`--force`.
- **M afetada:** M1 (PARCIAL).

## 4. [MÉDIO] Empacotamento do pacote publicado inclui o repositório-fonte inteiro
- **Onde:** `package.json` da lib (ausência de campo `files` / `.npmignore`).
- **Sintoma:** `npm install github:...` traz para dentro de `node_modules/@sarak/lib-ui-core` o repositório inteiro — `src/`, `specs/`, `playwright/`, `__snapshots__/`, `vitest.config.ts`, `Template-Ts/` — não só o `dist/`/`bin/`/`backend/`/`docs/manifest-catalog.*` que o consumidor precisa.
- **Impacto:** infla a instalação, expõe artefatos de desenvolvimento (testes, specs internas, playwright configs) para consumidores externos, e cria a tentação de "ler o código-fonte" bem debaixo do `node_modules` do próprio projeto.
- **M afetada:** M9 (contexto/observação).

## 5. [BAIXO] Fluxo "tema padrão read-only → salvar como novo tema" não documentado
- **Onde:** `CustomizationPanel` (`/design`), ao personalizar um tema padrão da biblioteca.
- **Sintoma:** mudar a cor da topbar e clicar "Aplicar Alterações Globais" não muda nada visualmente — só abre um modal "Persistência de Tema" ("Você está modificando um tema padrão (Read-Only)... salvar como Novo Tema") não anunciado em nenhuma skill/catálogo. Só descoberto explorando a UI às cegas. Depois de completar o fluxo, funciona e persiste corretamente (M7/M8 = PASS).
- **M afetada:** M7 (PASS com fricção não documentada).

## 6. [BAIXO] `renderFor` avisa sobre chave ausente mesmo com chave natural presente
- **Onde:** motor de renderização de listas (`renderFor`).
- **Sintoma:** `[Sarak:renderFor] item sem id/uuid; usando índice N como key.` aparece em toda renderização de uma lista cujos itens usam `hash` como identificador natural (não `id`/`uuid`). O motor não reconhece outras convenções de chave.
- **M afetada:** M5 (observação, não bloqueou).

## 7. [BAIXO] Bundle final sem code-splitting para um app mínimo
- **Onde:** `npm run build` (Vite) do consumidor.
- **Sintoma:** chunk principal em 3,9 MB (992 KB gzip) para um app usando ~8 componentes (`SarakFlex`, `SarakTypography`, `SarakButton`, `SarakInput`, `SarakShellNav`, `SarakSkeleton`, `SarakDataEmpty`, `CustomizationPanel`). Vite avisa "Some chunks are larger than 500 kB after minification".
- **M afetada:** build (observação de performance, não bloqueou).

## 8. [COSMÉTICO] Warning nativo do Chrome dentro do próprio `CustomizationPanel`
- **Onde:** algum `input[type=color]` interno do painel.
- **Sintoma:** `The specified value "var(--sarak-text-main,#ffffff)" does not conform to the required format...` — parece receber um valor `var(...)` não resolvido em vez de um hex.
- **M afetada:** nenhuma diretamente (ruído no console durante M7/M8).

---

# Não é erro (registrado para não repetir investigação)
- `npm run dev` falhando por `'concurrently' não reconhecido` logo após o `init`: causa raiz foi o executor não ter rodado `npm install` antes — o próprio `init` já imprime a instrução correta ("Rode `npm install && npm run dev`"). Risco de UX (o `init` poderia falhar mais alto ou rodar o install sozinho), mas não é um bug confirmado — registrado só como nota de fricção menor.
- **`package.json` do ERP com histórico de commit "estranho":** o achado 2 (`npm install github:...` instala no diretório errado) é real e ocorreu exatamente como descrito — na hora do teste, `Earendel/ERP` não tinha `package.json`. O que causa confusão ao olhar o `git log` DEPOIS é uma coincidência de timing: no mesmo intervalo (2026-07-20, 00:10-00:35), uma sequência de commits de NEGÓCIO totalmente à parte (feature "proposta xtreme" — canvas neural, overflow mobile) foi feita na raiz do mesmo repositório. Quem fez esses commits usou um `git add` amplo que varreu junto o `package.json`/`package-lock.json` recém-criados pelo teste, por isso eles aparecem sob mensagens como "ajusta overflow mobile e opacidade do canvas neural nas propostas". **Não é um bug da lib** — é higiene de commit (duas frentes de trabalho paralelas resultando em commits misturados). Vale como lição de processo, não como achado técnico contra a biblioteca.

---

# Granularidade de manifesto/telas — confirmação

O `app.manifest.json` gerado pelo teste (`Earendel/ERP/src/manifests/app.manifest.json`) foi inspecionado diretamente: shell com `topbar`+`sidebar`+`routes`, 5 rotas reais, cada uma composta por containers `SarakFlex` aninhados (`direction`/`gap`/`justify`/`align`), tipografia por variante, `SarakInput` com `model`+`validation` por campo, listas via `source`+`states`+`renderFor` com interpolação de template e pipe `currency`. **Confirma que a composição granular funciona de fato** — o autor monta a tela bloco a bloco em JSON (containers aninhados, formulário campo a campo, lista de itens template-driven), não apenas encaixa templates de página inteiros.

**Limite não testado (não é um FAIL, é uma lacuna de cobertura do teste):** este manifesto só exercitou empilhamento flex (`row`/`column`). Nenhuma tela usou grid, `SarakCard`, dashboards ou composições mais densas (`SarakDataTable`, `Kanban`, etc. — ver memórias "Onda 9/10" desta lib). Não há evidência de que a granularidade "aguenta tudo" que o catálogo de componentes oferece — só que o subconjunto flex+form+lista funciona bem. Uma próxima rodada de teste deveria forçar pelo menos 1 tela com grid/cards para fechar essa lacuna de cobertura.

---

# Comparação com o Sarak-MyService (referência mínima de funcionalidade)

Por pedido do usuário, analisei `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Biblioteca\Sarak-MyService` — um consumidor real de produção da mesma lib (`"@sarak/lib-ui-core": "file:../Sarak-Lib-UI-Core"`) — para servir de baseline.

**Achado estrutural importante: o MyService NÃO usa o motor testado pela Spec 26.** Ele importa `SarakShell` (`src/core/Shell/SarakShell.tsx`) — o Shell **LEGADO**, baseado em registro de módulos (`registerSarakModule`/`registerLocalComponent`, `src/core/Discovery/registry.ts`) e no próprio manifesto `src/sarak.manifest.json` (schema diferente: `system`+`navigationStyle`+`modules[]`, sem `routes`/`shell.topbar`/`shell.sidebar` como o `SarakManifestRenderer` usa). Ou seja: **é uma arquitetura paralela e mais antiga**, que coexiste na lib mas não é o "Renderizador Genérico" (specs 16-24 + 21/22) que a Spec 26 testou.

Isso muda o que a comparação pode provar:
- **NÃO serve** como referência de schema/paridade 1:1 do manifesto JSON novo (são formatos diferentes, não comparáveis linha a linha).
- **SERVE, e muito bem**, como prova de que o **catálogo de componentes** da lib é capaz de sustentar um app de produção rico: o MyService compõe autenticação (`@sarak/lib-auth-identity`), orquestrador de LLM, chat de IA, tradutor, personalização — muito além do que o manifesto de teste do ERP exercitou (que ficou em flex+form+lista simples). Isso é evidência indireta de que a limitação de granularidade observada no ERP é do ESCOPO DO TESTE, não um teto real da lib.
- **SERVE, de forma direta e grave**, para provar a severidade do achado 0: o `sarak.manifest.json` do MyService declara `"navigationStyle": "topbar"` como configuração de PRODUÇÃO real (não um valor aleatório do teste) — e o Shell legado que ele usa trata isso corretamente (`isTopbar` como ramo exclusivo, sem sidebar residual). O Shell novo (`ShellRouterNode`) não tem esse tratamento. **Migrar o MyService do Shell legado para o motor declarativo novo quebraria a navegação dele hoje**, exatamente como no ERP — não é uma hipótese, é uma consequência direta do código lido nos dois lados.

**Conclusão da comparação:** o "piso mínimo de funcionalidade" do MyService mostra que a BIBLIOTECA (componentes) já suporta muito mais do que o teste da Spec 26 exercitou — mas também expõe que o motor declarativo NOVO (o que a onda "Renderizador Genérico" entrega e o que P10 testou) ainda não replica uma capacidade básica que o motor antigo já tinha: suporte real a `navigationStyle` fora de `sidebar`. Isso deveria entrar na lista de correção como item de PARIDADE (o novo motor precisa alcançar o legado nesse ponto), não só como bug isolado.

---

# Uso pretendido deste documento
Cada erro acima é candidato a virar uma spec de correção (ou uma edição direta de skill, para os itens 2, 3, 4 e 5, que são lacunas de instrução/empacotamento, não bugs de motor). A ordem de severidade acima é a ordem de prioridade sugerida — o achado 0 (regressão de `navigationStyle`) e o achado 1 (validação de formulário) são os dois mais graves e devem vir primeiro. Depois da correção, repetir o teste (nova rodada do P10, spec 26) antes de reavaliar o Selo da Onda.
