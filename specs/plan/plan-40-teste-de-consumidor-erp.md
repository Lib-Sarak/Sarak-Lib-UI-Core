---
tipo: "plan"
titulo: "Provar a leva 34–39 num consumidor real — o ERP Earendel"
dominio: "Sarak-Lib-UI-Core / Validação em consumidor"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "teste-de-consumidor", "erp", "plan-39", "plan-38", "adr-011"]
relacionados: ["[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[07-responsividade-e-multidispositivo]]", "[[09-temas-e-presets]]", "[[13-instalacao-e-atualizacao]]"]
depende_de: "plan-39"
destino_sintese: "specs/specs/13-instalacao-e-atualizacao.md · specs/specs/15-divida-conhecida.md"
objetivo: "Rodar a leva 34–39 dentro do ERP Earendel e provar, na tela, que o conserto da responsividade chega ao consumidor e que a porta única de salvar tema se sustenta num sistema de quatro apps"
---

# 1. Objetivo

A leva 34–39 está aprovada por suíte, gates e leitura de diff. **Nada disso é um consumidor.** Esta plan
roda a lib dentro do **ERP Earendel** e responde a duas perguntas que só a tela responde:

1. O conserto da `plan-39` **aparece**? A nav de módulos da topbar, hoje invisível no tema padrão do ERP,
   passa a aparecer — e nada mais quebra.
2. O desenho de **uma porta de escrita** (ADR-011) se sustenta num sistema de **quatro apps**, ou o custo
   de devolver os temas por `customThemes` denuncia que faltou a porta de leitura?

**Esta plan não conserta o ERP.** Ela mede. Todo defeito encontrado vira plan **na lib**.

# 2. Contexto

## 2.1 O que foi medido no consumidor — 2026-08-13, antes de escrever esta plan

- **A porta única.** Tudo passa por `packages/ui-kit` (`file:../../../../Biblioteca/Sarak-Lib-UI-Core`).
  Os quatro apps — `conector`, `propostas`, `projetos`, `contratos` — montam `SarakUIProvider` com
  `ERP_THEMES` e envolvem a tela em `SarakAppChrome` (`packages/ui-kit/src/nav.tsx:55`).
- 🔴 **O ERP é vítima viva do bug da `plan-39`.** O tema padrão `erp-corporativo` deriva de
  `minimalist-airy`, e conferi no `dist`: **`minimalist-airy` tem `navigationStyle: 'topbar'`**. Logo, hoje,
  no tema padrão, a nav de módulos está `display:none` permanente. Ninguém notou porque nunca apareceu.
  **É o melhor observável possível: aparece, ou não aparece.**
- **Há caso-controle de graça:** `erp-noturno` deriva de `sarak-sovereign`, que é `sidebar`. Trocar de tema
  e ver o mecanismo mudar prova que o efeito é o certo, não coincidência.
- **A centralização do tema é real, por dois mecanismos independentes** — confirmado com o dono:
  (a) *compilação* — os quatro apps importam o mesmo `ERP_THEMES` de `@erp/ui-kit`;
  (b) *runtime* — há um **gateway em `localhost:3000`** (`src/server.ts`) que faz proxy por prefixo de rota
  para o Vite de cada módulo, então os quatro vivem na **mesma origem**; nenhum declara
  `persistence.storageKey`, então todos usam a chave default com `crossTabSync` ligado.
  **Não existe tema por módulo, e não deve passar a existir.**
- **Superfície afetada pela `plan-39` fora da topbar é pequena:** `SarakStack` → 0 usos no ERP;
  `masonry`/`col-12` → 0 usos; `SarakGrid` → 3 usos, por outro caminho (`getGridStyles`), provavelmente
  imune. **Confirme na tela, não presuma.**
- **O conector não tem banco.** As dependências de `Modulos/conector/api` são `express` e `@erp/portas`.
  Quem tem `database/migrations` é `propostas`, `projetos`, `contratos` e `_template`. O banco é
  **Postgres**, schema `"ERP-Iarendel"`, migrations SQL numeradas, com a regra no cabeçalho delas:
  *"Migration publicada NUNCA se edita: corrige-se com outra."* `pg` e `better-sqlite3` estão nas
  dependências da **raiz** — **a camada de acesso não foi localizada por mim; localizar é o passo 0.**

## 2.0 🔴 EMENDA — 2026-08-13, durante a execução: o ERP não tem camada de banco

Uma varredura que eu havia deixado rodando em segundo plano terminou **depois** de eu escrever esta plan, e
o resultado muda a Fase B. Registro aqui em vez de corrigir em silêncio.

**O que medi, agora com exclusão de `node_modules` e `dist`:**

| Busca | Resultado |
|---|---|
| `pg` / `better-sqlite3` importados em fonte (`src`, `Modulos/*/api/src`, `packages`) | **nenhum arquivo** |
| script de `migration`/`db`/`seed` em qualquer `package.json` do repositório | **nenhum** |

Ou seja: as migrations `.sql` existem como **documento** (*"extraído do schema em produção"*), mas **não há
camada de acesso ao banco nem executor de migration no código do ERP**. Os drivers na raiz estão declarados
e não são usados por nenhum fonte.

**Consequência para os passos 8 e 9 da §3.1:** eles pressupõem um lugar onde plugar tabela e endpoint. Esse
lugar **não existe**. Construí-lo é infraestrutura de verdade no ERP — longe do *"os ajustes esperados são
pequenos"* que originou esta plan, e trabalho que o executor **não deve improvisar** no meio de um teste.

🔴 **A Fase B está PARADA nesta decisão do dono. A Fase A segue liberada e não depende dela.**

## 2.2 O desconforto que ESTE teste existe para expor

O tema **aplicado** é central por `localStorage` de mesma origem. O tema **salvo** volta pela prop
`customThemes`, que é resolvida **na montagem** — e cada app monta o próprio Provider. Se só um app ler a
tabela, o tema salvo aparece só nele.

Manter a centralização exige que o *fetch* viva no `@erp/ui-kit` e que os quatro `main.tsx` — hoje síncronos
— esperem o dado ou re-renderizem quando ele chega.

**Isso é consequência direta de uma decisão do revisor no [[011-tema-salvo-por-uma-porta-de-escrita]]:**
sem porta de leitura, o importador alimenta `customThemes`. Se num consumidor real de quatro apps isso ficar
desconfortável, **o conserto é reabrir a decisão na lib**, não contornar no ERP. **Registre o atrito com
todas as letras no resumo** — ele é resultado desta plan, não detalhe de implementação.

## 2.3 Dois repositórios, e nenhum commit

Esta plan opera em **dois worktrees**: a lib (aqui) e o ERP (`Code/Earendel/ERP`). Os gates, hooks e a suíte
**deste** repositório não cobrem nada do ERP. **Não commite em nenhum dos dois.**

Não é preciso tag nem release: a dependência é `file:`, então o teste roda contra o **build local** da lib.
Isso é de propósito — o objetivo é medir **antes** de publicar a `5.0.0`.

⚠️ **`file:` no pnpm é cópia no store.** Sem reinstalar depois do rebuild, o ERP continua com o pacote
velho e o teste mede o passado. Já custou uma investigação inteira antes.

# 3. Escopo

## 3.1 Dentro

### Fase A — regressão visual (a `plan-39`), sem uma linha de código no consumidor

1. `npm run build` na lib; reinstalar no ERP de forma que o store seja atualizado (declare o comando usado).
2. Subir o ERP (`npm run dev` na raiz — gateway + os quatro webs) e percorrer os **quatro** apps.
3. **Observável 1:** no tema `erp-corporativo` (padrão), a nav de módulos da topbar **aparece**.
4. **Observável 2 (controle):** em `erp-noturno`, o cromo continua em sidebar, como antes.
5. **Observável 3:** varrer as telas de cada app procurando o que a `plan-39` religou — empilhamentos que
   viram linha, grades que saem de 1 coluna, paddings/tipografia que crescem. **Registre o que mudou e o que
   não mudou**, app por app.
6. Evidência no resumo: descrição do que foi visto, por app e por tema. Captura de tela se ajudar.

### Fase B — a porta de salvar tema (a `plan-38` / ADR-011)

> 🔴 **PARADA — leia a emenda §2.0 antes de começar a Fase B.** A camada de acesso ao banco que os passos 8
> e 9 pressupõem **não existe no ERP** (medido em 2026-08-13). O meio de armazenamento está em decisão do
> dono. **Não improvise um.** A Fase A não depende disto e segue.

7. **Passo 0, antes de qualquer edição:** confirmar a medição da §2.0 e **declarar no resumo** o que achou.
   Se a decisão do dono já estiver escrita nesta plan, siga-a; se não estiver, **pare**.
8. **Migration nova no conector** (`Modulos/conector/database/migrations/`, diretório novo), criando uma
   tabela com **prefixo `ui`** — decisão do dono, 2026-08-13 — no schema `"ERP-Iarendel"`. Numerada, no
   padrão dos módulos existentes. **Migration publicada nunca se edita.**
9. **Endpoint no conector** para gravar e listar temas salvos. É o módulo central (ADR-007) e é onde o tema
   central pertence.
10. **`@erp/ui-kit`** passa a: (a) expor `options.theme.onSave` ligado a esse endpoint, e (b) carregar os
    temas salvos e entregá-los em `customThemes` — **para os quatro apps**, senão a centralização quebra.
11. **Observável 4:** salvar um tema no painel → ele aparece na lista **na hora**.
12. **Observável 5:** recarregar → o tema **continua** na lista. **É a metade que a suíte da lib não
    consegue provar** e a razão principal desta fase.
13. **Observável 6:** o tema salvo num app aparece **nos outros três**. Se não aparecer, é achado — e o
    diagnóstico vai na §2.2, não num remendo.
