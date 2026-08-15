---
tipo: "spec"
titulo: "Instalação, scaffolder e ciclo de atualização — o caminho do importador, ponta a ponta"
dominio: "Sarak-Lib-UI-Core / Consumo externo / CLI / Atualização"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "consumidor", "cli", "instalacao", "scaffolder", "atualizacao", "monorepo", "multi-gerenciador"]
relacionados: ["[[12-kit-do-consumidor]]", "[[03-versionamento-e-release]]", "[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]"]
---

# 1. Propósito

Esta spec descreve o caminho do **importador**, do primeiro `install` até a enésima
atualização: como a lib entra num projeto, o que o `init` gera, como o consumidor descobre que
saiu versão nova, e o que ele roda para atualizar sem quebrar o repositório dele.

A decisão de **distribuir por Git, sem registry**, está no ADR-007; a de **publicar por tag**,
no ADR-008. Aqui é o **como**, do lado de quem consome.

> **O princípio que atravessa o documento inteiro:** *"sempre a mais atual" é **SOB COMANDO**.*
> A lib **avisa**; ela nunca instala nada sozinha, nunca chama rede em runtime de aplicação e
> nunca edita o `package.json` do consumidor fora do `init`. Automático de verdade exigiria
> registry + resolução semver contínua — e a compensação escolhida foi outra: aviso ativo no
> terminal, comando explícito, decisão do importador.

# 2. Instalação

## 2.1 O comando

```bash
npm install github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0   # RECOMENDADO (ADR-008)
npm install github:Lib-Sarak/Sarak-Lib-UI-Core                 # SUPORTADO
```

`#semver:` é recomendado porque faz o npm resolver contra as **tags** do repositório — o mesmo
comportamento de um registry, sem registry. `github:` puro continua suportado e **nunca foi
declarado errado**: a decisão D4 é explícita em não forçar migração de ninguém.

O default do scaffolder, quando o consumidor ainda não tem a dependência gravada, é
`github:Lib-Sarak/Sarak-Lib-UI-Core` (`bin/scaffold/constants.mjs:50`). Quando **já existe**, o
`init` reusa o spec real do projeto (`bin/scaffold/runInit.mjs:31-33`) — nunca assume o
repositório oficial por cima de um fork ou mirror interno.

## 2.2 ⚠️ Exigência não-óbvia: um `package.json` na raiz ANTES de instalar

> **Sem `package.json` no diretório-alvo, `npm install github:…` NÃO falha — ele instala no
> lugar errado.**

O npm sobe a árvore de diretórios até o `package.json` ancestral mais próximo e instala **lá**.
No achado real que originou a regra, isso significou 289 pacotes e uma dependência injetada em
`C:\Users\Igor\package.json` — um projeto sem nenhuma relação — **sem erro e sem aviso**.

**A instrução, portanto, é:** garanta um `package.json` no diretório certo (`npm init -y` se não
houver) **antes** do install. Está escrito no guia do kit (`sarak-ui/GUIA-FRONTEND.md:89`) e na
skill de integração.

É a mesma classe de defeito do restante desta spec: **falha silenciosa que só aparece muito
depois**, e sempre em cima de outra pessoa.

## 2.3 `dependencies` × `peerDependencies`

| | Quantidade | Quem instala |
| --- | --- | --- |
| `dependencies` | **3** — `@phosphor-icons/react`, `@tabler/icons-react`, `dompurify` | a lib traz junto |
| `peerDependencies` | **19** — React, `tailwindcss`, e as libs pesadas (`echarts`, `reactflow`, `recharts`, `pdfjs-dist`, `framer-motion`, `react-markdown`, `react-syntax-highlighter`, …) | **o consumidor** |

A divisão é deliberada e o critério está em `specs/arquitetura/05-build-e-distribuicao.md`: o que
o consumidor precisa **controlar a versão** (React, Tailwind) ou o que é **pesado e opcional**
fica como peer; o que é infraestrutura invisível (sanitização, ícones) vem junto.

O `init` **espelha** as peers reais do pacote instalado nas `dependencies` do consumidor — nunca
uma lista escrita à mão (`bin/scaffold/generators/packageJsonFields.mjs:14-19`, lendo
`ctx.peerDependencies` de `bin/scaffold/context.mjs:27`). Uma peer nova entra no starter sozinha.

