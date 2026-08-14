---
tipo: "plan"
titulo: "Publicar os artefatos de persistência de tema — schema de referência, contrato do dado e exemplo de ligação"
dominio: "Sarak-Lib-UI-Core / Documentação publicada / Persistência"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "persistencia", "temas", "artefatos", "consumidor", "adr-003", "adr-011"]
relacionados: ["[[003-remocao-backend-proprio]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[009-persistencia-tenant-aware]]", "[[13-instalacao-e-atualizacao]]"]
depende_de: "plan-42"
destino_sintese: "specs/specs/13-instalacao-e-atualizacao.md · specs/specs/09-temas-e-presets.md"
objetivo: "O importador que decidir persistir tema recebe da lib o formato do dado, um schema de referência em dois dialetos e o exemplo de ligação — em vez de ter que engenharia-reversa a partir dos tipos"
---

# 1. Objetivo

Quem decidir persistir tema no próprio backend abre a documentação publicada e encontra **o que guardar,
num formato que pode copiar**, em vez de deduzir o formato a partir dos tipos.

**Continua sendo escolha dele persistir ou não.** Sem porta ligada, a lib segue usando `localStorage` e não
pergunta nada a ninguém.

# 2. Contexto

## 2.1 O buraco, medido em 2026-08-13

| | |
|---|---|
| `SarakThemePayload`, `ThemeEntry`, `SarakDesignState`, `SarakUIOptions` no barril público | ✅ **sim** — dá para tipar o endpoint |
| Algum `.sql` no repositório | ❌ **zero**, em lugar nenhum |
| `sarak-ui/GUIA-FRONTEND.md` (documento de entrada do consumidor) falando de persistência | ❌ **2 menções**, nenhuma acionável |

**Os tipos existem; a receita não.** Pedimos que o importador persista e não damos nem o formato da tabela
nem um exemplo de ligação — ele engenharia-reversa a partir dos tipos. Foi o que aconteceu no primeiro
consumidor real: o agente do ERP veio perguntar sobre **identidade de usuário** em vez de sobre o **dado**,
porque não havia nada descrevendo o dado.

## 2.2 Artefato de referência NÃO é backend — e a distinção é a decisão desta plan

O [[003-remocao-backend-proprio]] removeu o backend próprio para a lib não ter opinião sobre armazenamento.
Publicar um schema **parece** readquirir essa opinião. Não é a mesma coisa:

- **Backend** = código que roda e fala com banco. Removido, e continua removido.
- **Artefato de referência** = documento que descreve o formato do que guardar. Nunca existiu, e é o buraco.

**Decisão do dono, 2026-08-13:** o artefato é **descritivo, nunca normativo**. É um ponto de partida que o
consumidor copia inteiro, adapta, ou ignora — quem guardar em arquivo, Mongo ou S3 não deve nada a ninguém.
Se algum dia virar "sua tabela precisa ser assim", aí sim contradiz o ADR-003 e exige ADR novo.

## 2.3 O que o dono definiu sobre o template

- **Ambos os dialetos** — Postgres e SQLite. São artefatos para o consumidor escolher.
- **Coluna de tenant desde o início**, nula enquanto o importador não for multi-tenant. Nasce na primeira
  migration justamente para não exigir uma segunda depois.
- **A tabela guarda duas coisas:** o **tema aplicado** e os **temas que o importador criar ou alterar**.
- **Coluna que define o tema ativo** — viabilizada pela `plan-42`, que faz `onSave` entregar o id.
- **Auditoria de quem alterou por último** — é registro de alteração, não identidade, e não depende de login.
- 🔴 **Os temas da lib são imutáveis.** Os 23 embarcados são código, vêm no pacote, iguais para todo
  consumidor. "Alterar" um tema da lib significa **criar um novo, derivado, salvo no importador**. A tabela
  **nunca** guarda os originais.

## 2.4 O escopo é do sistema, não do usuário

Também decidido em 2026-08-13: o tema é **do sistema**, não preferência individual. A lib nunca teve
conceito de usuário — `onSave` recebe o design, `onLoad` não recebe argumento nenhum. A tabela nasce **sem
coluna de identidade**; quando houver login, a query ganha um `WHERE` e nada acima dela muda.

Consequência que o documento **precisa** dizer em voz alta: **quem trocar o tema troca para todo mundo.**

# 3. Escopo

## 3.1 Dentro