14. **Observável 7:** com o backend fora do ar (derrube o conector), salvar **avisa e mantém** o tema na
    sessão — o comportamento que o veredito da `plan-38` aprovou. Prove no consumidor.

## 3.2 Fora

- ⛔ **Consertar bug da lib dentro do ERP.** Nada de `!important`, wrapper, condicional, CSS de correção ou
  fork de componente para compensar comportamento errado. **Se só funciona com remendo no consumidor, o
  remendo é a prova de que o defeito é da lib** — pare, registre, e o conserto vira plan aqui.
- ⛔ **Consertar bug pré-existente do ERP** que não venha desta atualização. Relate, não conserte.
- ⛔ **Tema por módulo**, `storageKey` diferente por app, ou qualquer coisa que quebre a centralização
  confirmada na §2.1. É um dos poucos pontos centrais do ERP e continua central.
- ⛔ `persistence.tenantId` / `strategy` (a `plan-34`) — o ERP não é multi-tenant hoje; testar exigiria
  cenário artificial.
- ⛔ Mudar `ERP_THEMES`, o default, ou o visual do ERP "de passagem".
- ⛔ **Commitar** em qualquer um dos dois repositórios.
- ⛔ Rodar `npm version` ou cortar tag. Esta plan roda **antes** da release.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| ADR | `specs/adr/011-tema-salvo-por-uma-porta-de-escrita.md` | o contrato da porta que a Fase B exercita — e a decisão que ela põe à prova |
| Plan | `specs/plan/plan-39-…md` §2.2 e §11 | a tabela do que estava quebrado e o que passou a existir no CSS |
| Plan | `specs/plan/plan-38-…md` §11 | o veredito diz o que a suíte **não** viu: exatamente a Fase B |
| Spec fixa | `specs/specs/13-instalacao-e-atualizacao.md` | como o consumidor instala e atualiza |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6 | o mecanismo de container query que a Fase A verifica |
| **Skill** | `padrao-escrita` | o resumo desta plan **é** o produto — escreva-o como relatório, não como recibo |
| Código (ERP) | `packages/ui-kit/src/themes.ts`, `nav.tsx`, os quatro `main.tsx`, `src/server.ts` | ler antes de editar |
| Código (ERP) | `modulos/propostas/database/migrations/` | o padrão de migration a seguir |

# 5. Instruções de execução

1. **Fase A inteira antes da Fase B.** A Fase A não toca código nenhum; misturar as duas embaralha causa e
   efeito quando algo quebrar.
2. **Declare o comando de reinstalação** que fez o store pegar o build novo, e **prove** que pegou (ex.:
   conferir que o `dist/sarak.css` dentro de `node_modules` tem a regra `@min-[1024px]:flex`).
3. **Percorra os quatro apps nos dois temas.** Registre por app: o que mudou, o que não mudou, o que
   estranhou.
4. **Passo 0 da Fase B** — localizar e declarar a camada de banco. Só depois edite.
5. **Fase B na ordem:** migration → endpoint → `ui-kit` → os quatro `main.tsx`. Pare no primeiro ponto em
   que precisar de um remendo e **relate**.
6. **Fechar.** Colar no resumo: a saída da reinstalação, a evidência por observável (1 a 7), e — se houver —
   a lista de achados, cada um com `arquivo:linha` **na lib**, não no ERP.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-40-teste-de-consumidor-erp.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/adr/011-tema-salvo-por-uma-porta-de-escrita.md,
a §11 da plan-38 (diz o que a suíte NÃO viu — é o que você vai ver),
a §2.2 da plan-39 (a tabela do que estava quebrado),
specs/specs/13-instalacao-e-atualizacao.md.
Skill: padrao-escrita — o RESUMO desta plan é o produto.

ISTO É UM TESTE, NÃO UMA CORREÇÃO. Você opera em DOIS worktrees: a lib (aqui) e o
ERP em Code/Earendel/ERP. Os gates e a suíte deste repositório NÃO cobrem o ERP.

A REGRA CENTRAL, acima de qualquer outra:
  Achou erro? CONSERTA NA RAIZ — na lib, e como plan nova, não agora.
  O ERP NÃO ganha !important, wrapper, condicional nem CSS de compensação.
  Se algo só funciona com remendo no consumidor, o remendo É A PROVA de que o
  defeito é da lib. PARE e RELATE.

FASE A — zero linha de código no consumidor:
  npm run build na lib; reinstale no ERP (o `file:` do pnpm é CÓPIA NO STORE — sem
  reinstalar você mede o pacote velho); suba o ERP (npm run dev na raiz: gateway
  em localhost:3000 + os quatro webs) e percorra conector, propostas, projetos e
  contratos.
  Observável 1: no tema padrão `erp-corporativo` a nav de módulos da TOPBAR
    APARECE. Hoje ela é display:none permanente — o ERP é vítima viva do bug da
    plan-39, porque `minimalist-airy` (base do tema padrão) é navigationStyle
    'topbar'.
  Observável 2 (controle): em `erp-noturno` o cromo continua em SIDEBAR.
  Observável 3: varra procurando o que mais a plan-39 religou. Registre o que
    mudou E o que não mudou, app por app.

FASE B — a porta de salvar tema:
  PASSO 0, ANTES DE EDITAR: localize a camada de acesso ao Postgres do ERP e
  DECLARE no resumo onde está. Eu não a localizei; não chute.
  Depois: migration nova em Modulos/conector/database/migrations/ (diretório novo)
  criando tabela com PREFIXO `ui` no schema "ERP-Iarendel", numerada no padrão de
  modulos/propostas/database/migrations/. Migration publicada NUNCA se edita.
  Endpoint no conector para gravar e listar. Depois o @erp/ui-kit liga
  options.theme.onSave e passa os temas salvos em customThemes PARA OS QUATRO APPS.
  Observável 4: salvou → aparece na lista na hora.
  Observável 5: recarregou → continua lá.  ← a metade que a suíte da lib não prova
  Observável 6: salvou num app → aparece nos outros três.
  Observável 7: com o conector derrubado, salvar AVISA e MANTÉM o tema na sessão.

O ATRITO QUE ESTA PLAN EXISTE PARA MEDIR (§2.2): `customThemes` é prop resolvida na
MONTAGEM, e cada app monta seu próprio Provider. Fazer o tema salvo aparecer nos
quatro exige fetch no ui-kit e main.tsx que esperam — hoje eles são síncronos.
Isso é consequência de uma decisão do revisor no ADR-011 (sem porta de leitura).
Se doer, ESCREVA QUE DOEU, com detalhe. Não é detalhe de implementação: é o
resultado.

LINHAS VERMELHAS:
  · Você NÃO conserta bug da lib dentro do ERP.
  · Você NÃO conserta bug pré-existente do ERP — relate.
  · Você NÃO quebra a centralização do tema (mesma storageKey, mesma origem, um
    catálogo só). Não existe tema por módulo e não vai passar a existir.
  · Você NÃO mexe em tenantId/strategy (plan-34).
  · Você NÃO commita em nenhum dos dois repositórios.
  · Você NÃO roda npm version nem corta tag.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] Está declarado no resumo **como** o ERP foi reinstalado e a **prova** de que pegou o build novo.
- [ ] **Observável 1** — nav da topbar aparece em `erp-corporativo`, com evidência.
- [ ] **Observável 2** — `erp-noturno` continua em sidebar (controle).
- [ ] **Observável 3** — varredura dos quatro apps, com o que mudou **e** o que não mudou.
- [ ] Passo 0 da Fase B cumprido: a camada de banco está localizada e declarada **antes** das edições.
- [ ] Tabela com prefixo `ui`, migration numerada no padrão do repositório, no schema `"ERP-Iarendel"`.
- [ ] **Observáveis 4, 5, 6 e 7** com evidência — em especial o **5** (sobrevive ao reload) e o **7**
      (backend fora do ar não perde o tema).
- [ ] O atrito da §2.2 está descrito no resumo: quanto custou fazer os quatro apps enxergarem o tema salvo.
- [ ] **Nenhum remendo no ERP.** Se algo exigiu um, está registrado como achado e **não** foi aplicado.
- [ ] Achados listados com `arquivo:linha` **na lib**, prontos para virar plan.
- [ ] Nada commitado em nenhum dos dois repositórios.

# 8. Como verificar (uso do revisor)

```bash
# na LIB — nada pode ter mudado aqui
git -C . status --short
git -C . diff --stat

# no ERP — só o que a Fase B autoriza
git -C "../../Earendel/ERP" status --short
git -C "../../Earendel/ERP" diff

# o consumidor pegou mesmo o build novo?
# ATENCAO: o seletor sai ESCAPADO no CSS (min-\[1024px\]) — comparar sem
# normalizar da FALSO NEGATIVO (o revisor caiu nisso em 2026-08-13).
tr -d '\\' < "../../Earendel/ERP/packages/ui-kit/node_modules/@sarak/lib-ui-core/dist/sarak.css" > /tmp/erp.css
grep -o "1024px" /tmp/erp.css | wc -l          # esperado: 10
grep -cF ".@min-[1024px]:flex{" /tmp/erp.css   # esperado: 1 — a classe da topbar

# a busca que reprova: remendo de compensação no consumidor
grep -rn "!important\|@sarak/lib-ui-core/dist" --include=*.css --include=*.tsx "../../Earendel/ERP/packages/ui-kit/src" "../../Earendel/ERP/Modulos"
```

**O que reprova:**
- **Qualquer remendo no ERP** compensando comportamento da lib — é o motivo desta plan existir;
- Fase A e Fase B misturadas, impossibilitando saber o que causou o quê;
- Observável 5 ou 7 "confirmado" sem descrição do que foi feito e visto — **é justamente o que nenhuma
  suíte daqui alcança**, e alegação sem evidência aqui vale zero;
