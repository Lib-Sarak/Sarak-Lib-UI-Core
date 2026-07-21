---
tipo: "relatorio"
titulo: "Relatório Consolidado de Instalação — Selo da Onda (rodadas 1 e 2)"
dominio: "Qualidade da instalação / Teste de aceitação em consumidor real"
status: "🟡 Rodada 2 concluída (9,3/10) — veredito do Selo pendente de decisão"
prioridade: "Alta"
tags: ["relatorio", "consolidado", "selo-da-onda", "instalacao", "erp"]
relacionados: ["26-instalacao-teste", "30-fechamento-achados-pos-selo", "40-teste-real", "41-piso-de-bundle-barris-de-icone", "42-generalizar-cardgrid-corecard"]
---

# Relatório Consolidado de Instalação — Selo da Onda

> **O que é este documento.** Unificação de TODOS os relatórios de instalação da onda "Renderizador Genérico". Substitui os arquivos separados `RELATORIO-INSTALACAO-UI-rodada1.md`, `RELATORIO-INSTALACAO-UI-rodada2.md` e `RELATORIO-SELO-ONDA-ACHADOS.md`, cujo conteúdo **integral** está preservado nos Anexos A, B e C — nada foi resumido nem descartado.
>
> A síntese (seções 1 a 4) é a leitura de trabalho; os anexos são a evidência bruta, como escrita pelos executores na época.

---

## 1. Linha do tempo

| Quando | O quê | Resultado |
|---|---|---|
| 2026-07-20 | **Rodada 1** (Spec 26, prompt P10) — agente externo instala do zero no `Earendel/ERP` | **Selo NEGADO** — 6,5/10 · 2 FAIL, 3 PARCIAL |
| 2026-07-20 | Triagem dos achados + descoberta do **achado 0** (`navigationStyle`) por inspeção de código | 3 specs de correção abertas (27, 28, 29) |
| 2026-07-20/21 | Execução das specs 27, 28, 29 + limpeza do ERP (Spec 31) | Gates verdes, revisados |
| 2026-07-21 | **Rodada 2 / Re-Selo** (2ª execução da Spec 26) | **9 PASS · 1 PARCIAL · 0 FAIL — 9,3/10** |
| 2026-07-21 | Spec 30 (fechamento dos achados residuais) | `src/` zerado do pacote, `SarakActionCard` generalizado, etc. |

**Estado atual:** o veredito formal do Selo (item 15 do roteiro) **segue em aberto** — é decisão do mantenedor.

---

## 2. Evolução da matriz M1–M10

| # | Medição | Rodada 1 | Rodada 2 | O que mudou entre as duas |
|---|---|---|---|---|
| M1 | `init` gera projeto completo em 1 comando | 🟡 PARCIAL | ✅ **PASS** | `--help` real + guard de TTY (Spec 29) |
| M2 | install+dev sem ajuste manual, sem poluir ancestral | 🔴 **FAIL** | ✅ **PASS** | skill manda garantir `package.json` (`npm init -y`) antes do install (Spec 29) |
| M3 | Telas do template corretas de primeira | ✅ PASS | ✅ PASS | — |
| M4 | Erro de autoria não derruba a tela e o warn ensina | ✅ PASS | ✅ PASS | — |
| M5 | Lista com `source`+`states` pelo exemplo da skill | ✅ PASS | ✅ PASS | warning de chave natural resolvido (Spec 30) |
| M6 | Formulário completo (validação barra submit) | 🔴 **FAIL** | ✅ **PASS** | gate de submit à prova de erro de autoria (Spec 28) |
| M7 | Personalização reflete ao vivo sem quebrar layout | 🟡 PASS c/ fricção → **reclassificado FAIL** | ✅ **PASS** | realocação de região por `navigationStyle` (Spec 27) + fluxo documentado (Spec 29) |
| M8 | Tema persiste após reload | ✅ PASS | ✅ PASS | — |
| M9 | Skills+catálogo bastaram; pacote sem o fonte | 🟡 PARCIAL | 🟡 PARCIAL | `files` allowlist (Spec 29) removeu `specs/`/`playwright/`; **`src/` só foi zerado DEPOIS, pela Spec 30** — ver nota abaixo |
| M10 | Zero contorno necessário | ✅ PASS | ✅ PASS | — |
| | **Nota final** | **6,5/10** | **9,3/10** | |

**Nota honesta sobre o M9:** na medição da rodada 2 ele ficou PARCIAL porque o pacote ainda continha uma pasta `src/` (com um único arquivo, `sarak-base.css`). A Spec 30 eliminou isso — o CSS foi para `dist/styles/` e o export foi reapontado; **verificado por `npm pack --dry-run` com zero `src/`**. Portanto a causa do PARCIAL não existe mais, **mas isso não foi re-medido num teste real** — só será confirmado na próxima rodada em consumidor.

---

## 3. Achados consolidados (todas as rodadas) e onde cada um foi parar

| # | Achado | Origem | Severidade | Tratado por | Estado |
|---|---|---|---|---|---|
| 0 | `navigationStyle: "topbar"` espreme a nav no `<aside>` de 240px (regressão vs. Shell legado) | R1 (pós-relatório, achado de código) | 🔴 Crítico | **Spec 27** | ✅ Fechado — M7 PASS na R2 |
| 1 | `validation` não barra o submit; registros vazios persistidos | R1 (M6 FAIL) | 🔴 Crítico | **Spec 28** | ✅ Fechado — M6 PASS na R2, confirmado por `curl` |
| 2 | `npm install github:` sem `package.json` instala em diretório ancestral | R1 (M2 FAIL) | 🟠 Alto | **Spec 29** (skill) | ✅ Fechado — M2 PASS na R2 |
| 3 | `init --help` inexistente; entrevista sem TTY falha em silêncio | R1 (M1 PARCIAL) | 🟠 Médio | **Spec 29** | ✅ Fechado — M1 PASS na R2 |
| 4 | Pacote publica o repositório-fonte inteiro | R1 (M9) | 🟠 Médio | **Spec 29** + **Spec 30** | ✅ Fechado — `npm pack` sem `src/` |
| 5 | Fluxo "tema padrão read-only → salvar novo tema" não documentado | R1 (M7 fricção) | 🟡 Baixo | **Spec 29** (skill) | ✅ Fechado — R2 confirma a doc |
| 6 | `renderFor` avisa por item quando a chave natural não é `id`/`uuid` | R1 (M5 obs) | 🟡 Baixo | **Spec 30** | ✅ Fechado — aceita `key`/`hash`/`slug`, warn 1x por lista |
| 7 | Bundle de app mínimo ~3,9 MB sem code-splitting | R1 + R2 | 🟡 Baixo | **Spec 30** (parcial) → **Spec 41** | 🟡 **Parcial** — ver §4 |
| 8 | Warning nativo de `input[type=color]` recebendo `var(...)` | R1 (cosmético) | ⚪ Cosmético | **Spec 30** | ✅ Fechado — bug real no `ColorControl` |
| 9 | Design Engine exige "Commit por categoria" antes de "Aplicar" (não documentado) | R2 (Problema 1) | 🟡 Baixo | **Spec 30 §2.6** | ✅ Fechado — fluxo documentado na skill |
| 10 | `SarakActionCard` não é genérico (card de LLM disfarçado) | R2 (Problema 4) | 🟠 Contrato | **Spec 30 §2.5** | ✅ Fechado — generalizado in-place + prova declarativa |
| 11 | `SarakCoreCard`/`SarakCardGrid` têm o MESMO defeito, em superfície maior | R2 (revisão da Spec 30) | 🟠 Contrato | **Spec 42** | 🔴 **Aberto** |
| 12 | Barris de ícone com acesso dinâmico impedem tree-shaking | R2 (revisão da Spec 30) | 🟠 Perf | **Spec 41** | 🔴 **Aberto** |

---

## 4. Pendências abertas

1. **Veredito do Selo (item 15 do roteiro).** Os bloqueadores acabaram (2 FAIL → 0). Resta 1 PARCIAL cuja causa já foi eliminada fora do teste (M9). Decisão do mantenedor: conceder com punch-list ou re-medir M9 antes.
2. **Spec 41 — Piso de Bundle.** O achado 7 não fechou: a Spec 30 mediu de verdade e o chunk **não caiu** (~2,44 MB antes e depois). A razão é estrutural e vale registrar: **num renderizador de manifesto, `manualChunks` não reduz bundle** — o Registry precisa de todo componente não-lazy em runtime, porque a ligação é por string e o manifesto é dado. A causa atacável identificada é outra (barris de ícone, achado 12).
3. **Spec 42 — `SarakCoreCard`/`SarakCardGrid`.** Mesmo domínio LLM do achado 10, mas em superfície maior e com tipo público já publicado no catálogo (quebra de contrato).
4. **Cobertura não exercitada.** Nenhuma das duas rodadas testou a lib contra funcionalidades **reais de negócio** com dados reais — é exatamente o objetivo da **Spec 40 (Teste Real)**.

