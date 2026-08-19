---
tipo: "spec"
titulo: "Dívida conhecida — o registro dos defeitos medidos e ainda não corrigidos"
dominio: "Sarak-Lib-UI-Core / Qualidade / Dívida técnica"
status: "🟢 Vigente"
prioridade: "Máxima"
tags: ["spec", "divida-tecnica", "achados", "auditoria", "roteamento"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[16-integracao-continua]]", "[[00-contexto]]"]
---

# 1. Propósito

O registro **único** dos defeitos que já foram **verificados no código** e ainda não corrigidos. Um agente que
leia esta spec para de "descobrir" o que já está catalogado — e para de propor conserto para o que já foi
decidido manter.

Quatro coisas que este documento **não** é:

- **Não é lista de desejos.** Todo item tem `arquivo:linha` e exposição medida. Suspeita sem medição não entra.
- **Não é backlog de prioridade.** A ordem de execução vive em [[00-indice]]; aqui a ordem é a de descoberta.
- **Não é histórico.** Item fechado **sai** da §3 (o histórico é o `git` e o veredito da plan que o fechou).
- **Não é a fila de gates a construir.** Verificação que nunca existiu **não é dívida** — é implementação
  posterior, e mora na §4. A §3 é só código que viola regra **já formada**.

**Como ler:** §3 é a dívida. §4 é o trabalho de gate que ainda não teve a sua vez. §5 e §6 guardam os números
que saíram, para que nenhum seja reaproveitado.

> **Regra de manutenção:** toda plan que fecha um achado **remove a linha dele aqui**, na mesma execução. Achado
> que sobrevive à sua própria correção vira ruído, e ruído faz a spec inteira perder credibilidade.

---

# 2. Origem e numeração

Os achados 1–31 vêm da campanha de reescrita da base de specs (2026-07-28 → 2026-08-01), em quatro rodadas de
auditoria. **A numeração é definitiva e nunca reaproveitada** — achado fechado não devolve o número.

Eles não são erros das specs antigas: são **defeitos e ambiguidades do módulo**, encontrados porque alguém foi
conferir no código em vez de copiar do material anterior.

**Estado em 2026-08-01, após a triagem (plan-03):** 31 numerados · **10 fechados** (§6) · **2 aceitos como
característica** (§5) · **5 movidos para implementação posterior** (§4) · **14 abertos** (§3). Soma: 31.

> ⚠️ **Correção de contagem.** Até esta triagem o cabeçalho declarava *"9 fechados · 22 abertos"*. Contado item
> a item: eram **8 fechados e 23 abertos** (8 + 23 = 31). Os dois números estavam errados; a numeração, não.

**Estado em 2026-08-07, após a síntese das plans 06/07/09/12 (`/spec-atualizar`):** as plans de conserto e de
construção de gate fecharam 12 achados de código e 2 gates de "implementação posterior" (§4.1), e mediram um
achado novo. **32 numerados** (o 32 é novo) · **24 fechados** (§6) · **2 aceitos como característica** (§5) ·
**3 em implementação posterior** (§4) · **3 abertos** (§3). Soma: 32.

> 🔴 **Desde 2026-08-15 o estado não é mais declarado por cifra aqui, e isso é decisão.** Toda contagem
> escrita em prosa acerta no dia em que é escrita e mente a partir do dia seguinte — foi o que aconteceu com
> as duas linhas acima, e é a mesma armadilha que o achado **32** registra para `arquitetura/04`.
>
> **O que esta spec afirma agora é a RELAÇÃO, não o total:** *todo número emitido aparece em exatamente uma
> das §3, §4, §5 ou §6* — nenhum some, nenhum aparece duas vezes, nenhum é reaproveitado. Quem quiser a
> contagem a conta: `grep -cE "^\| [0-9]+ \|"` na seção que interessa. As duas linhas acima ficam como
> **registro datado** de triagens que aconteceram, não como estado corrente.

---

# 3. Achados ABERTOS — a dívida de verdade

> **Como esta seção se move, e por que ela não declara total.** Achado entra pelo próximo número livre e sai
> quando fecha — por **conserto** ou por **não se reproduzir**, e os dois motivos são escritos com todas as
> letras na §6, porque não são a mesma coisa. O histórico de cada movimento vive no `git` e no veredito da
> plan que o causou; repeti-lo aqui transformaria a spec em changelog, que é o que a §1 diz que ela não é.
>
> ⚠️ **Dívida aceita não é dívida resolvida.** O achado **34** foi aceito porque *"a exposição medida na base
> é zero"* — e voltou como **40** quando a exposição deixou de ser zero, achado no console de um consumidor
> real. É a razão de os números fechados continuarem registrados: permitir reconhecer o reincidente.

## 3.1 Segurança e medição

