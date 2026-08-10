---
tipo: "plan"
titulo: "A superfície pública da major — remover o que não funciona e destravar o que falta"
dominio: "Sarak-Lib-UI-Core / Núcleo / Superfície pública"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "superficie-publica", "major", "breaking", "r10"]
relacionados: ["[[03-superficie-publica]]", "[[plan-22-triar-a-fronteira-de-papel]]", "[[plan-18-atomo-sem-provider]]", "[[00-regras-e-invariantes]]"]
depende_de: "plan-22"
objetivo: "Agrupar numa unica major as mudancas de superficie publica que a plan-22 deixou declaradas"
destino_sintese: "specs/arquitetura/03-superficie-publica.md · specs/specs/03-versionamento.md · specs/specs/01-gates-e-baseline.md"
---

> 🔒 **Esta é a plan da QUEBRA.** Tudo que muda contrato público e estava espalhado pelas plans anteriores
> converge aqui, **de propósito**: uma major, uma revisão, um `CHANGELOG`. Espalhar quebra por três versões é
> o que faz consumidor perder a confiança em atualizar.

# 1. Objetivo

**As três mudanças de superfície pública que a `plan-22` declarou entram juntas**, e o baseline de R10 fecha.

# 2. Contexto

## 2.1 Por que uma plan só, e por que agora

A `plan-22` triou 23 ocorrências de R10 e **parou em 4**, todas por um motivo só: **consertá-las mexe em
contrato público**, e faxina não é lugar de mudar contrato.

Some-se que o `release:check` **já bloqueia o push** desde a `plan-15`:

```
⛔ PUSH BLOQUEADO — o artefato publicado mudou desde a última tag
   última tag : v2.0.0   (dist + sarak-ui → 57aab47f1636)
```

Ou seja: **uma versão nova é inevitável**. A escolha real não é *"emitir ou não"*, é *"emitir uma minor agora
e uma major em duas semanas, ou uma major só"*. Esta plan existe para que seja a segunda.

## 2.2 Item 1 — remover o `ThemeToggle` *(decidido pelo dono em 2026-08-10)*

`src/components/atomic/Buttons/ThemeToggle.tsx` é **componente publicado que não funciona**:

| Fato | Medição |
|---|---|
| `LAYOUTS = {}` vazio, com `TODO` | `ThemeToggle.tsx:5-6` |
| Logo, `layoutOptions` é sempre `[]` | o dropdown **abre vazio, sempre** |
| Consumo interno | **zero** — nenhum componente de `src/` o importa |
| Publicado | `Buttons/index.ts` re-exporta · `src/index.ts:14` |

**Não confundir com `core/Shell/Components/ShellThemeToggle.tsx`**, que é vivo e usado. A `plan-15` já
verificou: **não são duplicatas**; este é um seletor de preset que nunca foi ligado.

**Por que remover e não popular:** popular `LAYOUTS` com os presets reais é **feature** — decisão de produto,
escopo novo. Decidir produto dentro de uma limpeza é o pior lugar para decidir produto. E publicar algo que
abre vazio é pior que não publicar: alguém importa, reporta bug, e o bug é um `TODO` antigo.

⇒ Fecha **2** das 4 ocorrências de R10 que a `plan-22` deixou declaradas.

## 2.3 Item 2 — `SarakScrim` ganha animação *(decidido pelo dono em 2026-08-10)*

O `SarakScrim` nasceu na `plan-19` e **não anima**. Os dois consumidores que justificaram criá-lo animam:

| Onde | Como anima hoje |
|---|---|
| `atomic/Inputs/Controls.tsx:124` | `motion.div` com transição de opacidade |
| `atomic/Modals/SarakDrawer.tsx:102-113` | `transition-opacity` + `opacity` por estado |

Migrá-los sem resolver isso **remove animação existente** — foi por isso que a `plan-20` e a `plan-22`
pararam, corretamente, duas vezes.