### Padrão recorrente a observar
Três achados desta onda (0, 10 e 12) têm a mesma característica: **passaram por todos os gates automatizados**. O auditor de hardcode só detecta unidades (`px`/`rem`/`em`), não strings de UI nem despacho dinâmico; o de variáveis-fantasma só acusa consumo que *não resolve*, não token fora do pipeline dinâmico. Defeitos de **contrato** e de **domínio embutido** são invisíveis à automação atual e só apareceram com olho humano/agente na tela. Vale considerar ao desenhar novos gates.

---

## Anexo A — Relatório bruto da Rodada 1 (2026-07-20)

### Relatório de Instalação — Sarak-UI (@sarak/lib-ui-core) no ERP Iarendel

Teste de instalação "do zero", como um desenvolvedor externo com acesso apenas ao pacote publicado no
GitHub, ao ERP (que não tinha frontend algum) e às skills/catálogo que a própria lib instala. Nenhum
arquivo de `node_modules/@sarak/lib-ui-core` ou do repositório-fonte da lib foi lido para aprender a
usá-la — apenas skills, `docs/manifest-catalog.md`, mensagens de erro/warn e o comportamento observado em
runtime (curl + navegador real via Playwright).

---

#### 1. Ambiente e tempo total

- **SO:** Windows 11 Pro 10.0.26200
- **Node:** v24.10.0
- **npm:** 11.6.1
- **Diretório do consumidor:** `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP` (Python/Supabase, zero tooling de frontend antes deste teste)
- **Tempo total:** a sessão teve uma interrupção real no meio (erro de limite de API) entre a instalação da
  dependência e a execução do `init`, então o intervalo bruto de timestamps (~00:14 → ~11:18) não reflete
  trabalho contínuo. O trabalho efetivo — instalação, scaffolding, escrita do manifesto, validação via
  browser real e build — ficou na faixa de **2 a 3 horas** de execução ativa de comandos.

---

#### 2. Passo a passo executado (comandos reais, na ordem)

```bash
node --version && npm --version                       # v24.10.0 / 11.6.1
cd ".../Earendel/ERP"

npm install github:Lib-Sarak/Sarak-Lib-UI-Core         # PROBLEMA 1 — ver seção 4 (instalou no HOME, não no ERP)
### --- diagnóstico e correção manual do PROBLEMA 1 ---
cd "C:\Users\Igor" && rm -rf node_modules package-lock.json   # reverte a poluição
### editei C:\Users\Igor\package.json de volta ao estado original (removi a entrada @sarak injetada)

cd ".../Earendel/ERP"
npm init -y                                            # cria o package.json que faltava no consumidor
npm install github:Lib-Sarak/Sarak-Lib-UI-Core         # agora instala corretamente no ERP

npx @sarak/lib-ui-core init --help                     # PROBLEMA 2 — não existe --help; caiu direto na entrevista interativa
### (para abortar, pipe de linhas vazias — sem TTY real, a entrevista trava/aborta sem gerar nada, ver seção 4)
npx @sarak/lib-ui-core --help                          # por acaso revelou a "Uso:" com as flags reais
npx @sarak/lib-ui-core init --yes                      # Golden Path: Modo=app Stack=vite-express Storage=sqlite → 12 arquivos escritos

npm run dev                                            # PROBLEMA 3 — 'concurrently' não reconhecido (faltava `npm install`)
npm install                                            # instala as deps/devDeps que o init acrescentou ao package.json
npm run dev                                            # agora sobe backend (3000) e frontend (5173) limpos

### validação via curl
curl http://localhost:3000/api/v1/hello
curl http://localhost:3000/api/v1/propostas
curl -X POST http://localhost:3000/api/v1/propostas -d '{...}'

### validação via navegador real (Chromium via Playwright, instalado isolado — não no consumidor)
node probe*.mjs   # navegação, preenchimento de formulário, Design Engine, reload

npm run build                                          # tsc --noEmit + vite build → verde (exit 0)
```

Editei apenas os arquivos permitidos pela regra 2: `src/manifests/app.manifest.json` (o manifesto da
aplicação) e `src/server.ts` (endpoints Express de dados de exemplo — backend, não UI). Nenhum componente
React novo foi escrito no consumidor; nenhum arquivo em `node_modules/@sarak/lib-ui-core` foi tocado.

---

#### 3. O que funcionou DE PRIMEIRA, sem intervenção

- `npx @sarak/lib-ui-core init --yes` (uma vez descobertas as flags): escreveu 12 arquivos corretos —
  `index.html`, `src/main.tsx`, `src/Sarak-Engine/index.ts`, `src/manifests/app.manifest.json`,
  `src/server.ts`, `tsconfig*.json`, `vite.config.ts`, e as duas skills de consumo em `.agents/skills/`
  (`ui-integra-escrever-manifesto`, `ui-auditoria-manifesto`) — sem erros de TypeScript nem de path.
- O template starter (shell + `SarakShellNav` + rota `/` + rota `/design` com `CustomizationPanel`) rodou de
  primeira, sem nenhum ajuste, assim que as dependências foram instaladas.
- `SarakUIProvider` + `SarakManifestRendererDefault` + `createSarakDataStore` + `networkInterceptor` já vêm
  prontos e funcionais no plumbing gerado — zero código de integração escrito à mão.
- Toasts (`trigger_toast`) funcionaram sem nenhum Provider extra, exatamente como a skill promete
  ("feedback é zero-config").
- Backend: `setupUIDatabase` + `createSarakUIExpressMiddleware` inicializaram o schema SQLite
  automaticamente no primeiro boot ("Schema inicializado com sucesso (SQLite, prefixo `ui_core_`)"),
  sem nenhuma migration manual.
- `npm run build` (tsc do backend + vite build) fechou verde de primeira, sem nenhum erro de tipos.
- O pipe `currency` e a interpolação `{{item.campo}}` em `renderFor` funcionaram exatamente como
  documentado, com dados reais vindos do backend Express.

---

#### 4. Problemas, um a um

##### Problema 1 — `npm install github:...` poluiu um projeto Node não relacionado (fora do ERP)
- **Sintoma:** ao rodar `npm install github:Lib-Sarak/Sarak-Lib-UI-Core` na raiz do ERP (que não tinha
  `package.json`), o comando **não falhou nem criou um `package.json` novo** — ele subiu a árvore de
  diretórios até encontrar o `package.json` mais próximo (`C:\Users\Igor\package.json`, do usuário, contendo
  dependências de outro projeto) e instalou a lib **lá**, criando `C:\Users\Igor\node_modules` (289 pacotes)
  e adicionando `"@sarak/lib-ui-core"` às `dependencies` daquele `package.json` alheio.
- **Onde apareceu:** primeiro comando da regra 1 (`npm install github:...`), antes de qualquer skill entrar
  em cena.
- **Bloqueou?** Sim, silenciosamente — não há nenhum aviso do npm nem da lib de que isso aconteceu; só foi
  percebido ao verificar manualmente que `ERP/node_modules` e `ERP/package.json` simplesmente não existiam
  após um "added 289 packages" de sucesso.
- **O que fiz:** registrei o problema, **não usei nenhum contorno proibido** — apenas revertido
  manualmente (`rm -rf` do `node_modules`/`package-lock.json` criados no HOME, editado o `package.json` do
  HOME de volta ao estado original) e segui o caminho correto: `npm init -y` no ERP antes de reinstalar. Isso
  é comportamento padrão do npm (busca de `package.json` na árvore de diretórios), mas a regra 1/skills
  nunca avisam que é preciso ter (ou criar) um `package.json` no consumidor **antes** do `npm install
  github:...` — exatamente o cenário de "instalação do zero" que este teste cobre.