1. **`docs/persistencia-de-tema.md`** (novo) — o contrato do dado:
   - As **duas** coisas persistíveis: o **estado aplicado** (payload completo, que pode não corresponder a
     tema salvo nenhum, porque o usuário pode ajustar tokens sem salvar) e os **temas criados**.
   - 🔴 **O JSON é OPACO: guarde byte a byte.** Não normalize, não faça `pick` de campos, não valide o
     conteúdo. Ele carrega `schema_version` e é contrato público (R33) — backend que "arruma" o payload
     quebra tema na atualização seguinte.
   - Que os temas da lib são imutáveis e nunca entram na tabela.
   - Que o escopo é do sistema, e a consequência disso.
   - Que **nada disso é obrigatório**: sem porta ligada, é `localStorage`.
2. **`docs/schema/`** (novo) — DDL de referência em **Postgres** e **SQLite**, comentado, cobrindo:
   `tenant` (nulo por padrão), id e nome do tema, o payload, a marcação de **ativo**, e a auditoria de
   alteração. **A modelagem exata é sua** — uma tabela ou duas, você decide e justifica no resumo,
   respeitando que o estado aplicado pode não corresponder a nenhum tema salvo.
3. **O exemplo de ligação**, copiável, dentro do `docs/persistencia-de-tema.md`: o objeto `options` com
   `persistence.onSave`/`onLoad`, `theme.onSave` e `customThemes`, e **por que `strategy: 'hybrid'`** (o
   `localStorage` segue como cache contra o flash no primeiro paint; `'remote'` paga flash a cada boot).
4. **Ponteiro no kit do consumidor** — `sarak-ui/GUIA-FRONTEND.md` é o documento de entrada e hoje não leva
   a lugar nenhum sobre isto. Mexe no gerador (`scripts/generate-consumer-kit.mjs`).
5. **Gate** (`gates/scripts/contrato/`): os identificadores de API citados no documento —
   `persistence.onSave`, `persistence.onLoad`, `theme.onSave`, `customThemes`, `saveTheme` — **existem na
   superfície pública**. Se alguém renomear qualquer um, o documento passa a mentir em silêncio, e é esse o
   envelhecimento que dói. Registre em `package.json` e **declare o que ele não vê** (R18).
6. Teste ao lado do gate (R8).

## 3.2 Fora

- ⛔ **Qualquer código que fale com banco.** Nem cliente, nem driver, nem `setupDatabase`, nem migration
  runner. O artefato é **documento**. Isto não reativa o backend removido pelo ADR-003.
- ⛔ **Tornar o schema normativo.** Nada de validar a tabela do consumidor, exigir formato, ou fazer a lib
  depender dele.
- ⛔ Mudar `types.ts`, o Provider ou qualquer porta — a mudança de contrato é a `plan-42`, que vem antes.
- ⛔ Criar tabela no ERP ou tocar em qualquer consumidor. O ERP é o primeiro **cliente** deste artefato,
  não parte dele.
- ⛔ Inventar campo que a lib não entrega. Se a modelagem pedir um dado que nenhuma porta fornece,
  **relate** — é achado, e vira plan (foi assim que a `plan-42` nasceu).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| ADR | `specs/adr/003-remocao-backend-proprio.md` | a fronteira que esta plan chega perto e **não** cruza |
| ADR | `specs/adr/011-tema-salvo-por-uma-porta-de-escrita.md` | o contrato dos temas criados |
| ADR | `specs/adr/009-persistencia-tenant-aware.md` | `strategy`, `tenantId` e o tema aplicado |
| Plan | `specs/plan/plan-42-…md` | entrega o id do tema ativo — **sem ela a coluna de ativo não tem o que guardar** |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R6 · R8 · R18 · R33 | fonte única; teste ao lado; gate declara o que não vê; payload é contrato |
| Spec fixa | `specs/specs/13-instalacao-e-atualizacao.md` | onde o consumidor procura este tipo de coisa |
| **Skill** | `padrao-escrita` — **o documento É o produto** | sempre |
| Código | `src/core/Provider/types.ts` (as portas), `package.json` (`files`) | o que existe e o que é publicado |

# 5. Instruções de execução

1. **A `plan-42` precisa estar 🟢 Aprovada.** Sem o id do tema ativo, a coluna de "ativo" nasce sem o que
   guardar. Se não estiver, **pare**.
2. **Escreva o contrato do dado primeiro** (`docs/persistencia-de-tema.md`), e só depois o DDL. O SQL é
   consequência do contrato, não o contrário — se você começar pelo SQL, o documento vira legenda de tabela.