## 2.4 O CSS que NÃO precisa ser importado

**Modo App:** nada a importar. `injectSarakStyles(SARAK_CSS)` roda na **importação do módulo**,
antes de qualquer Provider montar. É parte do contrato público, não conveniência — sem ele os
componentes não têm forma geométrica, porque o Tailwind interno não é processado no build do
consumidor.

**Modo Embarcado:** aí sim há um import explícito — `@sarak/lib-ui-core/sarak-scoped.css` — e o
`init` o escreve no `main.tsx` gerado (`bin/scaffold/generators/mainTsx.mjs:11`).

**Exceção SSR/Next:** injeção em tempo de import pode produzir FOUC; o import manual do
`./sarak.css` continua disponível pelos `exports`.

# 3. O scaffolder `npx sarak-ui init`

## 3.1 O que ele gera hoje

Cinco arquivos (`bin/scaffold/buildFileMap.mjs:22-30`) + o merge do `package.json` + a cópia do
kit:

| Arquivo | Gerador | O que é |
| --- | --- | --- |
| `index.html` | `indexHtml.mjs` | ponto de entrada Vite |
| `vite.config.ts` | `viteConfig.mjs` | React + `manualChunks` só de `react`/`react-dom` |
| `tsconfig.json` | `tsconfig.mjs` | front puro, `include: ['src']` |
| `src/main.tsx` | `mainTsx.mjs` | `SarakUIProvider` + `SarakShell` + registro do módulo de exemplo |
| `src/modules/ExampleModule.tsx` | `exampleModule.mjs` | um componente React comum, tematizado |

**É um starter de modelo módulos-plugin, Vite puro, SEM backend.** O tema persiste em
`localStorage`, embutido no Provider (ADR-003).

## 3.2 As 3 stacks que colapsaram numa só — e por quê

A Spec 21 gerava **três** variantes (`vite-express` · `next` · `frontend-only`), cada uma com o
próprio servidor. Elas existiam **só para gerar backend**
(`bin/scaffold/constants.mjs:14-22`). Quando o backend próprio saiu (ADR-003), a distinção
perdeu o objeto: não havia mais servidor a escolher, e três starters divergentes significavam
três caminhos a manter, testar e documentar para produzir o mesmo front.

Junto foi o segundo `tsconfig.server.json` (`generators/tsconfig.mjs:1-5`).

**A lição de método:** remover uma capacidade **simplifica** o que a servia. Manter as três
stacks "porque já existiam" teria deixado a maior parte do scaffolder testando ramos que ninguém
podia mais usar.

## 3.3 O merge de `package.json` é NÃO-DESTRUTIVO

`bin/scaffold/mergePackageJson.mjs` preserva **todo** campo existente e só acrescenta chaves
ausentes em `scripts`/`dependencies`/`devDependencies` (`:7-19`). Chave que já existe com valor
divergente é **reportada em `skipped`** e nunca sobrescrita, a menos que venha `--force`.

O `init` inteiro é **idempotente**: rodá-lo de novo completa o que faltou sem duplicar nem
corromper — e o próprio tratamento de erro do CLI diz isso ao consumidor
(`bin/sarak-ui.mjs:116-123`).

⚠️ **Armadilha de Windows tratada explicitamente:** `Set-Content -Encoding utf8` do PowerShell 5
grava **BOM UTF-8**, e `JSON.parse` não o tolera — o `init` morria no meio, com arquivos já
escritos e o merge abortado. Por isso todo `package.json` existente é lido por
`parsePackageJson` (`mergePackageJson.mjs:36-38`), que remove o BOM.

## 3.4 Dois achados reais preservados no gerador

**(a) `@types/react` e `@types/react-dom` faltavam.** A lib os declara só em `devDependencies`
(uso interno), então o starter nascia sem eles e `tsc --noEmit` falhava em `main.tsx` com
**TS7016** em `react-dom/client`. Hoje entram no `STARTER_DEV_DEPENDENCIES`
(`constants.mjs:31-32`), com o motivo escrito ao lado.

**(b) A landing default caía no Design Engine.** Sem `defaultModuleId`, o `SarakShell` sempre
abria no módulo nativo `mx-customization` — **prioridade 9999**, que vence qualquer módulo do
consumidor. O starter passava a impressão de que a lib é um painel de temas. Corrigido setando
`options={{ theme: { defaultModuleId: 'exemplo' } }}` (`generators/mainTsx.mjs:13-20`).