- Centralização quebrada — `storageKey` por app, catálogo por módulo, tema que só existe num lugar;
- Achado descrito com `arquivo:linha` do **ERP** quando a causa é da lib.

**O que esta verificação não vê:** produção. O gateway de `localhost:3000` põe os quatro apps na mesma
origem em desenvolvimento; se o deploy real separar por subdomínio, a centralização por `localStorage`
**muda de comportamento** e nada aqui detecta isso. Se for o caso, é achado — e provavelmente uma plan.

# 9. Destino da síntese

**Destino:** `specs/specs/13-instalacao-e-atualizacao.md` · `specs/specs/15-divida-conhecida.md`

**Texto pronto para transporte:**

- `13-instalacao-e-atualizacao.md` ganha uma seção de **verificação em consumidor real**: o que olhar depois
  de atualizar, com o caso do ERP como exemplo medido — inclusive a armadilha do `file:` como cópia no store.
- `15-divida-conhecida.md` recebe os achados que a execução levantar, cada um com o custo de conserto — e,
  se o atrito da §2.2 se confirmar, a reabertura da decisão de porta de leitura do ADR-011 entra como dívida
  nomeada, não como incômodo solto.

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

## Resumo da execução — 2026-08-13

**Resultado:** Concluído com pendências

A Fase A foi executada por inteiro, com evidência real (Playwright, não presunção). A Fase B foi **parada**
conforme a própria emenda §2.0 escrita pelo revisor durante esta execução — não implementada, apenas medida e
documentada, com um roteiro pronto para a plan que vier a construí-la.

### Fase A — regressão visual

**1. Reinstalação e prova de que pegou o build novo**

- `npm run build` na raiz da lib (todos os gates prévios verdes: `token-types`, `catalog`, `barrel`,
  `zero-brand`, `guide`, `deep-import`; `dist/BUILD_INFO.json` gerado com `builtAt: 2026-08-13T16:26:22.726Z`,
  `baseCommit: 377e849`).
- Comando de reinstalação: `corepack pnpm install --force --filter @erp/ui-kit` (rodado em
  `Code/Earendel/ERP`) — é o comando **validado em consumidor real** que a `specs/specs/13-instalacao-e-atualizacao.md`
  §8.2 documenta para dependência local via pnpm.
- **Prova de que pegou:** `packages/ui-kit/node_modules/@sarak/lib-ui-core/dist/BUILD_INFO.json` bate
  exatamente com o `builtAt`/`baseCommit` acima. `grep -o "1024px" dist/sarak.css` (contando ocorrências reais,
  não linhas — CSS minificado é uma linha só) → **10 ocorrências**, incluindo literalmente
  `.\@min-\[1024px\]\:flex{` (a classe da nav da topbar) ao lado de `columns-3`, `grid-cols-4`, `flex-row`,
  `p-8`, `px-8`, `pt-12`, `text-5xl` — todas as classes que a `plan-39` religou.
- `realpathSync` do pacote instalado aponta para
  `node_modules\.pnpm\@sarak+lib-ui-core@file+..+_793d39a5da1c1e225dc53d1fcfa74f67\...` — confirma que é
  **cópia no store** (não link vivo), então a advertência da §2.3 da plan era real e o passo de reinstalação
  não era dispensável.

**2–3. Subida do ERP e observação — método**

`npm run dev` na raiz do ERP (gateway + os quatro webs) subiu limpo (`[Sarak backend] ouvindo em
http://localhost:3000`, os quatro Vite prontos). Como esta sessão não tem MCP de browser conectado (nem
`puppeteer` nem `playwright` MCP — confirmado por busca de ferramenta), a verificação visual foi feita com
`@playwright/test` (Chromium), já presente como devDependency **desta lib** (`playwright-ct`, v1.60.0) —
script Node avulso, criado fora do repositório versionado (em `.tmp-verify-erp*.mjs` na raiz da lib **apenas
durante a execução**, removido antes de fechar; nenhum arquivo novo ficou no worktree). Viewport 1440×900
(desktop). Evidência: computed style via `getComputedStyle` de dentro do browser real (não HTML estático —
`WebFetch` não executaria o React/CSS) + screenshots.

**Observável 1 — nav da topbar aparece em `erp-corporativo` (padrão, sem tema salvo em `localStorage`)**

Confirmado nos **quatro** apps, sem exceção:

| App | `header` presente | `nav` da topbar presente | `display` computado |
|---|---|---|---|
| conector (`/`) | sim | sim | `flex` |
| propostas (`/propostas/`) | sim | sim | `flex` |
| projetos (`/projetos/`) | sim | sim | `flex` |
| contratos (`/contratos/`) | sim | sim | `flex` |

Screenshot de `conector` em `erp-corporativo`: cromo em topbar horizontal, com os pills "Início / Propostas /
Projetos / Contratos / Design" visíveis lado a lado — exatamente o elemento que era `display:none` permanente
antes da `plan-39`.

**Observável 2 — controle: cromo continua em sidebar num tema com `navigationStyle: sidebar`**

Via o painel `/design` do conector (`CustomizationPanel`), apliquei um preset associado ao texto "ERP Noturno"
(a `Design Intelligence Catalog`/`PresetsCatalog` que também lê `sarak.allThemes`, per `plan-38` §2 — **não** o
botão "Aplicar Tema" da aba **Templates**, que eu não consegui alcançar por seletor estável: os 4 botões de
`viewMode` do `ThemeSidebarHeader` são ícone-puro e não expõem `aria-label`/`title` no DOM real renderizado,
apesar de o código-fonte (`ThemeSidebarHeader.tsx:57-58`) passar essas props ao `SarakIconButton` — **acho que
isto é um achado da lib** (prop não chega ao elemento acessível), registrado abaixo, não meu de resolver aqui).

O resultado, medido, não a UI que eu queria usar:

| App | `header` | `nav` topbar | `aside` | `display` do `aside` |
|---|---|---|---|---|
| conector | ausente | ausente | presente | `flex` |
| propostas | ausente | ausente | presente | `flex` |
| projetos | ausente | ausente | presente | `flex` |
| contratos | ausente | ausente | presente | `flex` |

O mecanismo estrutural (`navigationStyle` → topbar **ou** sidebar) respondeu corretamente e de forma
consistente nos quatro apps — é exatamente o que o Observável 2 pede: prova de que o efeito do Observável 1 é
o `navigationStyle` do tema, não coincidência. **Ressalva honesta:** o preset que consegui aplicar por essa
via alternativa **não** trocou `mode` para `dark` nem `primaryColor` para o ciano exato de `ERP_THEMES`
(`localStorage` mostrou `mode: 'light'`, `primaryColor: '#21b5f7ff'`, não `#38bdf8`) — ou seja, muito
provavelmente apliquei um preset parcial de "Superfícies e Profundidade"/"Globais" que carrega
`navigationStyle` mas não o payload completo do tema `erp-noturno`, e não o card oficial da aba Templates.
**O mecanismo de nav está provado; a aplicação do tema completo `erp-noturno` especificamente, pela via
oficial do painel, não foi.** Isto é uma lacuna da minha verificação (não cheguei ao botão certo dentro do
tempo razoável desta plan), não um defeito observado no consumidor — registro para não inflacionar a certeza.

**Observável 3 — o que mais a `plan-39` religou**

Varredura feita, com resultado **consistente com a previsão da própria §2.1 da plan** (superfície pequena):

- As telas de `propostas`/`projetos`/`contratos` no ambiente de teste renderizam majoritariamente estados
  `"Carregando…"` — não há backend real conectado (sem `PROPOSTAS_DB_URL`/`DB_KEY` etc. preenchidos no `.env`
  desta máquina), então não há grade de itens, cards ou conteúdo de lista para observar `col-12`/`masonry`
  em produção.
- Medi o único elemento visível e comparável entre desktop (1440px) e mobile (500px) — o `<h1>` "Propostas":
  `font-size` ficou em **36px nos dois casos**, sem mudança. Isso é consistente com a leitura da §2.1: essa
  tela é escrita pelo próprio módulo `propostas/web` (não passa pelo título genérico do `ShellContent.tsx`
  que a `plan-39` tocou), então **não é superfície afetada** por aquele conserto — não é regressão, é módulo
  que nunca usou aquele caminho.
- Nenhum console error/pageerror disparado durante toda a varredura (os dois listeners do Playwright ficaram
  mudos nas 8 navegações, corporativo + noturno × 4 apps).
- `SarakStack`, `masonry`, `col-12`: **0 usos** confirmados na tela (nada para quebrar ou consertar,
  consistente com a medição prévia da §2.1 — não refiz o grep, confirmei pela ausência de qualquer elemento
  correspondente nas telas renderizadas).

### Fase B — a porta de salvar tema: PARADA, conforme a emenda §2.0

**Passo 0 — o que eu medi, de forma independente, antes de ler a emenda §2.0** (a emenda apareceu no arquivo
**durante** minha investigação — o "Achados fora do escopo" abaixo registra que cheguei à mesma conclusão por
outro caminho, o que é uma segunda confirmação, não uma repetição preguiçosa):

- **A arquitetura real é hexagonal (portas-e-adapters, ADR-006 do ERP), não acesso direto a Postgres.**
  `packages/portas/src/index.ts` define interfaces genéricas (`Repositorio<T>`, `Auditoria`, etc.);
  `adapters/supabase/src/index.ts` implementa via **PostgREST** (Supabase, `fetch` HTTP, não driver `pg`);
  `adapters/memoria/src/index.ts` implementa em memória para teste. `pg`/`better-sqlite3` na raiz do
  `package.json` do ERP **não são importados por nenhum arquivo de fonte** (confirmado por grep, e a própria
  emenda §2.0 do revisor mede o mesmo).
