---
tipo: "plan"
titulo: "Alinhar o ERP Earendel — o instrumento de medição da lib"
dominio: "ERP Earendel (repositório EXTERNO)"
status: "⚪ Sintetizada"
prioridade: "Alta"
tags: ["plan", "erp", "consumidor", "repositorio-externo", "workspace"]
relacionados: ["[[00-contexto]]", "[[13-instalacao-e-atualizacao]]", "[[adr/007-distribuicao-por-git]]"]
depende_de: ""
destino_sintese: "—"
---

> ⚠️ **REPOSITÓRIO DE FORA.** Esta é a única plan da fila que **não toca a biblioteca**. O alvo é
> `Earendel/ERP/`. Nada é escrito lá sem diagnóstico read-only → relatório → **"sim" do dono**.
>
> 🔄 **Plan reescrita pelo revisor em 2026-08-02**, depois do diagnóstico da rodada 1 e das decisões do dono.
> O escopo mudou de verdade: **2 itens foram fechados pela mão do dono**, **2 foram refutados pela medição** e
> **3 nasceram do próprio diagnóstico**. O registro completo do que aconteceu está na §10.1 — nada foi apagado.

# 1. Objetivo

O ERP volta a ser um **instrumento de medição confiável**: os 15 projetos do workspace são levados pelo
gerenciador (não por junction), o ERP roda a **versão corrente** da lib, e a defasagem passa a acender sozinha
em vez de esperar alguém desconfiar.

# 2. Contexto

O ERP é o **único consumidor real** — é nele que a `plan-09` vai provar que um `2.0.0` migra. A auditoria de
2026-07-30 levantou 8 defeitos; o diagnóstico de 2026-08-01 mediu cada um e o dono decidiu item a item.

**O que a rodada 1 mudou, e é o que justifica esta reescrita:**

- O dono **renomeou à mão** `Modulos/` → `modulos/` e as 3 pastas capitalizadas. O índice do git **já era**
  minúsculo (`core.ignorecase=true` mantinha a grafia antiga no working copy); as 14 specs do ERP também.
  Com isso o `pnpm ls -r` saltou de **5 para 15 projetos** — e os itens 0.2 e 0.4 fecharam juntos.
- O diagnóstico **refutou** dois itens: `conector:build` não é no-op (o turbo tem descoberta própria), e o
  "ADR 009 do ERP" não existe — aquele repositório abandonou o modelo de ADR numerado imutável.
- E encontrou o defeito que **invalida qualquer teste prático feito hoje**: o ERP roda a lib **1.1.0**
  (build de 2026-07-30, `7d224fb`) enquanto o repositório está em **1.2.0** (`d4d3c77`).

**Um instrumento que mede a versão errada é pior que instrumento nenhum** — ele produz um verde que ninguém
sabe a respeito de quê.

## 2.1 O fato operacional que governa esta plan

`"@sarak/lib-ui-core": "file:../../../../Biblioteca/Sarak-Lib-UI-Core"` **não é link para o repositório da
lib** — o pnpm **copia para o store**. O que existe no ERP é uma junction para
`.pnpm/@sarak+lib-ui-core@file+..+793d39a5…`.

**Consequência, medida:** todo rebuild da lib exige `pnpm install --force --filter @erp/ui-kit` no ERP para
chegar lá. Isso **não é defeito** — é o preço da escolha deliberada de consumir por caminho local enquanto os
dois repositórios são ajustados ao mesmo tempo. Desaparece quando o ERP migrar para `github:…#semver:^1.x`
([[adr/007-distribuicao-por-git]] · [[adr/008-releases-com-tag-e-semver-em-git]]), que é trabalho de outra
plan. **Não "consertar" aqui.**

# 3. Escopo

## 3.1 Dentro — o que esta rodada aplica

**A ordem é obrigatória.** O 0.1 vem antes do install porque o placeholder entra no lockfile; o 0.7 vem depois
porque a junction é a muleta que segura os webs até o install correto existir.

| Ordem | # | Item | Onde |
|---|---|---|---|
| 1 | **0.1** | `"name": "@erp/<modulo>-web"` e `-api` são **placeholder literal**. Antes eram inofensivos porque `_template` estava fora do workspace; **agora está dentro** e o `pnpm ls -r` já os lista com `<modulo>` no nome. `<` e `>` são inválidos em nome npm e quebram `--filter`. **Solução: excluir do glob** — `- '!modulos/_template/*'` em `packages:`. ⚠️ **Não renomear** — ver o bloco abaixo | `pnpm-workspace.yaml:5-9` |

> 🔴 **O `<modulo>` no campo `name` é marcador vivo, não lixo — e a justificativa anterior deste item estava
> factualmente errada.** Medido em 2026-08-02, na rodada 2:
>
> - `criar-modulo.mjs:66-72` roda `substituirMarcadores(conteudo, id)` no **conteúdo de todo arquivo copiado**
>   e ainda renomeia arquivo cujo **nome** contenha `<modulo>`. Gravar `@erp/template-web` faria
>   `criar-modulo propostas` produzir um pacote **chamado `@erp/template-web`** — dois módulos criados, dois
>   nomes duplicados no workspace, e `--filter @erp/propostas-web` deixando de casar. **É o defeito que o 0.1
>   existe para eliminar, reintroduzido pela porta dos fundos.**
> - A vantagem que a versão anterior alegava — *"mantém o template coberto pelo `validar-modulos`"* — **não
>   existe**: `validar-modulos.mjs:63` filtra `!nome.startsWith('_')`, então `_template` nunca foi coberto,
>   com glob ou sem.
>
> Renomear exigiria ensinar o `criar-modulo.mjs` a reescrever o `name` após a cópia — **código executável, fora
> do "Onde" declarado do item**. Excluir do glob é uma linha, não toca o scaffolder, não perde validação
> nenhuma (medida) e **mata de tabela** o `WARNING … 'modulos/_template/api' not found in lockfile` que o 0.9
> quer ver sumir. *Achado do executor, aceito pelo revisor.*
| 2 | **0.3** | `allowBuilds` com **placeholder literal** (`set this to true or false`) onde se espera booleano. ⚠️ **Confirme a chave contra o pnpm 11 real** antes de escrever: se o nome correto for outro (`onlyBuiltDependencies`), gravar `true` na chave errada **falha em silêncio** — e gate que falha em silêncio é pior que gate ausente | `pnpm-workspace.yaml:10-12` |
| 3 | **0.9** 🆕 | **Lockfile defasado.** Os 13 importers ainda gravados como `Modulos/…`; o turbo avisa `Unable to calculate transitive closures: Workspace 'modulos/contratos/web' not found in lockfile`. Some no primeiro install correto | `pnpm-lock.yaml:124-368` |
| 4 | **0.10** 🔴 🆕 | **O ERP roda a lib defasada:** instalado **1.1.0** (`7d224fb`, 2026-07-30) × repositório **1.2.0** (`d4d3c77`, 2026-08-01). O próprio `sarak:check` já diz o comando: `pnpm install --force --filter @erp/ui-kit`. **É o item que destrava o teste prático** — ver §2.1 | `packages/ui-kit/node_modules/@sarak/lib-ui-core` |
| 5 | **0.7** | **Junctions manuais como elo** — `modulos/*/web/node_modules/@erp/ui-kit` nos 4. Acoplamento **fora do gerenciador**: é o que fez a atualização chegar, e é o que um install que recrie `node_modules` apaga sem nada acusar até um build falhar. **Já são redundantes**: os 4 webs declaram `"@erp/ui-kit": "workspace:*"` e o glob agora casa. Remover **depois** dos passos 3–4, com prova | `modulos/*/web/node_modules/` |
| 6 | **0.6** | `sarak:check` **existe e nunca dispara** — `\|\| true`, e nenhum `predev` o invoca. **Pior que não existir: parece montado.** Foi assim que a defasagem do 0.10 durou seis dias sem acender. ⚠️ O `predev` da raiz já é ocupado (`matar-portas-dev.mjs`) — **encadear, não substituir**. E o modo é **`--notify`**, não o normal — ver o bloco abaixo | `packages/ui-kit/package.json:15` · `package.json:14` |

