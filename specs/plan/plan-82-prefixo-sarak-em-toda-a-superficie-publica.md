---
tipo: "plan"
titulo: "Prefixar com Sarak todo nome exportado pelo barril público"
objetivo: "Todo nome que o consumidor importa da lib carrega o prefixo da biblioteca, e um gate impede que um nome sem prefixo volte a entrar no barril"
dominio: "Sarak-Lib-UI-Core / Superfície pública"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "barril", "contrato-publico", "nomenclatura", "major", "gate"]
relacionados: ["[[arquitetura/03-superficie-publica]]", "[[specs/00-regras-e-invariantes]]", "[[specs/01-gates-e-baseline]]", "[[specs/03-versionamento-e-release]]"]
depende_de: ""
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md · specs/00-regras-e-invariantes.md · specs/01-gates-e-baseline.md"
---

# 1. Objetivo

Todo nome exportado pelo barril público começa por `Sarak`, `SARAK_`, `use` ou `sarak`, conforme a sua
espécie; um gate cobra a convenção a cada build, e a nota de migração diz ao consumidor como se chamava
cada nome antes.

# 2. Contexto

**Por que agora:** a lib está sendo importada num ERP novo, e o agente que a integra relatou que nomes
genéricos no barril (`FilterDescriptor`, `Message`, `CatalogItem`) são difíceis de distinguir dos tipos
locais do projeto dele. O ERP é o **único** consumidor e é ajustado junto com a lib, então este é o momento
mais barato de quebrar a API. Cada mês que passa encarece a mesma mudança.

**O que a leitura mediu** (revisor, 2026-09-19, sobre `dist/index.d.ts` da `6.3.0`):

- 298 nomes exportados. **116 estão fora da convenção** — 71 tipos, 22 valores (componentes, constantes) e
  23 funções.
- Entre os valores sem prefixo há **componentes públicos**: `ExpandableCard`, `ImageCard`, `FilterSelect`,
  `HelpButton`, `SocialButton` e os quatro widgets `Shell*`.
- Entre as funções há nomes de altíssima chance de colisão no projeto consumidor: `reorder`, `moveCard`,
  `widthOf`, `computeOffsets`.
- **Não há nenhuma colisão** entre um nome renomeado pela regra da §5 e um nome que já existe no barril.
  Conferido nome a nome, com o mapeamento mecânico aplicado.

**A convenção existe e vale pela metade.** A skill `ui-novo-componente` já manda prefixar componente
público, mas metade da superfície nasceu antes disso, e não há gate. Regra que vale pela metade não é
cobrável — é por isso que a plan entrega regra **e** gate na mesma entrega.

**O major não é novo.** A `6.3.0` é a versão publicada e o `docs/migracoes.md` já tem entradas tituladas
`7.0.0` esperando a próxima release. Esta mudança entra nesse mesmo major; não se cria outro.

