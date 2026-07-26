---
tipo: "spec"
titulo: "Aviso de atualização no terminal + CLI real do consumidor (multi-gerenciador)"
dominio: "Consumo externo / CLI / Atualização da biblioteca"
status: "🟢 Executada (2026-07-26) — aviso no `predev`, CLI de subcomandos, monorepo e `file:` resolvidos, multi-gerenciador com comandos MEDIDOS; ciclo §9 provado ponta a ponta em npm(git), pnpm(file:, consumidor real) e yarn(file:)"
prioridade: "Máxima"
tags: ["spec", "consumidor", "cli", "atualizacao", "monorepo", "pnpm", "dx"]
relacionados: ["50-kit-de-uso-do-consumidor", "39-importacao-e-atualizacao", "45-scaffolder-react-e-skills", "21-scaffolder-init"]
---

> **Origem (2026-07-26):** o dono tentou rodar `npm run sarak:check` no `packages/ui-kit` de um
> consumidor real e o terminal respondeu com **a ajuda do `init`** seguida de
> `'true' não é reconhecido como um comando interno`. A investigação achou **cinco** defeitos
> distintos — e a tentativa de contornar com `npm install` **quebrou** o repositório do consumidor
> (é um workspace **pnpm**; o npm entrou no store e tentou rodar o `prepare` de um pacote de
> terceiro). Nenhum deles é hipotético: todos foram reproduzidos.
>
> **Pedido explícito do dono, que vira o item de maior prioridade (L1):** *"sempre que houver uma
> atualização na biblioteca, o importador deve receber uma mensagem no terminal para que possa
> realizar a instalação."* Hoje a atualização é 100% **sob demanda e silenciosa** — quem não lembra
> de rodar `sarak:check` fica para trás sem nunca ser avisado (foi assim que um consumidor ficou
> preso 4 commits atrás por semanas, achado que motivou a Spec 39).

# 1. Visão Geral e Objetivo

Fechar o ciclo de **atualização do importador**: a lib passa a **avisar sozinha**, no terminal do
consumidor, que existe versão nova — e o comando que ela manda rodar tem de ser **o certo para o
gerenciador de pacotes daquele projeto**. No caminho, o CLI ganha os comandos que o consumidor já
tenta usar por instinto (`check`, `refresh`) e para de mentir quando o comando não existe.

**Fronteira de princípio (não muda):** a lib **nunca instala nada sozinha** e **nunca chama rede em
runtime de aplicação**. O aviso é uma **mensagem**, emitida por um comando que o próprio consumidor
dispara (`predev`), e a instalação segue sendo ato deliberado dele.

# 2. Os cinco defeitos (todos reproduzidos)

| # | Defeito | Evidência reproduzida |
| --- | --- | --- |
| **D1** | Subcomando desconhecido despeja o `USAGE` do `init` **sem dizer que o comando não existe**. Sai com 1, mas a mensagem engana. | `node bin/sarak-ui.mjs check` → ajuda do `init`, `exit 1` |
| **D2** | O CLI **só tem `init`**. `check`/`refresh` existem apenas como **caminho de arquivo interno** (`bin/scaffold/checkUpdate.mjs`), que vaza para o `package.json` do importador e quebra a qualquer refatoração. | `bin/sarak-ui.mjs:75` — `if (command !== 'init')` |
| **D3** | `runCheckUpdate` exige `package.json` **e** `package-lock.json` no **mesmo** diretório. Em monorepo o lock está acima → falha mesmo com o comando certo. | `checkUpdate.mjs` em `packages/ui-kit` → `package.json/package-lock.json não encontrados` |
| **D4** | Dependência **`file:`/`link:`** (modo dev local) não tem commit remoto. Hoje cai numa mensagem de **erro** (`lockfile em formato inesperado`) em vez de dizer a verdade. | consumidor real com `"@sarak/lib-ui-core": "file:../../..."` |
| **D5** | **Todo o fluxo de atualização assume npm.** `sarak:update` é `npm uninstall && npm cache clean --force && npm install`. Num workspace pnpm/yarn isso **quebra** — exatamente as topologias 2/3/4 do `GUIA-FRONTEND.md`. | `npm uninstall` num workspace pnpm → `command failed … husky` dentro de `node_modules/.pnpm/` |