> 🔴 **O `predev` recebe `check --notify`; o modo normal é para automação.** [[13-instalacao-e-atualizacao]]
> §5.1 é o contrato desta biblioteca, e é literal: `--notify` **sai sempre 0** — *"um aviso jamais derruba o
> `dev` de ninguém"* — enquanto o modo sem flag *"é o oposto de propósito: sai com 1 se está desatualizado"*.
>
> A versão anterior deste item mandava encadear o modo **normal** sem `|| true`. Isso derrubaria o
> `npm run dev` do ERP inteiro toda vez que a lib estivesse defasada — o ponto único de falha que a própria
> plan advertia, criado pela própria plan. **Erro do revisor, apanhado pelo executor na rodada 2**
> (medido: `EXITCODE_NORMAL=1`, `EXITCODE_NOTIFY=0` com o bloco de aviso impresso).
>
> Os dois modos ficam: **`--notify` no `predev`** (silencioso em dia, nunca derruba) e o **normal, sem
> `|| true`**, disponível para automação/CI — que é onde sair 1 é a graça. O `--filter @erp/ui-kit` já entrega
> o `cwd` correto: só o `ui-kit` declara `@sarak/lib-ui-core`, e da raiz o check não acha a dependência.
>
> **Por que o ERP divergiu:** o `init` da lib liga o `predev` com `--notify` sozinho
> (`generators/packageJsonFields.mjs:62-71`). O ui-kit do ERP foi ligado **à mão**, com o modo normal — e o
> `|| true` foi a reação correta a um exit 1 que não deveria estar ali. O item conserta a causa, não o sintoma.

## 3.2 Fora

- ⛔ **Todo este repositório (a lib).** Nenhum arquivo de `Sarak-Lib-UI-Core` é tocado. `git status` nela
  permanece limpo — é critério de aceite.
- ⛔ **Migrar o `file:` para `github:#semver:`.** Decisão do dono: os dois repositórios estão sendo ajustados ao
  mesmo tempo, e o caminho local é deliberado. É trabalho de outra plan, depois.
- ⛔ **`corepack enable` / mexer no PATH da máquina.** É pré-requisito do dono (§5, passo 0), não item desta
  plan — está **fora** do repositório do ERP.
- ⛔ Os itens **0.2**, **0.4**, **0.5** e **0.8**: fechados ou refutados na rodada 1 (§10.1). Não reabra.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/13-instalacao-e-atualizacao.md` | o contrato do lado da lib e o que o `sarak:check` promete |
| ADR | `adr/007-distribuicao-por-git` · `adr/008-releases-com-tag-e-semver-em-git` | por que o alvo final é `#semver:`, e por que ainda não é hoje |
| Contexto | `00-contexto.md` §7 | as fronteiras (o agente não commita, não empurra) |
| No ERP | `specs/adr/decisoes.md` §9 | `packages/ui-kit` é o **ponto de contato único** — já verificado: zero import direto fora dele |
| No ERP | `specs/plan/plan-01-raiz-de-composicao.md` §2.1-2.2 | a plan do próprio ERP que já especificava o case e o lockfile |

# 5. Instruções de execução

> **Passo 0 — pré-requisito do dono, fora do escopo.** `pnpm` **não está no PATH** desta máquina; só responde
> por `corepack pnpm` (11.17.0). É a causa real de `pnpm run <script>` sair 1: o `runDepsStatusCheck` do
> pnpm 11 reinvoca o binário puro e não o acha. **Enquanto não houver `corepack enable`, use `corepack pnpm`
> em todo comando** — e registre no resumo que foi assim que rodou.

1. **0.1 — excluir o template do glob.** Acrescentar `- '!modulos/_template/*'` a `packages:`. **Não renomear
   nada** e **não tocar no `criar-modulo.mjs`**. Rodar `corepack pnpm ls -r` e confirmar que `<modulo>` sumiu
   da listagem e que sobraram **13 projetos** (15 − os 2 do template).
2. **0.3 — `allowBuilds`.** Chave **já confirmada na rodada 2**: é a do pnpm 11.17.0 (72 ocorrências no
   `pnpm.mjs` contra 3 do legado `onlyBuiltDependencies`), lida por `switch (value) { case true … case false }`
   — string não casa nenhum dos dois, a regra nunca se registra, e daí o `ERR_PNPM_IGNORED_BUILDS`.
   **A parada (a) não dispara.** Valores decididos: **`esbuild: true`** (o `postinstall` dele é necessário) e
   **`better-sqlite3: false`** — ver o bloco abaixo.