Os dois têm a mesma forma: **o starter funcionava para quem o escreveu e não para quem o
recebia.** É o argumento a favor do smoke test de instalação existir.

# 4. O CLI de subcomandos

```
sarak-ui init | check | refresh    (+ --help / -h)
```

`bin/sarak-ui.mjs:20` fixa a lista; `:109-113` delega para os três módulos que **já existiam**
(`runInit`, `runCheckCli`, `runRefreshCli`) — a Spec 51 acrescentou **superfície pública**, não
lógica nova.

## 4.1 As quatro correções de honestidade da CLI

| # | Antes | Agora | `arquivo:linha` |
| --- | --- | --- | --- |
| D1 | comando desconhecido despejava o help do `init` sem dizer o que houve | `comando desconhecido: "X". Comandos válidos: …` **antes** do help, e continua `exit 1` | `bin/sarak-ui.mjs:100-107` |
| D2 | `check`/`refresh` só existiam como **caminho de arquivo interno** copiado para o `package.json` do importador | os scripts gerados usam `node node_modules/@sarak/lib-ui-core/bin/sarak-ui.mjs <cmd>` | `generators/packageJsonFields.mjs:12` |
| — | `--help` era o USAGE de um comando só | `--help` real: todos os comandos, todas as flags, exemplos, e a nota sobre TTY | `bin/sarak-ui.mjs:55-84` |
| — | sem TTY, o `init` ficava pendurado e às vezes saía `exit 0` **mudo** | guard que **falha em voz alta** antes de abrir o `readline` | `bin/scaffold/prompts.mjs:16-32` |

Sobre o D2: o consumidor estava decorando estrutura interna nossa, que qualquer refatoração
quebraria em silêncio. **Os caminhos antigos continuam funcionando** — nada foi movido
(`bin/scaffold/checkUpdate.mjs:30-35` e `refreshKit.mjs:34-39` mantêm o modo "execução direta").
Instalação existente não precisa mexer em nada; a mudança vale para instalações novas.

# 5. O aviso de atualização — o coração desta spec

## 5.1 O mecanismo

`sarak-ui check --notify`, ligado pelo `init` como **`predev`**
(`generators/packageJsonFields.mjs:62-71`). O importador é avisado a **cada `npm run dev`**, sem
precisar lembrar de rodar nada.

O contrato de saída é o que faz o aviso funcionar:

| Situação | Saída | Código |
| --- | --- | --- |
| Em dia | **nenhuma linha** | 0 |
| Link vivo (`file:` apontando para a fonte) | **nenhuma linha** | 0 |
| Não deu para verificar (offline, sem git, sem lockfile) | **nenhuma linha** | 0 |
| Existe versão nova **e** há comando a rodar | bloco destacado | **0** |

`formatNotice` devolve `null` para tudo que não seja "existe versão nova E há um comando"
(`checkUpdate/runCheckUpdate.mjs:199-201`), e `runCheckCli` engole qualquer exceção no modo
notify (`checkUpdate.mjs:20-24`).

> **`--notify` sai SEMPRE com 0.** Um aviso jamais derruba o `dev` de ninguém. O modo **normal**
> (sem a flag) é o oposto de propósito: sai com **1** se está desatualizado ou se a verificação
> falhou, para compor com automação (`checkUpdate.mjs:26-27`).

**Contrato de ruído** (`checkUpdate/renderNotice.mjs:1-12`): aviso que aparece sempre vira aviso
que ninguém lê. O silêncio em dia não é economia de linha — é a condição para o bloco ser lido
quando aparece.

**Tolerância a ambiente hostil:** `git ls-remote` roda com timeout de **3 s**
(`runCheckUpdate.mjs:35-40` e `tagComparison.mjs:14-18`), com `stdio` de erro ignorado. Rede
ruim não pode virar dev travado.

**Sem moldura fechada, de propósito** (`renderNotice.mjs:9-11`): caixa com borda à direita
desalinha com acento e com caminho longo do Windows. Separadores horizontais dão o mesmo
destaque e nunca quebram.

## 5.2 Quando o `init` não serve — o wiring manual

O `predev` automático cobre projeto **gerado pelo `init`**. Num monorepo real, duas premissas
caem:

