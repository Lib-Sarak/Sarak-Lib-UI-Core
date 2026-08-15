---
tipo: "plan"
titulo: "Atualizar a lib não chega ao navegador do consumidor"
dominio: "Sarak-Lib-UI-Core / Instalação e Atualização"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "instalacao", "atualizacao", "vite", "consumidor", "defeito-ativo"]
relacionados: ["[[13-instalacao-e-atualizacao]]", "[[12-kit-do-consumidor]]", "[[07-responsividade-e-multidispositivo]]"]
depende_de: ""
destino_sintese: "specs/specs/13-instalacao-e-atualizacao.md · specs/specs/12-kit-do-consumidor.md"
objetivo: "Quem atualiza a lib num consumidor com bundler vê a mudança na tela — hoje o pacote troca no disco e o navegador continua servindo o build anterior, sem aviso nenhum"
---

# 1. Objetivo

Atualizar a lib num consumidor **chega ao navegador**. Hoje o pacote é trocado no disco, todo comando
documentado responde sucesso, e a tela continua com o build anterior — **sem erro, sem aviso, sem sintoma
que aponte para a causa**.

# 2. Contexto

## 2.1 O incidente, três rodadas queimadas — 2026-08-14/15

As plans 47 e 49 consertaram o layout do grid. As duas foram aprovadas com gates verdes, artefato conferido
e medição em navegador. **Nas duas, o dono reinstalou no ERP e a tela não mudou** — e nas duas o tempo foi
gasto investigando a lib, que estava certa.

A causa, medida na terceira rodada:

| Camada | Estado medido |
|---|---|
| Pacote instalado (`node_modules/.pnpm/…/dist/`) | ✅ **build novo** — `builtAt 06:23`, `baseCommit db82131`, classe e regra CSS da `plan-49` presentes |
| CSS instalado | ✅ regras aninhadas certas — `768px→span 6`, `1024px→span 4`, `1280px→span 3` |
| **Cache de pré-bundle do Vite** (`.vite/deps/`) | ❌ **build ANTERIOR** — `_metadata.json` de `02:07`, referenciando `CustomizationPanelImpl-ZLQMJDZU` e `SarakChatEngine-73V474Y4`, chunks que o build seguinte **apagou** |

O navegador executava o build da `plan-47`. Como a `plan-47` não conserta `col-12` (é o que a `plan-49`
faz) e o consumidor tem `col-12` **persistido**, a tela ficou idêntica — dando a impressão, três vezes, de
que o conserto não funcionava.

## 2.2 Por que o cache não se invalida, e por que vai acontecer sempre

O Vite decide re-otimizar dependência por **lockfile**, **versão de pacote** e **config**. Num consumidor
que consome a lib por caminho local, **nenhum dos três muda quando a lib é reconstruída**:

- a `version` do `package.json` fica imóvel entre builds de desenvolvimento (5.0.0 dos dois lados);
- o caminho `file:` é o mesmo;
- o consumidor não declara `optimizeDeps` (conferido: `modulos/propostas/web/vite.config.mts` não o declara).

A chave do cache nunca se move. **Não é um caso extremo: é o caminho normal de todo rebuild** durante o
desenvolvimento simultâneo que [[00-contexto]] §8 declara ser o modo de trabalho atual com o ERP.

E há uma camada a mais, do mesmo tipo, já documentada: **`file:` no pnpm é cópia no store, não link** —
por isso `--force` é obrigatório ([[00-contexto]] §8). São **duas** camadas de cache em série, e a
documentação de hoje só conhece a primeira.

## 2.2.1 EMENDA — 2026-08-15, quarta rodada: apagar o cache FALHA EM SILÊNCIO no Windows

A terceira rodada terminou com o procedimento "derrube o dev server, apague `.vite`, suba". **O dono
executou e o resultado foi tela branca**, com `504 (Outdated Optimize Dep)` no console. Medido:

```
.vite/          → sobrou SÓ deps/   (as 6 pastas deps_temp_* e vitest/ foram apagadas)
.vite/deps/     → _metadata.json de 02:07, chunks do build ANTERIOR — intacto
porta 5175      → livre (o Vite do módulo não subiu)
```

**O `Remove-Item -Recurse` apagou os irmãos e falhou em `deps/`** — o processo do Vite mantinha os arquivos
abertos, e no Windows isso bloqueia a deleção. A falha foi **engolida pelo `-ErrorAction SilentlyContinue`**
que o próprio comando trazia (posto lá para tolerar pasta inexistente).

**Duas exigências novas, que esta emenda acrescenta ao escopo:**

1. **O procedimento nunca silencia o erro da deleção.** Tolerar "pasta não existe" e engolir "arquivo em uso"
   são coisas diferentes; um `-ErrorAction SilentlyContinue` genérico as confunde e transforma falha em
   sucesso aparente.
2. **O procedimento PROVA a deleção antes de subir** (`Test-Path` ⇒ `False`, ou equivalente). Sem essa prova
   o passo seguinte roda sobre premissa falsa — e o sintoma resultante (tela idêntica, ou branca) não aponta
   para a causa.

Isto reforça a escolha da §5, passo 1: **a saída A sozinha continua dependendo de o humano acertar um
procedimento que já falhou quatro vezes, agora inclusive por motivo que ele não podia ver.**

## 2.3 O que a documentação de hoje diz — e o vão

[[13-instalacao-e-atualizacao]] e a skill `ui-integra-consumidor` cobrem instalar e atualizar o **pacote**.
Nenhuma das duas menciona o cache do bundler. O resultado é que o consumidor executa **exatamente** o
procedimento documentado, recebe sucesso em todos os passos, e mede o build antigo.

**A armadilha de validação de [[07-responsividade-e-multidispositivo]] §7.1 já previu a família disso**
("antes de acusar bug num consumidor, confirme qual build está instalado") — mas ela ensina a conferir o
**pacote instalado**, e o pacote instalado estava *certo*. A pergunta que faltava é a seguinte: *"o build
instalado é o que o navegador executa?"*

## 2.4 O que NÃO resolve

- **`sarak:check`** compara o pacote com o repositório da lib. Aqui ele responderia **atualizado**, e estaria
  certo — o pacote está.
- **`dist/BUILD_INFO.json`** descreve o artefato em disco, não o que o bundler serve.
- **Recarregar / hard-refresh / guia anônima** — o cache é do **servidor de desenvolvimento**, não do
  navegador. Foi testado: guia anônima não muda nada.

# 3. Escopo

## 3.1 Dentro