> 🟢 **`better-sqlite3: false` é a decisão, e o `false` precisa do motivo escrito ao lado.** A rodada 3 mediu
> que **`true` derruba o install** (`EXIT=1`): aprovar o build dispara o `node-gyp rebuild` — fallback do npm,
> porque o pacote tem `binding.gyp` e nenhum script `install` — e esta máquina não tem Windows SDK.
> Confirmado pelo revisor: o `better-sqlite3@13.0.1` traz **8 prebuilds** (`win32-x64`, `win32-arm64`,
> `linux-{x64,arm64}`, `linuxmusl-{x64,arm64}`, `darwin-{x64,arm64}`) — compilar é desnecessário em qualquer
> alvo realista. **Nada no ERP o importa** (`grep` em `src/`, `modulos/`, `adapters/`, `packages/`): ele está
> declarado só em `package.json:46` e a `plan-01-raiz-de-composicao.md` §2.5 do próprio ERP já o lista entre
> os *"restos do hub antigo"*.
>
> Os dois valores removem o `ERR_PNPM_IGNORED_BUILDS` — o que o item cobra é a **regra explicitamente
> decidida**, não o build aprovado. E `false` é o único que mantém o `install --force` verde, que é o comando
> que o `sarak:update` do consumidor usa.
>
> ⚠️ **Um `false` sem motivo ao lado é o mesmo defeito que originou este item:** um valor naquele arquivo que
> ninguém sabe explicar. O próximo leitor vê "build desabilitado" e inverte. **O comentário é obrigatório.**
> *Instrução original (`true`) era suposição minha; a medição a refutou.*
3. **0.9 — reinstalar.** `corepack pnpm install`. Confirmar que o lockfile passou a gravar `modulos/…` e que o
   `WARNING` do turbo sumiu.
4. **0.10 — atualizar a lib.** `corepack pnpm install --force --filter @erp/ui-kit`. **Critério duro:**
   `require('@sarak/lib-ui-core/package.json').version` = **1.2.0** e `sarak:check` sai **verde**.
5. **0.7 — remover as 4 junctions**, e só então. Prova exigida: os 4 webs continuam resolvendo `@erp/ui-kit`
   pelo link do workspace, e o build dos 4 passa. **Escreva no resumo como desfazer**, caso quebre.
6. **0.6 — ligar o aviso, no modo certo.** Dois scripts no `ui-kit`: o **normal sem `|| true`** (para
   automação/CI, onde sair 1 é a graça) e um de **`--notify`**. O `predev` da raiz encadeia o de `--notify`,
   preservando o `matar-portas-dev`. **As duas provas exigidas já foram feitas na rodada 2** — o check não
   escreve (zero `writeFileSync`/`mkdirSync`/`rmSync` fora de `__tests__/`) e `runCheckCli` engole exceção em
   modo notify devolvendo exit 0. **A parada (b) não dispara.** Confirme na prática que `dev` sobe **com a lib
   defasada** antes do passo 4 e **em dia** depois dele — em dia, o `--notify` não imprime linha nenhuma.
7. **Provar que funciona** — é o produto desta plan, não um extra: `turbo run build` nos 15 projetos,
   `corepack pnpm run verificar` (validar-modulos + sincronizar-env --conferir + eslint + turbo test) e subir o
   `dev` para ver as telas rodando a **1.2.0**.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-04-alinhamento-erp.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/13-instalacao-e-atualizacao.md, e a §10.1 da própria plan (o que já foi
diagnosticado e decidido — não refaça).

ATENÇÃO: o alvo é um REPOSITÓRIO EXTERNO (Earendel/ERP). Nenhum arquivo da biblioteca é
tocado, e `git status` nela tem de continuar limpo ao final.

O dono JÁ AUTORIZOU os 6 itens da §3.1, nesta ordem: 0.1 → 0.3 → 0.9 → 0.10 → 0.7 → 0.6.
Não reabra 0.2, 0.4, 0.5 e 0.8 — estão fechados ou refutados, com evidência na §10.1.

`pnpm` NÃO está no PATH: use `corepack pnpm` em todo comando e diga isso no resumo.
O `file:` copiar para o store NÃO é defeito — é deliberado enquanto os dois repos andam
juntos. Não proponha migrar para github:#semver: aqui.

As duas paradas da rodada 2 JÁ FORAM RESOLVIDAS e não disparam: `allowBuilds` é a chave certa
do pnpm 11, e o check não escreve nem trava (`--notify` sai sempre 0). Pare e pergunte só se
aparecer algo NOVO que contrarie a §3.1.

Dois nãos que o 0.1 e o 0.6 carregam, e que já custaram uma rodada:
- NÃO renomeie o `_template` nem toque no `criar-modulo.mjs` — o `<modulo>` é marcador vivo.
- NÃO encadeie o modo normal do check no `predev` — o `predev` recebe `--notify` (specs/13 §5.1).

Não commite — nem na lib, nem no ERP. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] `corepack pnpm install` sai **0**, sem `ERR_PNPM_IGNORED_BUILDS`.
- [ ] `corepack pnpm ls -r --depth -1` lista **13 projetos** (os 15 menos os 2 do `_template`, agora fora do
      glob), e **nenhum** com `<modulo>` no nome.
- [ ] `modulos/_template/{web,api}/package.json` **inalterados** — o marcador `<modulo>` intacto — e
      `scripts/criar-modulo.mjs` **não foi tocado**.
- [ ] `pnpm-lock.yaml` sem nenhum importer `Modulos/` (maiúsculo); o `WARNING` de transitive closures do turbo
      não aparece mais.
- [ ] **A lib instalada é a `1.2.0`**, e `sarak:check` sai verde — evidência: a versão lida do `package.json`
      instalado **e** a saída do check.
- [ ] Os 4 builds passam **sem** junction manual (`modulos/*/web/node_modules/@erp/ui-kit` removidos).
- [ ] `dev` dispara o aviso sozinho **em modo `--notify`**, **sem** substituir o `matar-portas-dev` — e o
      `dev` **sobe** mesmo com a lib defasada (é o teste que prova que o aviso não virou trava).
- [ ] O script normal (sem `|| true`) continua existindo para automação, e sai **1** quando defasado.
- [ ] `turbo run build` verde nos 15 · `corepack pnpm run verificar` verde · o `dev` sobe e as telas navegam.
- [ ] ⛔ `git status` **na lib** permanece limpo.
- [ ] Nada commitado, em nenhum dos dois repositórios.

# 8. Como verificar