- **quem DEPENDE da lib não é quem RODA o `dev`** — a dependência mora num pacote de biblioteca
  sem script `dev`, e quem roda `dev` é a raiz do workspace;
- **já existe um `predev`** na raiz, então não há campo livre. O merge preserva o do consumidor e
  reporta em `skipped` (§3.3).

Por isso: (a) o comando funciona **de qualquer diretório** do workspace, já que sobe a árvore
atrás do lock (§7); (b) o kit traz a receita de encadear a linha à mão; (c) **nada de
`postinstall`** — a lib propõe a linha, quem cola é o importador.

⚠️ O `postinstall` foi rejeitado por dois motivos independentes: é superfície de supply chain, e
roda no momento errado — quem acabou de instalar está, por definição, em dia.

## 5.3 Como o `check` decide (a ordem real)

1. **Por TAG** (ADR-008), se o spec não fixa um commit no próprio texto: maior tag `vX.Y.Z` do
   remoto × versão instalada, lida do `package.json` **do pacote em `node_modules`** — não do
   lockfile, que guarda o commit e não a versão (`tagComparison.mjs:33-40`, `:67-106`). A
   mensagem passa a dizer `v1.0.0 → v1.1.0` em vez de dois hashes de 7 caracteres, que é o que o
   consumidor consegue relacionar com a faixa que escreveu.
2. **Por COMMIT**, se não deu para decidir por tag (remoto sem `vX.Y.Z`, versão ilegível,
   consulta falhou): `resolved` do lockfile × HEAD remoto. **Não foi removido** — `github:` puro
   continua suportado e um repositório novo tem de responder alguma coisa.
3. **Commit fixado no spec** (`…#7fd0bd1`): não há HEAD para comparar; foi decisão explícita do
   autor do spec, e o `check` diz isso em vez de inventar comparação
   (`resolveRemoteUrl.mjs:29-31`, `runCheckUpdate.mjs:137-143`).
4. **`file:`/`link:`**: §6.

⚠️ **Limite declarado do filtro de faixa** (`tagComparison.mjs:42-59`): `majorDaFaixa` lê **só o
MAJOR**. `~1.2.0` é tratado como `^1.2.0`, e o consumidor recebe aviso de um `v1.9.0` que o
`npm update` dele nunca vai entregar — exatamente o ruído permanente que o §5.1 combate. Faixa
que não fixa major (`>=1.0.0`, `*`) devolve `null` e nada é filtrado. **Registrado, não
corrigido:** está roteado para a Fase D da Campanha 2.

# 6. Os DOIS modos de dependência

| Modo | Como detecta | O que a mensagem diz |
| --- | --- | --- |
| **git spec** (`github:…`) | tag remota (ou commit) × instalado | "instalado v1.0.0, publicado v1.1.0" |
| **`file:`/`link:`** | assinatura de build instalada × a do repositório em disco | "a biblioteca em `<caminho>` mudou desde a sua última instalação" |

O modo `file:` é o que mais dói, e é o modo do único consumidor real hoje (D13): o gerenciador
**copia** o pacote para o store, então **rebuildar a lib não chega ao consumidor e nada avisa**.
É a classe de defeito do ADR-007 repetida noutra forma.

## 6.1 O teste certo não é "o `node_modules` é symlink?"

Todo gerenciador moderno usa symlink para alguma coisa. Medido: num workspace pnpm o symlink
aponta para o **store** (é cópia); num projeto npm simples ele aponta para a **fonte** (é link
vivo). **O que decide é o `realpath`** — cai dentro da fonte declarada no spec ou não
(`checkUpdate/localDependency.mjs:10-14`, `:114-127`). Daí os quatro vereditos:

| Veredito | Significado |
| --- | --- |
| `live` | o `node_modules` **é** a fonte → sempre em dia, nada a fazer |
| `fresh` | é cópia, e a cópia bate |
| `stale` | é cópia, e a fonte mudou → **dispara o aviso** |
| `indeterminado` | não deu para ler a assinatura dos dois lados (ex.: lib nunca buildada) |

## 6.2 ⚠️ O achado que muda o desenho: comparar CONTEÚDO não bastava

A primeira implementação comparava `dist/BUILD_INFO.json` + `sarak-ui/VERSION` instalados contra
os da fonte — e dizia **"em dia"** com a instalação comprovadamente velha.