> **Esta categoria esvaziou e voltou a encher — é o comportamento esperado dela.** Os cinco achados que a
> ocupavam (**33**, **35**, **37**, **38**, **39**) saíram para a §6 em 2026-08-15: três **corrigidos**, dois
> por **não se reproduzirem** — e a distinção entre os dois motivos está registrada lá, porque "ninguém
> consertou nada, a premissa é que estava errada" não é a mesma coisa que "foi consertado".
>
> É a categoria de *gate que mede errado ou não mede*, e por isso ela **permanece mesmo vazia**: pelo
> contrato da §8, é para cá que volta o próximo achado da classe.
>
> ⚠️ **Vários dos achados que passaram por aqui foram encontrados OLHANDO O CONSUMIDOR**, não a suíte — com a
> base inteira verde e nenhum teste vendo nenhum deles. **Suíte verde não é produto correto**; é o vão que a
> §4 desta spec existe para lembrar, e que a leva 47/49/50 reencontrou por caminho independente.

| # | Achado | Onde | Regra | Destino |
|---|---|---|---|---|
| 41 | **A derivação do nome do tema não trata dígito depois de hífen.** `themeId.replace(/-([a-z])/g, …)` só casa letra minúscula após o hífen, então `'tema-2-escuro'` vira `'tema-2Escuro'` — **identificador JS inválido**, e o arquivo gerado não compila. É a mesma classe do achado **39** (fechado): o gerador de tema emite o que não faz parse | `.agents/skills/ui-criar-tema/scripts/generate_theme_template.ts:30` | **nenhuma** | **Corrigir** — casar `[a-z0-9]`, e cobrir com um teste que compile a saída para um id com dígito |
| 42 | **O consumidor não tem como declarar `span` num grid de 12 colunas.** `layoutGridTemplate: 'col-12'` funciona sem span desde a `plan-49` (o filho sem span recebe um default por breakpoint), mas **não existe `SarakGridItem` nem prop `span`** na superfície pública. Quem quiser o controle fino do grid de 12 colunas depende de escrever `col-span-*` do próprio bolso — o que funciona (o default do pai tem especificidade zero, `:where`), mas **não é contrato publicado**: não está no barril, no catálogo, nem em spec | `src/components/atomic/Layouts/SarakGrid.tsx` · `src/index.ts` | **nenhuma** | **Decidir** — publicar o contrato de span, ou declarar que `col-12` é para uso com classe própria do consumidor. Enquanto não decidir, é capacidade real e não documentada |
| 43 | **O piso de cobertura tem 4,5 pontos de folga — e a cobertura não é estável entre execuções.** Medido pelo revisor em 2026-08-18, suíte 100% verde (317 arquivos / 1371 testes): `lines` em **75,97%** contra piso commitado de **71,47%**. O gate imprime `MELHOROU (nada bloqueado)` e **pede** o `--write`, que ninguém rodou — as plans 47/49/50 melhoraram o número e foram sintetizadas sem regravar o piso, contra o que a **R20** manda (*regravar e commitar **junto do conserto***). Consequência: **qualquer regressão que caiba nos 4,5 pontos não bloqueia nada** — é o mesmo *"teto folgado é um gate desligado pela metade"* de [[01-gates-e-baseline]] §4.2, invertido para piso. ⚠️ **E o número oscila:** uma medição de 2026-08-18 deu **76,02%** (`statements` 74,25%) e o revisor mediu **75,97%** (`statements` 74,19%) **no mesmo commit**, com as duas suítes verdes — então a cobertura varia por execução, o que é candidato natural aos **três estados mutáveis de módulo** de `src/` (`persistenceStrategy.ts`, `master-map.ts`, `validation.ts`), cuja ordem de execução muda quais ramos são exercitados — a mesma hipótese que o achado **44** carrega. | `gates/baselines/coverage-floor.json` (piso) · `gates/scripts/release/check-coverage-floor.mjs` (o gate) | **R8.1** (piso móvel) · **R20** (baseline não regride) | 🔓 **DESTRAVADO em 2026-08-18: a investigação da intermitência fechou DECLARANDO, não consertando** (achado **44**) — a intermitência não foi reproduzida em 46 execuções controladas, e segue **sem nome**. Pelo critério original desta linha, isso significa que o piso teria de ser o **mínimo sobre N execuções**. ⚠️ **Mas aquele laço não rodou `--coverage`** (ela pedia a suíte, não a cobertura), então **as 20 execuções não produzem o dado que este achado precisa**. Fica: quem regravar o piso mede a cobertura em laço — não numa rodada só — e o `--write` viaja junto do commit, como a **R20** manda |
| 46 | **O `plan-index:check` roda pela METADE no `pre-commit`.** O hook chama só `check-plan-index-sync.mjs`; o `npm run plan-index:check` é `check-plan-index-sync.mjs && generate-plan-index.mjs --check`. **A segunda metade — comparar o índice gerado agora contra o commitado — nunca rodou em commit nenhum.** Um índice cujo conteúdo diverge do que o gerador produziria passa o hook em silêncio | `.githooks/pre-commit` · `package.json` (script `plan-index:check`) | **nenhuma** | **Aceitar e vigiar.** A CI passou a rodar `plan-index:check` inteiro desde 2026-08-18 ([[16-integracao-continua]]), então o vão existe **só entre o commit e o push**. Igualar o hook ao script é conserto de uma linha, mas move custo de commit — decisão do dono |
| 47 | **A suíte coleta e RODA duas vezes o mesmo arquivo físico, por causa de um symlink que o git rastreia como blobs.** `.claude/skills` é symlink de `.agents/skills`, mas `git ls-files` mostra **16 arquivos regulares** sob `.claude/skills` (`mode 100644`, **nenhuma entrada `120000`**). Nesta máquina os dois caminhos são o mesmo inode — **num clone limpo viram duas cópias independentes**, que o Vitest roda duas vezes e **que podem divergir em silêncio**. Já estava presente antes de ser medido: faz parte da contagem `317/1376` | `.claude/skills` (symlink) × `.agents/skills` (real) · `vitest.config.ts` (sem `exclude`) | **nenhuma** | **Decidir.** Um `exclude` de `.claude/skills/**` eliminaria a duplicação sem mudar cobertura real — mas **muda a contagem da suíte**, que é referência de várias plans. Plan própria |
| 48 | **`install-tag.yml` existe, está ativo, e nunca disparou.** O **mecanismo** (`github:…#semver:^X.Y.Z` nos 3 gerenciadores) foi provado à mão contra o repositório público real; o **gatilho** (`push: tags: ["v*"]`) tem **0 runs**, porque nenhum `npm version` rodou desde que ele passou a existir. **Zero execuções não é "provado"** — é a mesma forma do verde falso que motivou remover o aparato E2E (achado **45**) | `.github/workflows/install-tag.yml` | **nenhuma** | **Fecha sozinho no próximo `npm version`** — não é código a escrever, é o gatilho disparar. Quem o emite é o dono. Fecha no **mesmo evento** que exercita pela primeira vez a skill `git-ci-cd` ([[17-contrato-de-operacao-git]] §6) |
| 49 | **O leitor de notas de migração ancora por UM título só por major.** `extractMigrationNotes` recorta o intervalo pela primeira entrada cujo título cite `X.0.0`; onde um major saiu com **mais de uma nota** o corte fica aproximado. Medido: a âncora da `6.0.0` cobre o lote certo das **três** quebras daquela tag (porque foi posta na entrada mais nova do lote), mas a da `5.0.0` deixa uma nota MINOR adicional — inofensiva, já conhecida — visível para quem já estivesse em `5.x` | `bin/scaffold/checkUpdate/migrationNotes.mjs` | **nenhuma** | **Aceitar e vigiar.** Resolver exige `extractMigrationNotes` aceitar **múltiplas âncoras por major**; o dano hoje é mostrar nota a mais, nunca a menos — **erra para o lado seguro** |
| 44 | **A suíte não foi provada determinística, e os testes intermitentes seguem SEM NOME.** Duas falhas observadas (2026-08-13 e 2026-08-14), sempre com a mesma assinatura — **1 arquivo, 2 testes** —, seguidas de execuções verdes. **46 execuções controladas não reproduziram**, mas em **duas bases distintas**: 26 na base onde o defeito apareceu (teto **11,5%**) e 20 numa base posterior (teto **15,0%**). Agregar as duas daria 6,5% e suporia que o defeito independe da base — o que não se sabe. **Não está descartado: está sem nome**, e pode tanto ser raro quanto ter morrido por acidente nas mudanças do intervalo | a suíte inteira (`npx vitest run`) — sem alvo identificado | **R8** *(cobertura 1:1 — o que ela vale quando não é determinística)* | **Aceitar e vigiar.** Perseguir além de 20 execuções controladas é a perseguição indefinida que a investigação original proibiu. Se reaparecer, o procedimento de captura de [[11-testes-e-cobertura]] §3.5 é o que transforma a próxima ocorrência em nome — **grave a saída inteira em arquivo, nunca `tail`/`grep` ao vivo** |