- `corepack pnpm ls -r --depth -1` → 13 projetos, zero `<modulo>`
- `git -C <ERP> diff --stat -- modulos/_template scripts/criar-modulo.mjs` → **vazio**
- `grep -c "^  Modulos/" pnpm-lock.yaml` → **0**
- `node -e "console.log(require('./packages/ui-kit/node_modules/@sarak/lib-ui-core/package.json').version)"` → **1.2.0**
- `node packages/ui-kit/node_modules/@sarak/lib-ui-core/bin/sarak-ui.mjs check` → verde, exit 0
- `ls modulos/*/web/node_modules/@erp/` → sem junction manual; e `turbo run build` verde mesmo assim
- `grep -n "predev" package.json` → encadeado, com `matar-portas-dev` preservado e o modo **`--notify`**
- Na lib: `git status --porcelain` → vazio

# 9. Destino da síntese

**Destino:** `—`

Os itens são do repositório do ERP e não alteram verdade documentada **desta** base. Duas exceções que o
**revisor** aplica no veredito, não o executor:

1. `00-contexto.md` §8 descreve o ERP com fatos que esta execução muda (topologia, junctions, defasagem).
2. Se o `sarak:check` se mostrar frágil sem rede, isso é achado **da lib** — vira insumo da `plan-10`
   (ciclo de atualização do consumidor), não conserto aqui.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## 10.1 Rodada 1 — diagnóstico (2026-08-01) e decisões do dono

> Registro do revisor, escrito na reescrita de 2026-08-02. **Nada aqui é para refazer** — é o que evita que a
> próxima rodada repita medição já feita, e o que prova que nenhum dos 8 itens originais sumiu sem destino.

| # original | O que era | Desfecho |
|---|---|---|
| **0.1** | placeholder `<modulo>` no nome do template | **ABERTO** → §3.1, ordem 1. Mudou de gravidade: o template agora **é** membro do workspace |
| **0.2** | glob `modulos/*` × pasta `Modulos/` | **FECHADO 2026-08-02** — o dono renomeou à mão. `pnpm ls -r`: 5 → **15 projetos**. O índice do git já era minúsculo (`core.ignorecase=true`); as 14 specs do ERP também. O lockfile é que era resíduo do glob antigo → virou o item **0.9** |
| **0.3** | `allowBuilds` com placeholder | **ABERTO** → §3.1, ordem 2. Medido: é **anterior** ao commit que trocou o glob (aparece como contexto no diff de `9313ffc`) |
| **0.4** | convenção de nome mista | **FECHADO 2026-08-02**, junto com o 0.2. Não era "convenção mista": era **uma** pasta em drift no working copy do Windows, num repositório cujo índice é uniformemente minúsculo |
| **0.5** | `conector:build` seria no-op | **REFUTADO.** `turbo run build --filter=@erp/conector-* --dry` → *"Packages in scope: @erp/conector-api, @erp/conector-web · Running build in 2 packages"*. O turbo tem descoberta própria e sobreviveu ao case. O que falhava era `pnpm run` por causa do PATH — problema de máquina (§5, passo 0) |
| **0.6** | `sarak:check` com `\|\| true` e fora do `predev` | **ABERTO** → §3.1, ordem 6 |
| **0.7** | junctions manuais nos 4 webs | **ABERTO** → §3.1, ordem 5. Agora **redundantes** (os 4 declaram `workspace:*`), mas ainda de pé |
| **0.8** | "o ADR 009 do ERP nunca foi superado" | **REFUTADO — a premissa envelheceu.** `ERP/specs/adr/` contém **um** arquivo, `decisoes.md`, cujo §14 declara: *"Este arquivo não é um log de mudanças. Quando uma decisão muda, a seção é reescrita no lugar."* O ERP abandonou o ADR numerado imutável, e o §9 (`decisoes.md:86-98`) **já descreve o estado atual corretamente**, inclusive a exceção do `file:`. Não há ADR vigente descrevendo o oposto do código; não há o que superar |

**Itens que nasceram do diagnóstico:** **0.9** (lockfile), **0.10** (lib defasada) e o **pré-requisito de PATH**
(§5, passo 0).

**Verificado de passagem, e que não vira item:** zero import direto de `@sarak/lib-ui-core` fora de
`packages/ui-kit` em `modulos/`, `adapters/`, `src/` e `packages/portas/` — o ponto de contato único do
`decisoes.md` §9 está sendo respeitado.

## 10.2 Rodada 2 — bloqueio antes da primeira escrita (2026-08-02)

> Registro do revisor. O executor **parou antes de escrever** e devolveu duas objeções. **As duas procedem, e
> as duas eram erro meu.** Ficam escritas porque a próxima pessoa que ler a §3.1 vai querer saber por que o
> 0.1 não é "renomear" e por que o 0.6 não é "tirar o `|| true`".

| Objeção | Verificação do revisor | Resultado |
|---|---|---|
| **0.1** — a justificativa do item é falsa e a solução tem custo não previsto | `validar-modulos.mjs:63` filtra `!nome.startsWith('_')` → `_template` **nunca** foi coberto pelo validador · `criar-modulo.mjs:66-72` faz `substituirMarcadores` no conteúdo **e** no nome de arquivo → o `<modulo>` é **marcador vivo** | **Aceita.** Item trocado para **excluir do glob**. Renomear reintroduziria o próprio defeito e exigiria mexer em código executável, fora do "Onde" do item |
| **0.6** — o passo mandava encadear o modo errado | [[13-instalacao-e-atualizacao]] §5.1, **spec fixa desta biblioteca**: `--notify` sai **sempre 0** (*"um aviso jamais derruba o `dev` de ninguém"*), o modo normal sai **1 de propósito** para automação | **Aceita.** `predev` recebe `--notify`; o modo normal fica para CI. A instrução anterior criaria o ponto único de falha que a própria plan advertia |

**Também confirmado pelo executor, fechando as duas paradas de §5:** `allowBuilds` é a chave do pnpm 11.17.0
(72 ocorrências × 3 do legado `onlyBuiltDependencies`), lida por `switch (value) { case true … case false }` —
string não casa e a regra nunca se registra; e o `check` não escreve nada em produção
(`writeFileSync`/`mkdirSync`/`rmSync` só em `__tests__/`).

**A lição, para além desta plan:** as duas falhas foram do mesmo tipo — **eu escrevi a instrução sem abrir o
arquivo que ela manda mudar**. No 0.1, o `criar-modulo.mjs`; no 0.6, a minha própria spec fixa. Instrução de
plan que não foi conferida contra o alvo é palpite com autoridade de spec.