**Causa: o pnpm HARDLINKA os arquivos para o store.** Reescrever um arquivo **existente** (o
`BUILD_INFO.json` de um rebuild) propaga sozinho para a cópia instalada. O que o hardlink **não**
propaga é arquivo **adicionado ou removido** — que era exatamente o sintoma real (`sarak-ui/`
inteiro ausente na cópia).

**Correção:** a assinatura passou a incluir o **inventário** `caminho:tamanho`, recursivo, de
`dist/` **e** `sarak-ui/` (`localDependency.mjs:61-96`). Registrado porque a intuição "comparar o
conteúdo basta" é forte e está errada aqui.

Detalhe correlato: o rótulo impresso combina `kitHash` **e** a assinatura do `dist/`, porque só o
`kitHash` não basta — um arquivo novo ou removido no `dist/` deixa o `kitHash` igual
(`runCheckUpdate.mjs:77-79`).

**Fronteira reusada, não duplicada:** `hashInventoryLines` é **exportada** para que o gate de
release (`gates/scripts/release/check-release-tag.mjs`, ADR-008) responda "o artefato publicado mudou?" com
**exatamente este critério**, só que lendo o inventário do git (`localDependency.mjs:25-36`).
Duas noções concorrentes de "o que é o artefato" seriam a porta para o gate dizer uma coisa e o
`check` dizer outra.

# 7. Monorepo

`resolveConsumerContext` (`checkUpdate/consumerContext.mjs:65-86`) sobe a árvore em três buscas
independentes:

- o `package.json` relevante é **o primeiro, subindo, que DECLARA a dependência** — não o
  primeiro que existir (num monorepo o de cima quase nunca é o certo);
- o **lockfile** é o primeiro, subindo a partir dali, de qualquer gerenciador;
- o **pacote instalado** é procurado em `node_modules/<nome>` subindo (hoisting).

Antes disso, `runCheckUpdate` exigia `package.json` **e** `package-lock.json` no **mesmo**
diretório, e falhava com "não encontrados" estando tudo certo.

# 8. Multi-gerenciador

## 8.1 Detecção

Ordem determinística, primeira que casar vence (`bin/scaffold/packageManager.mjs:81-106`), **em
cada nível da subida**:

1. campo **`packageManager`** do `package.json`;
2. **lockfile** presente (`pnpm-lock.yaml` · `yarn.lock` · `package-lock.json`);
3. default **`npm`**.

O campo tem precedência porque **é declaração de intenção; lockfile é rastro**. O consumidor
investigado tinha `pnpm-lock.yaml` **e** um `package-lock.json` resíduo dois dias mais velho.

⚠️ **Ambiguidade é reportada, não silenciada**: mais de um lockfile no mesmo diretório → o mais
recente vence e a mensagem diz quais achou e qual assumiu (`packageManager.mjs:92-103`,
`runCheckUpdate.mjs:184-189`). Silenciar aqui é como um resíduo npm num repositório pnpm passa
despercebido até quebrar algo.

## 8.2 ⚠️ A REGRA DURA: comando não executado de verdade não entra

> **Documentação de gerenciador não é prova.** Só entra comando que foi **rodado com sucesso** num
> consumidor real. O que não foi validado é marcado `validated: false` e a mensagem **degrada
> para instrução genérica**, em vez de mandar o consumidor rodar um chute
> (`packageManager.mjs:13-15`, `renderNotice.mjs:16-27`).

A regra não é preciosismo: **foi deduzir comando que quebrou o repositório de um consumidor
real** — um `npm install` num workspace pnpm entrou em `node_modules/.pnpm/` e tentou rodar o
`prepare` de um pacote de terceiro.

**Dependência GIT** (`packageManager.mjs:140-154`):

| Gerenciador | Comando | Validado |
| --- | --- | --- |
| npm | `npm uninstall <pkg> && npm cache clean --force && npm install <spec>` | ✅ |
| pnpm | `pnpm remove <pkg> && pnpm add <spec>` | ✅ |
| yarn | `yarn remove <pkg> && yarn add <spec>` | ✅ |

O npm precisa das **três** etapas porque a `version` não muda entre commits: o lockfile é
considerado satisfeito e o cache git serviria o mesmo commit velho. O `remove` que antecede
pnpm/yarn cumpre o mesmo papel do `uninstall` — tirar o pin do lockfile.