> 🔎 **O achado 44 ganhou DOIS NOMES em 2026-08-18, e a linha dele continua aberta.** As duas capturas estão
> em [[11-testes-e-cobertura]] §3.5.1 — e a mais valiosa falhou em `HEAD` **puro**, via `git stash`, sem
> nenhuma alteração aplicada: é a primeira evidência direta de que a intermitência é **pré-existente e
> independente** de qualquer mudança que se estivesse medindo. Nenhuma das duas reproduziu na rodada
> seguinte, então a linha permanece *"aceitar e vigiar"* — nomes de ocorrência não são causa identificada.
>
> **A captura deixou de depender de alguém lembrar:** o job `gates` grava a saída completa da suíte como
> artifact **inclusive no verde** ([[16-integracao-continua]] §4.1). Cada run é uma amostra grátis.

## 3.2 Violação de regra **já formada** que o gate agora vê, mas não corrige sozinho

> ✅ **Categoria vazia desde 2026-08-08.** Seu único ocupante — o achado **29** — fechou as duas metades e saiu
> para a §6, como o contrato da §8 manda. **A categoria fica**: ela é o que a §8 chama de *"achado com duas
> metades"*, e é para cá que volta o próximo caso em que o gate passa a **ver** uma violação que ele não
> **conserta**.