---

## Resumo da execução — 2026-08-02

**Resultado:** Concluído com **uma divergência declarada** (0.3 — `better-sqlite3`, ver *Decisões*).

**Como rodou:** `pnpm` não está no PATH (§5, passo 0), então **todo** comando foi por `corepack pnpm`. O
`turbo`, porém, exige o **binário** `pnpm` no PATH e falhava com `Unable to find package manager binary`. Para
o passo 7 criei um shim `pnpm.cmd` (→ `corepack pnpm`) **no scratchpad da sessão**, adicionado ao `$env:PATH`
apenas dentro de cada invocação. **Nada foi alterado no PATH da máquina nem no ERP** — o pré-requisito do dono
continua de pé.

**O que foi feito**

- `pnpm-workspace.yaml:10-13` — `- '!modulos/_template/*'` acrescentado a `packages:`, com o motivo em
  comentário (0.1). O `_template` e o `criar-modulo.mjs` **não foram tocados**.
- `pnpm-workspace.yaml:14-16` — `allowBuilds` com booleanos: `esbuild: true`, `better-sqlite3: **false**` (0.3).
- `pnpm-lock.yaml` — reescrito pelo `corepack pnpm install`: os 13 importers passaram de `Modulos/…` para
  `modulos/…` e o `_template` saiu (0.9).
- `packages/ui-kit/node_modules/@sarak/lib-ui-core` — de **1.1.0** para **1.2.0** (0.10).
- `modulos/{conector,contratos,projetos,propostas}/web/node_modules/@erp/ui-kit` — as 4 junctions manuais
  removidas e **recriadas pelo `corepack pnpm install`** a partir de `workspace:*` (0.7).
- `packages/ui-kit/package.json:15-16` — `|| true` removido do `sarak:check`; script novo
  `sarak:check:notify` (0.6).
- `package.json:14` — `predev` encadeado: `node scripts/matar-portas-dev.mjs && corepack pnpm --filter
  @erp/ui-kit sarak:check:notify` (0.6).

**Arquivos alterados** — todos no ERP; **zero** arquivo da lib.

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `pnpm-workspace.yaml` | alterado | exclusão do `_template` do glob + `allowBuilds` booleano |
| `pnpm-lock.yaml` | alterado (gerado) | importers reescritos para `modulos/…`; `_template` fora |
| `packages/ui-kit/package.json` | alterado | `sarak:check` sem `\|\| true` + `sarak:check:notify` |
| `package.json` | alterado | `predev` encadeia o aviso em `--notify` |

**Verificações executadas**

- `corepack pnpm ls -r --depth -1` → **13 projetos**, **0** ocorrências de `<modulo>`.
- `corepack pnpm install` → **exit 0**, sem `ERR_PNPM_IGNORED_BUILDS`; `postinstall` do esbuild executou.
- `corepack pnpm install --force` (pior caso) → **exit 0**, sem tentativa de `node-gyp`.
- Lockfile, *case-sensitive*: `^  Modulos/` → **0** · `^  modulos/` → **8** · bloco `importers:` → **13**.
  As 3 ocorrências de `_template` restantes são `@types/babel__template` (substring), não importer.
- `turbo run build --dry` → **sem** `WARNING … transitive closures`.
- Versão instalada → **1.2.0**; `sarak-ui.mjs check` (cwd `packages/ui-kit`) → *"Atualizado"*, **exit 0**.
- `turbo run build` → **5 successful, 5 total** (12 pacotes em escopo; 5 têm script `build`), **sem** junction
  manual. Os 4 webs entre eles.
- `corepack pnpm run verificar` → **exit 0** (validar-modulos → sincronizar-env `--conferir` → eslint → turbo
  test encadeados por `&&`); `Tasks: 8 successful, 8 total`.
- `predev` com a lib **em dia** → **exit 0**, **silencioso**, `matar-portas-dev` preservado.
- `predev` com a lib **defasada** → **exit 0**, bloco de aviso impresso.
- `dev` com a lib **defasada** → subiu: aviso impresso, depois `VITE ready` nos 4 fronts e
  `[Sarak backend] ouvindo em http://localhost:3000`.
- `dev` com a lib **em dia** → subiu **sem** imprimir aviso. Rotas: `/`, `/propostas/`, `/projetos/`,
  `/contratos/` → **200**; `/api/v1/{propostas,contratos,projetos}` → **200**; `/meta` → **200**.

**Critérios de aceite**

- [x] `corepack pnpm install` sai 0, sem `ERR_PNPM_IGNORED_BUILDS` — **com `better-sqlite3: false`**; com `true`
      o install sai **1** (ver *Decisões*).
- [x] `ls -r` lista 13 projetos, nenhum com `<modulo>`.
- [x] `modulos/_template/**` e `scripts/criar-modulo.mjs` intactos — `git diff --stat` desses caminhos: **vazio**.
- [x] Lockfile sem importer `Modulos/`; `WARNING` do turbo eliminado.
- [x] Lib instalada em **1.2.0** e `check` verde.
- [x] Os builds passam sem junction manual.
- [x] `dev` dispara o aviso em `--notify`, sem substituir o `matar-portas-dev`, e **sobe com a lib defasada**.
- [x] O script normal segue existindo e sai **1** quando defasado (medido: `CHECK_NORMAL_EXIT=1`).
- [x] `turbo run build` verde · `verificar` verde · `dev` sobe e as telas navegam.
- [x] `git status` na lib: inalterado em relação ao início (só os arquivos de spec que já estavam modificados).
- [x] Nada commitado em nenhum dos dois repositórios.

**Decisões e suposições**

1. 🔴 **`better-sqlite3: false`, e não `true` como a §5 passo 2 manda — divergência que precisa de veredito.**
   Com `true`, o `corepack pnpm install --force` **falhou** (`EXIT=1`): aprovar o build dispara o
   `node-gyp rebuild` (fallback automático do npm quando há `binding.gyp` e não há script `install`), e esta
   máquina não tem Windows SDK. Medido: `better-sqlite3@13.0.1` **já traz** `prebuilds/win32-x64.node`, e o
   módulo carrega e opera sem compilar (`new Database(':memory:')` + insert/select = OK). Com `false` a regra
   fica **explicitamente decidida** — que é o que remove o `ERR_PNPM_IGNORED_BUILDS` — e o install sai 0 até
   no `--force`. `esbuild` ficou `true` porque o `postinstall` dele roda e é necessário.
   ⚠️ **A `plan-01-raiz-de-composicao.md:82` do próprio ERP já lista `better-sqlite3` entre as 27 dependências
   de runtime que não são da raiz** ("restos do hub antigo") — nenhum arquivo do ERP o importa. Se ele sair,
   a chave sai junto.