**A forma decidida: prop OPCIONAL, com default igual ao comportamento de hoje.** Quem já usa `SarakScrim` não
percebe diferença; quem migra recupera o que tinha. **Adicionar prop opcional não é breaking** — entra nesta
plan por conveniência de agrupamento e porque destrava a migração, não por obrigação de major.

⇒ Destrava a migração dos 2 consumidores, e a base deixa de ter **três formas de fazer scrim, uma delas
chamada "a oficial"**.

## 2.4 Item 3 — `SarakInput` vira `forwardRef` `⏳ AGUARDANDO O DONO`

> ⚠️ **ESTE ITEM AINDA NÃO FOI DECIDIDO.** Está escrito aqui para não se perder, e **não deve ser executado**
> enquanto o dono não responder. Se a resposta for "não", ele sai da plan e `SarakMultiSelect.tsx:103` fica
> declarado no baseline com o motivo.

`SarakMultiSelect.tsx:103` usa `<input>` cru e depende de `inputRef.current?.focus()` para devolver o foco ao
campo depois de adicionar ou remover um chip. **`SarakInput` não é `forwardRef`**, então o `ref` não atravessa
e a troca pelo átomo perde o foco.

Há um segundo obstáculo, medido pelo executor da `plan-22`: `SarakInput` renderiza `SarakFormGroup` + label
por dentro, e embutir isso num container que já mistura chips inline provavelmente duplica borda e fundo.

**Ver §5.3** — a explicação completa do que `forwardRef` é e por que isto **não** quebra ninguém.

# 3. Escopo

## 3.1 Dentro

| # | Entrega | Quebra? |
|---|---|---|
| 1 | Remover `ThemeToggle` do código e do barril | 🔴 **SIM** — remoção de export público |
| 2 | `SarakScrim` ganha prop opcional de animação + os 2 consumidores migram | não |
| 3 | `SarakInput` vira `forwardRef` + `SarakMultiSelect:103` troca pelo átomo | não — **⏳ aguarda o dono** |
| 4 | `CHANGELOG` da major, com a remoção nomeada e o caminho de migração | — |

## 3.2 Fora

- **Emitir a tag.** `npm version` e push são do dono (ADR-008 §2.2). Esta plan **prepara**; não publica.
- **Popular `LAYOUTS`.** Se o `ThemeToggle` voltar um dia, volta como feature com decisão de produto.
- O `SarakUploader` (falso positivo de gate) e o achado 35 — são conserto de detector, não desta plan.
- Qualquer outro átomo. `forwardRef` **só** no `SarakInput`, e só se autorizado.

# 4. Referências obrigatórias

| Tipo | Onde | Para quê |
|---|---|---|
| Spec fixa | [[03-superficie-publica]] | o que é público e como se remove |
| Spec fixa | `specs/specs/03-versionamento.md` · ADR-008 | quem escolhe o nível da versão, e como |
| Plan | [[plan-22-triar-a-fronteira-de-papel]] | as 4 declaradas e por quê |
| Plan | [[plan-18-atomo-sem-provider]] | o precedente: mexer no átomo com a porta estreita |
| **Skill** | `code-adequacao` · `test-unitario` · `padrao-typescript` | remoção e mudança de assinatura |

# 5. Instruções de execução

1. **Remova o `ThemeToggle` por último**, não primeiro. Ele é o item irreversível; os outros dois devem estar
   verdes antes.
2. **Prove o consumo zero antes de remover** — `grep` por `ThemeToggle` em `src/`, excluindo o próprio arquivo,
   o barril e os testes. Cole a saída. *(O revisor mediu zero; confirme.)*
3. **`SarakScrim`:** a prop é **opcional com default igual ao de hoje**. Teste que prova que o uso atual
   (`SarakAppChromeMobile`) **não muda**, e que os 2 migrados **mantêm** a animação que tinham.
4. **Caracterize antes de migrar** `Controls.tsx` e `SarakDrawer.tsx` — os dois animam de formas diferentes.
5. O item 3 **só executa com autorização escrita**. Sem ela, declare e siga.