**Nenhum comportamento muda.** É renomeação de identificadores públicos, mais um gate. Nenhum componente
ganha, perde ou altera prop.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/index.ts` — o barril, e os exports nomeados que citarem nome antigo.
- `src/**` — a declaração de cada nome público renomeado, o arquivo que o abriga (quando o nome do arquivo
  segue o do componente) e **todos os usos internos** do nome, inclusive em `__tests__/`.
- `gates/allowlists/*.mjs` — entradas que citem nome antigo.
- `gates/scripts/contrato/check-public-prefix.mjs` — **criar**, o gate novo.
- `gates/scripts/contrato/__tests__/check-public-prefix.test.mjs` — **criar**, o teste do gate.
- `package.json` — o script `prefix:check` e a inclusão dele na cadeia do `build`.
- `docs/migracoes.md` — a entrada da migração.
- `.agents/skills/**` — referências a nome antigo no texto das skills locais.
- Artefatos **gerados**, por regeneração e nunca à mão: `docs/component-catalog.{json,md}`, `sarak-ui/`,
  `sarak-dev/`, `dist/`, `src/core/Provider/generated/`.

## 3.2 Fora (o que NÃO pode ser tocado)

- `specs/**` — inclusive as specs que citam nome antigo. São do revisor, e entram na síntese.
- O **consumidor** (o ERP). A lib não conserta o importador; quem o orienta é a nota de migração.
- Nomes **internos** que o barril não exporta. Esta plan é sobre a superfície pública, e só.
- Qualquer mudança de comportamento, de prop ou de assinatura que não seja o nome.
- `package.json` fora do que a §3.1 permite — nada de `version`, nada de dependência nova.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/03-superficie-publica.md` | o contrato do barril, o `barrel:check` e o que ele não vê |
| Spec fixa | `specs/00-regras-e-invariantes.md` | R14 (barril), R17 (não transcrever fonte viva), R18 (todo gate declara o que não vê) |
| Spec fixa | `specs/01-gates-e-baseline.md` | como ler a saída de cada gate, e o baseline do `audit` (que **não** é zero) |
| Spec fixa | `specs/03-versionamento-e-release.md` | por que remover nome do barril é major, e o que a nota de migração precisa ter |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| Skill | `padrao-escrita` · `padrao-typescript` | sempre |
| Skill | `ui-refatorar-componente` | é a skill de alterar assinatura pública sem quebrar a paridade das três fontes |
| Código | `gates/scripts/contrato/check-public-types-parity.mjs` | o gate mais próximo do novo: lê os nomes de `dist/index.d.ts` e é o molde a copiar |
| Código | `gates/scripts/contrato/check-barrel-parity.mjs` | a disciplina de allowlist com motivo escrito (§4.1 da spec de superfície) |
| Código | `gates/scripts/contrato/check-gate-limits.mjs` | o marcador de limites que o gate novo precisa ter para passar no `gate-limits:check` |
| Código | `.githooks/pre-commit` · `package.json` (cadeia `build` e `gates:full`) | onde os gates são ligados |

# 5. Instruções de execução

1. **Derive a lista, não a copie de lugar nenhum.** Os nomes públicos saem da última linha de
   `dist/index.d.ts` (o `export { … }` agrupado). Reconstrua a lista com o `dist/` atual e trabalhe sobre
   ela. Nenhuma lista de nomes é escrita à mão nesta plan, de propósito (R17).

2. **Aplique o mapeamento mecânico**, sem inventar nome bonito:

   | Espécie | Convenção | Renomeação |
   |---|---|---|
   | Componente, tipo, interface (PascalCase) | começa com `Sarak` | `Foo` → `SarakFoo` |
   | Constante (SCREAMING_SNAKE) | começa com `SARAK_` | `FOO_BAR` → `SARAK_FOO_BAR` |
   | Hook | começa com `use` | já conforme — **não mexa** |
   | Demais funções (camelCase) | contém `Sarak` | `foo` → `sarakFoo`. Função que **já** contém `Sarak` no meio do nome (`getSarakModule`, `registerSarakModule`) **já é conforme** — não mexa |

   O tipo de props acompanha o componente: `FooProps` → `SarakFooProps`, que é o que o `barrel:check`
   cobra junto com o valor.

3. **Renomeie o arquivo junto com o componente**, quando o arquivo leva o nome dele
   (`Cards/ExpandableCard.tsx` → `Cards/SarakExpandableCard.tsx`), inclusive o teste 1:1 ao lado. Cuidado
   com o Windows: renomeação que só muda caixa precisa de dois passos no git.

4. **Troque todos os usos internos** do nome antigo, em `src/`, nos testes e nas skills de `.agents/`.
   Ao terminar, nenhum nome antigo sobra como identificador fora de `docs/migracoes.md`.

5. **Se algum nome precisar ficar sem prefixo**, registre-o na allowlist do gate novo **com o motivo
   escrito ao lado**, na mesma disciplina do `barrelExclusions.mjs`. Silêncio não passa. A expectativa é
   que a lista nasça **vazia**: se você achar que precisa de entrada, diga o porquê no resumo.

6. **Crie o gate `check-public-prefix.mjs`**, no molde do `check-public-types-parity.mjs`:
   - lê os nomes exportados de `dist/index.d.ts`;
   - reprova (`exit 1`) nomeando cada nome fora da convenção e a espécie dele;
   - reprova também **entrada obsoleta de allowlist** — nome listado que já está conforme, ou que não
     existe mais, como o `barrel:check` faz;
   - declara no cabeçalho, no formato que o `gate-limits:check` reconhece, o que ele **não** vê — no
     mínimo: que ele lê o artefato construído e não a fonte, então `dist/` velho o faz medir o passado;
     e que ele julga o **nome**, nunca se o nome é bom.

7. **Ligue o gate** como `prefix:check` no `package.json` e insira-o na cadeia do `build`, **logo depois
   do `public-types:check`** — que é o ponto onde o `dist/` já existe. Não o coloque no `pre-commit`, pelo
   mesmo motivo que o `public-types:check` não está lá.

8. **Escreva o teste do gate** ao lado dele. Ele precisa ter, no mínimo, **um caso que FALHA** por nome sem
   prefixo e um que passa; mais um caso de allowlist obsoleta.

9. **Escreva a entrada em `docs/migracoes.md`**, titulada com `7.0.0` por extenso (é o que o
   `migration-anchor:check` exige). Ela traz a tabela **nome antigo → nome novo**, completa, e a frase que
   diz ao consumidor que nenhum comportamento mudou junto.

10. **Regenere os artefatos** e commite o resultado da geração:
    `npm run catalog` · `npm run guide` · `npm run dev-kit` · `npm run build`. Nenhum arquivo gerado é
    editado à mão.

11. **Rode e leia:** `npm run build` (que já encadeia `barrel:check`, `catalog:check`, `guide:check`,
    `public-types:check` e agora o `prefix:check`), `npm run audit` **comparado ao baseline**, `npm run
    gate-limits:check` e `npx vitest run` inteiro.

# 6. Critérios de aceite

- [ ] `npm run prefix:check` passa, e a allowlist dele está vazia — ou cada entrada tem motivo escrito.
- [ ] O gate reprova de verdade: renomear um nome público de volta ao formato antigo derruba o
      `prefix:check` com `exit 1`, nomeando o nome. Mostrado no resumo com a saída real.
- [ ] Entrada obsoleta na allowlist do gate novo também derruba o gate (caso mostrado).
- [ ] `npm run gate-limits:check` verde — o gate novo declara os próprios limites.
- [ ] Nenhum nome antigo sobra como identificador em `src/`, `gates/`, `scripts/` e `.agents/`; as únicas
      ocorrências são o texto de `docs/migracoes.md`.
- [ ] `barrel:check`, `catalog:check`, `guide:check`, `dev-kit:check` e `public-types:check` verdes, com os
      gerados regenerados e commitados.
- [ ] `docs/migracoes.md` tem a entrada com `7.0.0` no título e a tabela completa de nome antigo → novo.
- [ ] `npm run audit` **no baseline** (não em zero) e `npx vitest run` inteiro verde.
- [ ] Nenhuma mudança de comportamento: nenhuma prop criada, removida ou alterada no diff.

# 7. Como verificar (uso do revisor)

**Gate:** `prefix:check` — todo nome exportado pelo barril público segue a convenção de prefixo da §5,
com allowlist que exige motivo escrito e que se autolimpa.

- `git status` + `git diff --stat` → só os caminhos da §3.1; **nada** em `specs/`.
- `npm run build` → a cadeia inteira verde, inclusive o `prefix:check` novo.
- **Mutação 1:** renomear um nome público de volta ao formato antigo → `prefix:check` cai nomeando-o.
  Restaurar byte a byte.
- **Mutação 2:** pôr na allowlist um nome que já está conforme → o gate cai por entrada obsoleta.
- **Mutação 3:** apagar o bloco de limites do cabeçalho do gate novo → `gate-limits:check` cai.
- Derivar de `dist/index.d.ts` a lista de exportados e conferir, por script, que **nenhum** nome escapa da
  convenção — a mesma medição da §2, agora esperando 0.
- Conferir que a tabela de `docs/migracoes.md` cobre **todos** os nomes que o diff renomeou, sem sobra nem
  falta.
- `npx vitest run` inteiro e `npm run audit` contra `gates/baselines/audit-baseline.json`.
- `grep -rnE "plan-[0-9]+|veredito"` nos arquivos da entrega, rastreados e não rastreados.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md` · `specs/00-regras-e-invariantes.md` ·
`specs/01-gates-e-baseline.md`

- **`arquitetura/03`**: seção nova, junto do `barrel:check` e do `public-types:check` — a convenção de
  prefixo por espécie de nome, a allowlist com motivo e por que ela existe (o consumidor distingue o que é
  da lib do que é dele). Sem transcrever lista de nomes.
- **`specs/00-regras-e-invariantes`**: regra nova, na categoria das **verificáveis**, com o gate que a
  cobra; e a linha do inventário de quem executa o quê (§4.1).
- **`specs/01-gates-e-baseline`**: a linha do `prefix:check` na tabela de onde cada gate roda (§2.2.1) e o
  vão dele na matriz de cobertura — ele lê o artefato construído, não a fonte.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese, imediatamente antes da remoção da plan. -->