2. **O 0.10 já estava satisfeito no passo 3.** O `corepack pnpm install` do 0.9 forçou re-resolução por causa
   da mudança de glob e recopiou o `file:`, levando a lib a 1.2.0 antes do passo 4. Rodei o comando do passo 4
   assim mesmo, para honrar a instrução: ele saiu **1**, mas por causa do `better-sqlite3` (item 1), não da lib
   — a versão já era 1.2.0 e permaneceu.
3. **A primeira tentativa de provar "dev com a lib defasada" foi inválida** e está registrada como tal: quando
   a rodei, o passo 3 já havia atualizado a lib, então o silêncio observado era o caso **em dia**. Refiz a prova
   induzindo defasagem de verdade — um arquivo marcador dentro da **cópia instalada**
   (`node_modules/.pnpm/@sarak+lib-ui-core@…/sarak-ui/__PROVA_DEFASAGEM__.txt`), que altera o inventário
   `caminho:tamanho` da assinatura. **A biblioteca não foi tocada.** Marcador removido ao final e `check`
   confirmado verde de novo.
4. **`corepack pnpm` no `predev`, não `pnpm`.** O `corepack` acompanha o Node e funciona com ou sem `pnpm` no
   PATH; `pnpm` puro quebraria nesta máquina. É a forma que a §5 passo 6 já escrevia.
5. **Limpei os `.turbo/` que eu mesmo gerei.** O `.gitignore` do ERP não cobre `.turbo/`, então as caches dos
   meus `build`/`test` apareciam como 9 diretórios `??`. Removi para o `git status` mostrar só as 4 alterações
   pretendidas — são cache regenerável, nada versionado (`git log -- .turbo` vazio).

**Achados fora do escopo (não corrigidos)**

- `ERP/.gitignore` — **não cobre `.turbo/`**. Qualquer `turbo run` suja o `git status` com um diretório por
  pacote. Uma linha resolve. Sugestão: plan nova (ou item de higiene do próprio ERP).
- `ERP/package.json:44-66` — as **27 dependências de runtime na raiz** que a `plan-01-raiz-de-composicao.md:82`
  do ERP já cataloga como restos do hub antigo. `better-sqlite3` é uma delas e é a que forçou a divergência do
  item 1 acima. É trabalho da plan do próprio ERP, não desta.
- `corepack pnpm run <script>` **falha nesta máquina** sem shim: o `runDepsStatusCheck` do pnpm 11 reinvoca o
  binário `pnpm` puro e não o acha. Não é defeito do ERP — é o passo 0 (`corepack enable`), fora do escopo. Mas
  significa que **hoje ninguém roda `pnpm run dev` no ERP** sem resolver isso primeiro.

**Pendências / riscos**

- **A divergência do item 1 é a única coisa que separa esta execução de "conforme a plan".** Se o veredito for
  manter `true`, o critério de aceite nº 1 fica insatisfazível nesta máquina enquanto não houver toolchain C++
  — e `--force`, que é justamente o comando que o `sarak:update` do consumidor usa, sai 1.
- **Como desfazer o 0.7**, se algo quebrar: `corepack pnpm install` **recria** os 4 links sozinho (foi assim
  que a prova foi feita). Para recriar à mão:
  `New-Item -ItemType Junction -Path "modulos/<m>/web/node_modules/@erp/ui-kit" -Target "<ERP>/packages/ui-kit"`.
- O `dev` foi exercitado subindo e navegando por HTTP (códigos 200), **não** por inspeção visual das telas.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-02 — 🔴 Reprovado (1 achado)

**A execução está certa. A divergência do `better-sqlite3` está certa. Reprovo por uma linha que falta.**

### Verificação independente — reproduzi tudo que importa

**Inventário real (`git status` do ERP):** exatamente **4 arquivos**, os mesmos declarados —
`pnpm-workspace.yaml` · `pnpm-lock.yaml` · `packages/ui-kit/package.json` · `package.json`. Nada a mais, nada
a menos. E o que **não** podia ser tocado:

```
git diff --stat -- modulos/_template scripts/criar-modulo.mjs   → vazio
git status (na lib)                                              → só os 6 arquivos de specs desta sessão
```

**Critérios de aceite, um a um, medidos por mim:**

| Critério | Evidência minha |
|---|---|
| 13 projetos, zero `<modulo>` | `corepack pnpm ls -r --depth -1` → **13**, e o `_template` sumiu da lista |
| Lockfile sem `Modulos/` | `grep -c "^  Modulos/"` → **0** · `"^  modulos/"` → **8** (4 web + 4 api) |
| Sem o `WARNING` de transitive closures | `npx turbo run build` → *"Packages in scope: 12"*, **nenhum warning de lockfile** |
| Lib em `1.2.0`, check verde | `1.2.0` · `[sarak:check] Atualizado — a cópia instalada bate com a biblioteca em disco (kitHash 36b5cb181288)`, **EXIT=0** |
| Builds sem junction manual | **`Tasks: 5 successful, 5 total`** — rodado por mim, do zero (`0 cached`) |
| O elo é do gerenciador | Os 4 webs agora têm `'@erp/ui-kit': specifier workspace:*` no lockfile, com **4** ocorrências de `link:../../../packages/ui-kit`. **Isto** é a prova — não o tipo do link, que no Windows é junction dos dois jeitos |
| `verificar` verde | **`Tasks: 8 successful, 8 total`**, exit 0 — rodado por mim |
| `predev` encadeado, modo `--notify` | `node scripts/matar-portas-dev.mjs && corepack pnpm --filter @erp/ui-kit sarak:check:notify` — o `matar-portas-dev` preservado |
| Modo normal sobrevive para automação | `sarak:check` sem `\|\| true`; `sarak:check:notify` ao lado |

**As duas correções de percurso que o executor declarou:** aceitas, e a segunda o credita. Ter percebido que a
primeira prova de *"dev defasado"* era inválida — a lib já estava em 1.2.0, então o silêncio era o caso **em
dia** — e refeito induzindo defasagem real é a diferença entre provar e parecer provar. O marcador foi posto
na cópia de `node_modules/.pnpm/`, **não na biblioteca**, e removido ao final com o check reconfirmado.

