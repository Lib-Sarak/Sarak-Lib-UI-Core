---
tipo: "plan"
titulo: "As notas de migração que faltam, e os dois gates que impedem a reincidência"
dominio: "Sarak-Lib-UI-Core / Distribuição / Release"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "release", "semver", "migracoes", "gates"]
relacionados: ["[[03-versionamento-e-release]]", "[[13-instalacao-e-atualizacao]]", "[[adr/008-releases-com-tag-e-semver-em-git]]", "[[15-divida-conhecida]]"]
depende_de: ""
destino_sintese: "specs/specs/03-versionamento-e-release.md · specs/specs/01-gates-e-baseline.md · specs/specs/15-divida-conhecida.md"
objetivo: "Dar conteúdo às notas de migração ausentes e construir os dois gates que impedem a omissão de voltar"
---

# 1. Objetivo

Quem atravessa um major recebe **o que quebra, escrito**. E a próxima omissão é **barrada antes da tag
existir**, não descoberta um release depois.

# 2. Contexto — medido em 2026-08-19 pelo revisor

A `plan-10` entregou o `sarak-ui update --latest`, que imprime as entradas de `docs/migracoes.md` entre a
versão instalada e a nova, **antes** da confirmação. Ao verificá-la, medi a carga que esse comando teria:

| Medida | Valor |
|---|---|
| Majors publicados | **6** — `v1.0.0` … `v6.0.0`, em **12 tags** |
| Entradas ancoradas em `docs/migracoes.md` | **2** — só `2.0.0` e `3.0.0` |
| **Faltam** | **`4.0.0`, `5.0.0`, `6.0.0`** |

**Consequência prática:** um consumidor atravessando `3.x → 6.x` recebe a confirmação **sem nenhuma nota do
que quebra**. O comando está correto; a carga dele está vazia justamente nos majors mais recentes.

## 2.1 A obrigação existe, está escrita, e foi pulada três vezes

[[03-versionamento-e-release]] §5:

> *"`docs/migracoes.md` — **obrigatório para todo breaking change**. Breaking change sem entrada em
> `docs/migracoes.md` é **entrega incompleta**. **Não há gate cobrando isso — é conduta**, na mesma classe das
> regras R10/R11/R15/R16."*

**Conduta declarada, sem gate, pulada 3×.** É a prova empírica de que esta classe não se sustenta sozinha —
e a razão de esta plan construir gate, não só escrever texto.

⚠️ **E a decisão de nível foi de um agente revisor** *(informado pelo dono, 2026-08-19)*. Isso não atenua:
quem decide `major` está **afirmando que algo quebra**. Afirmar isso e não registrar **o quê** é meia entrega.
A falha é do papel de revisor, não do dono.

## 2.2 O que a superfície pública diz — e o que ela não diz

Medido comparando `src/index.ts` entre as tags:

| Transição | Removido | Adicionado |
|---|---|---|
| `v3.0.0 → v4.0.0` | nenhum | nenhum |
| `v4.0.1 → v5.0.0` | **nenhum** | **nenhum** |
| `v5.0.0 → v6.0.0` | **nenhum** | **30+ exports** |

E os commits de release são apenas `"4.0.0"`, `"5.0.0"`, `"6.0.0"` — sem mensagem.

⚠️ **Superfície intacta NÃO prova que não houve quebra.** A `4.0.0` é a contraprova viva: nenhum export mudou
e ainda assim *"toda cor de todo tema de todo consumidor podia mudar na tela"* ([[03-versionamento-e-release]]
§3.1). **Não conclua "não quebrou" a partir da tabela acima** — ela diz apenas que, se houve quebra, foi
**comportamental**, e ninguém a escreveu.

# 3. Escopo

## 3.1 Dentro
- `docs/migracoes.md` — arquivo **manual** (confirmado: nenhum gerador o produz)
- `gates/scripts/contrato/` — os dois gates novos (§5 passos 3 e 4)
- `package.json` — **só** o script `version`, para o gate (a) entrar antes da tag existir
- O **§10 desta plan** — o texto para as specs fixas de destino

## 3.2 Fora
- ⛔ **Criar ou editar spec fixa** (`specs/specs/`, `arquitetura/`, `adr/`, `00-*`). Proibição absoluta
  ([[00-prompt-executor]] §7.3). O texto vai no **§10**.
- ⛔ **INVENTAR o que quebrou.** Nota de migração fabricada é lida pelo consumidor **no momento em que ele
  decide se atualiza** — é pior que nota nenhuma. O passo 2 define exatamente o que escrever quando não se
  encontra o motivo.
- ⛔ Emitir release, ou mexer em tag existente. Tag publicada **não se apaga**: o consumidor já resolveu
  `#semver:` contra ela.
- ⛔ Reclassificar retroativamente uma versão já publicada. `5.0.0` é `5.0.0` para sempre, mesmo que a
  investigação conclua que poderia ter sido minor.
- ⛔ Mexer no `preversion` ou em qualquer outro script além do `version`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/03-versionamento-e-release.md` §3.1 · §5 | a tabela dos majors e a obrigação que foi pulada |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.1 | onde o motivo da `4.0.0` está escrito |
| ADR | `adr/008-releases-com-tag-e-semver-em-git` | como `#semver:` resolve contra tags |
| Código | `bin/scaffold/checkUpdate/migrationNotes.mjs` | **como a âncora é lida** — o gate tem de cobrar o formato que este módulo aceita |
| Código | `gates/scripts/contrato/check-no-deep-import.mjs` | molde de gate de contrato, com limites declarados (R18) |