##### Problema 2 — `npx @sarak/lib-ui-core init` não documenta flags e falha silenciosamente sem TTY
- **Sintoma:** `npx @sarak/lib-ui-core init --help` não reconhece `--help` — cai direto na entrevista
  interativa ("Modo (app | embedded) [app]: "). Alimentando a entrevista via pipe de texto (sem TTY real,
  como em qualquer shell não-interativo/CI/agente), o processo consome a entrada e **termina com exit code
  0, sem escrever nenhum arquivo e sem nenhuma mensagem de erro** — parece ter funcionado, mas não fez nada.
- **Onde apareceu:** no `init` (a segunda etapa da regra 1).
- **Bloqueou?** Bloqueou o fluxo não-interativo completamente até eu, por acaso, rodar
  `npx @sarak/lib-ui-core --help` (sem `init`) e cair numa mensagem de uso residual:
  `Uso: npx @sarak/lib-ui-core init [--stack ...] [--storage ...] [--mode ...] [--force] [--yes]` — que
  revelou as flags reais.
- **O que fiz:** usei `npx @sarak/lib-ui-core init --yes` (Golden Path: Modo=app, Stack=vite-express,
  Storage=sqlite) e funcionou perfeitamente. Não é um contorno — é o caminho oficial —, mas eu só o
  descobri por acidente; nenhuma skill ou documentação junto ao pacote menciona essas flags ou o fato de
  que a entrevista interativa não funciona sem TTY.

##### Problema 3 — `npm run dev` falha após o `init` porque faltou `npm install`
- **Sintoma:** `'concurrently' não é reconhecido como um comando interno ou externo...`
- **Onde apareceu:** ao rodar `npm run dev` imediatamente após o `init`.
- **Bloqueou?** Bloqueou até eu perceber que o próprio `init` já tinha impresso a instrução correta:
  `"[sarak-ui init] Pronto. Rode "npm install && npm run dev"."` — eu simplesmente não tinha executado o
  `npm install` antes. Registro como problema de UX limítrofe (o `init` deveria falhar mais alto/ou rodar o
  install sozinho), mas a causa raiz da minha falha específica foi não seguir a própria instrução impressa.
- **O que fiz:** rodei `npm install` (instala as 12 dependências + 6 devDependencies que o `init` injetou no
  `package.json`) e o `npm run dev` subiu limpo (backend na porta 3000, frontend na porta 5173).

##### Problema 4 — `validation` no formulário NÃO bloqueia o submit (contradiz a documentação da skill)
- **Sintoma:** segui a skill `ui-integra-escrever-manifesto` (item 6: "`validation: [...]` valida — erros
  aparecem após touch/submit"; item 7: "Com `submit: true` ... a validação BARRA o envio se houver erro").
  Declarei `"validation": [{ "type": "required", "message": "..." }]` em cada `SarakInput` do formulário de
  Nova Proposta e `"actions": [{ "type": "api_call", "payload": { "endpoint": "...", "method": "POST",
  "submit": true } }]` no botão. Ao clicar "Salvar proposta" com os três campos **vazios**, o `api_call`
  disparou normalmente, o toast de **sucesso** ("Proposta salva com sucesso!") apareceu, e o backend recebeu
  e persistiu um registro em branco. Confirmado via `curl http://localhost:3000/api/v1/propostas` — dois
  registros `{"cliente_apelido":"","cliente_contato":"","valor_maximo":0,"status_proposta":"em análise"}`
  foram criados por dois testes de submit vazio.
- **Onde apareceu:** no motor de renderização/dispatcher, testado a partir do manifesto escrito seguindo a
  skill.
- **Bloqueou?** Não travou a tela (a tela continuou funcional), mas é uma falha funcional real do recurso
  "formulário com validação" pedido no roteiro — dados inválidos foram persistidos silenciosamente, sem
  nenhum aviso no console (diferente do erro proposital da seção 6, que gera `console.warn` claro).
- **O que fiz:** registrei o problema e **não aplicei nenhum contorno** (não escrevi validação em
  JavaScript no consumidor, o que violaria a regra 2). Ressalva importante: nem a skill nem o
  `manifest-catalog.md` mostram o **schema exato** de um item de `validation` — é a única diretiva
  reservada da lista (`slots · renderFor · bindings · actions · onError · renderIf · disabledIf ·
  persistState · validation · source · model · form · responsive · shell · routes · theme · aria`) sem
  nenhum exemplo de uso. O formato `{"type":"required","message":"..."}` foi uma inferência razoável a
  partir do texto da skill, mas não posso garantir que é o shape certo — e é exatamente esse o problema:
  não há como saber, e a Engine não avisa que o shape foi ignorado (ela avisa lindamente para token de
  espaçamento inválido e para `actions` como objeto, mas fica muda para `validation` com shape possivelmente
  errado).

##### Problema 5 — Personalização "ao vivo" da topbar exige um passo não documentado (Design Engine)
- **Sintoma:** troquei o campo "COR DA TOPBAR (FUNDO)" (localizado pela busca de token "topbar" dentro do
  `CustomizationPanel`) para `#ff2fb0` e cliquei em "Aplicar Alterações Globais" — nada mudou na topbar real
  do app (`--sarak-topbar-bg` continuou `#000000ff`). Só ao clicar em "Aplicar Alterações Globais" apareceu
  um modal **"Persistência de Tema"**: *"Você está modificando um tema padrão da biblioteca (Read-Only).
  Precisamos salvar suas alterações como um Novo Tema no seu banco de dados."* — com um campo "Nome do Novo
  Tema" e um botão "Salvar Novo Tema". Só depois de confirmar esse modal a topbar mudou de fato (
  `--sarak-topbar-bg` passou a `#4d002fff`, cor visivelmente aplicada na captura de tela).
- **Onde apareceu:** no `CustomizationPanel` (`/design`), ao vivo no navegador (Playwright/Chromium real).
- **Bloqueou?** Não — depois de descoberto o passo extra, funcionou perfeitamente, inclusive persistindo
  após reload completo da página (ver M8). Mas nenhuma skill ou catálogo menciona esse modal ou a distinção
  entre "tema padrão (read-only)" e "tema salvo no seu banco" — foi encontrado por exploração cega da UI
  (busca por "topbar" no campo de busca de tokens do próprio painel).
- **O que fiz:** completei o fluxo (nomear e salvar o novo tema) porque é parte do próprio painel oficial da
  lib — não é um contorno, é usar o produto como ele pede. Registro a ausência de documentação como achado.

##### Observações menores (não bloquearam, registradas por completude)
- `[Sarak:renderFor] item sem id/uuid; usando índice N como key.` — todo item das minhas listas
  (Propostas/Contratos/Projetos) tem `hash` como identificador natural, mas o motor espera especificamente
  `id`/`uuid`; gera warning em toda renderização. Nem a skill nem o catálogo mencionam essa convenção.
- Um warning nativo do Chrome (`The specified value "var(--sarak-text-main,#ffffff)" does not conform to
  the required format...`) aparece repetidamente dentro do próprio `CustomizationPanel` — parece que algum
  campo `input[type=color]` interno do painel recebe um valor `var(...)` em vez de um hex resolvido. É um
  detalhe do painel da própria lib, não algo que eu tenha causado.
- `npm run build` fecha verde, mas o chunk principal (`index-*.js`) ficou em **3,9 MB** (992 KB gzip) para um
  app com meia dúzia de `types` usados (`SarakFlex`, `SarakTypography`, `SarakButton`, `SarakInput`,
  `SarakShellNav`, `SarakSkeleton`, `SarakDataEmpty`, `CustomizationPanel`) — o Vite avisa
  "Some chunks are larger than 500 kB after minification". Não há code-splitting por componente visível no
  bundle final de um app mínimo.
- O pacote instalado via `github:...` traz o repositório **inteiro** da lib para dentro de
  `node_modules/@sarak/lib-ui-core` — inclusive `src/`, `specs/`, `playwright/`, `__snapshots__/`,
  `vitest.config.ts`, `Template-Ts/` (observado só por listagem de diretório, nunca aberto por conteúdo, em
  respeito à regra 3). Isso infla a instalação e expõe artefatos de desenvolvimento da lib que não deveriam
  ir para consumidores (não há `files`/`.npmignore` restringindo o publish).

---

#### 5. Avaliação das instruções