**A divergência do `better-sqlite3: false`: APROVADA.** Verifiquei os três pilares — o pacote traz **8
prebuilds** (`win32-x64`, `win32-arm64`, `linux-{x64,arm64}`, `linuxmusl-{x64,arm64}`, `darwin-{x64,arm64}`),
**nada no ERP o importa** (`grep` em `src/`, `modulos/`, `adapters/`, `packages/` → vazio; declarado só em
`package.json:46`), e a `plan-01` §2.5 do próprio ERP já o lista entre os *"restos do hub antigo"*. O item
cobrava **regra explicitamente decidida**, não build aprovado — e `false` é o único valor que mantém verde o
`install --force`, que é justamente o comando do `sarak:update`. **Parar e perguntar foi o comportamento
certo**; a instrução original (`true`) era suposição minha, e a medição a refutou. A plan foi corrigida (§5.2).

### O achado

**1. `pnpm-workspace.yaml:14-16` — o `better-sqlite3: false` está sem o motivo escrito ao lado.**

- **O que está errado:** o mesmo arquivo ganhou, nesta execução, três linhas de comentário explicando por que o
  `_template` saiu do glob — e **nenhuma** explicando o valor contra-intuitivo. `false` lido cru significa
  *"build desabilitado"*; o próximo leitor inverte para `true`, o `install --force` volta a sair 1, e ninguém
  liga uma coisa à outra.
- **Critério violado:** é **a mesma classe de defeito que originou o item 0.3** — um valor naquele arquivo que
  ninguém sabe explicar. O `set this to true or false` durou o que durou exatamente por isso. Além de
  [[00-contexto]] §7: *"regra sem gate é declarada em negrito; gate falso é pior que lacuna declarada"* — aqui,
  decisão sem motivo é pior que decisão ausente, porque parece deliberada e não se defende.
- **Por que reprova, sendo um comentário:** porque o produto desta plan não é o install verde — é o ERP
  **funcionando sem gambiarra e sem mistério**. Um `false` órfão é mistério novo, criado pela execução que veio
  eliminar mistério.

### O que NÃO é achado, e fica registrado

- **`.turbo/` fora do `.gitignore`** — achado legítimo, corretamente declarado como fora de escopo. Confirmei:
  `grep turbo .gitignore` → nada, e cada `turbo run` cria um diretório por pacote. **Eu mesmo sujei o ERP
  rodando as provas e limpei atrás de mim** — `git status` do ERP está de volta aos 4 arquivos. É item do
  backlog do ERP, não desta plan.
- **`corepack pnpm` embutido no `predev`.** Funciona e é portátil (o corepack vem com o Node ≥16.9), mas é a
  solução de um problema desta máquina gravada num arquivo versionado. Depois do `corepack enable`, o
  idiomático é `pnpm --filter …`. **Não reprovo** — é escolha defensável, e trocar agora quebraria o `dev`
  antes do passo 0. Fica registrado para o dono decidir.
- **O shim de `pnpm.cmd` no scratchpad.** Reproduzi o método (criei o meu para rodar `turbo run build` e
  `verificar`) e confirmo: PATH da máquina e ERP intocados. **Mas isto limita o valor da prova** — ver abaixo.

### O que o dono precisa saber antes de comemorar

**O passo 0 continua aberto, e agora está no caminho crítico.** Sem `pnpm` no PATH, o `npx turbo run build`
falha com `Unable to find package manager binary: cannot find binary path` — **reproduzi**. Os verdes desta
execução (build 5/5, `verificar` 8/8) foram obtidos com shim, tanto pelo executor quanto por mim. São provas
válidas **do ERP**, não do ambiente: na sua máquina, hoje, sem `corepack enable`, o `turbo run build` não roda.

**Traduzindo:** o ERP está alinhado; a máquina, não.

### Prompt de correção

```
Leia specs/00-prompt-executor.md e corrija a execução de specs/plan/plan-04-alinhamento-erp.md.

Veredito de 2026-08-02: REPROVADO. Achado único:

1. ERP/pnpm-workspace.yaml:14-16 — `better-sqlite3: false` está sem o motivo escrito ao lado,
   no mesmo arquivo em que o `_template` ganhou três linhas de comentário. `false` lido cru
   significa "build desabilitado"; o próximo leitor inverte, o `install --force` volta a sair 1
   e ninguém liga uma coisa à outra. É a mesma classe do defeito que originou o item 0.3.

Escopo da correção: EXCLUSIVAMENTE um comentário em `pnpm-workspace.yaml`, acima ou ao lado
do bloco `allowBuilds`. Nada mais, em nenhum arquivo. O valor `false` está APROVADO — não o
altere. Não rode install, build nem verificar de novo: o revisor já reproduziu os verdes.

O comentário precisa dizer, curto: (a) que o pacote traz prebuilds para os 8 alvos e não
precisa compilar; (b) que `true` dispara node-gyp e derruba o `install --force` em máquina
sem toolchain nativo; (c) que a dependência é resto do hub antigo (plan-01 §2.5 do ERP) e
sai quando aquela plan rodar. Sem prosa além disso.

Acrescente um bloco "## Resumo da execução (correção 1) — AAAA-MM-DD" ao final da plan (o
resumo anterior permanece intacto) com o diff do comentário. Depois marque status:
"🟠 Em revisão". Não commite. Devolva para revisão.
```

---

## Resumo da execução (correção 1) — 2026-08-02

**Resultado:** Concluído.

**Achado 1 — `pnpm-workspace.yaml:14-16`, `better-sqlite3: false` sem motivo escrito ao lado.** Resolvido.
Comentário de três linhas acrescentado **dentro** do bloco `allowBuilds`, imediatamente acima da chave, cobrindo
os três pontos exigidos:

```diff
 allowBuilds:
-  better-sqlite3: false
+  # false de propósito: o pacote traz prebuilds para os 8 alvos e não precisa compilar.
+  # `true` dispara o node-gyp e derruba `install --force` em máquina sem toolchain nativo.
+  # É resto do hub antigo (plan-01 §2.5) — esta chave sai quando aquela plan rodar.
+  better-sqlite3: false
   esbuild: true
```

- **(a)** prebuilds para os 8 alvos, não precisa compilar → linha 15
- **(b)** `true` dispara node-gyp e derruba `install --force` sem toolchain nativo → linha 16
- **(c)** resto do hub antigo, `plan-01` §2.5, sai quando aquela plan rodar → linha 17