**Dependência LOCAL** (`packageManager.mjs:118-126`):

| Gerenciador | Comando | Validado |
| --- | --- | --- |
| pnpm | `pnpm install --force --filter <pacote>` | ✅ **no consumidor real** |
| yarn | `yarn install --force` | ✅ em probe |
| npm | `npm install --force` | ❌ **não validado** — nas topologias medidas o npm **linka** a fonte, então nunca fica velho; a forma fica registrada para o caso de um layout em que ele copie |

# 9. `sarak:update` — atualizar a lib **e** refrescar o kit

O script gerado tem duas metades (`generators/packageJsonFields.mjs:33-41`):

```
<comando de atualização do gerenciador detectado>  &&  <CLI> refresh
```

Sem a segunda, a lib estaria nova e as **instruções de uso** descreveriam a API velha — o pior
estado possível para um kit cuja premissa é "nunca desatualiza".

O `refresh` re-sincroniza a pasta `sarak-ui/` (conteúdo gerado, sempre sobrescrita) e **só toca
nas cópias movidas que JÁ existem** nos caminhos conhecidos de `bin/scaffold/kitTargets.mjs`
(detalhe em [[12-kit-do-consumidor]] §6). Ele **nunca falha o comando de atualização**: se a
versão instalada não trouxer kit, avisa e sai com 0 (`bin/scaffold/refreshKit.mjs:20-22`) — a lib
já foi atualizada com sucesso, e derrubar o `sarak:update` por causa disso seria pior.

Se o gerenciador não tiver comando validado, o script degrada para uma linha que **explica o que
fazer** e ainda assim roda o `refresh` (`packageJsonFields.mjs:37-40`).

# 9.1 ⚠️ Atualizar o PACOTE não é atualizar o que o navegador executa

Entre o `dist/` da lib e a tela do consumidor existem **duas camadas de cache em série**. Cobrir só a
primeira é o modo de falha mais caro desta spec: todo comando responde sucesso, todo gate passa, e a tela
continua com o build anterior — **sem erro, sem aviso, sem sintoma que aponte para a causa.**

| # | Camada | Por que não se invalida sozinha | Como se resolve |
| --- | --- | --- | --- |
| 1 | **Store do gerenciador** — com `pnpm`, `file:` é **cópia**, não link (§6.1) | o lockfile continua satisfeito; nada manda recopiar | `pnpm install --force --filter <pacote>` |
| 2 | **Pré-bundle do bundler** — Vite: `node_modules/.vite/deps/` | o Vite re-otimiza por **lockfile + versão + config**, nunca por conteúdo. Com dependência local a `version` fica parada, o caminho é o mesmo e a config não muda: **a chave do cache nunca se move** | derrubar o dev server, apagar a pasta, **provar** que apagou, subir |

**Nenhum sinal existente responde a essa pergunta sozinho, e é importante saber por quê:**
`sarak-ui check` compara o **pacote** e responde `live`/`fresh`/`stale` — corretamente; `BUILD_INFO.json`
descreve o **artefato em disco** (§10); e recarregar, hard-refresh ou guia anônima **não alcançam**, porque
o cache é do **servidor de desenvolvimento**, não do navegador.

## O aviso automático

`sarak-ui check` emite, com **rótulo próprio** (`[sarak:check:cache]`), um aviso quando encontra a segunda
camada defasada. O sinal é de **conteúdo**, não de tempo: o cache referenciando, **por nome**, um chunk
content-hashed que não existe mais no `dist/` instalado. Um heurístico por `mtime` foi descartado — ele
dispararia em todo rebuild, inclusive nos que não mudaram nada.

O rótulo é separado de propósito: fundir "o pacote está velho" e "o cache está velho" num único veredito
criaria um terceiro sinal ambíguo. E a busca **desce a partir da raiz do workspace**, não do diretório
corrente — num monorepo, o pacote que **declara** a lib normalmente não é o que **roda** o bundler.

**O aviso nunca afirma "cache em dia".** Ele tem dois estados úteis: encontrou referência quebrada, ou não
tinha o que comparar. Silêncio não é garantia — os limites do detector estão declarados no próprio código
(R18) e resumidos em [[01-gates-e-baseline]].

## O procedimento, na ordem — e a ordem importa