## 3.3 Prosa manual desatualizada por um conserto de outra plan

> ✅ **Categoria vazia desde 2026-08-09.** O achado **32** saiu para a §6. **A categoria fica** — ela é a que
> mais reincide nesta base, e o padrão já apareceu três vezes: `arquitetura/04` com `416`, depois `410`,
> depois `409`. A lição que fechou o 32 vale como aviso permanente: **total absoluto em prosa envelhece a cada
> conserto.** Cifra fica em fonte gerada; prosa afirma a relação.

## 3.4 Ambiente e cadeia de ferramentas — o que só a CI podia ver

> 🆕 **Categoria criada em 2026-08-19, e a origem dela é a resposta a uma pergunta.** *"Para que serve uma CI
> se os hooks já rodam tudo?"* — para isto. Os quatro achados abaixo **não eram invisíveis por descuido**:
> eram invisíveis **por construção**, porque todo gate local roda na máquina que é o próprio problema. O
> primeiro deles apareceu no **primeiro run**.

| # | Achado | Onde | Regra | Destino |
|---|---|---|---|---|
| 50 | **O lockfile é gerado por um npm mais antigo que o ambiente de referência.** `npm ci` **reprovou** no runner (`EUSAGE`, entradas hoisted de topo faltando) com um lock que o npm local aceitava sem reclamar. Reproduzido localmente com `npx npm@11.17.0 ci --dry-run`. Corrigido regenerando o lock do zero com o npm do runner — **mas reincide enquanto as duas versões divergirem** | `package-lock.json` | **nenhuma** | **Corrigir a causa, não o sintoma** — ver achado **51**, que é o conserto estrutural desta linha |
| 51 | **Não há `packageManager` nem `engines` no `package.json`.** É o que tornaria a divergência do achado **50** impossível em vez de recorrente: o campo `packageManager` fixa o gerenciador (e o corepack o respeita), e `engines` declara a faixa de Node esperada | `package.json` | **nenhuma** | **Candidato a plan própria.** Fixar versão de ferramenta é decisão com custo (todo colaborador passa a ser cobrado), e por isso não entrou de carona numa correção de lockfile |
| 52 | **O npm 11.17 já avisa que `esbuild` cai na política `allowScripts`.** Hoje é *warning*; a direção do npm é essa política endurecer. Quando endurecer, **o build para** — e vai parar no dia de um release, não num dia calmo | `package-lock.json` · cadeia de build (`tsup`/`esbuild`) | **nenhuma** | **Vigiar.** Nada a fazer enquanto for warning; a linha existe para o dia em que virar erro não ser uma surpresa |
| 53 | **As `actions/*@v4` rodam forçadas em Node 24 no runner.** É manutenção normal de dependência de CI — migrar para `@v5` quando a migração for estável | `.github/workflows/gates.yml` · `install-tag.yml` | **nenhuma** | **Manutenção.** Sem urgência, sem risco conhecido; registrado para não ser "descoberto" de novo |

---

# 4. Implementação posterior — os gates que ainda NÃO existem

> 🔒 **Isto não é dívida.** Decisão do dono (plan-03, 2026-08-01): *"tudo que é relacionado ao gate de
> verificação ainda não foi implementado — não é dívida, é implementação posterior. Devemos ter todas as
> regras formadas, para então criar a verificação para o gate."*

A diferença é de sequência, não de rigor. Um gate que **nunca foi construído** não é um defeito do código: é
trabalho que ainda não chegou a sua vez. Construí-lo antes de o conjunto de regras estar fechado produz gate que
cobra a régua errada — e gate errado é mais caro que gate ausente, porque ninguém desconfia dele.

**A ordem é:** fechar o conjunto de regras ([[00-regras-e-invariantes]]) → mapear escopo de gate × escopo de
regra (plan-06) → **só então** construir/ampliar as verificações.