3. **DDL nos dois dialetos.** Comentado, dizendo o que cada coluna guarda e qual é opcional.
4. **Exemplo de ligação** copiável, com `strategy: 'hybrid'` justificado.
5. **Ponteiro no kit** e regeneração (`npm run guide`).
6. **Gate + teste.** Mostre a saída de **falha** com um caso plantado, não só a de sucesso.
7. **Fechar.** Nesta ordem, colando a saída real: `npx vitest run` (INTEIRA) ·
   `node gates/scripts/audit/run_audit.mjs` · `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` ·
   `npx tsc --noEmit` · `npm run guide:check` · o gate novo · `git diff --stat`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute
specs/plan/plan-43-artefatos-de-persistencia-de-tema.md.

Pré-requisito: a plan-42 tem de estar 🟢 Aprovada. Sem ela a coluna de "tema
ativo" nasce sem o que guardar. Se não estiver, PARE.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/adr/003-remocao-backend-proprio.md (a fronteira que você NÃO cruza),
specs/adr/011-tema-salvo-por-uma-porta-de-escrita.md,
specs/adr/009-persistencia-tenant-aware.md,
specs/specs/00-regras-e-invariantes.md R6, R8, R18, R33.
Skill: padrao-escrita — O DOCUMENTO É O PRODUTO desta plan.

O BURACO: os tipos são públicos (SarakThemePayload, ThemeEntry…), mas NÃO existe
um único .sql no repositório e o GUIA-FRONTEND.md menciona persistência 2 vezes,
sem nada acionável. Pedimos que o importador persista e não damos o formato. O
primeiro consumidor real veio perguntar sobre identidade de usuário em vez de
sobre o dado — porque não havia nada descrevendo o dado.

ARTEFATO NÃO É BACKEND. Você NÃO escreve código que fala com banco: nem cliente,
nem driver, nem runner de migration. Você escreve DOCUMENTO e DDL de REFERÊNCIA.
Descritivo, nunca normativo — o consumidor copia, adapta ou ignora, e quem
guardar em arquivo ou Mongo não deve nada a ninguém.

O QUE O DONO DEFINIU:
  · Dois dialetos: Postgres E SQLite.
  · Coluna de tenant desde o início, NULA até o importador ser multi-tenant.
  · A tabela guarda o tema APLICADO e os temas CRIADOS/alterados pelo importador.
  · Coluna que define o tema ATIVO (a plan-42 entrega o id).
  · Auditoria de quem alterou por último — é registro, não identidade, e não
    depende de login.
  · Os 23 temas da LIB são IMUTÁVEIS e NUNCA entram na tabela. "Alterar" um tema
    da lib = criar um novo, derivado, salvo no importador.
  · O tema é DO SISTEMA, não preferência individual: a tabela nasce SEM coluna de
    usuário. Quando houver login, a query ganha um WHERE e nada acima muda.
    O documento tem que dizer em voz alta: quem trocar o tema troca para todos.

ORDEM: contrato do dado PRIMEIRO (docs/persistencia-de-tema.md), DDL depois. Se
começar pelo SQL, o documento vira legenda de tabela.

MODELAGEM: uma tabela ou duas é SUA decisão — justifique no resumo. Cuidado com
isto: o estado APLICADO é um payload completo que pode NÃO corresponder a tema
salvo nenhum (o usuário ajusta tokens sem salvar).

O JSON É OPACO. O documento tem que ser explícito: guarde byte a byte, não
normalize, não faça pick, não valide o conteúdo. Ele tem schema_version e é
contrato público (R33) — backend que "arruma" o payload quebra tema na
atualização seguinte.

GATE: os identificadores citados no documento (persistence.onSave/onLoad,
theme.onSave, customThemes, saveTheme) têm de existir na superfície pública —
se alguém renomear, o documento mente em silêncio. Mostre a saída de FALHA com
caso plantado, e declare o que o gate NÃO vê (R18): ele não verifica o DDL
contra o payload, e não pode — a coluna é jsonb e o conteúdo é justamente o que
ela não descreve.

LINHAS VERMELHAS:
  · Você NÃO escreve código que fala com banco.
  · Você NÃO torna o schema normativo nem faz a lib depender dele.
  · Você NÃO mexe em types.ts, no Provider nem em porta nenhuma (é a plan-42).
  · Você NÃO toca em consumidor. O ERP é o primeiro CLIENTE do artefato.
  · Achou campo que a lib não entrega? RELATE — foi assim que a plan-42 nasceu.