**Contradição correlata a corrigir junto:** o Golden Path da skill `ui-integra-consumidor` manda
*"instalação MONOLÍTICA, um único `package.json`, NÃO use workspaces"* — enquanto o kit da Spec 50
documenta **monorepo** e **monolito modular** como topologias de primeira classe. As duas coisas não
podem conviver.

# 3. L1 — Aviso de atualização no terminal (o pedido do dono)

## 3.1 O mecanismo
- **Comando novo `sarak-ui check --notify`**: mesma verificação do `check`, com outro contrato de saída.
  - **Em dia → silêncio absoluto** (nenhuma linha). Ruído em toda execução vira ruído ignorado.
  - **Desatualizado → bloco destacado** com: versão instalada, versão disponível e **o comando exato
    para o gerenciador detectado** (L2).
  - **Sempre `exit 0`** — o aviso jamais derruba o `dev`/`build` do consumidor.
- **Ligado automaticamente pelo `init`** como `predev` no `package.json` do consumidor: o aviso
  aparece no terminal a **cada `npm run dev`**, que é onde o desenvolvedor olha. Se já existir um
  `predev`, o `init` **não sobrescreve** (merge preserva) e reporta em `skipped` — o consumidor
  compõe à mão.

## 3.1.1 Onde o aviso é ligado quando o `init` não serve (achado real, 2026-07-26)
O wiring automático cobre projeto **gerado pelo `init`**. Num monorepo real, duas coisas quebram essa
premissa — as duas observadas no consumidor investigado:
- **Quem DEPENDE da lib não é quem RODA o `dev`.** Lá, só `packages/ui-kit` declara a dependência (é
  pacote de biblioteca, sem script `dev`); quem roda `dev` é a **raiz** do workspace. Um `predev` no
  pacote que depende nunca executaria.
- **Já existe um `predev`** na raiz (`node scripts/matar-portas-dev.mjs`), então não há campo livre.

Consequências para esta spec:
- O comando **deve funcionar de qualquer diretório do workspace** — ele já sobe a árvore atrás do
  lock (L3/D3), e o mesmo mecanismo resolve "de onde me chamaram".
- O **kit** ganha uma receita explícita de wiring manual (uma linha, encadeada ao `predev` existente,
  no pacote que roda o `dev`) — é o caminho de quem adotou a lib sem passar pelo `init`.
- Nada de `postinstall` nem de auto-edição do `package.json` do consumidor fora do `init`: a lib
  **propõe** a linha, quem cola é o importador.
- **Tolerante a ambiente hostil:** sem rede, sem git, repositório inacessível → **silêncio + exit 0**.
  Nunca um stack trace, nunca uma espera longa: `timeout` curto (**3s**, constante nomeada) no
  `git ls-remote`; estourou, desiste calado.

## 3.2 Os DOIS modos de dependência (o `file:` não pode ficar de fora)
| Modo | Como detecta atualização | Mensagem |
| --- | --- | --- |
| **git spec** (`github:…`) | `resolved` do lock **vs** HEAD remoto (`git ls-remote`) | "instalado `abc1234`, disponível `def5678`" |
| **`file:`/`link:`** (dev local) | `dist/BUILD_INFO.json` + `sarak-ui/VERSION` do pacote **INSTALADO** vs os do **repositório em disco** apontado pelo spec | "a biblioteca em `<caminho>` mudou desde a sua última instalação" |

O modo `file:` é o que mais dói hoje: o gerenciador **copia** o pacote para o store, então rebuildar
a lib **não** chega ao consumidor e nada avisa. É silêncio puro — a classe de defeito da Spec 39,
repetida noutra forma.

## 3.3 O que NÃO fazer (fronteiras)
- **Não** instalar/atualizar sozinho: o aviso informa, o consumidor decide.
- **Não** verificar em runtime de aplicação (nem no browser, nem no Provider): a lib não chama rede
  sozinha — Spec 08 §6, Regra 5.