Ficou **dentro** do bloco (e não acima dele) para o motivo viajar junto da chave: o `esbuild: true` logo abaixo
é decisão oposta e independente, e um comentário acima de `allowBuilds:` pareceria valer para os dois.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `ERP/pnpm-workspace.yaml` | alterado | +3 linhas de comentário no bloco `allowBuilds`. **Nenhum valor tocado** |

**Verificações executadas**

- `git diff -- pnpm-workspace.yaml` → o único acréscimo desta rodada são as 3 linhas `#`; `better-sqlite3: false`
  e `esbuild: true` **inalterados**.
- `git status --porcelain` no ERP → os **mesmos 4 arquivos** do resumo anterior. Nenhum arquivo novo.
- `git status --porcelain` na lib → inalterado; só esta plan.
- Referência conferida antes de escrever: `ERP/specs/plan/plan-01-raiz-de-composicao.md` **§2.5** existe e é
  *"O `package.json` da raiz carrega negócio"*, que lista `better-sqlite3` entre as 27 dependências de runtime
  restantes do hub antigo. A citação do comentário aponta para seção real.
- **Não rodei** install, build nem `verificar`, conforme a instrução — o revisor já reproduziu os verdes.

**Critérios de aceite** — os do resumo anterior seguem válidos e não foram reexecutados, por instrução. O único
critério novo desta rodada:

- [x] O valor contra-intuitivo tem o motivo escrito ao lado — evidência: `pnpm-workspace.yaml:15-17`.

**Decisões e suposições**

- Comentário **dentro** do bloco em vez de acima dele (motivo acima). O prompt permitia as duas posições.
- Mantive acentuação no comentário novo, seguindo o cabeçalho do próprio arquivo (linhas 1-4). O comentário do
  `_template` que escrevi na rodada anterior está sem acento — **inconsistência minha, dentro do arquivo**. Não
  a corrigi porque aquelas linhas estão fora do escopo desta correção; fica declarada para o revisor decidir.

**Achados fora do escopo (não corrigidos)**

- Nenhum novo. Os três da rodada anterior seguem abertos e já foram acolhidos no veredito
  (`.turbo/` fora do `.gitignore` · 27 deps de runtime na raiz · passo 0 do PATH).

**Pendências / riscos**

- Nenhum. A correção é textual e não altera comportamento.

## Veredito (correção 1) — 2026-08-02 — 🟢 Aprovado

**Achado fechado. A plan está aprovada.**

**Verificado por mim:**

- **Escopo exato.** `git diff -- pnpm-workspace.yaml` mostra, desta rodada, **só as 3 linhas `#`**. Os valores
  `better-sqlite3: false` e `esbuild: true` estão intactos, e o `git status` do ERP segue nos **mesmos 4
  arquivos**. Nenhum install, build ou `verificar` foi rodado de novo — como instruído.
- **O comentário cobre (a), (b) e (c)** em uma linha cada, sem prosa a mais: prebuilds para os 8 alvos ·
  `true` dispara node-gyp e derruba `install --force` · resto do hub antigo, sai com a plan-01 do ERP.
- **A citação resolve.** `ERP/specs/plan/plan-01-raiz-de-composicao.md` §2.5 existe, é *"O `package.json` da
  raiz carrega negócio"*, e `better-sqlite3` está lá entre as 27 dependências restantes. Ponteiro vivo — o
  executor conferiu antes de escrever, que é a ordem certa.
- **Append-only respeitado** na plan: resumo anterior e veredito de reprovação intactos, bloco novo ao final.

**A decisão de posicionamento é melhor que a minha instrução.** Pôr o comentário **dentro** do bloco, colado à
chave, em vez de acima de `allowBuilds:` — porque `esbuild: true` logo abaixo é decisão **oposta e
independente**, e um comentário acima do bloco pareceria cobrir os dois valores. O prompt permitia as duas
posições; esta é a que não cria ambiguidade nova.

**Sobre a inconsistência declarada (acentuação):** **não é achado.** O comentário do `_template` está sem
acento e o novo está com — dentro do mesmo arquivo. É cosmético, não muda decisão nem comportamento, e as
linhas antigas estavam fora do escopo desta correção. Declarar em vez de corrigir por conta própria foi o
comportamento certo. Uniformize quando for commitar, se quiser; não gate nada.

---

## Fecho da plan-04

**O que esta plan entregou, medido:** o workspace deixou de mentir (13 projetos, lockfile canônico), o ERP
subiu da lib **1.1.0 → 1.2.0**, as 4 junctions manuais deram lugar ao elo do gerenciador
(`link:../../../packages/ui-kit` no lockfile), o aviso de defasagem passou a disparar sozinho no modo que não
derruba o `dev`, e as duas decisões contra-intuitivas do `pnpm-workspace.yaml` ficaram com o motivo escrito ao
lado. `turbo run build` **5/5** e `verificar` **8/8**, reproduzidos pelo revisor.

**O que fica aberto, e não é dívida desta plan:**

1. **Passo 0 — `corepack enable`.** É do dono e está no caminho crítico: sem ele, `turbo run build` falha com
   `Unable to find package manager binary`. Os verdes saíram com shim de `pnpm.cmd`. **O ERP está alinhado; a
   máquina, não.**
2. **Backlog do próprio ERP:** `.turbo/` fora do `.gitignore` · as 27 dependências de runtime na raiz
   (`plan-01` §2.5, que também leva embora o `better-sqlite3` e a chave `allowBuilds` correspondente).
3. **`corepack pnpm` embutido no `predev`** — funciona e é portátil, mas é solução de um problema local gravada
   em arquivo versionado. Depois do passo 0, o idiomático é `pnpm --filter …`. Decisão do dono.
4. **A migração `file:` → `github:…#semver:^1.x`** segue fora de escopo por decisão do dono, enquanto os dois
   repositórios andam juntos.

**Destino da síntese:** `—`, como declarado. A exceção prevista na §9 foi aplicada pelo revisor nesta ação:
`00-contexto.md` §8 descrevia o ERP com fatos que esta execução mudou.

**Liberado: pode commitar — nos dois repositórios.**

---

## Síntese — 2026-08-07

Sintetizada em: `—` (destino declarado). A exceção de `00-contexto.md` §8 já foi aplicada pelo revisor no
próprio veredito. Nada pendente.