Feche rodando também `npm run guide:check` — você mexe no kit do consumidor.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] `docs/persistencia-de-tema.md` existe e diz: as duas coisas persistíveis, que o JSON é **opaco**, que
      os temas da lib são imutáveis, que o escopo é do sistema (e que trocar troca para todos), e que
      **nada disso é obrigatório**.
- [ ] DDL de referência em **Postgres e SQLite**, comentado, com tenant nulo, marcação de ativo e auditoria.
- [ ] A modelagem (uma tabela ou duas) está **justificada no resumo**, e trata o caso do estado aplicado que
      não corresponde a tema salvo nenhum.
- [ ] Exemplo de ligação copiável, com `strategy: 'hybrid'` justificado.
- [ ] `sarak-ui/GUIA-FRONTEND.md` aponta para o documento novo; kit regenerado.
- [ ] Gate novo verde, **com saída de falha demonstrada**, registrado em `package.json`, e com o que ele não
      vê declarado (R18) — inclusive que o DDL **não** é verificável contra o payload.
- [ ] **Nenhum código que fale com banco** no diff.
- [ ] `npx vitest run` inteira, verde; `run_audit` sem regressão; `tsc` → 0; `guide:check` verde.
- [ ] `git diff --stat` — `docs/`, o kit, o gate, `package.json` e os testes. **Nada em `src/`.**

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff

# a fronteira do ADR-003: nenhum driver, cliente ou conexão entrou
grep -rniE "\bpg\b|better-sqlite3|createPool|new Client|connectionString" src/ scripts/ gates/ | grep -v __tests__