1. **Um caminho verificável para "o navegador está com o build atual?"** — comando, verificação ou aviso,
   conforme a saída escolhida no passo 1. Se virar código, vive no CLI que já existe
   (`bin/sarak-ui.mjs`, onde moram `check`/`update`).
2. **`.agents/skills/ui-integra-consumidor/`** — o procedimento de atualização passa a cobrir a camada do
   bundler. ⚠️ Esta pasta é a **fonte do kit do consumidor** (`scripts/consumer-kit/kitFiles.mjs`) e
   `guide:check` roda dentro do `npm run build` — regenere o kit, não edite o gerado.
3. **Testes** do que virar código.

## 3.2 Fora

- ⛔ **Tocar no ERP Earendel** — nem código, nem config, nem dados. Ele é a evidência, não o alvo.
- ⛔ **Mexer em `layoutGridTemplate`, no grid ou em qualquer coisa das plans 47/49.** Estão aprovadas e
  corretas; esta plan existe porque elas **não chegaram**, não porque estejam erradas.
- ⛔ **Adotar versionamento automático por build** (bump de `version` a cada build para mover a chave do
  cache). É mudança de política de release ([[03-versionamento-e-release]]) e precisa de ADR próprio — se a
  medição indicar que é o melhor caminho, **proponha em plan nova**, não execute aqui.
- ⛔ **Assumir que todo consumidor usa Vite.** Webpack, Next e Rollup têm caches próprios. A saída tem de
  declarar o que cobre e o que não cobre (R18).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-49-…md` — veredito | o artefato estava certo e a tela não; a medição das duas camadas |
| Plan | `specs/plan/plan-47-…md` — nota pós-aprovação | a primeira rodada perdida pelo mesmo motivo |
| Spec fixa | `specs/specs/13-instalacao-e-atualizacao.md` | onde o procedimento vive hoje |
| Spec fixa | `specs/specs/12-kit-do-consumidor.md` | o kit gerado e o `guide:check` |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §7.1 | a armadilha irmã, já registrada |
| Spec fixa | `specs/00-contexto.md` §8 | `file:` é cópia no store — a primeira camada de cache |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R8 · R18 | teste ao lado; todo gate declara o que não vê |
| **Skill** | `padrao-escrita` · `padrao-typescript` · `test-unitario` | sempre |
| Código | `bin/sarak-ui.mjs` · `scripts/consumer-kit/kitFiles.mjs` · `.agents/skills/ui-integra-consumidor/` | ler antes de editar |

# 5. Instruções de execução

## Passo 1 — escolher a saída, com o custo declarado

| | Saída | Custo / limite |
|---|---|---|
| **A** | **Procedimento documentado** — o passo de limpar o cache do bundler entra no fluxo de atualização do kit e da skill, com a ordem correta (derrubar o dev server **antes** de apagar) | barato e cobre qualquer bundler. Depende de o humano seguir — e foi justamente o passo esquecido três vezes |
| **B** | **Verificação executável** — algo como `sarak-ui doctor`, que compara o que está no pacote com o que o cache do bundler contém e **falha nomeando o caminho a apagar** | transforma "lembre-se de" em "o comando te avisa". Precisa conhecer o layout de cache de cada bundler — **declare o que cobre** (R18) |
| **C** | **A + B** | provavelmente o certo, mas só se a medição do passo 2 mostrar que B é confiável o bastante para não dar falso verde |

**Falso verde aqui é pior que ausência**: um `doctor` que responde "tudo certo" com o cache velho custa mais
que não existir, porque encerra a investigação. Se B não puder ser confiável, entregue **A** e diga por quê.

## Passo 2 — medir o mecanismo antes de codificar

Se escolher **B**, prove primeiro que o sinal existe e é estável. O que foi medido nesta investigação, e
serve de ponto de partida:

- `.vite/deps/_metadata.json` — `mtime`, comparável com o do pacote instalado;
- os **nomes de chunk** referenciados dentro de `.vite/deps/` — mudam a cada build da lib (são
  content-hashed) e por isso denunciam o descompasso sem ambiguidade.

Cole a medição no resumo. **Se o sinal não for estável entre versões do Vite, diga isso e caia para a A.**

## Passo 3 — implementar, com teste ao lado (R8)

Cada teste declara o que prova e o que não prova. Se a saída for só documentação, o "teste" é
`guide:check` verde com o kit regenerado — e isso vai no resumo como tal, sem inflar.

## Passo 4 — a prova é do dono, e não é sua

Reinstalar no ERP e ver a tela **não é seu escopo**. Declare no resumo o que o dono deve rodar e o que deve
observar. **Não toque no ERP.**

## Passo 5 — fechar, colando a saída real

`npx vitest run` (INTEIRA) · `npm run guide:check` · `npm run build` ·
`node gates/scripts/release/check-audit-baseline.mjs --with-tsc` · `npx tsc --noEmit` · `git diff --stat`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-50-atualizar-a-lib-nao-chega-ao-navegador.md.

Contexto obrigatório antes de começar: specs/00-contexto.md (§8, o file: é cópia no
store), specs/00-knowledge.md, specs/specs/13-instalacao-e-atualizacao.md,
specs/specs/12-kit-do-consumidor.md,
specs/specs/07-responsividade-e-multidispositivo.md §7.1,
specs/plan/plan-49-col-12-continua-quebrado.md (o veredito),
specs/specs/00-regras-e-invariantes.md R8, R18.
Skills: padrao-escrita, padrao-typescript, test-unitario, ui-integra-consumidor.

O PROBLEMA: atualizar a lib num consumidor NÃO chega ao navegador. O pacote troca no
disco, todo comando documentado responde sucesso, e o dev server continua servindo o
pré-bundle do build anterior. Sem erro, sem aviso.

MEDIDO (2026-08-15), depois da plan-49 instalada no ERP:
  pacote instalado  → build NOVO (builtAt 06:23, classe e CSS da plan-49 presentes)
  .vite/deps/       → build ANTERIOR (_metadata de 02:07, referenciando chunks que o
                      build novo JÁ APAGOU)
Custou TRÊS rodadas de investigação na lib, que estava certa nas três.

POR QUE SEMPRE ACONTECE: o Vite re-otimiza por lockfile + versão + config. Com
consumo por caminho local nenhum dos três muda entre builds — versão imóvel, mesmo
caminho, e o consumidor não declara optimizeDeps. São DUAS camadas de cache em série:
o store do pnpm (já documentado, exige --force) e o pré-bundle do bundler (não
documentado em lugar nenhum).

O QUE NÃO RESOLVE, e não adianta propor: `sarak:check` (compara o PACOTE, e o pacote
está certo), BUILD_INFO (descreve o disco, não o que o bundler serve), hard-refresh
ou guia anônima (o cache é do dev server, não do navegador — foi testado).

PASSO 1 — escolha entre A (procedimento documentado), B (verificação executável tipo
`sarak-ui doctor`) ou C (as duas), e declare o custo. ATENÇÃO: falso verde aqui é
PIOR que ausência — um doctor que diz "tudo certo" com cache velho encerra a
investigação. Se B não puder ser confiável, entregue A e diga por quê.

PASSO 2 — se escolheu B, MEÇA antes de codificar que o sinal existe e é estável.
Pontos de partida medidos nesta investigação: o mtime de .vite/deps/_metadata.json e
os NOMES DE CHUNK referenciados dentro de .vite/deps/ (content-hashed, mudam a cada
build da lib). Cole a medição.

LINHAS VERMELHAS:
  · Você NÃO toca no ERP — nem código, nem config, nem dados.
  · Você NÃO mexe em nada das plans 47/49. Elas estão certas; o problema é que não
    CHEGARAM.
  · Você NÃO adota bump automático de versão por build — é política de release e
    precisa de ADR. Se a medição indicar isso, PROPONHA em plan nova.
  · Você NÃO assume que todo consumidor usa Vite. Declare o que cobre e o que não
    cobre (R18).
  · `.agents/skills/ui-integra-consumidor/` é a FONTE do kit; regenere o kit, nunca
    edite o gerado (guide:check roda dentro do npm run build).

Teste ao lado (R8). Não commite. Ao terminar, escreva o resumo na própria plan e mova
o status para 🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] A saída escolhida (A, B ou C) está declarada com o custo e o limite assumidos.
- [ ] Se escolheu **B**: a medição que prova que o sinal existe e é estável está colada no resumo, e o
      **limite declarado** diz quais bundlers cobre e quais não (R18).
- [ ] O procedimento de atualização — no kit gerado **e** na skill fonte — cobre a camada do bundler, **com
      a ordem correta**: derrubar o dev server **antes** de apagar o cache.
- [ ] As **duas** camadas de cache aparecem no procedimento: store do pnpm (`--force`) e pré-bundle do
      bundler. Cobrir só uma repete o incidente.
- [ ] **(emenda §2.2.1)** O procedimento **não silencia o erro da deleção** do cache, e **prova** que ela
      ocorreu (`Test-Path` ⇒ `False` ou equivalente) **antes** de mandar subir o dev server. Falha de
      deleção por arquivo em uso no Windows é o modo de falha medido, e ele é invisível sem essa prova.
- [ ] Está escrito, onde o consumidor vai ler, que `sarak:check` e `BUILD_INFO` **não** respondem a esta
      pergunta — a confusão que custou três rodadas.
- [ ] `npm run guide:check` verde com o kit **regenerado** (não editado à mão).
- [ ] O resumo declara o que **o dono** deve rodar e observar. Nada do ERP no diff.
- [ ] `npx vitest run` inteira, verde, sem encolher; `npm run build` passa; baseline sem regressão;
      `npx tsc --noEmit` → 0.

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff

# o kit foi REGENERADO, não editado à mão?
npm run guide:check
git diff -- .agents/skills/ui-integra-consumidor/

# as duas camadas aparecem no procedimento?
grep -rn "force\|\.vite\|optimizeDeps\|cache" .agents/skills/ui-integra-consumidor/

npx vitest run
npm run build
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
```