- **Não** usar `postinstall` na lib para isso: script de instalação de dependência é superfície de
  supply chain e roda no momento errado (quem acabou de instalar está, por definição, em dia).

# 4. L2 — Multi-gerenciador (npm · pnpm · yarn)

## 4.1 Detecção
Ordem determinística, primeira que casar vence: campo **`packageManager`** do `package.json` (subindo
a árvore) → **lockfile presente** (`pnpm-lock.yaml` · `yarn.lock` · `package-lock.json`) → default `npm`.
A detecção sobe a árvore junto com a busca do lock (L3) — em monorepo, a verdade está na raiz.

⚠️ **Armadilha real, a tratar explicitamente:** um repositório pode ter **dois** lockfiles (o
consumidor investigado tem `pnpm-lock.yaml` **e** um `package-lock.json` resíduo, mais antigo).
`packageManager` tem precedência justamente por isso; havendo só lockfiles, e mais de um, o **mais
recente vence** e a ambiguidade é **reportada** na mensagem.

## 4.2 Comando de atualização por gerenciador
O `sarak:update` gerado deixa de ser uma string npm fixa e passa a sair da detecção:

| Gerenciador | Forma |
| --- | --- |
| **npm** | `npm uninstall … && npm cache clean --force && npm install <spec>` (o de hoje — as 3 etapas furam o pin do lock e o cache git) |
| **pnpm** | a forma equivalente em pnpm, **validada na prática**, não deduzida da documentação |
| **yarn** | idem |

Regra dura desta spec: **nenhum comando entra sem ter sido executado com sucesso** num consumidor
real de cada gerenciador. Foi exatamente "deduzir o comando" que quebrou o repositório do consumidor
na origem desta spec.

## 4.3 Corolário — dependência `file:` em workspace
Para `file:`/`link:`, "atualizar" **não é reinstalar do remoto**: é **re-copiar** o pacote do disco
(depois de `npm run build` na lib). O comando gerado tem de refletir isso — e o aviso da §3.2 tem de
mandar o comando dessa família, não o do modo git.

# 5. L3 — CLI real e diagnóstico honesto (D1–D4)

- **`bin/sarak-ui.mjs` vira CLI de subcomandos:** `init` · `check` · `refresh` · `--help`.
  Delegam para os módulos que **já existem** (`runInit`, `runCheckUpdate`, `runRefreshKit`) — zero
  lógica nova, só superfície pública.
- **D1:** comando desconhecido imprime `comando desconhecido: "X"` + a lista de comandos válidos,
  ANTES do help. Continua `exit 1`.
- **D2:** os scripts gerados passam a usar a superfície pública (`sarak-ui check`, `sarak-ui refresh`)
  em vez do caminho interno. Os scripts antigos, com caminho de arquivo, **continuam funcionando**
  (nada é movido) — a mudança vale para instalações novas e é documentada como migração opcional.
- **D3:** o `check` sobe a árvore atrás do lockfile, a partir do `package.json` que declara a
  dependência. Monorepo passa a funcionar.
- **D4:** `file:`/`link:` ganha caso próprio, **exit 0**: "modo de desenvolvimento local — aponta para
  `<caminho>`; reflete o repositório em disco" + o veredito da §3.2 (mudou / não mudou) + o comando
  de re-cópia.

# 6. L4 — Documentação (fechar a contradição)

- **`GUIA-FRONTEND.md` (kit, Spec 50):** seção nova **"Gerenciador de pacotes"** na §2 (topologias) —
  a lib não escolhe o seu; o `init` detecta; em monorepo, os comandos de instalação/atualização são os
  do gerenciador do workspace, rodados da raiz. **Registrar como o primeiro buraco absorvido pelo loop
  de completude (§9 da Spec 50).**