> ✅ **O primeiro degrau foi dado em 2026-08-02 (plan-13):** o conjunto fechou em **32 regras** — 29 verificáveis
> e 3 de conduta. Três achados desta seção **ganharam a regra que lhes faltava** e deixaram de ser "nenhuma":
> **14 → R32** (a lib é indiferente ao sistema de autenticação) · **15 → R8.1** (cobertura em %, piso móvel) ·
> **18 → R31** (contraste AA nos 18 temas shippados). O que falta neles agora é só o gate — plan-12.

## 4.1 Gates integralmente ausentes

> **14 e 15 fecharam em 2026-08-05 (`plan-12`, Lote A/B)** — os gates existem agora; o detalhe está em §6.
> Restam **18, 23, 26**, mais o **45** (2026-08-18) e os **54** e **55** (2026-08-19).

| # | O que falta | Onde | Regra que ele cobraria |
|---|---|---|---|
| 18 | **Medição de contraste WCAG AA.** ✅ **O gate FOI construído** — `auditor_contraste` (`run_audit`) é a única trava da base que olha o **resultado** renderizado em vez da estrutura, e roda nos dois modos (claro e escuro), com **isenção nomeada** para os temas legados e exigência de contraparte para os não isentos ([[09-temas-e-presets]] §6.5). A descrição anterior desta linha — *"a construção está parada, aguardando o dono"*, com a cifra de temas reprovando — era anterior ao gate e envelheceu junto com ela; **a cifra corrente sai do próprio `run_audit`, nunca desta prosa**. O que **permanece** em implementação posterior é o alargamento da cobertura: os pares que os componentes de fato produzem (não só os 4 canônicos) e os pares em `rgba()`, hoje pulados por fundo não determinístico | `gates/scripts/audit/auditor_contraste.mjs` | **R31** — AA garantido nos temas shippados. Regra escrita, **gate existente**, cobertura ainda parcial e declarada |
| 23 | **Gate de conteúdo sobre `sarak-ui/templates/`.** Medido: `kitFiles.mjs:16-22` não lista `templates/`; `tsconfig.json:20` é `include: ["src"]`; `check-package-contents.mjs` cobra **só presença** de 3 dos 5 itens — `componente-proprio.tsx` e `templates/ui-kit/` existem e **nada os cobra**. Template citando componente removido sai verde em tudo | `sarak-ui/templates/` | **R17**, cuja metade de prosa manual não tem gate. O achado 24 (fechado, §6) foi a prova de que já aconteceu |
| 26 | **Automação que exercite um `install` de verdade.** ⚠️ **FECHADO PELA METADE em 2026-08-19, e a metade importa.** ✅ A prova **pelo SHA** está automatizada: o job `install-sha` instala a lib nos três gerenciadores a cada PR → `main`, e já rodou verde duas vezes, uma delas ao lado de um `gates` deliberadamente vermelho. Isso era o vão original desta linha. ❌ **A prova pelo caminho do consumidor — `#semver:` contra a tag — ainda não rodou nenhuma vez**: é o achado **48**, e não é trabalho, é um evento que não aconteceu. ❌ O `sarak-ui update` também não é exercitado por nenhum job: achado **55** | `.github/workflows/gates.yml` (job `install-sha`) | Nenhuma regra escrita. A dependência de CI (`plan-05`) **foi satisfeita** — o que resta não é infraestrutura |
| 54 | **O Anel 0 (segredos) não tem modo de faixa, e sem isso é inutilizável em qualquer pipeline remoto.** `gates/scripts/segredo/verificar_commit.py` chama `git diff --cached --unified=0 --no-color` — **hardcoded**, sem flag para varrer um intervalo (`origin/main...HEAD` ou similar). Confirmado lendo `main()` e o `argparse`. Num runner limpo **não há nada em staging**: o scanner reportaria *"0 achados"* **sempre**, em silêncio. ⚠️ **Isso é pior que ausência** — um passo verde que ninguém desconfia | `gates/scripts/segredo/verificar_commit.py` | **R22** — nenhum segredo no que se publica. A regra existe; o **modo de leitura** que a CI precisaria, não | **Construir um modo `--faixa <base>..<head>` ANTES de qualquer plan que queira levar o Anel 0 a um pipeline remoto.** Enquanto não existir, o Anel 0 é **exclusivamente local**, e é isso que os workflows refletem hoje — deliberadamente, não por esquecimento |
| 55 | **Nenhum job exercita `sarak-ui update`.** A prova de execução real do comando (dentro da faixa e atravessando major, nos 3 gerenciadores mais os dois modos locais) foi **manual**, uma vez, contra um `git daemon` servindo um espelho deste repositório com as tags reais. O `install-sha` cobre `check --notify` a cada PR; o `update` **não é coberto por nada** | `bin/scaffold/runUpdate.mjs` · `.github/workflows/` | Nenhuma regra escrita | **Estender o `install-sha`, ou job novo.** É o mesmo aparelho do achado **26**, aplicado ao comando que **age** em vez do que só avisa — e o `update` é o único que **reescreve o `package.json` do consumidor**, o que torna a ausência de cobertura mais séria, não menos |
| 45 | **E2E e regressão visual em navegador real.** Capacidade que **existiu e foi removida** em 2026-08-18 (decisão do dono, tomada duas vezes) por produzir **verde falso** — nenhum pipeline a executava. Cobria: o não-vazamento do modo embarcado medido em CSS renderizado (**R24**), o boot do painel pintado num browser, `var()` resolvendo de fato, e regressão visual de 8 componentes. ⚠️ **Perda transversal:** a base ficou **sem nenhuma ferramenta** de medir CSS/`var()` em navegador, o que alcança qualquer aceite futuro que dependa disso ([[11-testes-e-cobertura]] §7.2). 🔓 **A dependência de CI foi satisfeita em 2026-08-18 — e isso NÃO fecha esta linha.** O lugar de rodar passou a existir; a suíte da CI continua em `jsdom`, e a ferramenta continua desinstalada. **Ter onde rodar não é ter o que rodar** | — *(a capacidade não existe; o vão é a ausência dela)* | **R24**, que por isso é **⚠️** e não ✅ — os dois gates restantes provam estrutura, não CSS renderizado | **Destravado, não resolvido.** Reinstalar o aparato agora é decisão de plan própria — e ela precisa responder o que a remoção respondeu: *quem executa isso, e em que gatilho?* Sem essa resposta, reinstalar reproduz o verde falso que motivou remover |

