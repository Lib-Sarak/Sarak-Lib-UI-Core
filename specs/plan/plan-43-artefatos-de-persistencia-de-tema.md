---
tipo: "plan"
titulo: "Publicar os artefatos de persistência de tema — schema de referência, contrato do dado e exemplo de ligação"
dominio: "Sarak-Lib-UI-Core / Documentação publicada / Persistência"
status: "🔴 A executar"
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

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