## 5.3 O que `forwardRef` é, e por que não quebra ninguém *(para a decisão do §2.4)*

Um componente React comum **não repassa `ref`**. Se alguém escreve `<SarakInput ref={x} />`, hoje o `x` fica
vazio e o React avisa no console — o `ref` morre no componente, não chega ao `<input>` de dentro.

`React.forwardRef` é o mecanismo padrão para **deixar o `ref` atravessar** até o elemento nativo. A mudança é
de uma linha na assinatura:

```ts
// hoje
export const SarakInput: React.FC<SarakInputProps> = ({ ...props }) => …

// com forwardRef
export const SarakInput = React.forwardRef<HTMLInputElement, SarakInputProps>(({ ...props }, ref) => …
```

**Por que isto NÃO quebra os consumidores atuais:**

| Quem | Hoje | Depois |
|---|---|---|
| Passa props normais, sem `ref` | funciona | **idêntico** |
| Passa `ref` | `ref` vazio + aviso no console | `ref` chega ao `<input>` |

**Ninguém perde comportamento.** É adição de capacidade: o componente passa a aceitar algo que hoje ele
silenciosamente ignora.

**O que muda de verdade — e é por isso que é decisão, não detalhe:**

1. **O tipo público muda de forma.** `React.FC<SarakInputProps>` vira
   `React.ForwardRefExoticComponent<...>`. Quem tipou uma variável como `React.FC<SarakInputProps>` referindo
   ao `SarakInput` precisa ajustar. É raro, mas é contrato.
2. **É precedente.** Feito num átomo, os outros vão querer. A `plan-18` enfrentou a mesma pergunta com o
   Provider e o dono escolheu a **porta estreita** — mudar só onde havia necessidade medida, com a regra
   escrita de quando usar cada uma. Aqui a necessidade medida é **uma**: `SarakMultiSelect:103`.
3. **Não resolve sozinho.** O segundo obstáculo (o `SarakFormGroup` + label embutidos) continua de pé. Mesmo
   com `forwardRef`, a troca pode duplicar borda e fundo — precisa de caracterização visual.

**Recomendação do revisor: sim, com a porta estreita.** `forwardRef` só no `SarakInput`, com a razão escrita
em JSDoc, e **sem** promessa de estender aos outros átomos. Se o obstáculo do `SarakFormGroup` se confirmar na
caracterização, o item para e `SarakMultiSelect:103` fica declarado — o `forwardRef` continua valendo, porque
é capacidade que faltava.

**A alternativa honesta é não fazer:** `SarakMultiSelect:103` fica no baseline com motivo escrito, e a R10
fecha em 1 em vez de 0. Custo real: um número no baseline. **Não é catástrofe** — item declarado com dono
nomeado é resposta legítima desde a `plan-15`.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-23-superficie-publica-da-major.md.

Contexto obrigatório: specs/00-contexto.md, specs/00-knowledge.md,
specs/arquitetura/03-superficie-publica.md, specs/specs/03-versionamento.md,
plan-22 (as 4 declaradas) e a §2 desta plan.
Skills: code-adequacao, test-unitario, padrao-typescript, padrao-escrita.

Esta é a plan da QUEBRA. Tudo que muda contrato público converge aqui de propósito.

ORDEM OBRIGATÓRIA — o irreversível por último:

1. SarakScrim ganha prop OPCIONAL de animação, com default IGUAL ao de hoje.
   Teste que prova que SarakAppChromeMobile (o uso atual) NÃO muda.

2. Migrar Controls.tsx:124 e SarakDrawer.tsx:102-113 para o SarakScrim.
   Os dois animam de formas DIFERENTES (motion.div de opacidade / transition-opacity).
   Caracterize cada um ANTES e prove que a animação sobreviveu.