---

# 5. Aceitos como característica — migrados para `00-contexto` §8

Saíram da dívida por decisão do dono: o custo do conserto supera o dano, **e o motivo está escrito** no
destino. Registrados aqui só para a numeração não ser reaproveitada.

| # | O que era | Por que deixou de ser dívida |
|---|---|---|
| 16 | "5 sinks de `dangerouslySetInnerHTML` — auditar se algum é vetor real" | **A auditoria foi feita** (2026-08-01, um a um): os 5 são `<style>` com CSS. Dois são literais estáticos; três derivam de `design`, que já passou por `validateDesign` (R6 bloqueia `[<>{};]`). **Nenhum recebe HTML de origem não confiável.** O achado era uma pergunta, e ela foi respondida |
| 27 | "`chromeSlots` conta 9 para as 8 regiões" | `topbarActions` é alias legado de `topbarEnd`, e o **próprio `doc` do slot diz isso** ao consumidor no `catalog.json`. Imprecisão de derivação por tipo, autodeclarada no artefato |

---

# 6. Achados FECHADOS

Registrados só para que a numeração não seja reaproveitada. O detalhe está no `git`.

| # | Fechado por |
|---|---|
| 4 | 3 das 4 categorias de `engines/` entraram no barril |
| 5 | `README.md` deixou de mandar instalar `pg` |
| 6 | Decisão do dono: `atomic/Tables/` **fica como está** — o hook é `structuralConsumer` de 2 tokens |
| 7 | Era imprecisão de relatório, não defeito |
| 19 | "A lib nunca controla a URL" era falso (`useSarakRouter.ts:49,51`); a spec nova registra o comportamento real |
| 20 | Status falso na spec antiga de presets |
| 21 | Duplicação entre specs antigas, resolvida pela consolidação |
| 28 | JSDoc citando arquivo de plano inexistente, removido |
| 34 | **Aceito em 2026-08-10 (decisão do dono).** O conjunto de chaves aceitas na validação de tema caiu de 122 para 95 quando a `plan-21` removeu 27 entradas órfãs do manifesto. **Aceito porque as 27 eram metadado morto** — preservá-las só para validação seria manter um dicionário de coisas que não existem. Exposição na base medida em **zero**. Se um consumidor com tema persistido reclamar, o `console.warn` de `validation.ts:213` **é** o diagnóstico: ele nomeia a chave que caiu |
| 36 | **Fechado em 2026-08-10 (decisão do dono).** A "Regra de Ouro (Time Tracking)" saiu do `CLAUDE.md`: exigia a skill/MCP `time-tracking`, que não existe. Ficou no lugar um comentário com o motivo e um critério para regra nova naquele arquivo — verificável e com ferramenta existente, ou o lugar dela é uma spec |
| 17 | **Fechado em 2026-08-10 (`plan-19`).** O conserto não foi ajustar o `testDir`: o `playwright.config.ts` era **arquivo órfão** — nenhum script o usava. O que rodava era o **playwright-ct.config.ts** (`testDir: './src'`), pelo script **test-ct**, e os 4 arquivos em `src/**/__e2e__/` eram **component tests**, não E2E de navegador — **tudo removido em 2026-08-18** (achado **45**, §4). O arquivo foi **deletado**; `npx playwright test` agora sai com **exit 1** e *"No tests found"* — falha alto em vez de passar em silêncio |
| 32 | **Fechado em 2026-08-09.** `arquitetura/04-contrato-de-tokens-e-paridade.md:52` dizia `410/410/410` como estado resolvido; era 409 quando foi escrito e **422** hoje (a `plan-15` criou 13 tokens). O conserto não foi trocar o número: a linha **deixou de citar total**, porque total em prosa envelhece a cada token. A cifra vive em `sarak-dev/state.json` → `design.tokens` e é cobrada por `auditor_paridade.mjs`; a prosa afirma a **convergência**, não o valor |
| 33 | **Fechado em 2026-08-12 (corrigido).** `.gitattributes` com `eol=lf` acabou com o falso "defasado" do `dev-kit:check` em `checkout`/`stash pop` sob `core.autocrlf=true` |
| 35 | **Fechado em 2026-08-12 — NÃO SE REPRODUZ.** Ninguém consertou nada: a divergência 27×24 do detector de órfãs não se reproduziu na medição de 2026-08-12. A premissa do achado é que estava errada, e registrar isso como "corrigido" esconderia que o detector nunca foi alterado |
| 37 | **Fechado em 2026-08-12 (corrigido).** Os dois parênteses a mais do `SarakToast` saíram; o toast voltou a controlar fundo e cor de texto pelo tema |
| 38 | **Fechado em 2026-08-12 — NÃO SE REPRODUZ.** Mesma natureza do **35**: a emissão de `--sarak-status-*-color-bg` não se reproduziu como ausente na medição de 2026-08-12. Nada foi alterado no `generateVariants` |
| 39 | **Fechado em 2026-08-12 (corrigido).** O gerador de gabarito de tema passou a serializar `defaultValue` objeto (`{mob,tab,desk}`) em vez de interpolar cego — a saída volta a compilar. O defeito irmão, de derivação de **nome**, continua aberto como achado **41** (§3.1) |
| 29 | **As duas metades fecharam.** Gate: `check-section-pointers.mjs` (`plan-12`, 2026-08-05). Código: verificado fechado pelo revisor em **2026-08-08** — `scripts/dev-kit/renderDevAppendix.mjs` **não emite mais** `§5.1`, e `sarak-dev/GUIA-MANUTENCAO.md:308` regenerado aponta `§2` (paridade), o alvo correto. Medido rodando `npm run dev-kit` e recontando: **0 ocorrências** de `§5.1` no guia e no `state.json` |
| 30 | **Não se reproduz** (verificado 2026-08-01). Dizia que `verify_presets.ts:16` apontava para um `arquitetura/04 §9` inexistente. O alvo existe e é o certo: `04-contrato-de-tokens-e-paridade.md:252` = `# 9. Anti-drift de tema e preset` — exatamente o assunto do script. A reescrita da base (plan-01) criou o §9 |
| 31 | **Não se reproduz** (verificado 2026-08-01). Dizia que a ponte para `specs/` era SOFT. `CLAUDE.md:3` hoje aponta **duro** para `specs/00-contexto.md`, os dois prompts e o `00-indice`. `.agents/index.md` segue com 0 referências a `specs/`, mas a ponte não passa mais por ele |
| 8 | **`plan-08` F1 (2026-08-04).** `clearSarakStorage()` remove só as chaves da lib; texto do `confirm()` alinhado. Teste prova que chave alheia sobrevive ao reset |
| 22 | **`plan-12` Lote A (2026-08-05).** `design-token-ids.ts` regenerado (304→409) **e** `generate-token-types.ts --check` registrado no `build` e no Anel 1 — as duas metades fecharam juntas |
| 1 | **`plan-07` (código, 2026-08-03) + `plan-12` vão 2 (gate, 2026-08-05).** `--sx-*` encadeado num token real (`--theme-primary`); `auditor_ghostvars` passou a tratar `src/styles/` como consumidora |
| 13 | **`plan-07` (código, 2026-08-03) + `plan-12` vão 6 (gate, 2026-08-05).** Testes escritos para `useSarakRouter`/`useModuleDiscovery`; `auditor_coverage` ampliado a `shared/`/`effects/`/`constants/` |
| 10 | **`plan-08` F4 (2026-08-04).** `_utilities.css:58` passou a ler `var(--sarak-focus-width, 2px)` |
| 11 | **`plan-08` F5 (2026-08-04).** `DeviceProvider` passou a receber os breakpoints do tema via contexto. A metade Tailwind (`@min-[768px]`, build-time, sem `var()`) já havia sido aceita como característica na triagem (`00-contexto` §8) |
| 12 | **`plan-08` F6 (2026-08-04).** `SarakTable` ganhou `responsive?: boolean`, espelhando `SarakDataTableImpl` |
| 9 | **`plan-08` F3 (2026-08-04).** Ramo `isGlass` removido; `isSidebar` passou a ser o fallback explícito de qualquer valor fora de topbar/dock |
| 2 | **`plan-09` operação 3 (2026-08-05).** `partialMode` removido de `upgradeThemePayload`; zero chamador afetado |
| 3 | **`plan-09` operação 1 (2026-08-05).** `CustomizationPanel` virou `React.lazy` com `Suspense` interno (padrão `SarakChartEngine`), preservando o tipo público `React.FC`. Boot: **−75,1%** |
| 24 | **`plan-07` item 8 (2026-08-03).** `main.tsx` do scaffold deixou de citar `Sarak-MyService` |
| 25 | **`plan-07` item 8 (2026-08-03).** `context.mjs` deixou de citar `templates/app-starter.manifest.json` |
| 14 | **`plan-12` Lote A (2026-08-05).** `auditor_authcoupling.mjs` construído (R32); nasce verde — o único violador (`SarakSecurityOrchestrator`) já havia saído na `plan-09` |
| 15 | **`plan-12` Lote B (2026-08-05).** `check-coverage-floor.mjs` construído (R8.1); piso móvel gravado em 70,66% |
| 56 | **Aberto e fechado em 2026-08-19.** Uma **biblioteca inteira de outro repositório** vivia no `package-lock.json`: `@sarak/lib-shared@4.0.2`, com `axios`, `framer-motion` e `tsup` a reboque, apontando para um **diretório irmão que não existe mais** — desde a `v2.1.1`. Nenhum gate local a viu, porque nenhum resolve o lockfile contra o disco. Saiu quando o lock foi regenerado **do zero** (não regravado por cima) para fechar o achado **50** — o que é a razão de o conserto ter sido regeneração e não remendo |
| 40 | **Aberto e fechado em 2026-08-11** (correção da `plan-25`). A injeção de `hapticIntensity`/`scaleRatio` saiu de `validation.ts` — as duas tinham **zero consumidores** em toda a `src/`, logo eram vestigiais, e devolvê-las ao domínio seria preservar chave morta no contrato público. `animationSpeed` ficou: está em `PAYLOAD_EXTRA_KEYS` e **é** consumido. Travado por teste de **idempotência**: validar o mesmo design duas vezes não pode emitir warn na segunda |

