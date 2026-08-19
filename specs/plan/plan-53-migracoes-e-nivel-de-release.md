---
tipo: "plan"
titulo: "As notas de migração que faltam, e os dois gates que impedem a reincidência"
dominio: "Sarak-Lib-UI-Core / Distribuição / Release"
status: "🔴 A executar"
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

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