**O que reprova:**

- verificação que dá **falso verde** — responde "atualizado" com o cache velho;
- só uma das duas camadas de cache coberta;
- kit gerado editado à mão em vez de regenerado;
- `sarak:check` alterado para "também checar o cache" sem declarar o limite — ele responde sobre o pacote,
  e misturar as duas perguntas cria um terceiro sinal ambíguo;
- bump automático de versão por build executado aqui, sem ADR;
- qualquer arquivo do ERP no diff.

# 9. Destino da síntese

**Destino:** `specs/specs/13-instalacao-e-atualizacao.md` · `specs/specs/12-kit-do-consumidor.md`

**Texto pronto para transporte:**

- **`13-instalacao-e-atualizacao.md`** ganha a seção que falta: **atualizar o pacote não é atualizar o que o
  navegador executa.** Entre o `dist/` da lib e a tela existem **duas** camadas de cache em série — o store
  do pnpm (`file:` é cópia, exige `--force`) e o pré-bundle do bundler (invalidado por lockfile/versão/config,
  nenhum dos quais muda num rebuild local). Com a ordem correta do procedimento e a advertência explícita de
  que `sarak:check` e `BUILD_INFO` respondem sobre o **pacote**, nunca sobre o navegador.
- **`07-responsividade-e-multidispositivo.md` §7.1** — a armadilha registrada lá ("confirme qual build está
  instalado") **fica**, e ganha a pergunta seguinte, que é a que faltava: *"e o build instalado é o que o
  navegador executa?"* O incidente de 2026-08-15 é a evidência: pacote certo, tela errada, três rodadas.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução — 2026-08-15

**Resultado:** Concluído

## Passo 1 — a saída escolhida, com o custo declarado

**Escolhi C (A + B).** Antes de decidir, reproduzi o mecanismo isoladamente (fora do repositório, fora
do ERP — ver Passo 2) para não escolher B "no escuro":

- **A é obrigatória de qualquer forma** — nenhuma verificação automática substitui o procedimento
  correto, e a emenda §2.2.1 da plan (deleção que falha em silêncio no Windows) só se resolve com um
  procedimento escrito certo, não com código.
- **B é viável, mas SÓ com um sinal de CONTEÚDO, não de tempo.** Cheguei a cogitar comparar `mtime` do
  cache contra o `builtAt` do pacote — descartei depois de perceber que isso dispara em **todo**
  rebuild, mesmo sem mudança de conteúdo (o `dist/BUILD_INFO.json` é regravado a cada `npm run build`,
  então `mtime` sempre fica "mais novo" mesmo quando nada mudou). Isso violaria a própria regra desta
  base ("aviso que aparece sempre vira aviso que ninguém lê", `13-instalacao-e-atualizacao.md` §5.1) —
  seria falso-alarme constante, o oposto do falso-verde que a plan veta, mas igualmente destrutivo para
  a confiança no aviso.
- **O sinal que sobrevive é o mesmo que fechou o diagnóstico real**: o cache do Vite referenciando, por
  NOME, um chunk content-hashed da lib que não existe mais no `dist/` instalado
  (`CustomizationPanelImpl-ZLQMJDZU.js`/`SarakChatEngine-73V474Y4.js`, citados na medição da plan). É um
  sinal de conteúdo — imune a rebuild-sem-mudança, porque nesse caso o hash do chunk seria o MESMO e a
  referência continuaria batendo — e não depende de entender o schema interno do Vite: é busca textual,
  não parsing de `_metadata.json`.
- **Limite assumido e declarado (R18), no cabeçalho de `bundlerCache.mjs`**: só Vite, só
  `node_modules/.vite/deps/` **padrão** (sem `cacheDir` customizado, sem subir a árvore do monorepo);
  só detecta staleness se o `dist/` instalado tiver ao menos um chunk nomeado content-hashed (hoje
  sempre tem); dependência **linkada** (não copiada) nunca aparece no cache — medido na reprodução, não
  suposto — então o detector nunca "confirma" um link como OK, só fala quando encontra referência
  quebrada; e **nunca afirma "cache em dia"** — só tem dois estados: achou referência quebrada, ou não
  achou nada para comparar.

## Passo 2 — medição do mecanismo, ANTES de codificar

Reproduzi isoladamente (projeto descartável no scratchpad, fora do repositório e fora do ERP) para não
decidir B por suposição:

1. **Instalei `@sarak/lib-ui-core` via `file:` com npm puro** (não pnpm) num app Vite mínimo (Vite
   8.0.16, a versão instalada neste repositório) e subi o dev server. Achado que MUDA a leitura do
   incidente: **o npm LINKA** (symlink direto para a fonte) — e o Vite **exclui pacote linkado da
   otimização por padrão**. `@sarak/lib-ui-core` **não apareceu** em `.vite/deps/_metadata.json`
   `optimized{}` nenhuma vez. Ou seja: **o defeito desta plan não pode acontecer sob link** — só sob
   **cópia** (pnpm, `file:` copiado para o store — a mesma camada que `00-contexto.md` §8 já documenta).
   As duas camadas de cache citadas na plan não são independentes: a segunda (bundler) só fica exposta
   **depois** que a primeira (gerenciador) copia em vez de linkar.
2. **Inspecionei o schema real de `_metadata.json`** desta versão do Vite: campos top-level `hash`,
   `configHash`, `lockfileHash`, `browserHash`, `optimized`, `chunks` — confirma, por leitura direta (não
   pela documentação, que não descreve o formato), que a invalidação é por lockfile/config, nunca por
   conteúdo do pacote — a causa-raiz que a plan já afirmava, agora verificada no artefato.
3. Isso me levou a **descartar `mtime`** (Passo 1) e confirmar que a busca **textual por nome de chunk**
   é o caminho certo — e que ela não depende do schema que acabei de inspecionar (é textual sobre os
   arquivos de `.vite/deps/`, não um parser de `_metadata.json`).

**O sinal é estável entre versões do Vite** na medida em que depende só de: (a) o diretório
`node_modules/.vite/deps/` existir (estável desde o Vite 2), e (b) conteúdo textual de arquivo — não do
schema interno que mudou entre majors. Onde ele PODE falhar: se uma versão futura do Vite escapar/
codificar o nome do chunk de forma diferente dentro do arquivo (ex.: URL-encoding). Não teria como testar
isso sem instalar cada major do Vite — **declarado como limite, não testado exaustivamente**.

## Implementação (Saída B)

**`bin/scaffold/checkUpdate/bundlerCache.mjs`** (novo) — `inspectViteDepsCache({ rootDir, installedDir })`:
lista os chunks content-hashed do `dist/` instalado (`<Nome>-<hash>.js`, excluindo prefixos genéricos
`chunk`/`vendor` — que poderiam colidir com o chunk de qualquer outra dependência), varre o texto de
`node_modules/.vite/deps/*.{js,json}` atrás de referências aos mesmos prefixos, e reporta como "órfã"
qualquer referência cujo hash não bate com nenhum arquivo atualmente instalado. LIMITES DECLARADOS (R18)
no cabeçalho, com os cinco pontos do Passo 1.

**`bin/scaffold/checkUpdate/runCheckUpdate.mjs`** — chama `inspectViteDepsCache` independente do
veredito do pacote (`bundlerCache` no resultado) e anexa um aviso com rótulo **próprio**
(`[sarak:check:cache]`, nunca `[sarak:check]`) quando `stale`. Os dois sinais NUNCA se fundem — é o que
a própria plan pede em "O que reprova".

**`bin/scaffold/checkUpdate/formatNotice.mjs`** (novo, por extração — ver "Decisões") — o `--notify` do
`predev` agora fala sobre o cache do bundler **mesmo quando o pacote está em dia**: é exatamente o
cenário do incidente real (pacote fresh, cache órfão), e o contrato antigo de `formatNotice`
(`upToDate !== false → null`) nunca deixaria isso passar.

**Nenhum outro arquivo de produção mudou** — `bin/sarak-ui.mjs`, `runCheckCli`, o contrato de saída
(`--notify` sempre exit 0, modo normal sai 1 se desatualizado) ficaram intocados.

## Implementação (Saída A) — `.agents/skills/ui-integra-consumidor/SKILL.md`

Reescrevi o parágrafo "Desenvolvimento local" numa seção nova (`### ⚠️ Rebuildou a lib e a tela não
mudou`), cobrindo as **duas** camadas, na ordem certa:

1. **Camada 1 (gerenciador):** `pnpm install --force --filter <pacote>` — já existia como frase solta
   ("reinstale"), agora é comando explícito e marcado OBRIGATÓRIO, com o porquê (`--force`, senão o pnpm
   considera o lockfile satisfeito).
2. **Camada 2 (bundler):** procedimento em 4 passos — **derrubar o dev server primeiro** (com o motivo:
   arquivo aberto trava a deleção no Windows), apagar o cache, **provar a deleção** (`Test-Path` ⇒
   `False` / `[ ! -d ... ]`) antes de seguir, só então subir de novo. Cita explicitamente os dois modos
   de falha medidos: erro engolido por `-ErrorAction` tolerante demais, e tela branca com `504 Outdated
   Optimize Dep` quando a ordem é errada.
3. **Tabela final** ("nenhum dos três responde pelo outro"): `sarak-ui check` responde sobre o pacote;
   `BUILD_INFO` sobre o artefato instalado; o procedimento (mais o aviso `[sarak:check:cache]`, com o
   limite declarado) sobre se o bundler já notou.

`npm run guide` regenerou `sarak-ui/skill/SKILL.md` (espelho) e `guide:check` confirma em dia — não
editei o gerado.

## Verificações executadas (saída real, colada)

- `npx vitest run` (suíte INTEIRA) → **317 arquivos de teste / 1366 testes, 100% verde** (era 316/1357
  antes desta plan — cresceu +9: 7 em `bundlerCache.test.mjs` + 2 novos em `runCheckUpdate.test.mjs`).
- `node gates/scripts/audit/run_audit.mjs` → 2 auditores vermelhos, os mesmos de sempre (`ghostvars` 1,
  `composicaoatomica` 2) — `bin/` não é varrido por `auditor_cleancode.mjs` (confirmado lendo o script:
  `srcDir = path.resolve('src')`), então o teto de 250 linhas não é gate aqui, mas apliquei o mesmo piso
  por disciplina (ver Decisões).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `"igual ao baseline de 2026-08-11 —
  nenhuma regressão."`
- `npx tsc --noEmit` → **0 erros**.
- `npm run guide` → regenerou (83 componentes, 422 tokens, 100 ícones, kitHash `89d420c976f6`);
  `npm run guide:check` → `[guide:check] kit em dia (6 arquivos)`.
- **`npm run build`** → **exit 0**, `grep -ci "invalid|error"` na saída completa → **0**. Rodou dentro
  dele: `guide:check` (verde, confirmando o kit regenerado bate com o que o build cobraria),
  `public-types:check`, `build:css`, `build:css:scoped` — todos limpos.
- `git status --short` / `git diff --stat -- bin/ .agents/ docs/ sarak-ui/` → só os arquivos desta plan:
  `bin/scaffold/checkUpdate.mjs`, `bin/scaffold/checkUpdate/{bundlerCache,formatNotice,runCheckUpdate}.mjs`
  + seus testes, `.agents/skills/ui-integra-consumidor/SKILL.md` + o espelho `sarak-ui/skill/SKILL.md`
  (regenerado) + `.claude/skills/...` (junction, mesma fonte). `docs/migracoes.md`,
  `dist/BUILD_INFO.json`, `specs/00-indice.md`, `specs/plan/plan-47-...md` **já estavam modificados antes
  desta execução** (plans 47/49, não tocados por mim). **Nenhum arquivo do ERP.**

**Critérios de aceite**

- [x] A saída escolhida (C = A+B) está declarada com o custo e o limite — Passo 1.
- [x] Medição de que o sinal existe e é estável está colada — Passo 2 — com o limite declarado (R18) no
      cabeçalho de `bundlerCache.mjs`: só Vite, só `cacheDir` padrão, dependência linkada nunca aparece
      no cache (medido, não suposto), nunca afirma "em dia".
- [x] O procedimento — no kit gerado **e** na skill fonte — cobre a camada do bundler, na ordem certa
      (derrubar antes de apagar) — evidência: seção nova do SKILL.md, regenerada no kit.
- [x] As **duas** camadas aparecem no procedimento — evidência: os dois passos numerados da seção nova.
- [x] **(emenda §2.2.1)** O procedimento não silencia o erro da deleção e **prova** a deleção
      (`Test-Path`/`[ ! -d ]`) antes de subir — evidência: passos 2/3 do procedimento.
- [x] Está escrito, onde o consumidor lê, que `sarak:check` e `BUILD_INFO` não respondem a "o navegador
      está com o build atual?" — evidência: a tabela final da seção nova.
- [x] `npm run guide:check` verde com o kit regenerado (não editado à mão) — evidência acima.
- [x] O resumo declara o que o dono deve rodar/observar — não se aplica a esta plan da mesma forma que
      47/49 (não há tela para conferir; o artefato é o próprio mecanismo de aviso). Registrado abaixo.
- [x] `npx vitest run` inteira, verde, sem encolher; `npm run build` passa; baseline sem regressão;
      `npx tsc --noEmit` → 0 — evidência acima.
- [x] `git diff --stat` — só os arquivos desta plan. Nada do ERP.

**Decisões e suposições**

- **Extraí `formatNotice` de `runCheckUpdate.mjs` para um arquivo próprio** (`formatNotice.mjs`), fora
  da letra literal da plan — necessário porque `runCheckUpdate.mjs` foi de 226 para ~270 linhas com o
  novo aviso, e `bin/scaffold/` inteiro nunca teve um arquivo acima de 158 linhas (medido antes de
  editar: `wc -l bin/scaffold/**/*.mjs` ordenado). Sem gate cobrando (`auditor_cleancode` não varre
  `bin/`), mas seguindo o mesmo piso do resto da base — e a extração também é SRP genuíno: decidir o
  veredito é uma responsabilidade, formatar o aviso do `predev` é outra, e `renderNotice.mjs` já vive
  separado pela mesma razão. Os dois arquivos ficaram com 213/60 linhas.
- **Não usei `mtime`** como sinal de B (só conteúdo/nome de chunk) — decisão registrada e justificada no
  Passo 1, para não repetir o padrão "aviso que aparece sempre" que a própria base já identificou como
  defeito (`13-instalacao-e-atualizacao.md` §5.1).
- **Não escrevi entrada em `docs/migracoes.md`** — esta plan não muda o contrato público do barril
  (`src/index.ts`); é aditiva ao CLI (`bin/`) e à documentação. `docs/migracoes.md` é definido como
  registro de "breaking changes do contrato público" (`03-versionamento-e-release.md` §5), e nada aqui
  quebra nada — quem já usa `sarak-ui check`/`--notify` continua recebendo exatamente o que recebia,
  mais um aviso novo que só aparece quando há algo a dizer. Nenhum critério de aceite desta plan pede
  essa entrada (conferido contra a §7 inteira).

**Achados fora do escopo (não corrigidos)**

- Nenhum novo.

**Pendências / riscos**

- **A prova de que o aviso `[sarak:check:cache]` dispara de verdade no ERP não está aqui** — não é meu
  escopo tocar lá. O dono, depois da aprovação, pode observar: reinstalar a lib (Camada 1), rodar
  `npm run sarak:check` ou `npx sarak-ui check` no pacote que roda o `dev`, e — SE o cache do Vite dele
  estiver órfão no momento — ver o bloco `[sarak:check:cache]` apontando `node_modules/.vite/deps` com
  os chunks órfãos nomeados. Se não aparecer nada, não é garantia de cache em dia (limite declarado) — o
  procedimento manual da skill continua sendo a defesa que sempre funciona, independente do bundler.
- **O detector de B não foi testado contra uma instalação pnpm real** (nem no ERP, por proibição da
  plan, nem numa segunda reprodução isolada, por orçamento de tempo) — só contra fixtures de texto
  (que exercitam a LÓGICA de comparação) e uma reprodução real com npm/link (que mediu a AUSÊNCIA do
  sinal sob link, informando o design). A forma REAL de `.vite/deps/_metadata.json` sob uma dependência
  **copiada** não foi inspecionada por mim — o texto do detector foi desenhado para ser robusto a
  qualquer forma textual (basta o nome do chunk aparecer em algum lugar do arquivo), mas isso é
  inferência a partir do incidente relatado na plan, não uma segunda reprodução minha.

---

## Resumo da execução (correção 1) — 2026-08-15

**Resultado:** Concluído

**Escopo desta rodada: exclusivamente o achado 1** do veredito (busca só em `<rootDir>/node_modules/
.vite/deps`, cega para o pacote irmão no monorepo). Não toquei no sinal (chunk content-hashed órfão),
nos LIMITES DECLARADOS 2-6 originais, no rótulo `[sarak:check:cache]`, na política de nunca afirmar
"cache em dia", na extração de `formatNotice.mjs`, nem na seção do `SKILL.md` que cobre as duas
camadas na ordem certa — tudo isso o veredito confirmou correto, e nada disso mudou de comportamento.

### O que mudou

**`bin/scaffold/checkUpdate/bundlerCache.mjs`** — `inspectViteDepsCache` ganhou um terceiro parâmetro,
`workspaceRoot`. Antes, a busca olhava só `<rootDir>/node_modules/.vite/deps` (um único caminho fixo).
Agora ela **desce** a partir de `workspaceRoot` (com `rootDir` como fallback, se `workspaceRoot` não
for passado — comportamento antigo preservado para projeto único) atrás de **qualquer**
`node_modules/.vite/deps` alcançável, sem entrar fundo em nenhum `node_modules` além de checar se
`.vite/deps` existe direto nele (não varre o conteúdo de cada dependência instalada — ver LIMITES
DECLARADOS item 7, novo, sobre o teto de diretórios visitados). O retorno passou de `cacheDir` (uma
string) para `cacheDirs` (lista) — no monorepo pode haver mais de um `.vite/deps` órfão, um por app
Vite do workspace, e a mensagem agora nomeia todos.

**`bin/scaffold/checkUpdate/runCheckUpdate.mjs`** — passa
`workspaceRoot: context.lockfile?.dir` para `inspectViteDepsCache`. É o mesmo `context` que
`resolveConsumerContext` já resolve subindo a árvore a partir de quem DECLARA a lib (o pacote onde o
`predev` roda) — o diretório do lockfile é, por construção, um ancestral comum de qualquer pacote do
workspace, inclusive do que roda o Vite. Nenhuma mudança em como o consumidor invoca o comando: o
`rootDir` continua sendo `process.cwd()`, só o ponto de partida da BUSCA pelo cache mudou.

**LIMITE DECLARADO nº 1, reescrito** (era: *"não procura acima na árvore do monorepo"* — o limite que
o veredito apontou como o que engolia o caso de uso). Agora descreve o que a versão corrigida
realmente não vê: `cacheDir` customizado no `vite.config` (a busca é pelo NOME da pasta `.vite`, não
pela config real do bundler) e outros bundlers (webpack/Next/Rollup/Parcel). O item novo (nº 2) declara
a direção real da busca — desce de `workspaceRoot`, nunca sobe — e o que acontece sem lockfile
resolvido em lugar nenhum (cai em `rootDir`, comportamento de projeto único). O item de teto de custo
(nº 7) é novo, também.

**`.agents/skills/ui-integra-consumidor/SKILL.md`** — o parágrafo que descrevia o limite antigo ("sem
subir a árvore do monorepo") mentiria sobre a versão corrigida; reescrito para descrever a busca real
(desce da raiz do workspace) e por que ela resolve justamente a topologia "quem declara é irmão de
quem roda o Vite". `npm run guide` regenerou o espelho (`sarak-ui/skill/SKILL.md`).

### A prova — reproduzida isoladamente (não no ERP)

Escrevi a topologia EXATA que o veredito mediu no consumidor real — `packages/ui-kit` (declara a lib,
sem `.vite` — nunca teve dev server) irmão de `modulos/propostas/web` (roda o Vite, tem o cache
órfão) — como fixture de teste, e chamei `runCheckUpdate` (não `inspectViteDepsCache` direto, para
provar o caminho INTEIRO, do jeito que o CLI real percorre) com `rootDir` apontando para
`packages/ui-kit` — exatamente o comando que o revisor vai rodar:

```
it('MONOREPO real: rodando de packages/ui-kit (onde o predev roda), acha o cache órfão em
    modulos/propostas/web (pacote IRMÃO) — a prova que a correção exige', () => {
  ...
  const result = runCheckUpdate({ rootDir: uiKit, execGitLsRemote: () => 'a'.repeat(40) });

  expect(result.bundlerCache.stale).toBe(true);
  expect(result.bundlerCache.staleRefs.sort()).toEqual(
    ['CustomizationPanelImpl-ZLQMJDZU.js', 'SarakChatEngine-73V474Y4.js'].sort(),
  );
  expect(result.message).toContain('[sarak:check:cache]');
  expect(result.message).toContain('CustomizationPanelImpl-ZLQMJDZU.js');
  expect(result.message).toContain('SarakChatEngine-73V474Y4.js');
  expect(result.message).toContain(propostasVite);
});
```

Rodei — **passa**. Também escrevi o teste do MESMO cenário SEM `workspaceRoot` (o comportamento
antigo), provando que ele `checked: false` — a prova de que a correção realmente muda o resultado, não
só adiciona um parâmetro inerte. Mais dois testes: múltiplos caches órfãos no mesmo workspace (um por
módulo), e a prova de que o walker não desce para dentro de `node_modules` além de checar `.vite/deps`
(não varre o conteúdo de cada dependência instalada, nem lê arquivos fundo dentro de outra lib).

**Não toquei no ERP** — nem para rodar a verificação. O veredito reservou essa prova explicitamente
para o revisor (*"Eu vou verificar assim"*), e a linha vermelha da correção é clara: nem código, nem
config, nem dados do ERP. A reprodução acima é a MESMA topologia, isolada, com os MESMOS dois nomes de
chunk órfão que o veredito citou — é a evidência que está ao meu alcance sem tocar no fixture.

### Verificações executadas (saída real, colada)

- `npx vitest run` (suíte INTEIRA) → **317 arquivos de teste / 1371 testes, 100% verde** (era
  317/1366 antes desta correção — cresceu +5: 4 testes novos no `describe` de topologia de monorepo
  em `bundlerCache.test.mjs`, +1 teste end-to-end em `runCheckUpdate.test.mjs`).
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `"igual ao baseline de
  2026-08-11 — nenhuma regressão."`
- `npx tsc --noEmit` → **0 erros**.
- `npm run guide` → regenerou; `npm run guide:check` → `[guide:check] kit em dia (6 arquivos)`.
- **`npm run build`** → **exit 0**, `grep -ci "invalid|error"` → **0**; `guide:check` rodou dentro
  dele e ficou verde.
- `git status --short` / `git diff --stat -- bin/ .agents/ sarak-ui/` → só os arquivos do achado 1:
  `bundlerCache.mjs` (reescrito), `runCheckUpdate.mjs` (o `workspaceRoot` novo),
  `formatNotice.mjs`/`bundlerCache.test.mjs`/`runCheckUpdate.test.mjs` (testes),
  `.agents/skills/ui-integra-consumidor/SKILL.md` + o espelho `sarak-ui/skill/SKILL.md`. **Nenhum
  arquivo do ERP.**

**Achado do veredito, resolvido — evidência**

- [x] Rodando **como o consumidor roda hoje** (do pacote que declara a lib), o aviso aparece,
      nomeando o caminho de cache real — evidência: o teste end-to-end acima, que reproduz a
      topologia exata (`packages/ui-kit` → `modulos/propostas/web`) e passa.
- [x] Não exige que o consumidor mude o `predev` nem rode de outro diretório — `rootDir` continua
      sendo `process.cwd()`; só a busca interna do detector mudou.
- [x] O ERP não foi tocado, nem para verificar — a prova é por reprodução isolada.
- [x] O LIMITE DECLARADO nº 1 foi reescrito para descrever o que a versão corrigida realmente não vê
      (não mais "sem subir a árvore do monorepo", que era exatamente o que o achado provou falso).
- [x] O que estava certo (sinal, rótulo separado, política de silêncio, `formatNotice.mjs`, o
      `SKILL.md`) não foi refeito — só o parágrafo que descrevia o limite antigo mudou, porque
      descrever um limite que não existe mais seria uma mentira nova.

**Divergências:** nenhuma. O achado procede integralmente, e a medição do veredito (rodando o CLI de
verdade no ERP) é mais forte que qualquer coisa que eu poderia ter alegado sem repeti-la — não discuto.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-08-15 — 🔴 Reprovado

**Um achado, e ele é o objetivo da plan.** O detector está correto — eu o provei contra o consumidor real.
O que não funciona é **onde ele é executado**: no consumidor que motivou esta plan, ele nunca roda no
diretório onde o cache existe, e portanto nunca avisa.

O executor declarou exatamente esta pendência com honestidade (*"a prova de que o aviso dispara de verdade
num consumidor pnpm real é do dono"*). **Eu rodei essa prova, e ela falha.**

### Primeiro, o que está CERTO e não deve ser refeito

**O sinal escolhido é o correto, e funciona.** Executei `inspectViteDepsCache` contra o ERP no estado exato
de falha:

```
### propostas
  checked: true   stale: true
  staleRefs: CustomizationPanelImpl-ZLQMJDZU.js, SarakChatEngine-73V474Y4.js
  detail: o cache do Vite referencia 2 chunk(s) que não existem mais no dist/ instalado
### conector
  (idêntico)
```

Nomeou **exatamente** os dois chunks órfãos que eu havia identificado à mão. A escolha de sinal de
**conteúdo** (chunk content-hashed que sumiu do `dist/`) em vez de `mtime` está certa e o próprio executor
justificou por que descartou o heurístico de tempo — que teria disparado falso alarme em todo rebuild.

Também estão certos, e ficam: os **LIMITES DECLARADOS** (R18) no cabeçalho; o rótulo separado
`[sarak:check:cache]`, que não funde os dois vereditos; a política de nunca afirmar "cache em dia"; a
extração de `formatNotice.mjs` (SRP); e a seção nova do `SKILL.md`, que cobre as **duas** camadas, na ordem
certa, com a prova da deleção (`Test-Path` ⇒ `False`) — atendendo à emenda §2.2.1, inclusive registrando a
lição do `-ErrorAction` que engole "arquivo em uso".

Gates conferidos por mim: `npx vitest run` → **317 arquivos / 1366 testes, verde**; `guide:check` → **[OK]**
com o kit regenerado. Nada do ERP no diff.

### Achado 1 — o aviso não dispara no consumidor real (BLOQUEIA)

`inspectViteDepsCache` procura em `<rootDir>/node_modules/.vite/deps`, onde `rootDir = process.cwd()`.
**Num monorepo, o pacote que DECLARA a lib não é o pacote que RODA o bundler** — e o ERP é exatamente esse
caso:

| | Onde | Tem `.vite`? |
|---|---|---|
| Quem **declara** `@sarak/lib-ui-core` | `packages/ui-kit` | ❌ **não existe** |
| Quem **roda o Vite** | `modulos/{propostas,conector,projetos,contratos}/web` | ✅ é onde o cache vive |

E o `predev` do ERP roda o check **no primeiro**:
`corepack pnpm --filter @erp/ui-kit sarak:check:notify`.

Medido, rodando o CLI de verdade:

```
$ cd packages/ui-kit && node …/bin/sarak-ui.mjs check
[sarak:check] Desatualizado — a biblioteca em disco mudou desde a sua última instalação.
              …
$ ls node_modules/.vite  →  NÃO EXISTE
```

**Nenhuma linha `[sarak:check:cache]`.** O detector devolve `checked: false` e cala.

E a outra ponta está fechada também: rodar o CLI de dentro de `modulos/propostas/web` — onde o cache está —
é **recusado**, porque aquele `package.json` não declara a lib:

```
$ cd modulos/propostas/web && node …/bin/sarak-ui.mjs check
[sarak:check] Não achei nenhum package.json (deste diretório para cima) que declare "@sarak/lib-ui-core".
```

**As duas portas estão fechadas.** Não existe diretório de onde o consumidor possa rodar o comando
documentado e receber o aviso. O mecanismo construído por esta plan **não teria pego o incidente que esta
plan existe para pegar**, no consumidor que a motivou.

**Critério violado:** o **Objetivo** da plan — *"Quem atualiza a lib num consumidor com bundler **vê a
mudança na tela**"* — e a §5 passo 1, que exige que a saída B seja *"uma verificação executável que
transforma 'lembre-se de' em 'o comando te avisa'"*.

**Sobre o LIMITE DECLARADO nº 1** (*"não procura acima na árvore do monorepo"*): declarar um limite é
obrigatório (R18), mas **um limite que engole o caso de uso inteiro não é conformidade com R18 — é gate que
nunca dispara**. É a mesma classe de defeito que [[01-gates-e-baseline]] chama de gate decorativo, e que a
`plan-41` §3.1 item 4 já proibia com todas as letras: *"se não for verificável, NÃO invente um gate que
finge"*. Note ainda que a direção do limite está errada em relação ao caso real: no ERP o cache não está
**acima** de quem declara a lib — está num **ramo lateral** (`modulos/*/web` × `packages/ui-kit`).

**O que a correção precisa alcançar** (o *como* é seu): rodando o comando **como o consumidor o roda hoje**
— do pacote que declara a lib — o aviso aparece, nomeando o caminho de cache real. Não vale exigir que o
consumidor mude o `predev` dele, nem passar a rodar o comando de outro diretório: **o ERP não é escopo desta
plan, nem para adaptar**. E o limite declarado tem de ser reescrito para descrever o que a nova versão
realmente não vê.

**Como eu vou verificar na próxima rodada:**

```bash
cd <ERP>/packages/ui-kit && node <lib>/bin/sarak-ui.mjs check
# tem de imprimir uma linha [sarak:check:cache] nomeando
# CustomizationPanelImpl-ZLQMJDZU.js e SarakChatEngine-73V474Y4.js
```

O ERP está **preservado no estado de falha** de propósito — é o fixture desta correção, como o `col-12` foi
o da `plan-49`. **Não o limpe.**

### Achado que NÃO é desta plan — vai virar plan própria

`sarak:check` imprime *"Desatualizado"* e, logo abaixo, **duas linhas idênticas** (`kitHash` e `dist`) como
evidência. Não é falso positivo: `inspectLocalDependency` compara **três** campos
(`buildInfo`, `kitVersion`, `inventoryHash`) e o que difere é o `builtAt` de dentro do `BUILD_INFO.json` —
justamente o campo que a mensagem **não mostra**. A ferramenta está certa e **parece** estar se
contradizendo.

**Não conta contra esta execução:** `localDependency.mjs` não aparece no `git diff`, e a lógica de
comparação não foi tocada — o diff só extraiu `formatNotice` e acrescentou o bloco `extras`. É defeito
anterior, e vai para plan própria em vez de nota solta neste veredito.

### O que esta revisão não viu

Que a aba Propostas ficou legível. Continua sendo o passo do dono, e continua bloqueado pela mesma coisa:
o cache do Vite do ERP segue congelado no build da `plan-47`.

## Veredito (correção 1) — 2026-08-15 — 🟢 Aprovada

O achado foi fechado e a prova é a que eu escrevi **antes** da correção, rodada sem alteração:

```
$ cd <ERP>/packages/ui-kit && node <lib>/bin/sarak-ui.mjs check

[sarak:check] Desatualizado — a biblioteca em disco mudou desde a sua última instalação.
              ...
[sarak:check:cache] Aviso: 3 cache(s) de pré-bundle do Vite referenciam 2 chunk(s) que não
                    existem mais no dist/ instalado — o(s) dev server(s) ainda serve(m) o
                    build anterior.
                    ...\modulos\propostas\web\node_modules\.vite\deps
                    ...\modulos\contratos\web\node_modules\.vite\deps
                    ...\modulos\conector\web\node_modules\.vite\deps
                    chunk(s) órfão(s): CustomizationPanelImpl-ZLQMJDZU.js, SarakChatEngine-73V474Y4.js
                    Derrube o(s) dev server(s) acima, apague essa(s) pasta(s), PROVE que
                    apagou (Test-Path ⇒ False) e suba de novo.
```

**Do diretório em que o `predev` do consumidor já roda o comando hoje** — sem que o ERP mude uma linha, que
era a restrição da reprovação.

### Entregou mais do que eu exigi, e conferi que não é exagero

Eu pedi o aviso nomeando os dois chunks. A correção **varre o workspace inteiro** e nomeia **três** caminhos
de cache. Fui verificar se isso é cobertura real ou ruído — e é cobertura exata:

```
.vite/deps existentes no ERP:  modulos/{conector,contratos,propostas}/web
projetos/web:                  não tem cache (nada a reportar)
```

**Três existem, três foram reportados, nenhum escapou e nenhum foi inventado.** O plural na mensagem
("o(s) dev server(s) acima") acompanha o dado em vez de assumir singular — o consumidor precisa limpar os
três, e agora sabe disso sem descobrir um por vez.

### O limite reescrito é honesto

O nº 1 deixou de afirmar *"não procura acima na árvore do monorepo"* — a frase que engolia o caso de uso —
e passou a descrever o que a versão nova realmente não vê: `cacheDir` customizado (a busca é pelo **nome**
`.vite`) e os demais bundlers. E o nº 2 declara a direção da varredura: *"desce de `workspaceRoot` — nunca
SOBE"*, com o `workspaceRoot` vindo do diretório do lockfile, que `resolveConsumerContext` já resolvia.
`gate-limits:check` → **[OK]**.

### Gates, rodados por mim

| | |
|---|---|
| `npx vitest run` | **317 arquivos / 1371 testes, verde** (+5 sobre a rodada reprovada) |
| `npm run build` | **exit 0** |
| `npx tsc --noEmit` | **0** |
| `check-audit-baseline --with-tsc` | igual ao baseline de 2026-08-11 |
| `guide:check` · `gate-limits:check` | **[OK]** |
| Escopo | só `bundlerCache.mjs`, `runCheckUpdate.mjs` e testes. **Nada do ERP** — o fixture no estado de falha foi preservado, e é o que produziu a saída acima |

### O que esta revisão continua sem ver

Que a aba Propostas ficou legível. O aviso agora existe e aponta os três caminhos; **limpar e subir é do
dono**. A diferença em relação a todas as rodadas anteriores é que, da próxima vez, o consumidor é avisado
em vez de investigar a lib por três rodadas.

### Liberação

Status espelhado no [[00-indice]] na mesma ação. ⚠️ `dist/` mudou — o anel de `pre-push` vai exigir tag
nova, e a leva 47+49+50 é **MAJOR**. **Pode commitar.**