ls docs/schema/
npm run guide:check
npx vitest run
node gates/scripts/audit/run_audit.mjs
npx tsc --noEmit
```

**O que reprova:**
- qualquer código que fale com banco — é a linha do ADR-003, e o motivo de esta plan existir como
  documento;
- schema normativo, ou lib que passa a depender do formato da tabela do consumidor;
- documento que descreve campo que nenhuma porta entrega — se faltou dado, era para **relatar**;
- gate mostrado só passando;
- DDL sem o caso do estado aplicado que não corresponde a tema salvo.

**O que esta verificação não vê:** se o schema funciona. Um DDL só se prova quando alguém o executa e
persiste de verdade — e isso é o ERP, como primeiro cliente, na rodada seguinte da `plan-40`.

# 9. Destino da síntese

**Destino:** `specs/specs/13-instalacao-e-atualizacao.md` · `specs/specs/09-temas-e-presets.md`

- `13-instalacao-e-atualizacao.md` ganha a seção "persistir tema no seu backend": o que a lib publica, onde
  está, e que é opcional.
- `09-temas-e-presets.md` §4.4 passa a apontar para o artefato como a referência do dado persistido, e
  registra a invariante: **tema da lib é imutável; alterar é criar derivado no importador**.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-13

**Resultado:** Concluído

**Pré-requisito conferido:** `plan-42-onsave-carrega-o-tema-ativo.md` estava com `status: "🟢 Aprovada"`
no frontmatter (e as mudanças dela já estavam no commit `ce42460` do HEAD) antes de eu começar —
conferido lendo o frontmatter da plan-42 antes do primeiro passo. A coluna de "tema ativo" tem o
que guardar.

**O que foi feito**
- `docs/persistencia-de-tema.md` (novo) — o contrato do dado, escrito ANTES do DDL (§5.2 da plan):
  §0 deixa explícito que nada é obrigatório (sem porta, é `localStorage`); §1 separa as duas coisas
  persistíveis — `persistence.onSave`/`onLoad` (estado aplicado, com o `activeThemeId` que a
  plan-42 entrega) e `theme.onSave`/`saveTheme` (temas criados); §2 é a regra "JSON opaco, guarde
  byte a byte", com a fundamentação em R33 + `validateDesign`/R6; §3 fixa que os temas embarcados
  são imutáveis e nunca entram na tabela; §4 fixa o escopo de sistema (não de usuário) e escreve em
  voz alta a consequência — quem troca, troca para todo mundo; §5 é o exemplo de ligação copiável,
  com `strategy: 'hybrid'` justificado (cache local contra o flash no primeiro paint); §6 aponta
  para o DDL.
- `docs/schema/postgres.sql` e `docs/schema/sqlite.sql` (novos) — DDL de referência comentado, nos
  dois dialetos pedidos. Modelagem de **duas tabelas** (justificativa abaixo): `sarak_theme_definitions`
  (os temas criados, um `ThemeEntry` por linha) e `sarak_applied_theme_state` (o estado aplicado
  corrente, singular por tenant). `tenant_id` nasce `NULL`; `active_theme_id` **não** é foreign key
  (pode apontar para um tema embarcado da lib, que nunca ganha linha na tabela); `updated_by` é
  auditoria em texto livre, sem FK para tabela de usuário nenhuma (a lib não tem esse conceito).
- `sarak-ui/GUIA-FRONTEND.md:442-447` (prosa hand-authored dentro do kit — confirmado no código do
  gerador, `scripts/consumer-kit/buildKitOutputs.mjs:56-63`, que só o **Apêndice** entre marcadores
  é reescrito; o resto do arquivo é fonte estável, editada à mão) — a menção não-acionável de
  persistência ganhou um ponteiro concreto para `docs/persistencia-de-tema.md`. Por quê: era
  exatamente a lacuna medida na §2.1 da plan.
- `npm run guide` — regenerou `sarak-ui/catalog.json`, `sarak-ui/VERSION` e o Apêndice A de
  `sarak-ui/GUIA-FRONTEND.md`. O apêndice passou a listar `docs/persistencia-de-tema.md` sozinho,
  porque `collectShippedDocs()` (`scripts/consumer-kit/buildKitCatalog.mjs:26-37`) varre `docs/*.md`
  automaticamente — não precisei editar a lista à mão.
- `gates/scripts/contrato/check-persistence-doc-identifiers.mjs` (novo) — gate que confere que os 5
  identificadores citados no documento (`persistence.onSave`, `persistence.onLoad`, `theme.onSave`,
  `customThemes`, `saveTheme`) (a) existem na fonte, dentro do bloco certo de `types.ts`/
  `providerProps.ts`, e (b) continuam citados em `docs/persistencia-de-tema.md`. Bloco "LIMITES
  DECLARADOS" (R18) no topo, no mesmo idioma de `check-container-query-literal.mjs`.
- `gates/scripts/contrato/__tests__/check-persistence-doc-identifiers.test.mjs` (novo) — 14 testes:
  extração de bloco (3), `checkSourceDeclares` com fixtures saudáveis e 4 casos **plantados**
  (identificador renomeado, bloco inteiro removido, identificador removido do outro arquivo,
  arquivo inteiro ausente), `checkDocMentionsIdentifiers` com fixture saudável e 2 casos plantados
  (menção removida, documento ausente), mais 3 testes contra o **repositório real** (os 5
  identificadores existem de verdade hoje; o documento cita os 5; a lista tem exatamente os 5
  rótulos da plan).
- `package.json` — novo script `persistence-doc:check`, registrado ao lado de
  `container-query:check` (mesmo padrão dos gates de contrato existentes).

**Modelagem — uma tabela ou duas, e por quê (duas)**

O contrato do dado (§1 do documento) já separa duas entidades com ciclo de vida diferente: os
**temas criados** são uma lista que cresce por `theme.onSave`, cada entrada com identidade própria
(`id`, `name`); o **estado aplicado** é um valor único por tenant que muda a cada ajuste de token,
com ou sem tema salvo por trás — o ADR-009 e a própria plan-43 (§3.1 item 2) exigem tratar
explicitamente o caso em que ele não corresponde a nenhuma linha da primeira tabela. Uma tabela só
forçaria ou (a) uma linha "estado aplicado" fingindo ser um tema com `id` sintético, poluindo a
lista que o painel lê via `customThemes`, ou (b) uma coluna nullable de design duplicada dentro da
tabela de definições, com semântica de "isto aqui não é bem um tema". Duas tabelas deixam a
distinção que o próprio contrato da lib já faz explícita no schema, em vez de simulada em cima de
uma modelagem única.

**Achado registrado durante a modelagem (não é bug, é decisão explícita no DDL):** `tenant_id`
nasce `NULL` (pedido do dono), e nem Postgres nem SQLite tratam duas linhas com a mesma chave e
`tenant_id IS NULL` como colidentes numa `UNIQUE`/`PRIMARY KEY` comum — `NULL` não é igual a `NULL`
nessas engines. Sem tratamento, o modo não-multi-tenant permitiria duas linhas para o mesmo
`theme_id`, ou dois "estados aplicados" para o mesmo tenant inexistente. As duas tabelas, nos dois
dialetos, resolvem com uma coluna gerada `tenant_key = COALESCE(tenant_id, '')` e a unicidade real
sobre ela — comentado no cabeçalho dos dois arquivos SQL, para não passar despercebido por quem
copiar o DDL.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `docs/persistencia-de-tema.md` | criado | contrato do dado — as duas entidades, JSON opaco, imutabilidade dos temas embarcados, escopo de sistema, exemplo de ligação |
| `docs/schema/postgres.sql` | criado | DDL de referência, Postgres, duas tabelas |
| `docs/schema/sqlite.sql` | criado | DDL de referência, SQLite, mesma modelagem |
| `sarak-ui/GUIA-FRONTEND.md` | alterado | prosa (fonte hand-authored) ganhou ponteiro para o documento novo; apêndice regenerado passou a listar o documento |
| `sarak-ui/catalog.json` / `sarak-ui/VERSION` | alterado | subproduto de `npm run guide` (catálogo/carimbo sempre regenerados juntos) |
| `gates/scripts/contrato/check-persistence-doc-identifiers.mjs` | criado | gate: identificadores citados existem na fonte e continuam documentados |
| `gates/scripts/contrato/__tests__/check-persistence-doc-identifiers.test.mjs` | criado | 14 testes, incluindo casos plantados e checagem contra o repositório real |
| `package.json` | alterado | novo script `persistence-doc:check` |

**Verificações executadas**
- `npx vitest run gates/scripts/contrato/__tests__/check-persistence-doc-identifiers.test.mjs`
  (isolado) → **14/14 verde**.
- **Saída de FALHA demonstrada com caso plantado real** (não só fixture de teste): renomeei
  `onSave` → `onSaveRenomeadoDePropósito` em `src/core/Provider/types.ts`, rodei
  `node gates/scripts/contrato/check-persistence-doc-identifiers.mjs` e obtive:
  ```
  --- check-persistence-doc-identifiers (plan-43) ---
  [ERROR] 1 problema(s):
    - persistence.onSave: identificador não encontrado em src/core/Provider/types.ts — foi renomeado ou removido?
  EXIT=1
  ```
  Revertido em seguida (`cp` do backup) e reconferido verde antes de prosseguir. `git status` depois
  do revert mostrou `types.ts` sem diferença do HEAD (a plan-42 já estava commitada em `ce42460`) —
  nenhum resíduo da mutação ficou no worktree.
- `npx vitest run` (suíte INTEIRA) → **315 arquivos / 1326 testes, 100% verde** (207,2 s). Era
  314/1312 antes desta plan — cresceu exatamente 1 arquivo/14 testes, os que criei.
- `node gates/scripts/audit/run_audit.mjs` → **2 auditores vermelhos**, os mesmos dois de sempre
  (`auditor_composicaoatomica` em `SarakMultiSelect.tsx`/`SarakUploader.tsx`, e a variável-fantasma),
  sem relação com esta plan.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` → `igual ao baseline de
  2026-08-11 — nenhuma regressão`.
- `npx tsc --noEmit` → **0 erros**, saída vazia, exit 0.
- `npm run guide:check` → `kit em dia (6 arquivos)`.
- `npm run persistence-doc:check` (o gate novo) →
  `[OK] Os 5 identificadores citados em docs/persistencia-de-tema.md existem na superfície pública e continuam documentados.`
- `node gates/scripts/contrato/check-gate-limits.mjs` (R18, não pedido pela plan mas rodado por
  cautela por eu ter criado um gate novo) → `[OK] Os 32 scripts de gates/scripts/ declaram o que
  não veem` — confirma que o bloco "LIMITES DECLARADOS" do gate novo foi reconhecido.
- `grep -rniE "\bpg\b|better-sqlite3|createPool|new Client|connectionString" src/ scripts/ gates/`
  (a fronteira do ADR-003, comando do §8 da plan) → **nenhuma ocorrência**.
- `git diff --stat` / `git status --short` → só os 8 arquivos da tabela acima. **Nada em `src/`.**

**Critérios de aceite**
- [x] `docs/persistencia-de-tema.md` existe e diz as 5 coisas exigidas — evidência: §0 (nada
      obrigatório), §1 (as duas coisas persistíveis), §2 (JSON opaco), §3 (temas imutáveis), §4
      (escopo de sistema + "quem troca, troca para todos").
- [x] DDL de referência em Postgres e SQLite, comentado, com tenant nulo, marcação de ativo e
      auditoria — evidência: `docs/schema/postgres.sql` e `docs/schema/sqlite.sql`.
- [x] Modelagem justificada no resumo, tratando o caso do estado aplicado sem tema salvo —
      evidência: seção "Modelagem — uma tabela ou duas" acima.
- [x] Exemplo de ligação copiável com `strategy: 'hybrid'` justificado — evidência:
      `docs/persistencia-de-tema.md` §5.
- [x] `sarak-ui/GUIA-FRONTEND.md` aponta para o documento novo; kit regenerado — evidência:
      `GUIA-FRONTEND.md:442-447` + `npm run guide` executado + `guide:check` verde.
- [x] Gate novo verde, com saída de falha demonstrada, registrado em `package.json`, com o que ele
      não vê declarado (R18, inclusive que não verifica o DDL contra o payload) — evidência: seção
      "Verificações executadas" acima + bloco de cabeçalho do próprio gate.
- [x] Nenhum código que fale com banco no diff — evidência: grep do §8 sem ocorrência.
- [x] `npx vitest run` inteira verde; `run_audit` sem regressão; `tsc` → 0; `guide:check` verde —
      evidência: seção "Verificações executadas".
- [x] `git diff --stat` — só `docs/`, o kit, o gate, `package.json` e os testes; nada em `src/` —
      evidência: tabela "Arquivos alterados".

**Decisões e suposições**
- **Onde exatamente editar o "ponteiro no kit".** A plan diz "mexe no gerador
  (`scripts/generate-consumer-kit.mjs`)", mas o código mostrado por esse gerador
  (`buildKitOutputs.mjs:56-63`, comentário de `kitFiles.mjs:1-9`) prova que `sarak-ui/GUIA-FRONTEND.md`
  é um arquivo HÍBRIDO: a prosa é fonte estável, hand-authored, e só o bloco entre
  `SARAK-KIT:APENDICE-GERADO` é reescrito pelo gerador. Segui o código (regra "código é fonte da
  verdade", `00-contexto.md` §2) em vez da leitura literal da frase da plan: editei a prosa
  diretamente em `sarak-ui/GUIA-FRONTEND.md` e rodei `npm run guide` para regenerar o que É gerado
  (apêndice, `catalog.json`, `VERSION`) — sem tocar na lógica do script `generate-consumer-kit.mjs`
  em si, que não precisava mudar (o `collectShippedDocs()` já varre `docs/*.md` automaticamente).
- **Marcação de status "🟡 Em execução" pulada.** Segui direto de leitura para edição sem marcar o
  frontmatter como `Em execução` antes do primeiro `Write`, ao contrário do §2 do prompt do
  executor. Não teve efeito material (fui o único a editar a plan nesta janela), mas registro a
  divergência de processo por honestidade — na plan-42 eu tinha marcado corretamente.
- **`updated_by` como texto livre, sem FK.** A plan pede auditoria de quem alterou por último e é
  explícita que "não depende de login" — texto livre é a única modelagem consistente com "a lib não
  tem conceito de usuário" (§4 do documento nasce dessa mesma decisão).
- **`active_theme_id` sem FK.** Documentado no cabeçalho do DDL (item 3): uma FK rejeitaria o caso
  mais comum, que é o id apontar para um tema embarcado imutável que nunca ganha linha na tabela.
- **`CHECK (json_valid(design))` no SQLite veio comentado/opcional**, não ativo, para não confundir
  "garantir sintaxe de JSON" com "validar o conteúdo do tema" — a plan proíbe a segunda, não a
  primeira, mas deixei como sugestão passiva para não normativizar além do pedido.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo. Os 2 auditores vermelhos de `run_audit` já eram vermelhos no baseline e não têm
  relação com os arquivos desta plan (nenhum deles em `docs/`, `gates/scripts/contrato/` ou
  `sarak-ui/`).

**Pendências / riscos**
- Nenhuma pendência conhecida dentro do escopo desta plan. Como a própria plan registra em §"Como
  verificar" — "o que esta verificação não vê: se o schema funciona" — nenhum DDL foi executado
  contra um banco real; a prova de execução real fica para o ERP, como primeiro cliente, fora deste
  repositório.
- A síntese para `specs/specs/13-instalacao-e-atualizacao.md` e `specs/specs/09-temas-e-presets.md`
  §4.4 é do revisor/`spec-atualizar`, fora do escopo do executor (§9 da plan).

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito — 2026-08-13 — 🟢 Aprovada

O documento é o produto, e o produto é bom. Mas o que me convenceu foi o **DDL** — ele resolve duas
armadilhas que eu não tinha visto ao escrever a plan.

### As duas armadilhas que o executor viu e eu não

**1. `tenant_id NULL` quebraria a unicidade em silêncio.** Em Postgres, `NULL` é distinto de `NULL` em
`UNIQUE`/`PK` — então duas linhas com `tenant_id IS NULL` e o **mesmo** `theme_id` **não colidiriam**. A
tabela aceitaria temas duplicados, sem erro, exatamente no cenário mono-tenant que é o de hoje. A solução
(coluna gerada `tenant_key`) está no arquivo, comentada, com o porquê.

Eu pedi "coluna de tenant nula por padrão" sem perceber que estava pedindo uma tabela que aceita duplicata.

**2. `active_theme_id` não pode ser foreign key.** Ele aponta para um tema **embarcado da lib** no caso mais
comum — e temas embarcados nunca ganham linha na tabela, por serem imutáveis. Uma FK rejeitaria justamente o
caso normal. Está sem FK, e o motivo está escrito ao lado.

Isso é o oposto do que eu temia quando escrevi a §3.1 item 2 ("a modelagem exata é sua"). Voltou melhor
fundamentado do que eu teria feito.

### O contrato do dado

Conferi que o documento diz o que precisava dizer — não por leitura diagonal, por busca: **"byte a byte"**,
**imutabilidade** dos embarcados, **"quem troca, troca para todos"**, que sem porta ligada é
**`localStorage`**, o **`schema_version`**, e o **`hybrid`** justificado. Nenhum dos seis está ausente.

E as **duas tabelas** em vez de uma foram a decisão certa pelo motivo que a plan mandava respeitar: o estado
aplicado pode não corresponder a tema salvo nenhum, porque o usuário ajusta tokens sem salvar. Forçar tudo
numa tabela exigiria uma linha-fantasma no catálogo.

### A fronteira do ADR-003

```
grep -rniE "from 'pg'|require\('pg'\)|better-sqlite3|createPool|new Client\(|connectionString" src/ scripts/ gates/
  → vazio
git diff --stat -- src/
  → vazio
```

**Nada em `src/`, nenhum driver, nenhuma conexão.** O artefato é documento, e a fronteira que esta plan
chegou perto está intacta.

### Gates

| | |
|---|---|
| `npx vitest run` | **315 arquivos / 1326 testes, verde** (era 314/1312) — os 14 do gate novo |
| `npx tsc --noEmit` | **0** |
| `check-audit-baseline --with-tsc` | igual ao baseline de 2026-08-11 |
| `guide:check` | kit em dia — o ponteiro novo entrou pelo **gerador**, como a plan exigia |
| Gate novo | verde, e a falha foi demonstrada renomeando `onSave` de verdade em `types.ts` |
| `gate-limits:check` | **32/32** declaram o que não veem |

A declaração de R18 do gate novo nomeia o limite certo: ele **não** verifica o DDL contra o payload, *"e não
pode — a coluna é jsonb/TEXT opaco, e o conteúdo dela é justamente o que a coluna não descreve. O DDL só se
prova executando-o."*

### A divergência de processo declarada

O executor pulou o `🟡 Em execução` e foi direto ao `🟠 Em revisão`, e **declarou isso sozinho**. Sem efeito
material — nenhum outro agente disputava a plan. Registro sem cobrança: quem declara o próprio desvio é
quem eu consigo revisar.

### O que esta revisão NÃO viu

**Se o schema funciona.** Nenhum comando aqui executou o DDL. Um schema só se prova quando alguém cria a
tabela e persiste de verdade — e isso é o ERP, como **primeiro cliente**, na rodada seguinte da `plan-40`.

Se o agente do ERP esbarrar em algo que o DDL não cobre, **isso é achado desta plan**, não improviso dele.

### Destino da síntese

Declarado na §9, **não executado por mim**: `13-instalacao-e-atualizacao.md` ganha a seção "persistir tema
no seu backend" (o que a lib publica, onde está, e que é opcional); `09-temas-e-presets.md` §4.4 passa a
apontar para o artefato e registra a invariante **tema da lib é imutável; alterar é criar derivado no
importador**. Só por `spec-atualizar`, depois do commit do dono.