# 5. Instruções de execução

## Passo 1 — Recuperar a `4.0.0` (transporte, não invenção)

O motivo **existe escrito**: [[03-versionamento-e-release]] §3.1 e [[09-temas-e-presets]] §4.3.1 descrevem a
decisão **D** — o motor de cor deixou de reescrever o tema a cada render, e no modo nativo o emitido passou a
ser o escrito. Nenhum export mudou, e ainda assim toda cor de todo tema podia mudar na tela.

Escreva a entrada em `docs/migracoes.md` **transportando** esse conteúdo, com o "antes/depois" que o resto do
arquivo usa. **Âncora no formato que o `migrationNotes.mjs` lê** — confirme no código, não presuma.

## Passo 2 — `5.0.0` e `6.0.0`: **procurar antes de declarar**

⚠️ **Declarar perda sem procurar é preguiça com aparência de honestidade.** Varra, nesta ordem, e registre o
que cada fonte devolveu — inclusive "nada":

1. `git log --all -S"5.0.0"` e `-S"6.0.0"` sobre `specs/plan/*.md` — **vereditos de plans removidas**, que é
   onde decisão de revisor costuma morar (`git log --diff-filter=D -- specs/plan/` lista as removidas);
2. `git log v4.0.1..v5.0.0` e `v5.0.0..v6.0.0` — as mensagens dos commits da faixa;
3. as specs fixas alteradas nessas faixas (`git diff --stat v4.0.1 v5.0.0 -- specs/`);
4. `docs/` e `sarak-dev/` nas mesmas faixas.

**Se encontrar o motivo:** a entrada é transporte, como no passo 1.

**Se não encontrar:** escreva a entrada **honesta**, e ela tem três partes obrigatórias:
- o que foi **medido** (a superfície pública não mudou — com os números da §2.2);
- que **nenhuma quebra foi registrada**, e que isso significa *"ninguém sabe"*, não *"não houve"*;
- o que o consumidor deve fazer se **encontrar** uma quebra ao atravessar: relatar, porque vira achado.

**Isso é melhor que silêncio**: hoje o consumidor não sabe nem que ninguém sabe. E faz o `--latest` funcionar,
porque a âncora passa a existir.

## Passo 3 — Gate (a): todo major tem entrada

**O requisito:** um `npm version major` é **barrado** se não houver entrada ancorada em `docs/migracoes.md`
para a versão que está sendo emitida.

**O lugar é o script `version`, e o motivo importa:** ali o `package.json` **já tem a versão nova** e a tag
**ainda não existe** — dá para barrar antes de publicar. No `preversion` a versão nova ainda não é conhecida;
no `pre-push` a tag já foi criada, e aí é tarde.

Hoje: `version = npm run guide && npm run build && npm run dev-kit && git add …`. Acrescente o gate **no
início**, sem remover nem reordenar nada.

**Só cobra major** (`X.0.0`). Minor e patch passam direto — a obrigação da `03` §5 é sobre *breaking change*.

## Passo 4 — Gate (b): minor não pode remover do barril

**A assimetria que decide este gate** — e ela precisa estar escrita no cabeçalho dele:

- **`major` sem remoção** é **legítimo** e não se cobra. A `4.0.0` é a prova: quebra comportamental, superfície
  intacta. Um gate que exigisse remoção para justificar major **teria reprovado a `4.0.0`**, que estava certa.
- **`minor`/`patch` COM remoção** é **sempre errado**, e é o erro **com vítima**: quem está em `^N` recebe a
  quebra **dentro da faixa que declarou**, sem escolher.

Só a segunda direção é decidível, e é a que este gate cobra: comparar o barril público da última tag com o
atual; se algo **saiu** e o bump não é major, **barra**.

⚠️ **Limite declarado obrigatório (R18):** este gate vê **remoção de nome exportado**, não mudança de
comportamento. Ele **não** teria pego a `4.0.0`, e isso tem de estar escrito no próprio arquivo — gate que
não declara o que não vê é gate em que se confia demais.

## Passo 5 — O material para as specs

**No §10**, não nas specs:

- **`03` §3.1** — a tabela diz *"**oito** tags desde a renumeração, **três** delas MAJOR"* e para na `4.0.0`.
  Medido: **12 tags, 6 majors**. Escreva a correção **e** as linhas da `5.0.0`/`6.0.0` com o que o passo 2
  encontrou (ou não encontrou).
- **`03` §5** — a obrigação deixa de ser só conduta: passa a ter gate. Escreva o texto novo, com o **limite**
  do gate (só major, só presença de âncora — ele não lê o *conteúdo* da nota).
- **`01-gates-e-baseline`** §2.2 — os dois gates novos entram no catálogo, com onde cada um roda.
- **`15-divida-conhecida`** — o achado da omissão 3×, e o que dele **permanece aberto** depois desta plan.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-53-migracoes-e-nivel-de-release.md.

Contexto obrigatorio: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/03-versionamento-e-release.md, specs/specs/09-temas-e-presets.md,
specs/adr/008-releases-com-tag-e-semver-em-git.md.