---

# 7. Critérios de aceite desta spec

- [x] Todo achado aberto tem **arquivo:linha** ou a declaração explícita de que a localização é o próprio vão.
- [x] Nenhum achado aberto está sem categoria.
- [x] A numeração é **contínua a partir de 1 e sem reaproveitamento** — o último número emitido é o maior que
      aparece nas §3–§6.
- [x] Todo achado aberto tem **regra nomeada** — ou a declaração explícita de que **nenhuma regra o cobre**.
- [x] Todo achado aberto tem **destino decidido pelo dono** (plan-03, 2026-08-01).
- [x] **Soma fechada — pela relação, não pela cifra:** todo número emitido aparece em **exatamente uma** das
      §3 (aberto) · §4 (gate futuro) · §5 (aceito) · §6 (fechado). Sem número em duas seções, sem buraco.
      *(Esta linha carregava `3+3+2+24 = 32` e envelheceu na primeira leva de achados novos — os reais eram
      `2+3+2+29`. É o padrão que o achado **32** já tinha ensinado: **total absoluto em prosa envelhece a cada
      conserto.** A verificação agora afirma a relação, que não envelhece.)*
- [ ] Toda plan que fecha um achado **remove a linha** aqui e cita o número no veredito.
- [x] `00-contexto` §8 aponta para cá em vez de listar achado.

