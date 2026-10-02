---
tipo: "plan"
titulo: "Expor em runtime o selo do build que o navegador está executando"
objetivo: "Permitir responder em um olhar, na página do consumidor, qual build da lib o navegador está executando"
dominio: "Sarak-Lib-UI-Core / Build e distribuição / Identidade de build"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "build", "identidade-de-build", "consumidor", "cache"]
relacionados: ["[[13-instalacao-e-atualizacao]]", "[[05-build-e-distribuicao]]", "[[03-superficie-publica]]", "[[08-identidade-do-host-e-zero-marca]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/13-instalacao-e-atualizacao.md + arquitetura/05-build-e-distribuicao.md + arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

Com a lib montada numa página, uma pessoa (pelo inspetor do navegador) ou um agente (por uma leitura do
`document`) vê **qual build o navegador está executando** — versão, commit-base e data — e consegue comparar
com o build que está instalado em disco.

# 2. Contexto

Entre o `dist/` da lib e a tela do consumidor há duas camadas de cache, e as duas falham em silêncio
([[13-instalacao-e-atualizacao]] §9.1). A segunda — o pré-bundle do bundler — re-otimiza por lockfile, versão
e config, **nunca por conteúdo**: com dependência local, o dev server segue servindo o build anterior.

**Nada na lib diz, em runtime, qual build está no ar.** Os sinais que existem respondem outra pergunta:
`sarak-ui check` compara o **pacote**; `dist/BUILD_INFO.json` descreve o **artefato em disco**. Medir contra
código velho é indistinguível de defeito da lib — já custou dois ciclos de diagnóstico, e três rodadas de
investigação numa lib que estava certa.

**Por que agora:** a próxima etapa do repositório é validar a lib em sistemas que a aplicam, alguns em
versões anteriores. *"Que build este sistema está executando?"* passa a ser a primeira pergunta de toda
medição, e hoje ela não tem resposta na página.

**O que existe para aproveitar.** `scripts/generate-build-info.mjs` já calcula `libVersion`,
`baseCommitShort` e `builtAt` e os grava em `dist/BUILD_INFO.json` — como **último** passo do `npm run build`,
depois de o JavaScript já ter sido empacotado. O `build-info:check` confere o arquivo.

⚠️ **Três armadilhas conhecidas:**

- **O selo tem de estar dentro do bundle**, não ser lido do `BUILD_INFO.json` em runtime. A pergunta é sobre
  o código que o navegador executa; um arquivo ao lado responderia sobre o disco de novo.
- **`baseCommit` é sempre um commit atrás** ([[13-instalacao-e-atualizacao]] §10) — o hash de um commit não
  contém a si mesmo. O selo identifica o **build**; não responde *"estou atualizado?"*, que continua sendo do
  `sarak-ui check`.
- **Valor injetado em tempo de build pode ser dobrado pelo empacotador.** Comparar o valor injetado com um
  literal igual vira constante, e o ramo morto é apagado em silêncio. O selo deve ser **lido**, não
  comparado, dentro da lib.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `scripts/generate-build-info.mjs` e o teste dele em `scripts/__tests__/` — a tríade passa a ter fonte
  única para o bundle e para o `BUILD_INFO.json`, e o `--check` passa a conferir os dois.
- `package.json` — **só** os scripts `build` e `build:js`, no que for necessário para a tríade existir antes
  do empacotamento.
- `src/` — o ponto que carrega o selo e o ponto que o expõe na página, mais o barril (`src/index.ts`) se o
  selo for exportado.
- Testes ao lado do que mudou (`__tests__/`).
- `.agents/skills/ui-integra-consumidor/` — onde o kit do consumidor ensina a ler o selo. O arquivo aparece
  duas vezes no `git status` (`.claude/skills` é symlink rastreado sob os dois prefixos): é esperado.
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` — regenerados. Nunca à mão.

## 3.2 Fora (o que NÃO pode ser tocado)

- **Qualquer texto visível na interface do host.** O selo é atributo ou valor legível por inspeção, nunca
  conteúdo renderizado — é a R12.
- **Qualquer elemento que não seja da lib, no modo embarcado.** Lá a lib é hóspede.
- `bin/` — o `sarak-ui check` e o aviso de cache ficam como estão.
- O formato e as chaves de `dist/BUILD_INFO.json`.
- A lista de `--external` do `build:js`.
- `browser-tests/` — as plans 89 e 90 mexem ali.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/13-instalacao-e-atualizacao.md` | §9.1 (as duas camadas de cache e o procedimento) e §10 (a armadilha do `BUILD_INFO`) |
| Spec fixa | `specs/arquitetura/05-build-e-distribuicao.md` | §2 (o pipeline do build, na ordem exata), §2.1 (a armadilha medida do tsup) e §6 (identidade de build) |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §4 e §4.3 — barril, e a convenção de prefixo por espécie de nome |
| Spec fixa | `specs/specs/08-identidade-do-host-e-zero-marca.md` | o que conta como marca vazando para o host |
| Spec fixa | `specs/arquitetura/01-forma-do-produto-e-modos-de-consumo.md` | o modo embarcado — onde a lib pode e não pode escrever |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R12, R24, R29 (todo artefato gerado bate com a fonte), R34 e R37 |
| Spec fixa | `specs/specs/12-kit-do-consumidor.md` | de onde o kit do consumidor é gerado |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | como ler os gates que o `build` roda |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | os testes |
| **Skill** | `ui-integra-consumidor` | é a fonte do kit do consumidor — e é editada aqui |
| Código | `scripts/generate-build-info.mjs` | o cabeçalho explica `baseCommit` e os limites do `--check` |
| Código | `package.json` | os scripts `build` e `build:js` |
| Código | `src/core/Provider/SarakUIProvider.tsx` | o ponto de montagem da lib |
| Código | `src/core/Design/components/DesignScope.tsx` | o elemento de escopo do modo embarcado |

# 5. Instruções de execução

1. **Fonte única da tríade.** `libVersion`, `baseCommitShort` e `builtAt` são calculados **uma vez** por
   build, antes do empacotamento, e são os mesmos no bundle e em `dist/BUILD_INFO.json`.
2. **O selo dentro do bundle**, nos dois formatos (ESM e CJS).
3. **O selo na página.** Com a lib montada, um elemento **da lib** carrega um atributo com a tríade. No modo
   de aplicação e no embarcado; no embarcado, nunca num elemento do host. Registre no resumo qual elemento e
   por quê.
4. **O selo no código.** Se ele for exportado pelo barril, o nome segue a convenção de prefixo da espécie
   dele, e entra no catálogo.
5. **O `build-info:check` passa a conferir o bundle.** Reprova quando o selo dentro de `dist/index.js` não
   bate com `dist/BUILD_INFO.json`. Caso que falha, por fixture: um `dist/` sintético com as duas metades
   divergentes. O cabeçalho de limites do script (R18) acompanha.
6. **Testes:** a lib montada expõe o atributo, nos dois modos; sem Provider, nada quebra (R34); em ambiente
   sem `document`, nada quebra.
7. **O kit do consumidor** passa a ensinar a leitura: como ver o selo na página, e como compará-lo com
   `node_modules/@sarak/lib-ui-core/dist/BUILD_INFO.json`. Iguais: o navegador executa o que está instalado.
   Diferentes: a segunda camada de cache está defasada, e o procedimento é o da
   [[13-instalacao-e-atualizacao]] §9.1.
8. `npm run guide`, `npm run build`, `npm run build-info:check`, `npm run dev-kit`.
9. `npm run zero-brand:check` → verde. `npx tsc --noEmit` → zero erros. `npx vitest run` → verde.

# 6. Critérios de aceite

- [ ] Depois de `npm run build`, o selo dentro de `dist/index.js` e de `dist/index.cjs` traz a mesma tríade
      de `dist/BUILD_INFO.json`.
- [ ] Com a lib montada, `document.querySelector` pelo atributo do selo devolve um elemento **da lib**, cujo
      valor contém versão, commit-base e data — nos dois modos.
- [ ] No modo embarcado, nenhum elemento fora do escopo da lib recebe o atributo.
- [ ] `npm run build-info:check` reprova um `dist/` de fixture com bundle e `BUILD_INFO.json` divergentes, e
      aprova o real.
- [ ] Nenhum texto do selo é renderizado como conteúdo; `npm run zero-brand:check` verde.
- [ ] O kit do consumidor regenerado ensina a ler o selo e a compará-lo com o `BUILD_INFO.json` instalado.
- [ ] `npm run build` verde — inclusive `barrel:check`, `public-types:check`, `prefix:check` e
      `catalog:check`, se o selo for exportado.
- [ ] `npx tsc --noEmit` com zero erros; suíte verde.

# 7. Como verificar (uso do revisor)

**Gate:** `--check` do gerador — o `build-info:check` passa a cobrar que o selo embutido no bundle bate com
`dist/BUILD_INFO.json`. É a forma certa porque o selo é **arquivo derivado** de outra fonte.

- `git status` + `git diff --stat` → só os arquivos de §3.1.
- `npm run build`, e então:
  - `grep -c "<valor de builtAt do BUILD_INFO.json>" dist/index.js dist/index.cjs` → presente nos dois;
  - `npm run build-info:check` → verde.
- Mutação por fixture, sem tocar o worktree: chamar a função do `--check` com um `dist/` sintético divergente
  → reprova.
- **O selo denuncia build velho?** Buildar, guardar o valor, buildar de novo → o `builtAt` do bundle mudou
  junto com o do `BUILD_INFO.json`.
- Leitura do diff de `src/` → o selo é lido, nunca comparado com literal; nenhum texto renderizado.
- `npm run zero-brand:check` · `npx tsc --noEmit` · `npx vitest run` → verde, 0 erros, verde.
- Leitura do kit regenerado em `sarak-ui/` → a instrução de leitura existe.

# 8. Destino da síntese

**Destino:** `specs/13-instalacao-e-atualizacao.md + arquitetura/05-build-e-distribuicao.md + arquitetura/03-superficie-publica.md`

- **`13-instalacao-e-atualizacao`** §9.1 — o parágrafo *"nenhum sinal existente responde a essa pergunta
  sozinho"* deixa de ser verdade: o selo em runtime responde **qual build o navegador executa**, e a
  comparação com o `BUILD_INFO.json` instalado é o teste da segunda camada. **§10** — as três perguntas e
  quem responde cada uma: *estou atualizado?* (`sarak-ui check`), *o que está instalado?* (`BUILD_INFO.json`),
  *o que está executando?* (o selo).
- **`05-build-e-distribuicao`** §2 e §6 — onde a tríade nasce no pipeline, e que ela tem fonte única.
- **`03-superficie-publica`** — o nome exportado, se houver.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