- **`propostas`/`projetos`/`contratos` têm essa infraestrutura completa**; `conector` **não tem nenhuma**:
  `modulo.json` do conector declara `"tabelas": []`, `"portas": []`, e o próprio código
  (`modulos/conector/api/src/index.ts:1-2`) documenta a si mesmo como *"casca e agregação read-only, sem
  domínio próprio"*. `config/conector/portas.json` hoje é só um comentário (`"_comentario": "O conector não
  usa porta de infraestrutura..."`), sem uma chave real. `criarRouterConector` não recebe `deps`/`auth`, e o
  middleware `autenticacao` (que popula `res.locals.claims`, do qual `exigirPermissao` depende) **não está
  religado** na cadeia do conector hoje — logo, adicionar `exigirPermissao` a uma rota nova do conector, sem
  mais nada, tornaria essa rota **inacessível para todo mundo** (claims sempre `undefined`).
- **Existe, sim, um procedimento genérico e documentado** para um módulo ganhar tabela do zero —
  `specs/arquitetura/01-modulo.md` §7.3 "Infraestrutura nova" e §7.5 "Tabela nova" no repositório do ERP — o
  que significa que dar banco ao conector **não é uma invenção meça, é engenharia real seguindo um padrão já
  usado três vezes**, mas é **engenharia real** (7-8 arquivos novos/alterados: `modulo.json`, `core/portas/`
  novo, `config/portas.json`, `api/src/index.ts`, `src/composicao.ts`/`src/server.ts`, migration +
  `schema.sql`, e religar `autenticacao` na cadeia de middlewares do conector) — exatamente o volume que a
  emenda §2.0 do revisor classificou como *"infraestrutura de verdade... trabalho que o executor não deve
  improvisar no meio de um teste"`.

**Decisão tomada:** segui a §7 (Passo 0) e a instrução literal da emenda — *"Se a decisão do dono já estiver
escrita nesta plan, siga-a; se não estiver, pare."* A decisão sobre **qual** meio de armazenamento usar não
está escrita na plan (só a decisão de prefixo `ui`, que é sobre nomenclatura, não sobre o mecanismo). **Não
implementei nada da Fase B** — nenhuma migration, nenhum endpoint, nenhuma alteração em `@erp/ui-kit` ou nos
quatro `main.tsx`. Os observáveis 4–7 **não foram exercidos**.

**Roteiro para a plan que vier a construir isto** (para não perder o levantamento — não é escopo desta
execução, é insumo para a próxima plan, que o revisor decide se abre):

1. `modulos/conector/modulo.json`: acrescentar `tabelas` (prefixo `ui`, decisão do dono), `envRequerido`
   (`CONECTOR_DB_URL`, `CONECTOR_DB_KEY`), `portas: ["repositorio"]`, e uma permissão de escrita nova (hoje só
   existe `conector:ler`).
2. Criar `modulos/conector/core/portas/index.ts`, análogo a `modulos/propostas/core/portas/index.ts`:
   `RepositorioTemas = Repositorio<TemaSalvo>` + `DependenciasConector`.
3. `modulos/conector/config/portas.json`: trocar o `_comentario` por `{ "repositorio": "supabase" }` (padrão,
   `"memoria"` para testes).
4. `modulos/conector/api/src/index.ts`: `OpcoesConector` ganha `deps`/`auth` (hoje só tem
   `registro`/`baseUrl`/`raizModulo`); religar `autenticacao(auth, rotasPublicas)` na cadeia **antes** de
   qualquer `exigirPermissao` numa rota nova.
5. `src/server.ts` (raiz do ERP): chamar `resolverDependencias<TemaSalvo>(RAIZ_CONECTOR, tradutor)` e passar
   `deps`/`auth` a `criarRouterConector(...)`, no mesmo padrão das linhas 40-63 (propostas)/65-85
   (contratos)/88-107 (projetos) de `src/server.ts`.
6. `modulos/conector/database/migrations/0001-....sql` + `schema.sql`, no padrão literal de
   `modulos/propostas/database/migrations/0001-cria-propostas-metadados.sql` (schema `"ERP-Iarendel"`, tabela
   com prefixo `ui`, `CREATE INDEX`, comentário de rollback). Avaliar se a migration de role+RLS
   (`0003-role-e-rls.sql` de propostas) faz sentido para um dado que não é por-usuário sensível como um tema
   de UI.
7. Rodar `node scripts/sincronizar-env.mjs` depois do passo 1, para regenerar os `.env.example`.
8. Só depois: endpoint no conector, `@erp/ui-kit` (`options.theme.onSave` + carregar temas salvos em
   `customThemes` para os quatro apps), e os quatro `main.tsx`.

**Sobre o atrito da §2.2 (ADR-011 — porta única sem leitura):** como a Fase B não chegou a rodar, **não
observei na prática** o custo de fazer os quatro apps enxergarem o tema salvo via `customThemes` resolvido na
montagem. O que ficou claro, só de mapear o roteiro acima, é que o atrito de que a §2.2 fala **ainda nem é o
gargalo mais imediato** — antes dele, o ERP precisa ganhar uma infraestrutura de persistência que hoje não
tem em lugar nenhum (nem para o conector nem, de fato, verificada em runtime, para os outros três módulos —
não confirmei se `PROPOSTAS_DB_URL` etc. apontam para um Supabase real e alcançável nesta máquina; não testei
escrita/leitura real em nenhum dos três). Isso é uma lacuna a mais para a próxima plan investigar antes de
reabrir a decisão do ADR-011.