---

# 8. Contrato de manutenção

- **Só entra o que foi medido.** Suspeita vira plan de investigação, não linha nesta spec.
- **Item fechado sai** — na mesma execução que o fechou, não "depois".
- **Numeração definitiva.** Achado novo pega o próximo número livre — o maior emitido até 2026-08-19 é **56**.
- Achado que o dono decidir **aceitar como dívida permanente** sai da §3 e vira linha em `00-contexto` §8, com
  o motivo — porque aí deixou de ser dívida e virou característica. O §5 desta spec guarda só o número.
- **Gate que nunca existiu não é dívida** — vai para a §4. Dívida é código que viola regra **já formada**;
  gate ausente é trabalho em fila, e a fila começa depois de as regras fecharem. Misturar os dois faz a lista
  de dívida crescer com trabalho que ninguém prometeu, e a métrica perde o sentido.
- **Achado com duas metades declara as duas** (§3.2). Fechar só a de código deixa o vão aberto para a próxima
  violação; apagar a de gate destrói trabalho que ninguém fez e ninguém vai lembrar de refazer.
- **`nenhuma` na coluna *Regra* é resultado, não lacuna de preenchimento.** É o sinal de que estamos cobrando
  algo que não está escrito — leia como candidato a regra nova, não como achado de segunda classe.