1. **Derrube o dev server primeiro.** No Windows, um processo com os arquivos abertos **impede** a deleção.
2. Apague o cache do bundler.
3. **PROVE que apagou** — `Test-Path` ⇒ `False`, ou `[ ! -d … ]`. Não confie no código de saída do passo 2:
   *"pasta não existe"* e *"arquivo em uso"* são erros **diferentes**, e um supressor de erro genérico os
   confunde, transformando falha em sucesso aparente.
4. Só então reinstale (camada 1) e suba o dev server.

Pular o passo 1 produz tela **branca** com `504 (Outdated Optimize Dep)`; pular o passo 3 produz tela
**idêntica** à anterior. Nenhum dos dois sintomas aponta para a causa.

# 9.2 Verificação em consumidor real

Depois de atualizar, o que confirma que chegou — em ordem de custo:

| Pergunta | Como responder |
| --- | --- |
| O **pacote** está atualizado? | `sarak-ui check` |
| O **navegador** está com esse pacote? | ausência de `[sarak:check:cache]`; na dúvida, §9.1 |
| A mudança **aparece na tela**? | abrir a tela afetada, com dado real |

A terceira é a única que fecha o ciclo, e **nenhuma verificação estática a substitui**: gates verdes e
artefato conferido convivem perfeitamente com tela errada. Quando o consumidor persiste tema, some ainda a
precedência de [[09-temas-e-presets]] §4.4.1 — **valor salvo vence default**, então mudança de default não
aparece para quem já tinha o valor gravado.

# 9.3 Persistir tema no seu backend — opcional

Persistência é **do importador**; a lib não tem backend ([[003-remocao-backend-proprio]]). Para quem
decidir persistir, a lib **publica os artefatos de referência** em vez de exigir engenharia reversa a
partir dos tipos:

- o **formato** do dado que atravessa as portas;
- um **schema de referência em dois dialetos** (PostgreSQL e SQLite);
- o **exemplo de ligação** das portas.

São referência, não obrigação: nenhum deles é importado pela lib em runtime, e o consumidor que não
persiste ignora a seção inteira. O contrato das portas está em [[09-temas-e-presets]] §4.4 e §4.6.

# 10. ⚠️ A armadilha do `BUILD_INFO`

`dist/BUILD_INFO.json` traz `baseCommit`, `builtAt` e `libVersion`. E o `baseCommit` é **sempre
um commit atrás**:

> O hash de um commit **não pode conter a si mesmo**. Qualquer arquivo gerado antes do commit
> registra, por construção, o commit **anterior**. Não é bug; é auto-referência impossível.

**Para responder "estou atualizado?", use `sarak-ui check` — NUNCA o `BUILD_INFO`.** O
`packageJsonFields.mjs:43-52` diz isso por escrito no comentário do gerador do script.

O `BUILD_INFO` **é** útil para outra pergunta: *"qual artefato está instalado aqui?"* — é parte da
assinatura do modo `file:` (§6.2) e foi como o P28 provou que a cópia do ERP havia sido refeita.
São perguntas diferentes, e confundi-las é o erro que a armadilha produz.

Desde o ADR-008 isso **parou de importar tanto**: a identidade passou a ser a **tag**.

# 11. Achados registrados nesta spec (nenhum corrigido)

Escopo da Campanha 1 fechado — todos vão para a Campanha 2.

## 11.1 O starter gerado cita um consumidor OBSOLETO

`bin/scaffold/generators/mainTsx.mjs:37-40` escreve, **dentro do `main.tsx` que todo consumidor
novo recebe**:

> `// Registro Industrial de Componentes com Proteção — espelha o padrão real do Sarak-MyService`
> `// (safeRegister/registerSarakModuleSafe em Sarak-MyService/src/main.tsx)`

O `Sarak-MyService` é **OBSOLETO** (decisão D6, 2026-07-28) e o importador não tem acesso nenhum
a esse repositório. O código gerado está correto; a **justificativa** aponta para algo que o
leitor não pode conferir. Mesma classe do achado dos JSDoc ([[12-kit-do-consumidor]] §10):
comentário que viaja para o consumidor é documentação pública.

## 11.2 Ponteiro morto em `context.mjs`