- **Skill `ui-integra-consumidor`:** corrigir o Golden Path. O "não use workspaces" nasceu de um
  achado real com **npm workspaces no Windows** — vira o que sempre foi: *"npm workspaces quebram
  binários locais no Windows; pnpm/yarn workspaces são suportados e são a forma normal das topologias
  2/3/4"*. Sem isso, a skill contradiz o guia que ela mesma entrega.
- **`docs/migracoes.md`:** entrada para `sarak:check`/`sarak:update` (forma nova × antiga, ambas
  válidas) e para o `predev` do aviso.

# 7. Critérios de Aceite
- [x] **`sarak-ui check --notify`**: silencioso em dia; bloco destacado quando desatualizado, com o
      comando **do gerenciador detectado**; **exit 0 em todos os casos**, inclusive sem rede/sem git.
- [x] **`init` liga o aviso** como `predev` (sem sobrescrever um `predev` existente) — o importador é
      avisado **a cada `npm run dev`**, sem precisar lembrar de nada.
- [x] O aviso funciona nos **dois** modos de dependência (git spec **e** `file:`/`link:`).
- [x] **Detecção de gerenciador** (npm/pnpm/yarn) por `packageManager` → lockfile → default; caso de
      lockfiles ambíguos coberto por teste e reportado na mensagem.
- [x] **Comandos de atualização de pnpm e yarn executados de verdade** num consumidor de cada um —
      evidência no relatório. Comando não validado não entra.
- [x] `sarak-ui` aceita `init`/`check`/`refresh`; comando desconhecido diz **qual** comando não existe.
- [x] `check` acha o lockfile **acima** do pacote (monorepo) e trata `file:`/`link:` com exit 0.
- [x] Seção "Gerenciador de pacotes" no `GUIA-FRONTEND.md`; contradição do Golden Path corrigida na
      skill; entrada em `docs/migracoes.md`.
- [x] Gates verdes: `catalog:check`, `barrel:check`, `zero-brand:check`, `guide:check`, `build` (DTS),
      suíte COMPLETA `npx vitest run`, `package:check`, `run_audit.mjs` no baseline.
- [x] Entrada no `00-progresso.md` + item marcado no `00-indice.md`.

## 7.1 Achado de execução: por que comparar CONTEÚDO não bastava no modo `file:`
A 1ª implementação comparava `dist/BUILD_INFO.json` + `sarak-ui/VERSION` instalados contra os da
fonte — e dizia **"em dia"** mesmo com a instalação comprovadamente velha. Causa: o **pnpm hardlinka**
os arquivos para o store, então reescrever um arquivo EXISTENTE (o `BUILD_INFO.json` de um rebuild)
propaga sozinho para a cópia instalada. O que o hardlink **não** propaga é arquivo **adicionado ou
removido** — exatamente o sintoma real que originou tudo (`sarak-ui/` inteiro ausente na cópia).
Correção: a assinatura passou a incluir o **inventário** (`caminho:tamanho`, recursivo) de `dist/` e
`sarak-ui/`. Registrado porque a intuição "comparar o conteúdo basta" é forte e está errada aqui.

# 8. Fronteiras (não fazer)
- **Não** instalar/atualizar automaticamente — o aviso informa; instalar é ato do consumidor.
- **Não** verificar atualização em runtime de aplicação (browser/Provider).
- **Não** usar `postinstall` da lib como gatilho do aviso.
- **Não** deduzir comando de gerenciador da documentação: só entra o que foi **executado**.
- **Não** quebrar os scripts já gerados em consumidores existentes (caminho de arquivo continua válido).
- **Não** mexer na topologia/estrutura do consumidor investigado — o resíduo `package-lock.json` num
  repositório pnpm é problema **dele**, não da lib (registrado, não corrigido aqui).

# 9. Validação
O aceite é **prático, num consumidor real de cada gerenciador**: com a lib atualizada e o consumidor
para trás, um `npm run dev` (ou equivalente) **imprime o aviso com o comando certo**; rodar aquele
comando atualiza de fato; o `dev` seguinte fica **silencioso**. Sem essa prova, a spec não fecha —
foi a ausência dela que deixou os cinco defeitos passarem.