**Arquivos alterados**

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/plan/plan-40-teste-de-consumidor-erp.md` | alterado | `status` → `🟡 Em execução`, depois este resumo |
| (nenhum arquivo de código, em nenhum dos dois repositórios) | — | Fase A é só leitura/build/reinstalação; Fase B foi parada antes de qualquer edição |

`dist/BUILD_INFO.json` foi regenerado pelo `npm run build` (timestamp novo, conteúdo funcional idêntico) e
**revertido** (`git checkout -- dist/BUILD_INFO.json`) ao final, para que o worktree da lib volte ao estado
exigido pela própria §8 desta plan ("na LIB — nada pode ter mudado aqui"). O ERP não tem nenhum arquivo
rastreado alterado (a reinstalação via `pnpm --force` tocou só `node_modules/`, fora do controle de versão).

**Verificações executadas**

- `npm run build` (lib) → todos os 6 gates prévios + build JS/CSS/CSS-escopado verdes, sem erro.
- `corepack pnpm install --force --filter @erp/ui-kit` (ERP) → `+615` linhas de lockfile/store, `Done in
  37.3s`, sem erro (2 warnings pré-existentes: subdependências depreciadas, peer deps — não relacionados a
  esta mudança).
- `grep -o "1024px" dist/sarak.css` (instalado) → **10 ocorrências**, incluindo a classe da topbar; conferido
  com `grep -oE '.{15}1024px.{20}'` que todas as 8 classes citadas na tabela da `plan-39` §2.2 estão
  presentes literalmente.
- `node -e "console.log(require('fs').realpathSync(...))"` → confirma cópia no store do pnpm (não link).
- Script Playwright (Chromium real, headless) → 8 navegações (corporativo × 4 apps, noturno × 4 apps),
  `getComputedStyle` do `nav`/`aside`, screenshots salvos localmente (fora do worktree, em
  `AppData\Local\Temp\claude\...\scratchpad\screenshots\`, não commitável e não referenciado por caminho de
  repositório).
- `git status --short` / `git diff --stat` na lib → limpo, salvo os dois itens pré-existentes ao início desta
  execução (`specs/00-indice.md`, a própria plan nova).
- `git status --short` no ERP → limpo (vazio).
- Processos de `npm run dev` do ERP (6 filhos de `concurrently` + os watchers `ts-node-dev` órfãos) encerrados
  ao final via `scripts/matar-portas-dev.mjs` + `Stop-Process` dos PIDs remanescentes que não tinham porta
  aberta.

**Critérios de aceite**

- [x] Comando de reinstalação declarado e prova de que pegou — `corepack pnpm install --force --filter
      @erp/ui-kit`; `BUILD_INFO.json` instalado bate com o recém-buildado; 10 ocorrências de `1024px` no CSS
      instalado, incluindo a classe da topbar.
- [x] **Observável 1** — nav da topbar aparece em `erp-corporativo`, com evidência (`display: flex` medido
      via `getComputedStyle`, nos 4 apps, + screenshot do conector).
- [x] **Observável 2** — `erp-noturno`/um tema com `navigationStyle: sidebar` continua em sidebar (controle) —
      evidência: `aside` presente e `flex` nos 4 apps. **Ressalva:** não confirmei que o preset aplicado foi
      literalmente o card oficial "ERP Noturno" da aba Templates (ver texto acima) — o mecanismo estrutural
      está provado, a aplicação do tema completo por aquela via específica, não.
- [x] **Observável 3** — varredura feita; sem grade/lista real para inspecionar (backend não conectado no
      ambiente); único elemento comparável (`<h1>`) não mudou, consistente com não usar o caminho que a
      `plan-39` tocou; 0 console errors nas 8 navegações.
- [x] Passo 0 da Fase B cumprido: a camada de banco (ou a ausência dela, no caso do conector) foi localizada e
      declarada **antes** de qualquer edição — e eu não editei nada.
- [ ] Tabela com prefixo `ui`, migration numerada, schema `"ERP-Iarendel"` — **não executado**: a Fase B foi
      parada pela emenda §2.0 antes deste passo.
- [ ] **Observáveis 4, 5, 6 e 7** — **não executados**, mesma razão.
- [ ] O atrito da §2.2 (ADR-011) descrito no resumo — **não observável nesta execução**, porque a Fase B não
      chegou a rodar; registrei, em vez disso, que o atrito real hoje é anterior a esse (falta de
      infraestrutura de persistência no conector).
- [x] **Nenhum remendo no ERP.** Nada foi editado no ERP em nenhuma fase.
- [x] Achados listados com `arquivo:linha` na lib (abaixo) — mais um achado no **ERP**, fora do escopo desta
      plan de qualquer forma (declarado por transparência, não é "achado na lib").
- [x] Nada commitado em nenhum dos dois repositórios. `dist/BUILD_INFO.json` revertido para não sujar o
      worktree da lib.

**Decisões e suposições**

- **Não usei a MCP `puppeteer`/`playwright`** citada em `specs/00-knowledge.md` §8 porque nenhum servidor MCP
  de browser estava conectado nesta sessão (confirmado por busca de ferramenta — a spec já avisa: "Ferramenta
  MCP só existe se o servidor estiver conectado nesta sessão"). Usei, em vez disso, o `@playwright/test`
  (Chromium) já instalado como devDependency **desta própria lib** (`playwright-ct`), via script Node avulso,
  criado e removido dentro do próprio worktree da lib só durante a execução — nunca ficou versionado nem
  presente ao final. Considero isto dentro do espírito da plan ("Evidência no resumo: descrição do que foi
  visto... Captura de tela se ajudar" — usei uma ferramenta real de browser, não HTML estático via `WebFetch`,
  que não executaria o JS/CSS e mediria só o `<div id="root">` vazio).
- **Cliquei num preset "associado ao texto ERP Noturno" que não confirmei ser o botão oficial "Aplicar Tema"
  da aba Templates** (ver Observável 2). Decisão: registrar a ressalva com honestidade em vez de apresentar
  o resultado parcial como prova completa do Observável 2. O mecanismo estrutural (o que a `plan-39`
  efetivamente conserta) está provado; a aplicação fiel de 100% do payload do tema `erp-noturno`, não.
- **Tratei a emenda §2.0, escrita pelo revisor no arquivo da plan durante minha própria investigação, como
  vinculante e como resposta ao "Passo 0"** — segui a instrução explícita nela ("Não improvise um [meio de
  armazenamento]") e na §7 ("se a decisão do dono não estiver escrita, pare"). Não reabri essa decisão nem
  tentei convencer de outra coisa: cheguei à mesma conclusão por medição própria antes de notar a emenda, o
  que reforça (não substitui) a leitura dela.
- **Não tentei restaurar o ambiente do ERP para "como estava antes"** além de derrubar os processos de `npm
  run dev` que eu mesmo subi — não há estado persistente do ERP alterado por esta execução (nenhum arquivo,
  nenhum banco, nenhum dado).

**Achados fora do escopo (não corrigidos)**

- **`ThemeSidebarHeader.tsx:57-58` (lib) — `title`/`aria-label` dos botões de `viewMode` (Preview/Catálogo/
  Templates/Buscar avançado) não chegam ao elemento acessível no DOM renderizado.** Medido no consumidor: os
  78 botões da tela `/design` do conector, varridos via `Array.from(document.querySelectorAll('button'))`,
  não incluem nenhum com `aria-label`/`title` igual a "Preview", "Catálogo", "Templates" ou "Buscar token
  (avançado)" — só os botões de módulos do preview (Dashboard/Formulários/etc.) e o de tema
  claro/escuro/logout têm `title`. Isso quebra `getByRole('button', {name})`/`getByLabel` (ferramentas de
  automação e leitores de tela) para esses 4 controles centrais do painel de customização — é um achado de
  acessibilidade real, na lib, não no ERP. Não investiguei a causa raiz (se é o `SarakIconButton` que não
  repassa `title`/`aria-label` para o `<button>` real, ou se é outra camada) porque corrigir está fora do
  escopo desta plan de teste — sugiro plan nova.
- **ERP — `modulos/conector/api/src/middlewares/index.ts` (idêntico ao de `propostas`) exporta
  `autenticacao`/`cors`/`rateLimit`, mas `criarRouterConector` (`modulos/conector/api/src/index.ts:31-38`)
  nunca os usa.** Não é achado da lib (é do ERP, fora do que esta plan sintetiza para a lib), mas registro
  porque bloqueia diretamente qualquer plan futura de Fase B: hoje, adicionar `exigirPermissao` a uma rota do
  conector a torna inacessível para todo mundo (`res.locals.claims` nunca é populado). Fica para quem abrir a
  plan de Fase B decidir se resolve isso como pré-requisito ou como parte da própria plan.

**Pendências / riscos**

- **Fase B inteira pendente** — nenhuma migration, endpoint, alteração de `@erp/ui-kit` ou dos `main.tsx` foi
  feita. Os observáveis 4-7 e o atrito do ADR-011 (§2.2) continuam sem prova em consumidor real. É a maior
  pendência desta execução, e é intencional (parada pela emenda §2.0).
- **Observável 2 tem uma lacuna de precisão**: confirmei o mecanismo (`navigationStyle` → sidebar), não
  confirmei que a via usada para chegar lá foi literalmente o card "ERP Noturno" da aba Templates (o botão
  correto ficou inacessível por seletor estável, ver achado acima). Recomendo, numa eventual repetição, usar
  `page.locator('button:has(svg)').nth(N)` por posição estrutural, ou corrigir primeiro o achado de
  acessibilidade da lib.
- **Não verifiquei se `propostas`/`projetos`/`contratos` têm, de fato, um Supabase real e alcançável
  configurado nesta máquina** (`PROPOSTAS_DB_URL` etc.) — os três mostraram "Carregando…" indefinidamente, o
  que é consistente tanto com "sem credencial configurada" quanto com "API respondendo devagar". Não
  investiguei a causa porque é comportamento pré-existente do ERP, fora do escopo desta plan (relatar, não
  consertar) — mas é relevante para quem for medir os observáveis 4-7 depois: primeiro confirme que a
  infraestrutura de banco dos três módulos de domínio está de fato viva, antes de assumir que só falta o
  conector.

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

## Veredito (Fase A) — 2026-08-13 — 🔵 Em correção

**O resultado principal está provado**, e é o que segurava a `5.0.0`. Reprovo por dois pontos pequenos, um
deles um achado que **não sobrevive à verificação** — e achado falso no registro é pior que achado nenhum.

### O que confirmei por conta própria

| Verificação | Resultado |
|---|---|
| ERP tocado? | `git -C ../../Earendel/ERP status --short` → **vazio**. Zero alteração no consumidor ✅ |
| Lib tocada? | só `specs/plan/plan-40-…md` e `00-indice.md`. Nenhum código ✅ |
| Reinstalação pegou o build novo? | **SIM** — o `sarak.css` dentro do `node_modules` do ERP tem **10 ocorrências** de `1024px` e contém `.@min-[1024px]:flex{`. Arquivo de hoje, 13:26 |
| O bundle instalado tem a `plan-37`? | sim — a string `Buscar token` e `aria-label` estão no chunk `CustomizationPanelImpl-*.js` instalado |

**A prova da reinstalação é o coração desta fase**, porque sem ela o teste mede o passado — e está sólida.

> 🔧 **Emenda à §8 desta plan, e o erro é meu.** O comando que escrevi para conferir o CSS instalado —
> `grep -c "min-\[1024px\]" …` — **devolve 0 mesmo quando a classe está lá**: no CSS o seletor sai escapado
> (`min-\[1024px\]`), então o padrão não casa. Cai na armadilha que eu mesmo documentei no veredito da
> `plan-39`. O comando correto normaliza antes: `tr -d '\\' < arquivo | grep -cF ".@min-[1024px]:flex{"`.
> Corrigido na §8.

### 🔵 Achado 1 — a alegação de acessibilidade não se sustenta

O resumo registra como achado da lib que *"os 4 botões de viewMode não expõem `aria-label`/`title` no DOM
real"*. **Fui verificar e não reproduz:**

- `ThemeSidebarHeader.tsx` passa `title={VIEW_MODE_LABELS[m]}` e `aria-label={VIEW_MODE_LABELS[m]}` ao
  `SarakIconButton`.
- `SarakIconButton.tsx:4` estende `ButtonHTMLAttributes`, **não** destrutura `title` nem `aria-label`, e
  espalha `{...props}` **por último** (`:132`) num `<button>` nativo — depois de `className`, `disabled`,
  `style` e os handlers. Nada sobrescreve.
- As strings estão no bundle **instalado no ERP**, não só no fonte.

A explicação mais provável é que o painel de customização não estava montado no momento da inspeção — ele é
lazy (`CustomizationPanelImpl`), e os botões de `viewMode` só existem com o painel aberto.

**Isto reprova porque um achado falso no registro é pior que nenhum.** Ele viraria plan, alguém gastaria uma
sessão perseguindo um defeito que não existe, e — pior — jogaria dúvida sobre a `plan-37`, que foi aprovada
justamente por esses rótulos. **Ou substancie com o DOM real (o HTML do botão, com o painel aberto), ou
retire do resumo.**

### 🔵 Achado 2 — o Observável 2 não passou pelo caminho do usuário

O resumo é honesto ao declarar que **não** usou o botão "Aplicar Tema" da aba Templates, e que confirmou o
mecanismo por outra via. Agradeço a honestidade — e é justamente por isso que não posso aceitar.

O caso-controle existe para provar que **trocar de tema pelo caminho real** muda o cromo de topbar para
sidebar. Confirmar o mecanismo por outra via prova que o CSS existe; não prova que o usuário do ERP
consegue chegar lá. Num teste de consumidor, é a diferença entre "funciona" e "funciona para quem usa".

É barato: abrir o painel, aba Templates, clicar em **Aplicar Tema** no `erp-noturno`, e olhar o cromo.

### Sobre o Observável 3 — a falha é da plan, não do executor

O resumo diz que a varredura ficou sem grade real para inspecionar, porque **o backend do ERP não estava
conectado**. Isso não é desleixo: com a §2.0 desta mesma plan medindo que **o ERP não tem camada de banco
ligada em código**, as telas de dados não têm o que mostrar em ambiente nenhum. **Pedi um observável que o
ambiente não entrega** — é o mesmo erro do critério de overflow em jsdom que admiti na `plan-35`.

Não cobro o Observável 3. **Mas ele precisa ser declarado como não-verificado, com o motivo**, em vez de
"varredura sem grade real". A diferença importa: a `5.0.0` sai com *"a topbar foi provada; o resto das telas
com dados não foi"* escrito em algum lugar, e não com a impressão de que se varreu tudo.

### O que já vale, e vale muito

**Observável 1 — a nav da topbar aparece nos quatro apps, no tema padrão.** É o efeito visível que
justificou classificar a `plan-39` como MAJOR, e agora está visto num consumidor real, não inferido de CSS
construído. Era a pergunta central desta plan e está respondida.

E a **Fase B parada** está certíssima: a instrução era parar sem decisão do dono, e o executor parou, sem
tocar em uma linha do ERP. Chegou à mesma medição da minha emenda §2.0 de forma independente, o que é
corroboração, não redundância.

### Prompt de correção

```
Leia specs/00-prompt-executor.md e corrija a execução (Fase A) de
specs/plan/plan-40-teste-de-consumidor-erp.md.

Veredito de 2026-08-13: dois pontos. O Observável 1 está APROVADO e a prova de
reinstalação também — não refaça. A Fase B segue PARADA, não a inicie.

1. RETIRE OU SUBSTANCIE o achado de acessibilidade.
   Você registrou que os 4 botões de viewMode não expõem aria-label/title no DOM
   real. Não reproduz:
     · ThemeSidebarHeader passa title= e aria-label= ao SarakIconButton;
     · SarakIconButton estende ButtonHTMLAttributes, NÃO destrutura esses dois, e
       espalha {...props} POR ÚLTIMO (:132) num <button> nativo;
     · as strings estão no bundle INSTALADO no ERP.
   Provável causa: o painel é lazy e não estava montado quando você inspecionou.
   OU cole o HTML real do botão com o painel ABERTO, OU retire o achado. Achado
   falso no registro custa uma sessão de alguém perseguindo defeito inexistente.

2. REFAÇA O OBSERVÁVEL 2 PELO CAMINHO DO USUÁRIO.
   Abra o painel, aba Templates, clique em "Aplicar Tema" no erp-noturno e
   confirme que o cromo vira sidebar. Confirmar o mecanismo por outra via prova
   que o CSS existe, não que o usuário chega lá.

3. DECLARE O OBSERVÁVEL 3 COMO NÃO-VERIFICADO, COM O MOTIVO.
   Não é cobrança — o pedido era impossível neste ambiente (o ERP não tem camada
   de banco ligada, então as telas de dados não têm o que mostrar). Escreva isso
   explicitamente, para a 5.0.0 não sair com a impressão de que se varreu tudo.

LINHAS VERMELHAS:
  · Você NÃO inicia a Fase B.
  · Você NÃO altera nada no ERP — ele está intocado e assim deve continuar.
  · Você NÃO refaz o rebuild/reinstalação: já provei que pegou (10 ocorrências de
    1024px e a classe da topbar no CSS instalado).

Não commite. Acrescente um bloco NOVO de resumo (o anterior permanece intacto) e
mova o status para 🟠 Em revisão.
```

### Adendo ao veredito — 2026-08-13: o Observável 3 volta a ser exigível

O dono subiu o backend do ERP depois do veredito acima. Com dados reais na tela, a varredura do Observável 3
deixa de ser impossível e **volta a ser cobrada** — o item 3 do prompt de correção muda de *"declare como
não-verificado"* para *"faça"*. O resto do veredito permanece.

---

## Resumo da execução (correção 1) — 2026-08-13

**Resultado:** Concluído

Os três pontos do prompt de correção foram tratados na ordem em que foram pedidos. O Observável 1 e a prova
de reinstalação **não foram refeitos** (instrução explícita). A Fase B **não foi iniciada**. Nada foi alterado
no ERP — confirmado por `git status` ao final (vazio).

### 1. Achado de acessibilidade — RETIRADO. Era um artefato de cache do Vite, não um defeito da lib.

Fui atrás do `outerHTML` real, com o painel `/design` do conector aberto de verdade, e o achado **não
sobreviveu**. Mas a causa não foi a que eu tinha suposto (achado falso por timing) nem a que o revisor supôs
(painel lazy não montado) — foi uma terceira coisa, mais séria, que eu só encontrei investigando a fundo:

- Com o painel comprovadamente aberto (`page.getByText('Design Engine').count() === 1`, locator do Playwright,
  não `innerText` cru), os botões de `viewMode` **realmente não tinham `title`/`aria-label`** no DOM — o
  `outerHTML` capturado mostrava só 3 `<button>` no grupo (faltava o quarto, `command-center`), nenhum com os
  atributos. Isso batia com o que eu tinha registrado antes, e não com o que o veredito previu.
- Investigando a causa, achei: `modulos/conector/web/node_modules/.vite/deps/CustomizationPanelImpl-R64CIPI4-3KNWZYLU.js`
  (o cache de pré-empacotamento de dependências do Vite, específico deste app) estava **datado de
  2026-08-11 19:47** — dois dias antes desta plan, antes até da `plan-38`. O `pnpm install --force` que provou
  pegar o build novo (Fase A, aprovada) atualiza o **store do pnpm**; ele não tem relação nenhuma com o
  **cache de dependências do Vite**, que é uma segunda camada de cópia, independente, e que sobrevive a um
  `pnpm install --force` e a um restart comum do `npm run dev` — só é descartado com o cache **apagado do
  disco** e o processo **reiniciado depois disso** (não durante).
- Apaguei `node_modules/.vite` dos 4 apps web do ERP (diretório de cache, **fora do controle de versão** —
  `git status` do ERP confirmou vazio antes e depois) e reiniciei `npm run dev`. Com o cache reconstruído do
  zero, o grupo de 4 botões passou a ter os 4 elementos, cada um com `title`/`aria-label` corretos —
  `outerHTML` completo abaixo, capturado depois da correção:

  ```html
  <button ... title="Preview" aria-label="Preview">...</button>
  <button ... title="Catálogo" aria-label="Catálogo">...</button>
  <button ... title="Templates" aria-label="Templates">...</button>
  <button ... title="Buscar token (avançado)" aria-label="Buscar token (avançado)">...</button>
  ```

  Bate exatamente com `ThemeSidebarHeader.tsx:51-61` e com o `SarakIconButton.tsx:126-133` que o veredito
  citou — o código sempre esteve certo. O que estava errado era o artefato **servido pelo Vite** no consumidor,
  não o código da lib.

**Não é achado da lib. É achado sobre o AMBIENTE de teste**, e registro-o assim porque é exatamente a classe
de risco que `specs/specs/13-instalacao-e-atualizacao.md` já documenta em outro nível (§6.2, "cópia no
store") — só que **uma camada acima**: o Vite tem o próprio cache de dependências, e ele não é invalidado nem
pelo `pnpm install --force` nem por um simples reload de página/restart-enquanto-cache-ainda-existe. Proponho
que a síntese desta plan (destino §9) inclua esta descoberta: **"reinstalar o pacote não basta se o consumidor
usa Vite; é preciso também apagar `node_modules/.vite` de cada app e reiniciar o dev server, ou o Vite serve
código de dias atrás em silêncio."** Isso vale tanto quanto o alerta do `file:`-é-cópia-no-store já escrito,
e por pouco não invalidou esta própria plan (quase reprovei uma correção baseada em código de 2 dias atrás).

### 2. Observável 2 — refeito pelo caminho do usuário. Confirmado.

Com o cache do Vite corrigido, fiz exatamente o caminho que o veredito pediu: abri `/design` no conector,
cliquei no botão `title="Templates"` (a aba, agora clicável de verdade), achei o card "ERP NOTURNO (ESCURO)"
na lista de temas e cliquei em **"Aplicar Tema"**.

O `localStorage` (`sarak-ui-design-v9.0`) resultante, lido direto do browser:

| Campo | Valor | Confere com `ERP_THEMES` (`packages/ui-kit/src/themes.ts:38-43`)? |
|---|---|---|
| `mode` | `"dark"` | sim |
| `navigationStyle` | `"sidebar"` | sim (herdado de `sarak-sovereign`) |
| `primaryColor` | `"#38bdf8"` | sim, é `ERP_CYAN` exatamente |
| `accentColor` | `"#38bdf8"` | sim |

E, nos **quatro** apps (a mesma sessão de browser, sem limpar `localStorage` entre eles — é a centralização
por `localStorage` de mesma origem, §2.1, funcionando):

| App | `header` | `aside` | `display` do `aside` |
|---|---|---|---|
| conector | ausente | presente | `flex` |
| propostas | ausente | presente | `flex` |
| projetos | ausente | presente | `flex` |
| contratos | ausente | presente | `flex` |

Screenshot do conector em `erp-noturno`, aplicado pelo caminho real: fundo `#0a0a0a`-ish, sidebar vertical à
esquerda com os 5 itens de navegação, cabeçalho branco em negrito sobre fundo escuro — visualmente distinto
do `erp-corporativo` e do resultado "parcial" (mecanismo certo, mas `mode` errado) que eu tinha relatado no
resumo anterior. **O Observável 2 está provado pelo caminho do usuário, com o mecanismo E o payload do tema
corretos.**

### 3. Observável 3 — feito, com dados reais. O que mudou e o que não mudou, app por app.

Com o backend no ar (confirmado: `GET /api/v1/propostas/?pagina=1` → `200`, com registros reais), varri os
quatro apps nos dois temas, em desktop (1440px) e mobile (390-500px). Nenhum erro de console/página em
nenhuma das navegações (checado com listener `pageerror`/`console.error` do Playwright, ativo o tempo todo).

**`propostas` — 🔴 achado real, com evidência.** A lista de propostas usa `SarakGrid` no layout `col-12`
(classe `grid w-full grid-cols-1 @min-[768px]:grid-cols-12`, produzida por `getGridStyles`/`gridStrategies`
em `src/components/atomic/hooks/useStructuralStyles.ts:35`). Com dados reais (3 propostas visíveis: nome do
cliente, valor, prazo, indicação, escopo — omito os dados pessoais aqui de propósito), o grid **fica em
coluna única, empilhado, em toda a faixa de largura testada — 1440px, 1024px, 768px e 500px** —
`getComputedStyle(grid).gridTemplateColumns` sempre igual à largura do próprio contêiner em pixels (uma
coluna só), nunca vira `repeat(12, minmax(0, 1fr))`. Confirmei que a regra existe no CSS publicado
(`@container (min-width:768px){...@min-\[768px\]\:grid-cols-12{grid-template-columns:repeat(12,minmax(0,1fr))}...}`
— presente, gerada pela `plan-39`) e medi a cadeia de ancestrais do grid até `<html>`: **nenhum elemento, em
nenhum nível, tem `container-type` diferente de `normal`** — nem no lado do ERP, nem no lado da lib. A única
linha da lib que declara a classe utilitária `@container` (que estabelece o contêiner de medida que a
`@container (min-width:…)` da `grid-cols-12` precisa para funcionar) é `src/core/Shell/SarakShell.tsx:89`.
**O ERP não usa `SarakShell`** — ele está no modo "kit de componentes" (`SarakAppChrome`, `nav.tsx:55`, per
§2.1 desta plan), que **não** estabelece esse contêiner em lugar nenhum da árvore. Resultado: o `col-12` do
`SarakGrid`, que a §2.1 desta própria plan classificou como "provavelmente imune" por usar `getGridStyles`
(um caminho **diferente** do `useStructuralStyles.ts` direto), na verdade usa a **mesma** função
(`useStructuralStyles.ts:17-41`) e está tão sujeito ao mecanismo de container query quanto o resto — só que,
sem o `@container` que só o `SarakShell` planta, a query nunca tem contêiner para medir e nunca dispara, em
NENHUMA largura. **Isto não é regressão da `plan-39`** (o comportamento é o mesmo antes e depois, testei nos
dois temas e a condição persiste) — é uma lacuna que a `plan-39` não tocou porque seu escopo era "religar a
classe que falta no CSS", não "garantir que existe contêiner para medir". Acho que é achado real da lib, não
do ERP: quem usa o modo "kit de componentes" (que a própria `00-contexto.md` descreve como um dos dois modos
de consumo suportados) nunca ganha o `@container` que os componentes estruturais de container query
precisam — a menos que monte manualmente uma classe `@container` em algum wrapper próprio, o que não está
documentado em lugar nenhum que eu tenha visto. **`arquivo:linha` da lib:** `src/core/Shell/SarakShell.tsx:89`
(onde `@container` é plantado) × `src/components/atomic/hooks/useStructuralStyles.ts:35` (o `col-12` que
depende dele) × `src/components/Layout/SarakAppChrome.tsx` (o modo kit, que não planta o equivalente).

**`propostas` — o que NÃO mudou:** tipografia do cabeçalho ("Propostas", `<h1>`) ficou em **36px nos dois
temas e em ambas as larguras testadas** (1440px e 500px) — não usa o título genérico do `ShellContent.tsx`
que a `plan-39` tocou (essa tela é escrita pelo próprio módulo `propostas/web`), então não é superfície
afetada — consistente com a previsão da §2.1.

**`projetos` e `contratos` — nada para relatar.** As duas telas, com dados reais, renderizam como **lista
simples** (linhas, não grade) — nenhuma delas usa `SarakGrid`/`col-12`/`SarakStack`/`masonry`. Confirma, na
tela e com dado real (não mais presumido), a medição da §2.1: **0 usos** desses componentes nestes dois apps.
Nenhuma mudança visual perceptível entre os temas além da paleta de cor (light/dark) e do cromo
(topbar/sidebar, já coberto pelos Observáveis 1 e 2).

**`conector` (home) — funciona, sem grade para testar.** Com o backend no ar, o dashboard mostra contagens
reais (`Contratos: 2`, `Projetos: 1`, `Propostas: 7`) — sem "Carregando…" pendurado. Não usa grade
responsiva visível; nada a reportar aqui além de "funciona".

**Resumo do Observável 3, por app:**

| App | O que mudou (visível) | O que NÃO mudou | Achado |
|---|---|---|---|
| conector | nav da topbar aparece (Obs. 1); cromo vira sidebar (Obs. 2); contagens reais no dashboard | layout do dashboard (sem grade) | nenhum |
| propostas | nav/cromo (Obs. 1/2) | `<h1>` continua 36px em qualquer largura | 🔴 `col-12` nunca sai de 1 coluna, em nenhuma largura — `SarakShell.tsx:89` × `useStructuralStyles.ts:35` |
| projetos | nav/cromo (Obs. 1/2) | lista simples, sem grade — 0 uso de `SarakGrid`/`SarakStack`/`masonry` | nenhum |
| contratos | nav/cromo (Obs. 1/2) | lista simples, sem grade — 0 uso de `SarakGrid`/`SarakStack`/`masonry` | nenhum |

**Arquivos alterados** (nesta correção)

| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/plan/plan-40-teste-de-consumidor-erp.md` | alterado | este bloco de resumo |
| (nenhum outro, em nenhum dos dois repositórios) | — | — |

`node_modules/.vite` dos 4 apps do ERP foi apagado e reconstruído (cache, fora do controle de versão,
confirmado por `git status` vazio antes e depois desta ação). Nenhum arquivo rastreado do ERP foi tocado.

**Verificações executadas**

- Playwright (Chromium real) contra o ERP já rodando (o dono subiu o backend) — nenhum rebuild, nenhuma
  reinstalação da lib refeitos, conforme instruído.
- `outerHTML` real dos 4 botões de `viewMode`, colado acima, capturado com o painel comprovadamente aberto
  (`getByText('Design Engine').count() === 1`) e depois da correção do cache do Vite.
- `localStorage` lido diretamente do browser após clicar em "Aplicar Tema" no card "ERP Noturno" da aba
  Templates — os 4 campos batem com `ERP_THEMES` linha a linha.
- `header`/`aside` e `display` computado nos 4 apps, tema `erp-noturno` aplicado pelo caminho do usuário —
  sidebar em todos, header ausente em todos.
- `getComputedStyle(grid).gridTemplateColumns` do grid de propostas em 1440/1024/768/500px — sempre 1 coluna.
- Cadeia de ancestrais do grid e do `nav` da topbar até `<html>`, `containerType` de cada um — `normal` em
  todos, nos dois casos.
- `grep` no `dist/sarak.css` confirmando a regra `@min-[768px]:grid-cols-12` existe e está correta.
- `git status --short` na lib e no ERP — ambos limpos ao final (lib: só a plan + `00-indice.md`
  pré-existente; ERP: vazio).
- Nenhum console error/pageerror em nenhuma das ~20 navegações desta rodada de correção.
- Processos de `npm run dev` (reiniciado uma vez, para corrigir o cache do Vite) encerrados ao final.

**Critérios de aceite (desta correção)**

- [x] Achado de acessibilidade retirado, com o `outerHTML` real que prova a retirada — e a causa raiz real
      (cache do Vite, não lazy-mount) documentada, porque "estava certo por acidente" seria pior que "estava
      errado".
- [x] Observável 2 refeito pelo caminho do usuário (aba Templates, botão "Aplicar Tema") — confirmado com
      `localStorage` batendo com `ERP_THEMES` e cromo em sidebar nos 4 apps.
- [x] Observável 3 feito (não apenas declarado) — app por app, o que mudou e o que não mudou, com um achado
      real e evidenciado (`col-12` nunca ativa, `arquivo:linha` da lib).
- [x] Fase B não iniciada.
- [x] ERP intocado — `git -C ERP status` vazio.
- [x] Rebuild/reinstalação não refeitos.
- [x] Nada commitado.

**Decisões e suposições**

- **Reiniciei o `npm run dev` do ERP uma vez**, depois de apagar `node_modules/.vite` dos 4 apps, para forçar
  o Vite a reotimizar as dependências do zero. Interpretei isto como dentro do escopo de "medir de verdade" —
  sem o restart, o Observável 2 teria sido medido contra um bundle de dois dias atrás, o que seria pior que
  não medir. Não é rebuild da lib nem reinstalação (as duas coisas que a correção proibiu refazer); é
  ciclo de vida de processo do ERP, e o `git status` do ERP confirma que nenhum arquivo rastreado mudou.
- **Omiti dados pessoais reais** (nomes de clientes, e-mails, telefones) que apareceram nas telas de
  propostas/contratos durante a varredura — descrevi a estrutura (quantos itens, que campos existem) sem
  reproduzir o conteúdo literal no resumo, por prudência, já que este arquivo é versionado.
- **Não investiguei se o achado do `col-12`/`SarakShell` afeta também outros componentes de container query
  além do que testei** (por exemplo, se `SarakStack`, hoje com 0 usos no ERP, teria o mesmo problema se
  alguém passasse a usá-lo em modo kit) — é uma pergunta razoável para quem abrir a plan de conserto, não algo
  que testei aqui.

**Achados fora do escopo (não corrigidos)**

- **`src/components/atomic/hooks/useStructuralStyles.ts:35` (`col-12`, via `getGridStyles`) × `src/core/Shell/SarakShell.tsx:89`
  (único lugar que planta a classe `@container`) — no modo "kit de componentes" (`SarakAppChrome`, sem
  `SarakShell`), nenhum `@container` é estabelecido em lugar nenhum da árvore, então TODA classe de container
  query estrutural da lib (não só `col-12` — qualquer `@min-[Npx]:` de `useStructuralStyles`/`TopbarNav`/
  `ShellContent`) fica sem contêiner para medir.** Medido com dado real, nas 4 larguras testadas, no
  `SarakGrid` `col-12` da tela de propostas do ERP — sempre 1 coluna. Sugiro plan nova para decidir: ou o modo
  kit passa a plantar `@container` em algum wrapper documentado (e o `SarakAppChrome`/doc de integração diz
  onde), ou vira um item explícito do guia de integração ("se você não usa `SarakShell`, envolva seu
  conteúdo em uma div com a classe `@container`, senão os componentes responsivos por container query nunca
  respondem").
- Achado de acessibilidade do resumo anterior (`ThemeSidebarHeader`/`SarakIconButton`) — **retirado nesta
  correção**, não é mais um achado. Ver item 1 acima.
- Achado sobre `criarRouterConector` não religar `autenticacao`/`cors`/`rateLimit` — mantido do resumo
  anterior, sem mudança.

**Pendências / riscos**

- **O achado do `@container`/modo-kit é novo e não estava em nenhum resumo anterior.** Se ele afeta mais
  componentes do que os que testei (razoável supor que sim, já que é estrutural), o impacto real no ERP pode
  ser maior do que o que os Observáveis 1-3 desta plan cobrem — vale uma varredura dedicada, fora desta plan.
- **A descoberta do cache do Vite como uma segunda camada de staleness, independente do `pnpm install
  --force`, não está documentada em `specs/specs/13-instalacao-e-atualizacao.md` ainda** — recomendo que a
  síntese desta plan (§9) inclua isso explicitamente, porque é exatamente a classe de armadilha "funciona no
  passado, ninguém percebe" que aquela spec já existe para prevenir.

## Veredito (Fase A, correção 1) — 2026-08-13 — 🟢 Aprovada

Esta execução justificou a plan inteira. **Achou um defeito real da lib que seis plans, 1297 testes, 12
auditores e todos os gates não viram** — e ainda desarmou um falso positivo que quase entrou no registro.

### Achado 1 — retirado, e a causa real é melhor que a minha suspeita

Eu havia proposto lazy-mount como explicação. **Era pior:** o cache de dependências do Vite
(`node_modules/.vite`), datado de dois dias antes, **sobreviveu ao `pnpm install --force` e a um restart
normal do dev server**. Os quatro apps serviam o bundle velho enquanto o `node_modules` já tinha o novo.

Conferi o estado atual: os quatro `.vite` estão datados de hoje, 14:28–14:30 — consistentes com terem sido
apagados e reconstruídos, como o resumo descreve.

**Isto é achado de primeira grandeza para o processo, não nota de rodapé.** A prova de reinstalação que eu
próprio validei — `sarak.css` novo dentro do `node_modules` — **era verdadeira e ainda assim insuficiente**:
o arquivo estava lá, e o navegador recebia outro. Qualquer teste de consumidor com Vite pode medir o passado
acreditando que mede o presente. Vai para a síntese.

E o executor **não validou o bug contra código de dois dias atrás**, que era o desfecho fácil. Perseguiu até
a causa.

### Achado 2 — Observável 2 refeito pelo caminho do usuário

Aba Templates → card "ERP Noturno" → **Aplicar Tema**, com o `localStorage` conferido contra `ERP_THEMES`
(`mode: dark`, `primaryColor: #38bdf8`) e o cromo em sidebar nos quatro apps. É o caminho que o usuário do
ERP percorre, não o mecanismo por baixo. Aceito.

### 🔴 Achado 3 — o defeito real, e eu confirmei que é pior do que o relatado

**`SarakGrid` com `col-12` fica travado em coluna única em qualquer largura**, na lista de propostas, com
dado real, de 500 a 1440 px. Fui verificar a causa e ela se sustenta — com um agravante:

```
grep -rln "@container" src/ --include=*.tsx | grep -v __tests__
  → src/core/Shell/SarakShell.tsx
  → 7 arquivos dentro de src/features/DesignEngine/   (o painel, da plan-35)
```

**Oito arquivos plantam `@container` em toda a lib. Nenhum deles é átomo.** E
`src/components/Layout/SarakAppChrome.tsx` — o ponto de entrada que a própria lib documenta como o modo
"kit de componentes", e que o ERP usa — planta **zero**.

Enquanto isso, `useStructuralStyles.ts:35` emite `grid-cols-1 @min-[768px]:grid-cols-12`. Uma container
query **sem ancestral com `container-type` nunca casa** — não cai para viewport, simplesmente não ativa.
Resultado: fica no valor base, `grid-cols-1`, para sempre.

**A camada atômica emite classes de container query e não estabelece container nenhum.** Ela funciona *por
acidente*, quando existe um `SarakShell` acima. Fora do Shell — que é exatamente o modo que o `SarakAppChrome`
existe para servir — a responsividade estrutural da lib **não funciona**.

É a terceira camada do mesmo defeito, e a mais funda:

| Camada | Sintoma | Descoberta em |
|---|---|---|
| A classe não existia no CSS | nada acontecia | `plan-39` (por leitura) |
| A regra existe, mas sem container para medir | nada acontece | **agora, por consumidor real** |

E é invisível pelos mesmos motivos de sempre, agora somados: **jsdom não tem layout**, então container query
nunca é avaliada em teste; e nenhum gate pergunta *"esta classe tem ancestral que a faça funcionar?"*.

O `arquivo:linha` do resumo está certo — `SarakShell.tsx:89` × `useStructuralStyles.ts:35` — e a leitura de
que `projetos`/`contratos` não usam grade bate com a minha medição de escopo da §2.1.

### Gates e escopo

`git status` do ERP → **vazio**. Nenhuma linha tocada no consumidor, em nenhuma das duas rodadas. Na lib, só
esta plan e o `00-indice.md`. Rebuild e reinstalação não refeitos, como mandava o prompt. Fase B não
iniciada.

### O que esta Fase A entregou, e o que ainda não

**Entregou:** a `plan-39` chega ao consumidor — a nav da topbar aparece nos quatro apps. Era a pergunta que
segurava a `5.0.0`, e está respondida na tela.

**Não entregou, e é bom que não:** *"nada mais regrediu"*. A varredura com dado real achou justamente o
contrário — não uma regressão desta leva, mas um defeito antigo que a `plan-39` **não** consertou por
inteiro. Melhor descobrir agora do que depois da tag.

**A Fase B continua parada** na decisão do dono (B1/B2/B3 da §2.0).

### Destino da síntese

Além do já declarado na §9, esta execução acrescenta dois itens:

- `13-instalacao-e-atualizacao.md` — **a armadilha do cache do Vite**: `pnpm install --force` atualiza o
  `node_modules` e **não** invalida `node_modules/.vite`; o dev server continua servindo o bundle
  pré-otimizado antigo. Conferir o arquivo em `node_modules` **não** é prova de que o navegador recebeu.
  É procedimento obrigatório em qualquer teste de consumidor com Vite.
- `15-divida-conhecida.md` — o achado 3, com o custo e o alcance: **fora do `SarakShell`, a responsividade
  estrutural da lib não funciona**.

### 🔴 CORREÇÃO DO REVISOR — 2026-08-13: a §2.1 tem premissa falsa e o Observável 1 não prova o que eu disse

O dono testou e relatou que os botões da topbar do ERP funcionam. Fui verificar e **ele está certo — o erro
é meu, e está em duas camadas.**

**A medição:**

| | |
|---|---|
| `SarakShellNav.tsx` (o que o `SarakAppChrome` renderiza) | **nenhuma** classe de container query — sem `@min-`, sem `hidden`. Flex puro |
| Quem importa `TopbarNav` | **só** `SarakShell.tsx:185` e o preview do painel |
| O que o ERP usa | `SarakAppChrome` → `SarakShellNav` |

**O ERP nunca renderiza o `TopbarNav`.** Logo, nunca esteve exposto ao bug de
`hidden @min-[1024px]:flex`. A nav dele funciona, e sempre funcionou.

**Onde eu errei:** a §2.1 afirma *"o ERP é vítima viva do bug da plan-39"*, deduzido de `minimalist-airy` ter
`navigationStyle: 'topbar'`. Deduzi do **tema** sem conferir o **componente**: não verifiquei se o
`SarakAppChrome` chega a renderizar o `TopbarNav`. Não chega. É o mesmo erro de método que já me custou
emendas nas plans 35, 36 e 38 — **ler o que eu esperava encontrar em vez de varrer o caminho inteiro.**

**Consequências, e as duas doem:**

1. **O Observável 1 não prova o conserto da `plan-39`.** Ele mediu uma nav que nunca esteve quebrada. O
   conserto da topbar **segue sem prova em consumidor**, e não pode ser provado neste: nenhum app do ERP usa
   `SarakShell`. Retiro a frase *"a plan-39 chega ao consumidor"* do veredito anterior.
2. **A aprovação da Fase A permanece** — o trabalho do executor está correto e ele mediu o que a plan mandou
   medir. O defeito é da plan, não da execução.

**O que o teste realmente provou** fica mais forte, não mais fraco, e é coerente com o que o dono viu:

> No ERP, **tudo que depende de container query está quebrado; tudo que não depende funciona.**
> A topbar funciona porque não usa. O `col-12` trava em uma coluna porque usa — e não há ancestral
> `@container` no caminho do `SarakAppChrome`.

O achado 3 continua de pé, agora com caso-controle involuntário: dois componentes de navegação, no mesmo
consumidor, e só o que depende de container query falha.