`bin/scaffold/context.mjs:5-10` afirma que o starter "não usa mais
`templates/app-starter.manifest.json`" e que "o template **segue publicado**
(`SARAK_STARTER_MANIFEST`) para quem quiser usar o motor de manifesto (Spec 11) como recurso
opcional".

**Medido nesta entrega:** a pasta `templates/` **não existe** na raiz do repositório, e
`SARAK_STARTER_MANIFEST` tem **0 ocorrências** em `src/`, `bin/` e `scripts/` fora do próprio
comentário. O motor de manifesto foi removido inteiro (ADR-002). O comentário descreve um recurso
opcional que não existe.

## 11.3 O filtro de faixa lê só o MAJOR

Ver §5.3. Roteado para a **Fase D** da Campanha 2, junto do `sarak-ui update`.

# 12. Fronteiras desta spec

- O **artefato** `sarak-ui/` e seu contrato são [[12-kit-do-consumidor]].
- O **build** e o campo `files` são `specs/arquitetura/05-build-e-distribuicao.md`.
- A **política de versão** (o que é major/minor/patch, o ritual de release) é
  [[03-versionamento-e-release]].
- O **porquê** da distribuição por Git é o ADR-007; o da publicação por tag, o ADR-008.
- O comando `sarak-ui update` **não existe hoje** — é escopo da Fase D da Campanha 2. Esta spec
  descreve o que existe.

# 13. Critérios de Aceite

- [x] `sarak-ui` aceita `init`/`check`/`refresh`; comando desconhecido diz **qual** não existe.
- [x] `--help` real, com todos os comandos, flags e exemplos.
- [x] Guard de TTY: sem terminal e sem flags suficientes, o `init` falha com 1 — nunca em silêncio.
- [x] `check --notify` silencioso em dia e **exit 0 em todos os casos**, inclusive sem rede.
- [x] O aviso funciona nos dois modos de dependência (git **e** `file:`/`link:`).
- [x] Detecção npm/pnpm/yarn por `packageManager` → lockfile → default, com ambiguidade reportada.
- [x] Comandos de pnpm e yarn **executados de verdade**; o não validado degrada a mensagem.
- [x] `check` acha o lockfile **acima** do pacote (monorepo).
- [x] Os scripts gerados usam a superfície pública da CLI; os caminhos antigos continuam válidos.
- [x] `sarak:update` atualiza **e** re-sincroniza o kit, sem nunca derrubar a atualização.

# 14. Plano de Testes (Quality Gate)

## Testes Unitários existentes (12 arquivos em `bin/**/__tests__/`)
- [x] `packageManager.test.mjs` — detecção por campo, por lockfile, default, ambiguidade,
      monorepo (subida da árvore) e a fronteira `stopAt` que a tornou **hermética**.
- [x] `localDependency.test.mjs` — os quatro vereditos (`live`/`fresh`/`stale`/`indeterminado`)
      e o inventário que pega arquivo adicionado/removido.
- [x] `tagComparison.test.mjs` — comparação por tag, filtro de faixa e queda para commit.
- [x] `runCheckUpdate.test.mjs` — os modos, o `--notify` e o silêncio.
- [x] `resolveRemoteUrl.test.mjs` / `readInstalledCommit.test.mjs` — tradução de spec e leitura
      do lockfile.
- [x] `runInit.fs.test.mjs` / `mergePackageJson.test.mjs` / `prompts.test.mjs` /
      `packageJsonFields.test.mjs` / `viteConfig.test.mjs` — o scaffolder.
- [x] `runRefreshKit.test.mjs` — o refresh só toca no que já existe.

## Verificação de sistema
- [x] `node bin/sarak-ui.mjs --help` imprime o USAGE completo e sai com 0.
- [x] `package:check` exige no tarball todos os módulos que o `check`/`refresh` do consumidor lê
      (`gates/scripts/contrato/check-package-contents.mjs:36-52`).

## Lacunas declaradas
- [ ] **Nenhum teste automatizado exercita um `install` de verdade.** As provas de instalação
      ponta a ponta (npm/pnpm/yarn) foram feitas à mão, uma vez, e estão registradas em relatório
      — não há gate que as repita. Uma regressão no `init` só apareceria no próximo consumidor
      novo.
- [ ] **O `--notify` no `predev` nunca foi exercitado em pipeline** — só em consumidor real, à
      mão. É o comando que roda mais vezes na vida do importador e o menos coberto por automação.