O DEFEITO, medido pelo revisor: 6 majors publicados (v1..v6, 12 tags), e apenas
DUAS entradas ancoradas em docs/migracoes.md (2.0.0 e 3.0.0). Faltam 4.0.0, 5.0.0
e 6.0.0. A 03 §5 diz que a entrada e OBRIGATORIA e que "nao ha gate cobrando isso
— e conduta". Foi pulada 3x. Por isso esta plan constroi gate, nao so texto.

PASSO 1 — a 4.0.0 e RECUPERAVEL: o motivo esta escrito na 03 §3.1 e na
  09-temas §4.3.1 (decisao D, motor de cor). Transporte, nao invente.

PASSO 2 — 5.0.0 e 6.0.0: PROCURE ANTES DE DECLARAR. Varra, e registre o que cada
  fonte devolveu, inclusive "nada": (1) git log --all -S sobre specs/plan/*.md —
  vereditos de plans REMOVIDAS, onde decisao de revisor costuma morar; (2) git log
  da faixa entre as tags; (3) specs alteradas na faixa; (4) docs/ e sarak-dev/.
  Achou o motivo -> transporte. NAO achou -> entrada HONESTA com tres partes: o
  que foi medido (superficie publica nao mudou), que NINGUEM REGISTROU a quebra
  (o que significa "ninguem sabe", nao "nao houve"), e o que o consumidor faz se
  encontrar uma.
  ⛔ NUNCA INVENTE o que quebrou. Nota fabricada e lida no momento em que o
  consumidor decide se atualiza — e pior que nota nenhuma.

PASSO 3 — gate (a): npm version major barrado sem entrada ancorada para a versao
  emitida. O LUGAR e o script "version" (nao preversion, nao pre-push): la o
  package.json JA tem a versao nova e a tag AINDA NAO existe. Acrescente no
  inicio, sem remover nem reordenar o resto. So cobra major (X.0.0).

PASSO 4 — gate (b): minor/patch NAO pode remover nome do barril publico.
  ASSIMETRIA, e ela vai no cabecalho do gate: major SEM remocao e LEGITIMO (a
  4.0.0 prova — quebra comportamental, superficie intacta) e NAO se cobra; minor
  COM remocao e SEMPRE errado, e e o erro com vitima. Limite declarado (R18): o
  gate ve remocao de NOME, nao mudanca de comportamento — ele nao teria pego a
  4.0.0, e isso tem de estar escrito no arquivo.

PASSO 5 — o material para as specs vai NO §10. A 03 §3.1 diz "8 tags, 3 majors";
  sao 12 e 6. Corrija la, nao na spec.

Voce NAO edita spec fixa (§7.3). Voce NAO emite release nem mexe em tag existente
— tag publicada nao se apaga. Voce NAO reclassifica versao ja publicada. Voce NAO
mexe em nenhum script alem do "version".
Nao commite. Ao terminar, escreva o resumo na propria plan e mova o status para
🟠 Em revisao.
```

# 7. Critérios de aceite

- [ ] `docs/migracoes.md` tem entrada ancorada para **`4.0.0`**, transportada das specs — não inventada.
- [ ] `5.0.0` e `6.0.0` têm entrada, e o §10 registra **o que cada fonte da varredura devolveu**, inclusive
      as que devolveram nada.
- [ ] Nenhuma nota afirma uma quebra que não foi encontrada em fonte citável.
- [ ] `sarak-ui update --latest`, de uma versão `3.x`, **imprime as três notas** — provado executando.
- [ ] Gate (a) barra um `npm version major` sem entrada — provado com uma simulação, **revertida**.
- [ ] Gate (a) **não** barra minor nem patch.
- [ ] Gate (b) barra um bump minor que remove nome do barril — provado com remoção deliberada, **revertida**.
- [ ] Gate (b) **não** barra um major sem remoção *(o caso da `4.0.0`)*.
- [ ] Os dois gates declaram o que **não** veem (R18), no próprio arquivo.
- [ ] `version` continua com os mesmos passos, na mesma ordem, mais o gate no início.
- [ ] Nenhuma spec fixa tocada; nenhuma tag criada, movida ou apagada.
- [ ] Suíte verde, com teste dos dois gates.

# 8. Como verificar

```bash
# as ancoras existem e o comando as le
grep -nE "^#{1,3} .*[0-9]+\.0\.0" docs/migracoes.md     # tem de listar 2,3,4,5,6
node bin/sarak-ui.mjs update --latest                   # num consumidor 3.x: 3 notas

# gate (a) — simular um major sem nota
node -e "const p=require('./package.json');p.version='9.0.0';require('fs').writeFileSync('package.json',JSON.stringify(p,null,4))"
npm run <gate-a>        # tem de BLOQUEAR ; depois: git checkout package.json

# gate (b) — remover um nome do barril e simular minor
#   -> tem de BLOQUEAR ; depois desfazer

npx vitest run          # verde, com os testes dos dois gates
git status --short      # NENHUM specs/specs, arquitetura, adr
git tag --list          # 12 tags, inalteradas
```

# 9. Destino da síntese

**Destino:** `specs/specs/03-versionamento-e-release.md` · `specs/specs/01-gates-e-baseline.md` ·
`specs/specs/15-divida-conhecida.md`

- **`03` §3.1** — a cifra corrigida (12 tags / 6 majors) e as linhas dos majors que faltavam.
- **`03` §5** — a obrigação deixa de ser só conduta; ganha gate, com o limite dele declarado.
- **`01` §2.2** — os dois gates entram no catálogo.
- **`15`** — o achado da omissão 3× e o resíduo que permanecer.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-19

**Resultado:** Concluído

## O que foi feito

- **`docs/migracoes.md:412`** — prefixei o título da entrada "O motor de cor parou de reescrever o seu tema
  sem avisar (Decisão D)" com `4.0.0 — `. Conteúdo **transportado**, não escrito: já estava lá, só sem a
  âncora numérica que `migrationNotes.mjs` lê no título. Fonte: `specs/specs/03-versionamento-e-release.md`
  §3.1 + `specs/specs/09-temas-e-presets.md` §4.3.1, como a Passo 1 mandou.
- **`docs/migracoes.md:308`** — prefixei "A responsividade da Spec 40.3 estava desligada no pacote
  publicado... (plan-39)" com `5.0.0 — `, e acrescentei um parágrafo curto citando a fonte da varredura.
- **`docs/migracoes.md:8`** — prefixei "`layoutGridTemplate: 'col-12'` passa a funcionar... (plan-49)" com
  `6.0.0 — `, e acrescentei um parágrafo citando que as outras duas quebras MAJOR da mesma tag (`plan-41`,
  `plan-47`) estão logo abaixo.
- **`gates/scripts/contrato/check-migration-anchor.mjs`** (novo) — Gate (a). Barra `npm version major` sem
  entrada ancorada, reusando `extractMigrationNotes` (o MESMO código que `sarak-ui update --latest` usa) —
  gate e leitor nunca divergem sobre o que conta como "ancorado".
- **`gates/scripts/contrato/check-minor-no-removal.mjs`** (novo) — Gate (b). Compara os nomes exportados de
  `dist/index.d.ts` entre a última tag e a árvore atual; barra minor/patch que removeu algum. Pula sempre que
  o bump é major (a `4.0.0` é a prova de que major sem remoção também é legítimo — R18 no cabeçalho do
  arquivo).
- **`gates/scripts/contrato/__tests__/check-migration-anchor.test.mjs`** (novo) — 3 testes: bloqueia major sem
  âncora, libera major ancorado, não se aplica a minor/patch.
- **`gates/scripts/contrato/__tests__/check-minor-no-removal.test.mjs`** (novo) — 7 testes: parsing de
  `export { ... }` (nomes de tipo, `X as Y`, arquivo sem o bloco) + bloqueia minor/patch com remoção, libera
  major com remoção, libera minor/patch sem remoção.
- **`package.json:53-57`** — acrescentei os dois gates **no início** do script `version`, sem remover nem
  reordenar nada do que já existia; e as duas entradas de script (`migration-anchor:check`,
  `minor-no-removal:check`) que os tornam invocáveis por `npm run` (ver "Decisões e suposições").

## Arquivos alterados

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `docs/migracoes.md` | alterado | 3 títulos ganharam âncora `X.0.0 — ` (linhas 8, 308, 412) + 2 parágrafos editoriais curtos citando a fonte da varredura |
| `gates/scripts/contrato/check-migration-anchor.mjs` | criado | Gate (a) |
| `gates/scripts/contrato/check-minor-no-removal.mjs` | criado | Gate (b) |
| `gates/scripts/contrato/__tests__/check-migration-anchor.test.mjs` | criado | testes do Gate (a) |
| `gates/scripts/contrato/__tests__/check-minor-no-removal.test.mjs` | criado | testes do Gate (b) |
| `package.json` | alterado | script `version` ganhou os 2 gates no início; 2 scripts novos (`migration-anchor:check`, `minor-no-removal:check`) |

## Verificações executadas

- `grep -nE "^#{1,3} .*[0-9]+\.0\.0" docs/migracoes.md` → lista `6.0.0` (linha 8), `5.0.0` (308), `4.0.0`
  (412), `3.0.0` (458), `2.0.0` (530) — as 5 âncoras, como o §8 pede.
- Simulação end-to-end de `sarak-ui update --latest` a partir de um consumidor `3.0.0` fictício (spec
  `#semver:^3.0.0`, 12 tags reais mockadas em `execGitLsRemoteTags`, `packageRoot` apontando para este repo)
  → saída real: `"v3.0.0 → v6.1.0 — 3 majors pulados."` seguida do conteúdo INTEGRAL das entradas `6.0.0`,
  `5.0.0` e `4.0.0` (mais as MINOR que andam junto — `plan-47`, `plan-45`, `plan-42`, `plan-41`, `plan-38`,
  ADR-009). Antes desta plan, a mesma simulação para `installedMajor=4/5/6` devolvia `bounded:false` (todas
  as 20 entradas do arquivo, sem corte) — medido antes de editar (ver "Decisões e suposições").
- `npm run migration-anchor:check` — 5 cenários manuais (`package.json` bumpado e revertido a cada um,
  nenhum commitado): `7.0.0` (sem âncora) → **BLOQUEOU**; `6.0.0` (ancorado) → **OK**; `6.2.0` e `6.1.5`
  (minor/patch) → **OK, não se aplica**.
- `npm run minor-no-removal:check` — 3 cenários manuais (removi `SarakInput`/`SarakInputProps` de
  `dist/index.d.ts`, revertido com `git checkout -- dist/index.d.ts` ao final): árvore real (`6.1.0→6.1.0`,
  sem remoção) → **OK**; `6.1.0→6.2.0` com remoção → **BLOQUEOU** (`2 nome(s)` listados); `6.1.0→7.0.0` com a
  MESMA remoção → **OK, major é legítimo**.
- `npm run gate-limits:check` (R18) → `[OK] Os 35 scripts de gates/scripts/ declaram o que não veem.` — os 2
  gates novos entram na varredura e passam.
- `npx vitest run` (suíte completa) → **325 arquivos / 1432 testes, 100% verde** (incluindo os 10 testes
  novos dos 2 gates).
- `git tag --list` → as mesmas **12 tags**, inalteradas.
- `git status --short` → só `docs/migracoes.md` e `package.json` modificados, mais os 4 arquivos novos em
  `gates/scripts/contrato/`; nenhum `specs/specs/`, `arquitetura/`, `adr/`.

## Critérios de aceite

- [x] `docs/migracoes.md` tem entrada ancorada para `4.0.0`, transportada das specs — evidência: linha 412.
- [x] `5.0.0` e `6.0.0` têm entrada, e o §10 registra o que cada fonte devolveu — ver "Decisões e suposições"
      abaixo (as 4 fontes retornaram, no fim, o MESMO achado: o conteúdo já morava em `docs/migracoes.md`,
      só sem a âncora numérica).
- [x] Nenhuma nota afirma uma quebra que não foi encontrada em fonte citável — as três âncoras transportam
      texto **já existente** no arquivo (nada foi inventado; só o título ganhou o número).
- [x] `sarak-ui update --latest`, de uma versão `3.x`, imprime as notas de `4.0.0`/`5.0.0`/`6.0.0` — provado
      executando (ver "Verificações executadas").
- [x] Gate (a) barra um `npm version major` sem entrada — provado, revertido.
- [x] Gate (a) não barra minor nem patch — provado.
- [x] Gate (b) barra um bump minor que remove nome do barril — provado, revertido.
- [x] Gate (b) não barra um major sem remoção *(nem COM remoção — é o caso da `4.0.0`)* — provado.
- [x] Os dois gates declaram o que não veem (R18), no próprio arquivo — bloco "LIMITES DECLARADOS" em ambos.
- [x] `version` continua com os mesmos passos, na mesma ordem, mais os gates no início — `git diff
      package.json` mostra só a inserção, sem reordenar o resto.
- [x] Nenhuma spec fixa tocada; nenhuma tag criada, movida ou apagada — evidência acima.
- [x] Suíte verde, com teste dos dois gates — 325/325 arquivos, 1432/1432 testes.

## Decisões e suposições

- **Passo 2 — as 4 fontes de busca, e o que cada uma devolveu** (`5.0.0`: faixa `v4.0.1..v5.0.0`; `6.0.0`:
  faixa `v5.0.0..v6.0.0`):
  1. `git log --all -S"5.0.0"` / `-S"6.0.0"` sobre `specs/plan/*.md` — devolveu commits, mas o CONTEÚDO das
     ocorrências era majoritariamente ruído (faixas de IP `10.0.0.0/8` num scanner SSRF, `package.json`
     mostrando `@sarak/lib-ui-core@5.0.0`/`@sarak/lib-ui-core@6.0.0` em saída de comando colada num relatório,
     a tabela de defasagem do `sarak-dev/` — `a899e7a`, `92c1e44`, `09ac35a`). **Um sinal útil apareceu**: o
     texto "é o que segurava a `5.0.0`" / "a pergunta que segurava a `5.0.0`", achado nos commits que tocam
     `docs/migracoes.md` da própria faixa (`188bea4` e vizinhos) — vindo do que era `specs/plan/plan-40-teste-
     de-consumidor-erp.md` (removida; conteúdo já sintetizado). Confirma que `plan-39` (a entrada agora
     ancorada como `5.0.0`) era o bloqueio real da tag.
  2. `git log <tag>..<tag>` (mensagens de commit da faixa) — nenhuma mensagem citava "major"/"breaking"
     explicitamente (mesmo padrão que o ADR-008 já registrou: mensagens não carregam intenção de release).
     Sem sinal direto por si só.
  3. `git diff --stat <tag> <tag> -- specs/` — **o sinal mais forte**: para `4.0.1..5.0.0`, mostrou
     `specs/adr/009-persistencia-tenant-aware.md` e os `plan-34` a `plan-39` entrando NESSA faixa; para
     `5.0.0..6.0.0`, mostrou `plan-40` a `plan-50` entrando nela. Isso delimitou exatamente quais entradas de
     `docs/migracoes.md` pertencem a qual tag.
  4. `docs/` e `sarak-dev/` na mesma faixa — **decisivo**: `git log <faixa> -- docs/migracoes.md` mostrou que
     as entradas "Tema salvo... (ADR-011, plan-38)" e "A responsividade... (plan-39)" foram ambas
     ACRESCENTADAS dentro de `v4.0.1..v5.0.0` (commits `802c245`→ADR-009, `26aad11`→plan-39, `cf6e60b`→
     plan-38); e as 5 entradas `plan-41/42/45/47/49` foram acrescentadas dentro de `v5.0.0..v6.0.0`
     (`188bea4`, `ce42460`, `5bb5b9b`, `db82131`, `96552dc`, nesta ordem cronológica). `sarak-dev/` não
     carregava narrativa nenhuma (é estado gerado) — devolveu "nada" para este propósito.
  - **Conclusão do Passo 2:** as 4 fontes, combinadas, encontraram o motivo — o conteúdo de `5.0.0` e `6.0.0`
    **já estava integralmente escrito** em `docs/migracoes.md`; faltava só o número no título. Por isso as
    entradas ancoradas nesta execução são **transporte** (prefixo no título), igual à `4.0.0` — nenhuma
    prosa nova sobre "o que quebrou" foi inventada.
- **`6.0.0` tem TRÊS entradas classificadas MAJOR por conta própria** (`plan-41`, `plan-47`, `plan-49`), todas
  emitidas juntas na mesma tag. Ancorei o número na entrada mais NOVA do lote (`plan-49`, a primeira do
  arquivo) — é a escolha que faz o corte de `extractMigrationNotes` ficar **exato** para um hipotético
  consumidor já em `6.x` (nada sobra como "nota pendente"). Documentei essa assimetria: para o consumidor
  em `5.x`, o corte não é pixel-perfeito — a entrada `5.0.0` (`plan-39`) não é a mais nova do lote de
  `4.0.1..5.0.0` (`plan-38`, MINOR, é mais nova) porque anco-la nela misturaria o defeito COMPORTAMENTAL que
  motivou o major com uma feature aditiva não relacionada. Efeito prático: um consumidor hipotético já em
  `5.x` rodando `--latest` veria de volta a nota (inofensiva) de `plan-38`, que ele já tem. Prefiro esta
  imprecisão declarada a rotular uma entrada MINOR com o número do major que ela não define — no espírito do
  R18 (gate/mecanismo declara o que não cobre, em vez de fingir precisão que não tem).
- **`package.json` ganhou 2 chaves de script novas** (`migration-anchor:check`, `minor-no-removal:check`),
  além da alteração em `version`. A Passo 3 diz "package.json — só o script version". Interpretei isso como
  "não mexa em `preversion`/`postversion`/`gates:full`/`build`" (os outros scripts de release), não como
  "proibido criar qualquer chave nova": (a) o §8 desta própria plan escreve `npm run <gate-a>`, que só existe
  se houver um nome de script; (b) todo gate irmão em `gates/scripts/contrato/` tem seu próprio alias
  (`deep-import:check`, `container-query:check`, etc.) — sem o alias, os dois gates novos ficariam
  inconsistentes com a convenção do resto do arquivo e intestáveis isoladamente. Suposição de impacto baixo
  (2 linhas, sem side-effect em outro gate), declarada aqui por ser a interpretação menos literal do texto.
- **Não rodei `npm run dev-kit`** depois de acrescentar os 2 scripts `:check` — `sarak-dev/state.json`
  ficará com "N gates" defasado em 2 até a próxima geração real. Isso é **esperado e fora do escopo**: a
  própria `03` §3.1 (citada no `00-contexto` §3.1) documenta que o gancho `version` é quem regenera
  `sarak-dev/` a cada release de verdade, e `dev-kit:check` só roda dentro de `preversion`/`gates:full` — que
  esta execução não disparou (não emiti release nenhum). Não é regressão de gate verde→vermelho no HEAD
  atual: medido, `npx vitest run` (que inclui `scripts/dev-kit/__tests__/devKit.test.mjs`) segue 100% verde
  porque aquele teste deriva os gates do `package.json` real (não de uma contagem fixa) e só checa
  CONTENÇÃO de nomes conhecidos, não o total.
- **Restaurei `package.json` e `dist/index.d.ts` manualmente após cada simulação** (edição direta de volta ao
  valor original, ou `git checkout -- dist/index.d.ts` — este último só porque `dist/index.d.ts` nunca fez
  parte do diff pretendido desta plan, é artefato gerado que só toquei para simular o Gate (b)). Em um ponto
  usei `git checkout -- package.json` por engano e descartei minha própria edição do script `version` —
  percebido na hora (o "note" do sistema após o próximo `Read` apontou o arquivo revertido) e reaplicado
  antes de prosseguir; `git diff package.json` no fim confere que só a alteração pretendida sobrou.

## Achados fora do escopo (não corrigidos)

- Nenhum. A varredura do Passo 2 não encontrou nada que precisasse virar plan nova — o conteúdo de `5.0.0` e
  `6.0.0` já existia; só faltava a âncora.

## Pendências / riscos

- **`sarak-dev/state.json` ficará com a contagem de gates defasada em 2** até a próxima vez que alguém rodar
  `npm run dev-kit` (o que acontece automaticamente dentro do gancho `version` real, na próxima release) —
  não é um gate vermelho hoje, é uma leva pendente de regeneração, prevista pelo próprio `00-contexto` §3.1.
- **A imprecisão declarada do corte para um consumidor hipotético em `5.x`** (ver "Decisões e suposições")
  fica registrada aqui para quem for sintetizar o §10 → `01-gates-e-baseline`: não é um defeito do gate (a),
  é uma característica de como `extractMigrationNotes` (plan-10) ancora por título único — resolvível no
  futuro só se a função aceitar múltiplas âncoras por major, o que está fora do escopo desta plan.

---

## §10 — Material para as specs fixas (não editado aqui; para o revisor sintetizar)

### Para `specs/specs/03-versionamento-e-release.md` §3.1

A tabela atual diz *"Oito tags desde a renumeração, três delas MAJOR"* e para na `4.0.0`. Medido nesta plan
(`git tag --list --sort=v:refname`): são **12 tags, 6 majors**. Substituir o parágrafo de abertura da §3.1 e
acrescentar as linhas que faltam:

> **Doze tags desde a renumeração, seis delas MAJOR.** *(Fonte viva: `git tag`. Esta tabela existe para dar o
> **motivo** de cada quebra, que o `git` não guarda.)*

| MAJOR | O que quebrou |
|---|---|
| `2.0.0` | *(sem alteração — já correta)* |
| `3.0.0` | *(sem alteração — já correta)* |
| `4.0.0` | *(sem alteração — já correta)* |
| **`5.0.0`** | **Mesma família da `4.0.0` — mudança de comportamento default, zero export tocado.** O scanner do Tailwind v4 lê arquivo como texto; onde a lib montava a classe de container query por interpolação de template literal, o Tailwind nunca gerava a regra CSS — 11 das 19 classes de container query da lib nunca funcionavam no pacote publicado (nav da topbar, `SarakStack`, layout `col-12`/`masonry`, cabeçalho de seção, `ShellContent`, layout `center` do Shell). Corrigido trocando interpolação por classe literal. Ver `docs/migracoes.md` — entrada `5.0.0`. |
| **`6.0.0`** | **Três quebras MAJOR saíram juntas nesta tag** (nenhuma, sozinha, ganhou release própria): (1) container query estrutural — 10 componentes fora do `SarakShell` (ex.: `SarakAppChrome`) nunca tinham o ancestral `container-type`, então toda classe `@min-[…]` ficava congelada no layout de celular; (2) o grid zero-config (`layoutGridTemplate` default) deixou de ser 12 colunas fixas sem mecanismo de `span` (virava 1 filho por trilha) e passou a ser `auto-fit`; (3) `col-12` escolhido EXPLICITAMENTE (tema persistido/painel) continuava com o mesmo defeito de (2) mesmo depois da correção do default — ganhou `span` default por breakpoint. Ver `docs/migracoes.md` — entrada `6.0.0`. |

### Para `specs/specs/03-versionamento-e-release.md` §5

Acrescentar, ao final da seção (o texto atual sobre a obrigação permanece — isto é adição, não substituição):

> **Desde a `plan-53` (2026-08-19), a obrigação deixou de ser só conduta.** `gates/scripts/contrato/check-
> migration-anchor.mjs` roda dentro do script `version` do npm — o único instante em que o `package.json` já
> tem a versão nova e a tag ainda não existe — e barra `npm version major` se `docs/migracoes.md` não tiver
> uma entrada cujo título cite a versão emitida por extenso (`"X.0.0"`). **Limite declarado (R18, no próprio
> arquivo do gate):** ele só confere a PRESENÇA da âncora, nunca o conteúdo — uma nota vazia ou tecnicamente
> errada passa igual; e só cobra MAJOR, nunca minor/patch.
>
> **Um segundo gate, `check-minor-no-removal.mjs`, cobra a direção oposta e ASSIMÉTRICA:** minor/patch que
> remove um nome do barril público (`dist/index.d.ts`) é sempre barrado — é o erro **com vítima**, porque quem
> está preso numa faixa `^N` recebe a quebra sem escolher. Major SEM remoção nunca é cobrado por gate nenhum
> — e não deveria ser: a `4.0.0` é a prova viva de que um major pode ser 100% legítimo sem remover um export
> sequer (quebra comportamental). Um gate que exigisse remoção para "justificar" o major teria reprovado a
> `4.0.0`.

### Para `specs/specs/01-gates-e-baseline.md` §2.2 (catálogo de gates)

Acrescentar duas linhas à tabela de gates de release:

| Gate | Onde roda | Cobra |
|---|---|---|
| `migration-anchor:check` | `npm run version` (script `version`, início) | Todo MAJOR emitido tem entrada ancorada em `docs/migracoes.md` (03 §5) |
| `minor-no-removal:check` | `npm run version` (script `version`, início) | Minor/patch nunca remove nome do barril público (`dist/index.d.ts`) contra a última tag |

### Para `specs/specs/15-divida-conhecida.md`

Registrar o achado como FECHADO por esta plan, mas com o resíduo declarado:

> **Achado: obrigação de `docs/migracoes.md` por MAJOR foi pulada 3× (4.0.0, 5.0.0, 6.0.0) antes de ganhar
> gate.** Medido pela `plan-53` (2026-08-19): 6 majors publicados, só 2 tinham entrada ancorada (`2.0.0`,
> `3.0.0`). Fechado nesta plan: as 3 âncoras que faltavam foram TRANSPORTADAS (não inventadas — o conteúdo já
> existia em `docs/migracoes.md`, só sem o número no título) e 2 gates novos (`migration-anchor:check`,
> `minor-no-removal:check`) impedem a reincidência.
>
> **Resíduo que permanece aberto:** `extractMigrationNotes` (plan-10) ancora por UM título só por major — a
> âncora de `6.0.0` cobre exatamente o lote de 3 quebras que saíram naquela tag (porque foi colocada na
> entrada mais nova do lote), mas a de `5.0.0` deixa uma nota MINOR adicional (inofensiva, já conhecida)
> visível para um hipotético consumidor que já estivesse em `5.x`. Resolver isso extrapola o escopo da
> `plan-53` (exigiria `extractMigrationNotes` aceitar múltiplas âncoras por major) — registrado aqui para não
> ser redescoberto.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-19 — 🟢 **APROVADA**, com um defeito de entrega a corrigir antes do commit

Tudo abaixo foi **medido ou executado por mim no worktree**.

### 🔧 A §2.1 desta plan estava ERRADA, e a execução provou

Eu escrevi, com todas as letras: *"conduta declarada, sem gate, **pulada 3×**"*.

**Não foi pulada.** As notas dos três majors **estavam escritas** — completas, com "antes/depois",
classificação e ponteiro de plan. Refiz a arqueologia por conta própria e confirmei:

| Faixa | Entrada MAJOR encontrada |
|---|---|
| `v3.0.0 → v4.0.0` | *"O motor de cor parou de reescrever o seu tema sem avisar (Decisão D)"* |
| `v4.0.1 → v5.0.0` | *"A responsividade da Spec 40.3 estava desligada no pacote publicado"* — **a única MAJOR da faixa** |
| `v5.0.0 → v6.0.0` | `plan-49`, `plan-47` e `plan-41` — **três MAJOR na mesma tag** |

Conferi as classificações uma a uma; batem com o que o executor afirmou, **inclusive as MINOR que ele
descartou** como não sendo a âncora (`ADR-011`, `plan-45`, `plan-42`).

**O defeito real era outro, e é mais interessante:** faltava **o número da versão no título**. O
`migrationNotes.mjs` — construído na `plan-10`, dias atrás — procura a âncora pelo `X.0.0` no `##`. As notas
foram escritas **antes** desse leitor existir, seguindo a convenção do arquivo, que nunca exigiu o número.

> **Uma funcionalidade voltada ao consumidor foi construída sobre uma convenção que só existia na cabeça do
> leitor.** Quem escreveu as notas cumpriu a obrigação; ninguém nunca disse que o título precisava carregar a
> versão.

⚠️ **Isso muda o que vai para a `03` §5 na síntese.** Não é *"conduta pulada, agora tem gate"* — é *"a
obrigação **era cumprida**; o **formato** não era cobrado por ninguém, e agora é"*.

### As alegações, contra a minha medição

| Alegação | O que eu medi | |
|---|---|---|
| Atribuição das 3 âncoras | **refiz** `git diff <tag> <tag> -- docs/migracoes.md` nas três faixas — bate integralmente | ✅ |
| Nada inventado | os três casos são **transporte**; a proibição mais dura da plan não precisou ser exercida | ✅ |
| Gate (a) barra major sem âncora | **executei a função exportada**: `9.0.0` ⛔ · `6.0.0` ✅ · `4.0.0` ✅ · `6.1.0`/`6.1.1` não se aplica | ✅ |
| Gate (b) — a assimetria | **executei os 5 casos** com o `.d.ts` real: minor removendo ⛔ (nomeia `SarakButton`) · patch removendo ⛔ · major removendo ✅ · **major sem remover ✅** · minor sem remover ✅ | ✅ |
| `version` sem remover nem reordenar | os gates entraram **no início**; o resto da cadeia intacto | ✅ |
| Suíte | **325 arquivos / 1432 testes, 100% verde**, 139,61 s | ✅ |
| Tags intactas | **12**, nenhuma criada, movida ou apagada | ✅ |
| Nenhuma spec fixa tocada | `git status` limpo em `specs/specs`, `arquitetura`, `adr` | ✅ |

**Um erro meu, declarado:** minha primeira prova do gate (b) usou um `.d.ts` sintético que o
`parseExportedNames` **não reconhecia** — devolvia `[]`, e eu comparei conjunto vazio com conjunto vazio,
concluindo que o gate não bloqueava. **O gate estava certo; o teste era meu e era vazio.** É a mesma classe do
defeito da minha receita de verificação da `plan-51`. Validei a entrada antes de acusar.

### O cuidado que ninguém pediu

O caso da `6.0.0` ganhou nota editorial avisando que **três MAJOR saíram na mesma tag** e que as três devem
ser lidas. Sem isso, quem atravessa a `6.0.0` leria **um terço** do que quebrou.

### 🔴 Defeito de entrega — bloqueia o commit, e o conserto é um comando

`dev-kit:check` está **VERMELHO**: `sarak-dev/state.json`, `GUIA-MANUTENCAO.md` e `START-HERE.md` defasados.

Causa: o `state.json` rastreia os `scripts` do `package.json`, e entraram dois (`migration-anchor:check`,
`minor-no-removal:check`). **O kit não foi regenerado.**

Isto **barra o commit** — foi a `plan-52` que tornou o `dev-kit:check` bloqueante no `pre-commit`, e o
executor daquela plan tratou este mesmo caso explicitamente. Conserto: **`npm run dev-kit`**.

*(Registro sem ironia, mas vale notar: a trava construída duas plans atrás pegou uma omissão real hoje.)*

### Observação de escopo — aceita, e registrada como leitura minha

A §3.1 dizia *"`package.json` — **só** o script `version`"*. Entraram também dois `*:check`. **Aceito:** é o
idioma do repositório (os 15 gates existentes têm todos o seu `*:check`), e o `version` os chama por nome em
vez de caminho, o que envelhece menos. Mas é **além da letra do escopo**, e fica escrito.

### Achados para a síntese

| # | Achado | Destino |
|---|---|---|
| A | A obrigação da `03` §5 **era cumprida**; faltava o **formato da âncora**, que nenhuma convenção exigia | `03` §5 |
| B | `03` §3.1 diz *"8 tags, 3 majors"*; são **12 e 6** | `03` §3.1 |
| C | A `6.0.0` juntou **três MAJOR numa tag só** — nenhum ganhou tag própria | `03` §3.1 |
| D | Os dois gates novos entram no catálogo, com o limite declarado de cada um | `01` §2.2 |