As duas skills de consumo (`ui-integra-escrever-manifesto`, `ui-auditoria-manifesto`) e o
`docs/manifest-catalog.md` gerado são, na maior parte, **muito bons**: densos, cheios de exemplos concretos
("Exemplo (salvar e avisar)", exemplo completo de lista com `source`+`states`, lista de "erros comuns a
evitar" com os bugs reais que já aconteceram em testes anteriores). Isso me permitiu montar shell+nav,
lista com carga automática, ações/toasts e o teste de erro proposital **sem precisar adivinhar nada**.

Onde precisei adivinhar (documentado nos Problemas acima):
1. As flags não-interativas do `init` (`--yes`, `--stack`, `--storage`, `--mode`, `--force`) — não estão em
   nenhuma skill, só numa mensagem de uso acidental.
2. O schema exato de um item de `validation` — nenhuma fonte fornecida mostra um exemplo.
3. O fluxo "tema read-only → salvar como novo tema" do `CustomizationPanel` — descoberto por tentativa e
   erro na UI, não documentado em skill/catálogo algum.
4. Que `npm install` precisa rodar de novo depois do `init` — só está na própria saída do CLI, não em
   nenhuma skill.

Nenhum desses quatro pontos exigiu ler o código-fonte da lib — todos foram resolvidos por observação de
comportamento em runtime (mensagens de erro, saída de CLI, exploração da UI renderizada), mas exigiram
tempo de exploração que a documentação fornecida não cobre.

---

#### 6. Contornos que teriam sido necessários (e que a regra 2 proibiu) — não aplicados

- **Nenhum.** Todos os cinco problemas acima foram contornados por meios permitidos: correção de ambiente
  (npm/package.json), uso de flags oficiais do próprio CLI, e uso da própria UI do Design Engine como ela
  pede (modal de "Salvar Novo Tema"). Não precisei escrever validação em JavaScript no consumidor, não
  precisei editar `node_modules/@sarak/lib-ui-core`, e não escrevi nenhum componente React de interface.
- A única coisa que **teria sido** um contorno proibido — e que deliberadamente **não fiz** — seria
  implementar a validação de formulário "na mão" (JS/TS no consumidor) para compensar o Problema 4. Preferi
  registrar a falha e deixar o formulário exatamente como a skill documenta, mesmo sabendo que ele aceita
  submits vazios.

---

#### 7. Matriz de medição M1–M10

| # | Critério | Resultado | Evidência |
|---|---|---|---|
| M1 | init gera projeto completo em 1 comando | **PARCIAL** | `init --yes` escreveu 12 arquivos certos em 1 comando, mas (a) exige descobrir `--yes`/`--stack`/`--storage`/`--mode` fora de qualquer doc fornecida (a entrevista interativa sozinha falha silenciosamente sem TTY, exit 0 e zero arquivos), e (b) o próprio CLI avisa que ainda falta um 2º comando obrigatório (`npm install`) antes de `dev` funcionar. |
| M2 | install+dev sobem sem ajuste manual | **FAIL** | `npm install github:...` no ERP (sem `package.json` prévio) instalou silenciosamente em `C:\Users\Igor\package.json` (ancestral não relacionado) em vez de no ERP — sem erro, sem aviso. Exigiu `npm init -y` manual + reversão da poluição antes de repetir corretamente. |
| M3 | telas do template corretas de primeira | **PASS** | Home + `/design` (`CustomizationPanel`) renderizaram sem erro no primeiro `npm run dev` bem-sucedido, sem nenhum ajuste de código. |
| M4 | erro de autoria proposital não derruba a tela e o warn ensina | **PASS** | Console: `[Sarak:Manifest] nó "root.routes[/].children[3]": diretiva "actions" inválida (esperado array, recebido object)... Ex. correto: "actions": [{ "type": "navigate", ... }]` e `[Sarak UI] Valor de espaçamento inválido "spacing-xxl" ... Você quis dizer "spacing-xl"?...`. Tela ficou de pé (screenshot `10-home-after-reload.png`), zero `pageerror`. |
| M5 | lista com source+states funciona pelo exemplo da skill | **PASS** | `/propostas` carregou 3 registros reais de `/api/v1/propostas` via `source`+`into`+`states`, `renderFor` + pipe `currency` renderizaram corretamente (`R$ 18.500,00` etc. — screenshot `03-propostas.png`). Ressalva menor: warning não documentado sobre falta de `id`/`uuid` por item. |
| M6 | formulário completo (validação barra submit; toasts) | **PARCIAL/FAIL** | Toast de sucesso funcionou (`"Proposta salva com sucesso!"`). Mas submit com os 3 campos vazios **não foi bloqueado**: `curl http://localhost:3000/api/v1/propostas` mostra registros `{"cliente_apelido":"","cliente_contato":"","valor_maximo":0,...}` criados a partir de submits vazios — a validação declarada (`"validation":[{"type":"required",...}]`) não impediu o envio. |
| M7 | topbar personalizada reflete ao vivo | **PASS** (com fricção não documentada) | Via `CustomizationPanel`: campo "COR DA TOPBAR (FUNDO)" → `#ff2fb0` → "Aplicar Alterações Globais" → modal "Persistência de Tema" (tema padrão é read-only) → "Salvar Novo Tema" → `--sarak-topbar-bg` mudou de `#000000ff` para `#4d002fff`, visível na topbar real (screenshot `83-home-after-full-reload.png`). |
| M8 | tema persiste após reload | **PASS** | Após `page.reload()` completo, `--sarak-topbar-bg` permaneceu `#4d002fff` e a topbar continuou magenta; `database.sqlite` (49 KB) confirmado no disco como camada de persistência. |
| M9 | skills+catálogo bastaram (zero leitura do código-fonte da lib) | **PARCIAL** | Cobriram ~90% do trabalho sem adivinhação (shell/nav, lista, ações, teste de erro). Não cobriram: flags do CLI, schema de `validation`, fluxo de "salvar novo tema" no Design Engine, e a necessidade de re-`npm install` após o `init`. Zero arquivo de `node_modules/@sarak/lib-ui-core` foi aberto para resolver qualquer um desses pontos — só comportamento observado em runtime. |
| M10 | zero contorno necessário | **PASS** | Nenhum patch em `node_modules/@sarak`, nenhum componente React de UI escrito no consumidor, nenhuma validação client-side "na mão" para mascarar o Problema 4. Toda fricção foi registrada, não contornada. |

**Resumo:** 5 PASS, 3 PARCIAL, 2 FAIL/PARCIAL-FAIL (M2 e M6 são os dois achados mais sérios).

---

#### 8. Veredito final

**Nota: 6,5/10.**

O motor declarativo em si — dispatcher de ações, resolução de tokens com fallback e `console.warn`
didático, `source`/`states`/`renderFor`, o Design Engine com dezenas de tokens granulares e persistência
real em SQLite — é **genuinamente sofisticado e, no núcleo, funciona muito bem**. O tratamento de erro de
autoria (M4) é o melhor ponto do produto: a tela nunca cai e o console literalmente ensina a correção
("Você quis dizer 'spacing-xl'?"). Isso é raro de ver bem feito.

Mas "plug-and-play" não é isso — é a primeira milha, e é exatamente onde a experiência tropeça:
- O primeiro comando do próprio roteiro oficial (`npm install github:...`) tem um efeito colateral sério e
  silencioso (instalar no diretório errado) no cenário exato que a lib deveria dominar: um projeto sem
  frontend nenhum ainda.
- O segundo comando oficial (`init`) não funciona sem descobrir flags não documentadas em lugar nenhum do
  material fornecido.
- O recurso mais básico de qualquer formulário de produção — "validação impede submit inválido" — está
  documentado como funcionando e, no teste real, não funcionou, sem nenhum aviso no console para compensar.

Não é um "quase não funciona": é um "funciona muito bem depois que você tropeça nos três primeiros
degraus sem corrimão". Para um consumidor real com prazo, isso é a diferença entre "instalei em 20 minutos"
e "instalei em 3 horas, sendo 2 delas resolvendo problemas que a documentação deveria ter prevenido".

**As 3 melhorias que eu mais sentiria falta:**
1. **`npm install github:...` deveria falhar ou avisar claramente quando não há `package.json` no diretório
   atual**, em vez de subir a árvore de diretórios e instalar num projeto não relacionado. Idealmente o
   scaffolder deveria assumir esse passo (`npm init -y` automático se ausente).
2. **Um exemplo concreto do shape de `validation`** no catálogo/skill (hoje é a única diretiva reservada sem
   nenhum exemplo) — e a Engine deveria emitir um `console.warn` quando uma regra de validação é ignorada
   por shape inválido, do mesmo jeito exemplar que já faz para tokens de espaçamento e `actions` como
   objeto.
3. **`npx @sarak/lib-ui-core init --help` deveria realmente mostrar o uso** (com as flags `--yes`/
   `--stack`/`--storage`/`--mode`), e a entrevista interativa deveria detectar ambiente não-TTY e falhar
   alto (nunca `exit 0` sem escrever nada) — hoje ela finge sucesso.


---

## Anexo B — Triagem de achados da Rodada 1 (extrato analítico, inclui o achado 0)


### Origem

Teste de instalação real (`Spec 26`, prompt **P10**) executado por agente externo sem contexto da lib, instalando `@sarak/lib-ui-core` do zero em `Earendel/ERP` só pelo caminho oficial. Relatório bruto do executor: `Earendel/ERP/RELATORIO-INSTALACAO-UI.md`. Este documento é a **extração só dos erros**, organizada para virar specs de correção depois — nenhuma correção foi aplicada ainda (regra "não corrigir no calor" da spec 26).

Resultado do teste: **Selo da Onda NÃO concedido** (nota 6,5/10; matriz M1-M10 = PARCIAL·FAIL·PASS·PASS·PASS·FAIL·PASS·PASS·PARCIAL·PASS).

**Atualização pós-relatório (2026-07-20, revisão do usuário):** ao revisar o app rodando, o usuário apontou uma faixa de navegação visualmente quebrada no topo da tela, não capturada como achado autônomo pelo executor do P10 (que classificou o fluxo de tema como M7 PASS-com-fricção). Investigação direta no código-fonte (permitida para mim, vedada ao executor do teste) confirmou uma causa raiz nova e mais grave — ver achado **0** abaixo, agora o mais crítico do documento. Isso reclassifica **M7 de PASS para FAIL** (ver nota na tabela de matriz em `00-progresso.md`, a atualizar).

---

### Erros (ordenados por severidade)

#### 0. [CRÍTICO — achado pós-relatório] `navigationStyle: "topbar"` quebra o layout do Shell novo (regressão vs. o Shell legado)
- **Onde:** `src/core/Manifest/nodes/ShellRouterNode.tsx:154-172` (região `shell.sidebar`) vs. `src/components/atomic/Navigation/SarakShellNav.tsx:114-119` (`useNavigationStyle`/orientação).
- **Sintoma:** ao ativar um tema com `navigationStyle: "topbar"` no Design Engine (`/design`, aba Layout — campo real, não é preciso editar banco à mão), a barra de navegação lateral fica visualmente quebrada: uma faixa horizontal estreita e cortada aparece no lugar da sidebar, mostrando só 1-2 itens de navegação em vez da lista completa. Print do usuário confirma o sintoma ao vivo no navegador.
- **Causa raiz confirmada:** `SarakShellNav` muda corretamente seu próprio layout interno para `flexDirection: row` quando `navigationStyle === "topbar"` (linha 116-119 do componente) — mas `ShellRouterNode` (quem monta o chrome do shell a partir do manifesto) **sempre** envolve a região `shell.sidebar` num `<aside>` de largura FIXA (`--sarak-sidebar-width`, 240px por padrão, min 200/max 450), **independentemente** de `navigationStyle`. O resultado é um menu horizontal inteiro espremido dentro de uma coluna de 240px pensada para menu vertical.
- **Por que isto é uma REGRESSÃO, não só um bug novo:** o Shell LEGADO da própria lib (`src/core/Shell/SarakShell.tsx:78-192`) já resolve isso corretamente — `isSidebar`/`isTopbar`/`isDock`/`isGlass` são ramos **mutuamente exclusivos**: quando `isTopbar`, a região de sidebar **nem é renderizada**; em vez disso monta um `<TopbarNav>` dedicado, de largura cheia. O `ShellRouterNode` novo (Spec 18/33, o motor declarativo que a Spec 21/22 escala e que a Spec 26 testou) nunca replicou essa exclusividade mútua — só herdou a adaptação de orientação do item de nav (Spec 18), não a realocação de região.
- **Por que isto importa MUITO além do teste isolado:** `Sarak-MyService` (apontado pelo usuário como referência mínima de funcionalidade, `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Biblioteca\Sarak-MyService`) declara `"navigationStyle": "topbar"` como sua **configuração de produção real** (`src/sarak.manifest.json:11`) — não é um valor exótico do teste, é literalmente como o app de referência da própria Sarak está configurado hoje. Isso só não quebra no MyService porque ele ainda roda sobre o Shell LEGADO, não sobre o `SarakManifestRenderer`/`ShellRouterNode`. **Se o MyService for migrado para o motor novo (o objetivo declarado da onda "Renderizador Genérico"), a navegação dele quebra exatamente como no ERP.**
- **M afetada:** M7 — reclassificar de PASS para **FAIL**. O achado #5 abaixo (fluxo "salvar como novo tema" não documentado) é um problema DIFERENTE e independente, também dentro do Design Engine, mas não é a mesma causa raiz.

#### 1. [CRÍTICO] Validação de formulário não bloqueia submit — dado inválido persistido silenciosamente
- **Onde:** motor/Dispatcher, diretiva `validation` (`{"type": "required", "message": "..."}`) num `SarakInput` dentro de um `SarakForm` com `actions: [{ type: "api_call", payload: { submit: true, ... } }]`.
- **Sintoma:** clicar em submit com os 3 campos obrigatórios vazios **não bloqueia o envio**. O `api_call` dispara normalmente, o backend recebe e persiste o registro vazio, e o toast de **sucesso** aparece. Confirmado via `curl` no endpoint real: dois registros `{"cliente_apelido":"","cliente_contato":"","valor_maximo":0,"status_proposta":"em análise"}` foram criados a partir de dois testes de submit vazio.
- **Contradiz:** a skill `ui-integra-escrever-manifesto` documenta explicitamente que "a validação BARRA o envio se houver erro" (item 7) e que "erros aparecem após touch/submit" (item 6).
- **Agravante:** zero warning no console — o mesmo motor que avisa lindamente para token de espaçamento inválido ou `actions` como objeto fica mudo aqui.
- **Causa possível a investigar:** shape de `validation` pode não estar documentado/implementado como a skill descreve, ou o Dispatcher não está checando o resultado da validação antes de disparar `api_call`.
- **M afetada:** M6 (FAIL), M9 (PARCIAL — nenhuma fonte mostra o schema exato de `validation`, é a única diretiva reservada sem exemplo).

#### 2. [ALTO] `npm install github:...` sem `package.json` local instala silenciosamente no diretório errado
- **Onde:** primeiro comando do caminho oficial de instalação (`npm install github:Lib-Sarak/Sarak-Lib-UI-Core`), antes de qualquer skill/init entrar em cena.
- **Sintoma:** rodado num diretório do consumidor SEM `package.json` (o caso real de "projeto sem frontend ainda"), o npm sobe a árvore de diretórios até achar o `package.json` mais próximo — no teste, achou `C:\Users\Igor\package.json` (projeto não relacionado do usuário) — e instalou lá: criou `node_modules` com 289 pacotes e injetou `@sarak/lib-ui-core` nas dependencies daquele arquivo alheio. Nenhum erro, nenhum aviso do npm ou da lib.
- **Impacto:** poluição silenciosa de um projeto não relacionado; só descoberto por verificação manual de que `ERP/node_modules` e `ERP/package.json` não existiam após um "added 289 packages" de sucesso.
- **M afetada:** M2 (FAIL).

#### 3. [MÉDIO] `init --help` não existe; entrevista interativa falha silenciosa sem TTY
- **Onde:** `npx @sarak/lib-ui-core init` (`bin/sarak-ui.mjs`).
- **Sintoma:** `init --help` não é reconhecido como flag — cai direto na entrevista interativa ("Modo (app | embedded) [app]: "). Em ambiente sem TTY real (pipe de texto, CI, agente), o processo consome a entrada e termina com **exit code 0, sem escrever nenhum arquivo e sem mensagem de erro** — parece ter funcionado, mas não fez nada.
- **Como as flags reais foram descobertas:** por acidente, rodando `npx @sarak/lib-ui-core --help` (sem `init`), que revelou uma mensagem de uso residual: `Uso: npx @sarak/lib-ui-core init [--stack ...] [--storage ...] [--mode ...] [--force] [--yes]`.
- **Impacto:** bloqueia qualquer fluxo não-interativo (scripts, CI, agentes) até descobrir as flags por tentativa e erro; nenhuma skill ou documentação do pacote menciona `--yes`/`--stack`/`--storage`/`--mode`/`--force`.
- **M afetada:** M1 (PARCIAL).

#### 4. [MÉDIO] Empacotamento do pacote publicado inclui o repositório-fonte inteiro
- **Onde:** `package.json` da lib (ausência de campo `files` / `.npmignore`).
- **Sintoma:** `npm install github:...` traz para dentro de `node_modules/@sarak/lib-ui-core` o repositório inteiro — `src/`, `specs/`, `playwright/`, `__snapshots__/`, `vitest.config.ts`, `Template-Ts/` — não só o `dist/`/`bin/`/`backend/`/`docs/manifest-catalog.*` que o consumidor precisa.
- **Impacto:** infla a instalação, expõe artefatos de desenvolvimento (testes, specs internas, playwright configs) para consumidores externos, e cria a tentação de "ler o código-fonte" bem debaixo do `node_modules` do próprio projeto.
- **M afetada:** M9 (contexto/observação).

#### 5. [BAIXO] Fluxo "tema padrão read-only → salvar como novo tema" não documentado
- **Onde:** `CustomizationPanel` (`/design`), ao personalizar um tema padrão da biblioteca.
- **Sintoma:** mudar a cor da topbar e clicar "Aplicar Alterações Globais" não muda nada visualmente — só abre um modal "Persistência de Tema" ("Você está modificando um tema padrão (Read-Only)... salvar como Novo Tema") não anunciado em nenhuma skill/catálogo. Só descoberto explorando a UI às cegas. Depois de completar o fluxo, funciona e persiste corretamente (M7/M8 = PASS).
- **M afetada:** M7 (PASS com fricção não documentada).

#### 6. [BAIXO] `renderFor` avisa sobre chave ausente mesmo com chave natural presente
- **Onde:** motor de renderização de listas (`renderFor`).
- **Sintoma:** `[Sarak:renderFor] item sem id/uuid; usando índice N como key.` aparece em toda renderização de uma lista cujos itens usam `hash` como identificador natural (não `id`/`uuid`). O motor não reconhece outras convenções de chave.
- **M afetada:** M5 (observação, não bloqueou).

#### 7. [BAIXO] Bundle final sem code-splitting para um app mínimo
- **Onde:** `npm run build` (Vite) do consumidor.
- **Sintoma:** chunk principal em 3,9 MB (992 KB gzip) para um app usando ~8 componentes (`SarakFlex`, `SarakTypography`, `SarakButton`, `SarakInput`, `SarakShellNav`, `SarakSkeleton`, `SarakDataEmpty`, `CustomizationPanel`). Vite avisa "Some chunks are larger than 500 kB after minification".
- **M afetada:** build (observação de performance, não bloqueou).

#### 8. [COSMÉTICO] Warning nativo do Chrome dentro do próprio `CustomizationPanel`
- **Onde:** algum `input[type=color]` interno do painel.
- **Sintoma:** `The specified value "var(--sarak-text-main,#ffffff)" does not conform to the required format...` — parece receber um valor `var(...)` não resolvido em vez de um hex.
- **M afetada:** nenhuma diretamente (ruído no console durante M7/M8).

---

### Não é erro (registrado para não repetir investigação)
- `npm run dev` falhando por `'concurrently' não reconhecido` logo após o `init`: causa raiz foi o executor não ter rodado `npm install` antes — o próprio `init` já imprime a instrução correta ("Rode `npm install && npm run dev`"). Risco de UX (o `init` poderia falhar mais alto ou rodar o install sozinho), mas não é um bug confirmado — registrado só como nota de fricção menor.
- **`package.json` do ERP com histórico de commit "estranho":** o achado 2 (`npm install github:...` instala no diretório errado) é real e ocorreu exatamente como descrito — na hora do teste, `Earendel/ERP` não tinha `package.json`. O que causa confusão ao olhar o `git log` DEPOIS é uma coincidência de timing: no mesmo intervalo (2026-07-20, 00:10-00:35), uma sequência de commits de NEGÓCIO totalmente à parte (feature "proposta xtreme" — canvas neural, overflow mobile) foi feita na raiz do mesmo repositório. Quem fez esses commits usou um `git add` amplo que varreu junto o `package.json`/`package-lock.json` recém-criados pelo teste, por isso eles aparecem sob mensagens como "ajusta overflow mobile e opacidade do canvas neural nas propostas". **Não é um bug da lib** — é higiene de commit (duas frentes de trabalho paralelas resultando em commits misturados). Vale como lição de processo, não como achado técnico contra a biblioteca.

---

### Granularidade de manifesto/telas — confirmação

O `app.manifest.json` gerado pelo teste (`Earendel/ERP/src/manifests/app.manifest.json`) foi inspecionado diretamente: shell com `topbar`+`sidebar`+`routes`, 5 rotas reais, cada uma composta por containers `SarakFlex` aninhados (`direction`/`gap`/`justify`/`align`), tipografia por variante, `SarakInput` com `model`+`validation` por campo, listas via `source`+`states`+`renderFor` com interpolação de template e pipe `currency`. **Confirma que a composição granular funciona de fato** — o autor monta a tela bloco a bloco em JSON (containers aninhados, formulário campo a campo, lista de itens template-driven), não apenas encaixa templates de página inteiros.

**Limite não testado (não é um FAIL, é uma lacuna de cobertura do teste):** este manifesto só exercitou empilhamento flex (`row`/`column`). Nenhuma tela usou grid, `SarakCard`, dashboards ou composições mais densas (`SarakDataTable`, `Kanban`, etc. — ver memórias "Onda 9/10" desta lib). Não há evidência de que a granularidade "aguenta tudo" que o catálogo de componentes oferece — só que o subconjunto flex+form+lista funciona bem. Uma próxima rodada de teste deveria forçar pelo menos 1 tela com grid/cards para fechar essa lacuna de cobertura.

---

### Comparação com o Sarak-MyService (referência mínima de funcionalidade)

Por pedido do usuário, analisei `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Biblioteca\Sarak-MyService` — um consumidor real de produção da mesma lib (`"@sarak/lib-ui-core": "file:../Sarak-Lib-UI-Core"`) — para servir de baseline.

**Achado estrutural importante: o MyService NÃO usa o motor testado pela Spec 26.** Ele importa `SarakShell` (`src/core/Shell/SarakShell.tsx`) — o Shell **LEGADO**, baseado em registro de módulos (`registerSarakModule`/`registerLocalComponent`, `src/core/Discovery/registry.ts`) e no próprio manifesto `src/sarak.manifest.json` (schema diferente: `system`+`navigationStyle`+`modules[]`, sem `routes`/`shell.topbar`/`shell.sidebar` como o `SarakManifestRenderer` usa). Ou seja: **é uma arquitetura paralela e mais antiga**, que coexiste na lib mas não é o "Renderizador Genérico" (specs 16-24 + 21/22) que a Spec 26 testou.

Isso muda o que a comparação pode provar:
- **NÃO serve** como referência de schema/paridade 1:1 do manifesto JSON novo (são formatos diferentes, não comparáveis linha a linha).
- **SERVE, e muito bem**, como prova de que o **catálogo de componentes** da lib é capaz de sustentar um app de produção rico: o MyService compõe autenticação (`@sarak/lib-auth-identity`), orquestrador de LLM, chat de IA, tradutor, personalização — muito além do que o manifesto de teste do ERP exercitou (que ficou em flex+form+lista simples). Isso é evidência indireta de que a limitação de granularidade observada no ERP é do ESCOPO DO TESTE, não um teto real da lib.
- **SERVE, de forma direta e grave**, para provar a severidade do achado 0: o `sarak.manifest.json` do MyService declara `"navigationStyle": "topbar"` como configuração de PRODUÇÃO real (não um valor aleatório do teste) — e o Shell legado que ele usa trata isso corretamente (`isTopbar` como ramo exclusivo, sem sidebar residual). O Shell novo (`ShellRouterNode`) não tem esse tratamento. **Migrar o MyService do Shell legado para o motor declarativo novo quebraria a navegação dele hoje**, exatamente como no ERP — não é uma hipótese, é uma consequência direta do código lido nos dois lados.

**Conclusão da comparação:** o "piso mínimo de funcionalidade" do MyService mostra que a BIBLIOTECA (componentes) já suporta muito mais do que o teste da Spec 26 exercitou — mas também expõe que o motor declarativo NOVO (o que a onda "Renderizador Genérico" entrega e o que P10 testou) ainda não replica uma capacidade básica que o motor antigo já tinha: suporte real a `navigationStyle` fora de `sidebar`. Isso deveria entrar na lista de correção como item de PARIDADE (o novo motor precisa alcançar o legado nesse ponto), não só como bug isolado.

---

### Uso pretendido deste documento
Cada erro acima é candidato a virar uma spec de correção (ou uma edição direta de skill, para os itens 2, 3, 4 e 5, que são lacunas de instrução/empacotamento, não bugs de motor). A ordem de severidade acima é a ordem de prioridade sugerida — o achado 0 (regressão de `navigationStyle`) e o achado 1 (validação de formulário) são os dois mais graves e devem vir primeiro. Depois da correção, repetir o teste (nova rodada do P10, spec 26) antes de reavaliar o Selo da Onda.


---

## Anexo C — Relatório bruto da Rodada 2 / Re-Selo (2026-07-21)

### Relatório de Instalação — Sarak-UI (@sarak/lib-ui-core) no ERP Earendel (Rodada 2 / Re-Selo)

Segunda rodada do Selo da Onda. A primeira (2026-07-20) foi **NEGADA** (nota 6,5/10, ver
`RELATORIO-INSTALACAO-UI-rodada1.md`) e motivou uma rodada de correção (specs 27/28/29). Este teste
reinstala a Sarak-UI **do zero** no ERP Earendel (previamente desinstalado pela spec 31), como um
consumidor externo sem contexto da lib — só pelo caminho oficial (`npm install github:...` →
`npx @sarak/lib-ui-core init` → skills instaladas → catálogo `manifest-catalog.md`), sem ler o
código-fonte da lib e sem nenhum contorno proibido pela regra 2 do protocolo (Spec 26). Validação real
via automação de navegador headless (CDP nativo, sem dependência instalada no consumidor) + `curl` nos
endpoints + `npm run build`.

---

#### 1. Ambiente e tempo total

- **SO:** Windows 11 Pro 10.0.26200
- **Node:** v24.10.0
- **npm:** 11.6.1
- **Diretório do consumidor:** `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP`
- **Tempo total:** ~48 min corridos (2026-07-20 ~23:33 → 2026-07-21 ~00:21). Instalação + scaffold + 1ª
  tela no ar levaram **< 10 min**; o restante foi validação funcional real (formulário, Design Engine,
  persistência, erro proposital) via automação de browser para gerar evidência objetiva de cada item da
  matriz.

---

#### 2. Passo a passo executado (comandos reais, na ordem)

```bash
cd "C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP"

npm init -y                                                # diretório não tinha package.json (spec 31 removeu por completo)

npm install github:Lib-Sarak/Sarak-Lib-UI-Core             # added 300 packages in 1m — instalou CORRETO no ERP desta vez

npx @sarak/lib-ui-core --help                               # flags descobertas via --help real, não por acidente

npx @sarak/lib-ui-core init --yes                            # Modo=app Stack=vite-express Storage=sqlite
                                                              # "12 arquivo(s) escrito(s)."
                                                              # "1 pulado(s) (já existiam; use --force p/ sobrescrever): package.json:dependencies.@sarak/lib-ui-core"

npm install                                                 # peerDeps gravadas pelo init — added 248 packages in 10s

### edição do manifesto (6 rotas: /, /propostas, /contratos, /projetos, /design, /qa-erro-proposital)
### via skill ui-integra-escrever-manifesto + docs/manifest-catalog.md
### edição de src/server.ts SÓ com endpoints de exemplo (GET propostas/contratos, GET/POST projetos) — plumbing, não UI

npm run dev                                                 # backend :3000, frontend :5175 (5173/5174 ocupadas por outro processo da máquina)

### validação funcional completa via automação de browser headless (CDP) + curl — ver seções 4 e 7

npm run build                                               # tsc --noEmit + vite build → ✓ built in 20.77s
```

Editei apenas os arquivos permitidos pela regra 2: `src/manifests/app.manifest.json` e `src/server.ts`
(endpoints Express de exemplo — backend, não UI). Nenhum componente React novo foi escrito no consumidor;
nenhum arquivo em `node_modules/@sarak/lib-ui-core` foi tocado.

---

#### 3. O que funcionou DE PRIMEIRA, sem intervenção

- `npm install github:Lib-Sarak/Sarak-Lib-UI-Core` — instalação limpa no diretório correto, sem scripts
  de post-install suspeitos.
- `npx @sarak/lib-ui-core --help` — ajuda completa e precisa, lista todas as flags (`--mode`, `--stack`,
  `--storage`, `--schema`, `--backend-port`, `--frontend-port`, `--force`, `--yes`) com defaults
  documentados e avisa o comportamento não-interativo (falha com exit 1 e instrução, nunca sai em
  silêncio) — **Problema 2 da rodada 1 fechado**.
- `npx @sarak/lib-ui-core init --yes` — gerou os 12 arquivos do Golden Path, com `vite.config.ts` já
  trazendo o proxy `/api` → `:3000` pré-configurado.
- Tela padrão do template (`/` e `/design`) renderizou perfeitamente na primeira carga, shell +
  `SarakShellNav` com todos os itens, zero warning no console.
- Lista com `source`/`states`/`renderFor` (rota `/propostas`) funcionou exatamente como o exemplo
  canônico da skill.
- Grid de cards (rota `/contratos`, `SarakGrid` + `SarakActionCard` + `source`) funcionou de primeira, em
  grade real (não empilhamento flex) — cobertura nova pedida para esta rodada.
- Formulário com `validation` + `submit: true` funcionou exatamente como documentado, sem nenhuma
  tentativa/erro.
- `npm run build` do consumidor: verde na primeira tentativa.
- Design Engine acessível em `/design`, +20 temas prontos, preview ao vivo refletindo a tela real.

---

#### 4. Problemas, um a um

##### Problema 1 — Design Engine exige "Commit por categoria" antes de "Aplicar Alterações Globais" ter efeito (não documentado)
- **Sintoma:** mudar um valor (ex.: Estrutura de Navegação de Sidebar → Topbar) e clicar direto em
  "Aplicar Alterações Globais" não teve efeito visível na app real — o rótulo de estado continuou
  "SALVAR" (sujo). Só depois de perceber que cada categoria expandida tem um botão próprio
  **"Commit 0. Configurações Globais (2)"** (preciso clicar nele primeiro) é que "Aplicar Alterações
  Globais" passou a funcionar.
- **Onde apareceu:** motor (`CustomizationPanel`), não documentado em nenhuma skill nem no catálogo.
- **Bloqueou?** Não — descoberto por inspeção visual da própria tela (o botão está visível, só não é
  mencionado em nenhuma instrução).
- **O que fiz:** registrei e segui; nenhum contorno aplicado.

##### Problema 2 — Modal "Persistência de Tema" — confirmado, e agora DOCUMENTADO (achado positivo)
- **Sintoma:** ao personalizar um tema padrão (read-only), abriu o modal "Persistência de Tema" pedindo
  para salvar como Novo Tema.
- **Onde apareceu:** motor (`CustomizationPanel`).
- **Bloqueou?** Não — e a skill `ui-integra-escrever-manifesto` **já avisa isso explicitamente** ("Temas
  padrão da biblioteca são READ-ONLY — personalizar exige 'Salvar como Novo Tema' (esperado, não é bug)").
  Este é o Problema 5 da rodada 1: **a documentação foi corrigida e bate 100% com o comportamento real.**
- **O que fiz:** preenchi o nome e salvei; o tema foi persistido e ativado normalmente.

##### Problema 3 — Bundle de produção grande, sem code-splitting por rota
- **Sintoma:** `dist/assets/index-*.js` em **3,9 MB (993 KB gzip)**; Vite avisa "Some chunks are larger
  than 500 kB after minification".
- **Onde apareceu:** build do consumidor (Vite).
- **Bloqueou?** Não — build passa verde, é aviso de performance.
- **O que fiz:** apenas registrei (contorno de `manualChunks`/lazy-loading estaria fora do escopo do
  teste). **Já rastreado — ver seção "Relação com a Spec 30" abaixo.**

##### Problema 4 — `SarakActionCard.label` não determina o texto do botão do card
- **Sintoma:** `"label": "Ver contrato"` esperado no botão do card; o botão renderizado sempre mostra
  "EXECUTAR" (rótulo fixo interno).
- **Onde apareceu:** componente (`SarakActionCard`); catálogo não documenta a semântica real da prop
  `label` neste componente (só lista o tipo `string`).
- **Bloqueou?** Não — cosmético; a tela funciona, só o texto do botão não é customizável como o nome
  sugere.
- **O que fiz:** registrei e segui (contornar exigiria componente React próprio, proibido pela regra 2).

Nenhum dos quatro pontos impediu a entrega das telas pedidas.

---

#### 5. Avaliação das instruções

As duas skills (`ui-integra-escrever-manifesto`, `ui-auditoria-manifesto`) e o
`docs/manifest-catalog.md` bastaram para construir **100% das telas pedidas**, sem nenhuma leitura do
código-fonte da lib. A skill de manifesto está sensivelmente mais madura que na rodada 1: já traz, numa
seção "Erros comuns a evitar", exatamente os erros de autoria testados neste relatório (token de
espaçamento inventado, `actions` como objeto, `body` em vez de `params`, form sem `submit: true`) — sinal
de que a correção realimentou a documentação com os achados reais da rodada 1, não só o motor.

Único ponto onde precisei adivinhar: o passo de "Commit por categoria" antes de "Aplicar Alterações
Globais" no Design Engine (Problema 1) — não está em nenhuma skill nem no catálogo, só descoberto
navegando visualmente pela UI.

---

#### 6. Contornos que teriam sido necessários (e que a regra 2 proibiu) — não aplicados

**Nenhum.** Todas as telas pedidas foram construídas inteiramente por manifesto JSON + o plumbing gerado
pelo `init` + endpoints de exemplo em `server.ts` (backend, não UI). Não houve `registerComponent`, edição
de `node_modules`, nem nenhum componente React de interface escrito à mão.

---

#### 7. Matriz de medição M1–M10

| # | Critério | Resultado | Evidência |
|---|---|---|---|
| M1 | init gera projeto completo em 1 comando | **PASS** | `init --yes` → "12 arquivo(s) escrito(s)." — projeto completo na primeira execução. |
| M2 | install+dev sobem sem ajuste manual, sem poluir diretório ancestral | **PASS** | `npm install`+`npm install`+`npm run dev` sem edição manual; `node_modules`/`package.json` só em `...\ERP` — o `C:\Users\Igor\node_modules` pré-existente (de outro projeto) tem timestamp anterior ao teste, não tocado. **Problema 1 da rodada 1 (FAIL) fechado.** |
| M3 | telas do template corretas de primeira | **PASS** | Home e `/design` renderizaram completos, zero warning, na primeira carga. |
| M4 | erro de autoria proposital não derruba a tela e o warn ensina | **PASS** | Token `spacing-xxl` inventado + `actions` como objeto: tela de pé, console ensina a correção exata ("Você quis dizer 'spacing-xl'?" / exemplo de `actions` correto). |
| M5 | lista com source+states funciona pelo exemplo da skill | **PASS** | `/propostas` carregou via `source`+`states`+`renderFor` copiados do exemplo canônico, sem ajuste. |
| M6 | formulário completo (validação barra submit; toasts) | **PASS** | Submit vazio: 3 erros inline, zero toast de sucesso, zero chamada de rede (`curl` confirma nenhum registro vazio criado). Submit válido: toast de sucesso + `curl` confirma só o registro válido persistido. **Problema 4/M6 FAIL da rodada 1 fechado.** |
| M7 | topbar/navigationStyle personalizada reflete ao vivo sem quebrar o layout | **PASS** | `navigationStyle: "topbar"` aplicado ao vivo → navegação full-width com os 6 itens visíveis, sem faixa cortada. **Achado crítico 0 (Spec 27) fechado.** |
| M8 | tema persiste após reload | **PASS** | Reload completo da SPA manteve a navegação em topbar — persistido via storage escolhido na entrevista (SQLite). |
| M9 | skills+catálogo bastaram (zero leitura do código-fonte da lib; pacote sem o fonte) | **PARCIAL** | Zero leitura de código-fonte para aprender a usar a lib. Empacotamento: `node_modules/@sarak/lib-ui-core` não tem `specs/`/`playwright/`/componentes-fonte (Problema/achado da rodada 1 fechado), **mas existe uma pasta `src/`** contendo só `src/styles/sarak-base.css` (declarado em `package.json.files`, não é vazamento de componente — mas viola a expectativa literal de "pacote sem `src/`"). |
| M10 | zero contorno necessário | **PASS** | Nenhum `registerComponent`, nenhuma edição de `node_modules`, nenhum componente React de UI no consumidor. |

**Resumo: 9 PASS, 1 PARCIAL, 0 FAIL.** Os dois achados FAIL/crítico da rodada 1 (M2 instalação e M6
validação) e o achado crítico 0 da triagem (M7 topbar) estão fechados e comprovados com evidência de
interação real.

---

#### 8. Veredito final

**Nota: 9,3/10.**

A instalação é, na prática, plug-and-play: `npm init -y` → `npm install github:...` → `npx @sarak/lib-ui-core init --yes` → `npm install` entregam um app completo, rodando, com shell, navegação, Design Engine e
persistência funcionando. Os dois achados críticos da rodada 1 — **M6 (validação não barrava submit
vazio)** e **M7 (topbar cortado/estreito)** — estão decisivamente corrigidos: testei ativamente tentar
quebrá-los (submit vazio real via automação de browser + `curl` no endpoint; troca de `navigationStyle`
ao vivo) e os dois se comportaram exatamente como esperado. A skill de manifesto também amadureceu:
documenta hoje, com exemplos "❌ ERRADO", precisamente os erros reais que apareceram na rodada anterior.

O que ainda tira uma nota mais alta:
1. O passo de "Commit por categoria" no Design Engine não está documentado em nenhuma skill/catálogo —
   único ponto em que precisei adivinhar por exploração visual.
2. Bundle de produção grande sem code-splitting por rota (3,9 MB / 993 KB gzip no chunk principal).
3. `node_modules/@sarak/lib-ui-core/src/` ainda existe (só 1 CSS, mas viola a expectativa literal de
   "pacote sem `src/`") e a prop `label` do `SarakActionCard` não documenta sua semântica real.

**As 3 melhorias que mais sentiria falta:**
1. Documentar o fluxo "Commit da categoria → Aplicar Alterações Globais → (possível) modal Salvar Novo
   Tema" na skill `ui-integra-escrever-manifesto` ou num guia dedicado ao Design Engine.
2. Mover `src/styles/sarak-base.css` para dentro de `dist/` no `package.json.files`, eliminando qualquer
   pasta `src/` de dentro de `node_modules/@sarak/lib-ui-core` (fecha M9 para PASS puro).
3. `build.rollupOptions.output.manualChunks` (ou lazy-loading por rota) sugerido por padrão no
   `vite.config.ts` gerado pelo `init`.

---

#### Relação com a Spec 30 (Polimento pós-Selo) — checar antes de executar

A Spec 30 já foi planejada a partir dos achados **da rodada 1** (não bloqueantes, execução após o
re-Selo). Cruzando com os achados desta rodada 2:

- **Achado 7 da Spec 30 (bundle sem code-splitting, baseline "3,9 MB / 992 KB gzip")** é **o mesmo
  problema do Problema 3 acima** ("3,9 MB / 993 KB gzip" — mesma ordem de grandeza, mesmo chunk
  principal). **A Spec 30 já cobre este item** — nenhuma spec nova necessária para o code-splitting;
  a melhoria 3 desta rodada (manualChunks por padrão no `vite.config.ts` do `init`) é escopo adjacente
  dentro da mesma seção 2.2 da Spec 30 (vale mencionar/expandir ao executá-la).
- **Achado 6 da Spec 30 (`renderFor` sem chave natural além de `id`/`uuid`)** e **achado 8 (warning de
  `input[type=color]`)** não foram re-testados diretamente nesta rodada (o roteiro funcional não forçou
  os dois cenários), mas continuam válidos como estavam — sem mudança de status.
- **NÃO cobertos pela Spec 30** (achados novos desta rodada 2, fora do escopo dela — candidatos a uma
  spec própria ou a um adendo, não incluídos automaticamente na execução da 30):
  - Problema 1 (fluxo "Commit por categoria" no Design Engine não documentado);
  - Problema 4 (`SarakActionCard.label` não define o texto do botão / catálogo não documenta a
    semântica real da prop);
  - Melhoria 2 (pasta `src/` dentro do pacote publicado — só 1 CSS, mas ainda presente).
