# Relatório de Instalação — Sarak-UI (@sarak/lib-ui-core) no ERP Iarendel

Teste de instalação "do zero", como um desenvolvedor externo com acesso apenas ao pacote publicado no
GitHub, ao ERP (que não tinha frontend algum) e às skills/catálogo que a própria lib instala. Nenhum
arquivo de `node_modules/@sarak/lib-ui-core` ou do repositório-fonte da lib foi lido para aprender a
usá-la — apenas skills, `docs/manifest-catalog.md`, mensagens de erro/warn e o comportamento observado em
runtime (curl + navegador real via Playwright).

---

## 1. Ambiente e tempo total

- **SO:** Windows 11 Pro 10.0.26200
- **Node:** v24.10.0
- **npm:** 11.6.1
- **Diretório do consumidor:** `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\ERP` (Python/Supabase, zero tooling de frontend antes deste teste)
- **Tempo total:** a sessão teve uma interrupção real no meio (erro de limite de API) entre a instalação da
  dependência e a execução do `init`, então o intervalo bruto de timestamps (~00:14 → ~11:18) não reflete
  trabalho contínuo. O trabalho efetivo — instalação, scaffolding, escrita do manifesto, validação via
  browser real e build — ficou na faixa de **2 a 3 horas** de execução ativa de comandos.

---

## 2. Passo a passo executado (comandos reais, na ordem)

```bash
node --version && npm --version                       # v24.10.0 / 11.6.1
cd ".../Earendel/ERP"

npm install github:Lib-Sarak/Sarak-Lib-UI-Core         # PROBLEMA 1 — ver seção 4 (instalou no HOME, não no ERP)
# --- diagnóstico e correção manual do PROBLEMA 1 ---
cd "C:\Users\Igor" && rm -rf node_modules package-lock.json   # reverte a poluição
# editei C:\Users\Igor\package.json de volta ao estado original (removi a entrada @sarak injetada)

cd ".../Earendel/ERP"
npm init -y                                            # cria o package.json que faltava no consumidor
npm install github:Lib-Sarak/Sarak-Lib-UI-Core         # agora instala corretamente no ERP

npx @sarak/lib-ui-core init --help                     # PROBLEMA 2 — não existe --help; caiu direto na entrevista interativa
# (para abortar, pipe de linhas vazias — sem TTY real, a entrevista trava/aborta sem gerar nada, ver seção 4)
npx @sarak/lib-ui-core --help                          # por acaso revelou a "Uso:" com as flags reais
npx @sarak/lib-ui-core init --yes                      # Golden Path: Modo=app Stack=vite-express Storage=sqlite → 12 arquivos escritos

npm run dev                                            # PROBLEMA 3 — 'concurrently' não reconhecido (faltava `npm install`)
npm install                                            # instala as deps/devDeps que o init acrescentou ao package.json
npm run dev                                            # agora sobe backend (3000) e frontend (5173) limpos

# validação via curl
curl http://localhost:3000/api/v1/hello
curl http://localhost:3000/api/v1/propostas
curl -X POST http://localhost:3000/api/v1/propostas -d '{...}'

# validação via navegador real (Chromium via Playwright, instalado isolado — não no consumidor)
node probe*.mjs   # navegação, preenchimento de formulário, Design Engine, reload

npm run build                                          # tsc --noEmit + vite build → verde (exit 0)
```

Editei apenas os arquivos permitidos pela regra 2: `src/manifests/app.manifest.json` (o manifesto da
aplicação) e `src/server.ts` (endpoints Express de dados de exemplo — backend, não UI). Nenhum componente
React novo foi escrito no consumidor; nenhum arquivo em `node_modules/@sarak/lib-ui-core` foi tocado.

---

## 3. O que funcionou DE PRIMEIRA, sem intervenção

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

## 4. Problemas, um a um

### Problema 1 — `npm install github:...` poluiu um projeto Node não relacionado (fora do ERP)
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

### Problema 2 — `npx @sarak/lib-ui-core init` não documenta flags e falha silenciosamente sem TTY
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

### Problema 3 — `npm run dev` falha após o `init` porque faltou `npm install`
- **Sintoma:** `'concurrently' não é reconhecido como um comando interno ou externo...`
- **Onde apareceu:** ao rodar `npm run dev` imediatamente após o `init`.
- **Bloqueou?** Bloqueou até eu perceber que o próprio `init` já tinha impresso a instrução correta:
  `"[sarak-ui init] Pronto. Rode "npm install && npm run dev"."` — eu simplesmente não tinha executado o
  `npm install` antes. Registro como problema de UX limítrofe (o `init` deveria falhar mais alto/ou rodar o
  install sozinho), mas a causa raiz da minha falha específica foi não seguir a própria instrução impressa.
- **O que fiz:** rodei `npm install` (instala as 12 dependências + 6 devDependencies que o `init` injetou no
  `package.json`) e o `npm run dev` subiu limpo (backend na porta 3000, frontend na porta 5173).

### Problema 4 — `validation` no formulário NÃO bloqueia o submit (contradiz a documentação da skill)
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

### Problema 5 — Personalização "ao vivo" da topbar exige um passo não documentado (Design Engine)
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

### Observações menores (não bloquearam, registradas por completude)
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

## 5. Avaliação das instruções

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

## 6. Contornos que teriam sido necessários (e que a regra 2 proibiu) — não aplicados

- **Nenhum.** Todos os cinco problemas acima foram contornados por meios permitidos: correção de ambiente
  (npm/package.json), uso de flags oficiais do próprio CLI, e uso da própria UI do Design Engine como ela
  pede (modal de "Salvar Novo Tema"). Não precisei escrever validação em JavaScript no consumidor, não
  precisei editar `node_modules/@sarak/lib-ui-core`, e não escrevi nenhum componente React de interface.
- A única coisa que **teria sido** um contorno proibido — e que deliberadamente **não fiz** — seria
  implementar a validação de formulário "na mão" (JS/TS no consumidor) para compensar o Problema 4. Preferi
  registrar a falha e deixar o formulário exatamente como a skill documenta, mesmo sabendo que ele aceita
  submits vazios.

---

## 7. Matriz de medição M1–M10

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

## 8. Veredito final

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