3. ⏳ SÓ COM AUTORIZAÇÃO ESCRITA DO DONO: SarakInput vira forwardRef, e
   SarakMultiSelect.tsx:103 troca o <input> cru pelo átomo.
   Sem autorização: DECLARE e siga. Não é bloqueio da plan.
   Aviso medido: SarakInput renderiza SarakFormGroup + label por dentro; embutir
   isso num container que já tem chips inline pode duplicar borda/fundo.
   Caracterize visualmente ANTES. Se duplicar, PARE — forwardRef sozinho não resolve.

4. REMOVER ThemeToggle.tsx, do código e do barril (Buttons/index.ts, src/index.ts:14).
   É o item IRREVERSÍVEL — só depois de 1, 2 e 3 estarem verdes.
   ANTES de remover, PROVE o consumo zero: grep por ThemeToggle em src/, excluindo
   o próprio arquivo, o barril e os testes. Cole a saída.
   NÃO confunda com core/Shell/Components/ShellThemeToggle.tsx, que é VIVO e usado.
   NÃO popule LAYOUTS — isso é feature, e o dono decidiu remover.

5. CHANGELOG da major: a remoção nomeada, o motivo (componente publicado que abre
   vazio desde sempre) e o que o consumidor faz no lugar.

LINHAS VERMELHAS:
  · Você NÃO emite tag nem roda `npm version` — é do dono (ADR-008 §2.2).
  · Você NÃO torna outro átomo forwardRef. Só o SarakInput, e só se autorizado.
  · Você NÃO altera gate nenhum.
  · Você NÃO edita specs/specs/, specs/adr/, specs/arquitetura/ nem 00-indice.md
    (a coluna Status é gerada por npm run plan-index).

META: composicaoatomica cai para 1 (só o SarakUploader, falso positivo de gate já
declarado) — ou 2, se o item 3 não for autorizado.

Os três espelhos: gates/baselines/ · sarak-dev/ (npm run dev-kit) · sarak-ui/
(npm run guide — a contagem de componentes MUDA, o ThemeToggle sai).

VERIFICAÇÕES, com a saída colada:
  npm run audit           (ANTES e DEPOIS)
  npx vitest run          (INTEIRA)
  npm run barrel:check · npm run deep-import:check
  npm run gate-limits:check · npm run dev-kit:check · npm run guide:check
  node gates/scripts/release/check-audit-baseline.mjs --with-tsc
  git diff --stat

DECLARE se dist/ mudou e toda baseline que se moveu.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] `ThemeToggle` **não existe** em `src/`, no barril nem no catálogo do consumidor, e a **prova de consumo
      zero** está colada no resumo.
- [ ] `ShellThemeToggle` **continua intacto** — o gate de barril e a suíte provam.
- [ ] A prop do `SarakScrim` é **opcional**, e existe teste provando que `SarakAppChromeMobile` **não mudou**.
- [ ] `Controls.tsx` e `SarakDrawer.tsx` usam o `SarakScrim` **com a animação que tinham**, caracterizada antes.
- [ ] Item 3: **executado com autorização escrita**, ou **declarado** com o motivo — nunca decidido sozinho.
- [ ] `CHANGELOG` nomeia a remoção e diz o que o consumidor faz no lugar.
- [ ] `composicaoatomica` = **1** (ou 2 sem o item 3), e o que sobrou tem motivo escrito.
- [ ] `npx vitest run` verde; baseline e **os três** espelhos regravados junto.
- [ ] **Nenhuma tag emitida** — a versão é do dono.

# 8. Como verificar

```bash
grep -rn "ThemeToggle" src/ --include=*.ts --include=*.tsx | grep -v ShellThemeToggle
npm run barrel:check && npm run guide:check
npm run audit
npx vitest run
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
```

# 9. Destino da síntese

`specs/arquitetura/03-superficie-publica.md` (o que saiu, o que ganhou prop, o que virou `forwardRef`) ·
`specs/specs/03-versionamento.md` (o registro da major) · `specs/specs/01-gates-e-baseline.md` (baseline).

# 10. Resumo da execução

*(a preencher pelo executor)*

# 11. Veredito

*(a preencher pelo revisor)*
