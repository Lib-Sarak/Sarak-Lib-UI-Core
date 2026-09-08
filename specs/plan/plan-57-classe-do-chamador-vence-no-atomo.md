---
tipo: "plan"
titulo: "Fazer a classe do chamador vencer o default do átomo"
objetivo: "Fazer a classe passada pelo chamador vencer a classe default do átomo, em vez de o vencedor ser decidido pela ordem do stylesheet"
dominio: "Sarak-Lib-UI-Core / Componentes Atômicos"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "atomos", "tailwind", "cromo"]
relacionados: ["[[arquitetura/03-superficie-publica]]", "[[00-regras-e-invariantes]]", "[[05-cromo-e-slots]]", "[[02-design-engine]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/00-regras-e-invariantes.md · arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

Quando um chamador passa `className` a um átomo de botão, a classe dele **vence** a classe default do
átomo — e isso deixa de depender da ordem em que o Tailwind emitiu as duas regras no `dist/sarak.css`.

# 2. Contexto

## 2.1 O defeito, medido

`SarakButton` (`src/components/atomic/Buttons/SarakButton.tsx:57,80`) e `SarakIconButton`
(`src/components/atomic/Buttons/SarakIconButton.tsx:46,131`) **concatenam** strings de classe:

```
`${baseClasses} ${tailwindClasses} ${widthClass} ${disabledClass} ${className}`
```

Em Tailwind, duas utilitárias que escrevem a **mesma propriedade** têm a **mesma especificidade**. Quem
vence é a que aparece **depois no stylesheet**, não a que aparece depois no atributo `class`. Concatenar
não sobrescreve nada — só empilha, e deixa o resultado a cargo da ordem de emissão.

Medido por offset de byte no artefato publicado `dist/sarak.css` (a evidência é reproduzível: procure a
primeira ocorrência de cada seletor):

| Par em conflito | Offset | Vence |
| --- | --- | --- |
| `.normal-case` × `.uppercase` | 90600 × 90633 | **o átomo** |
| `.tracking-normal` × `.tracking-widest` | 81558 × 82009 | **o átomo** |
| `.w-full` × `.w-max` | 20987 × 21006 | **o átomo** |
| `.justify-center` × `.justify-start` | 26307 × 26384 | o chamador |
| `.text-xs` × `.text-2xs` | 79760 × 79852 | o chamador |
| `.rounded-btn` × `.rounded-full` | 31915 × 31960 | o chamador |

Três dos seis resolvem contra a intenção do chamador. Nenhum resolve **por decisão** — os seis resolvem por
acaso, e o acaso muda quando a ordem de emissão do Tailwind mudar.

## 2.2 Duas consequências que não se resolvem com `twMerge` sozinho

**(a) `fullWidth` continua inerte.** `useButtonLayoutStyles` (`hooks/useButtonLayoutStyles.ts:26`) emite
`w-max min-w-fit` quando `buttonWidthStrategy` não é `'full'` — que é o **default**. Com `twMerge`,
`w-full` (emitido depois) passa a vencer `w-max`; mas `min-w-fit` está em **outro grupo** (`min-width`),
não conflita com nada e **sobrevive**. O elemento continua com largura mínima igual ao conteúdo: não
trunca, transborda. Isto tem de ser resolvido no hook, não pelo merge.

**(b) `twMerge` não conhece as utilitárias próprias desta base**, e classificá-las errado é pior que não
mergear. As quatro em uso:

| Classe | Onde nasce | Grupo correto |
| --- | --- | --- |
| `text-2xs` · `text-3xs` | `src/styles/_theme.css:56-57` (tokens `@theme`) | `font-size` |
| `rounded-btn` | `src/styles/_theme.css:86` (classe CSS avulsa, **não** utilitária gerada) | `border-radius` |
| `font-tab` | `src/styles/_typography.css:37` (classe CSS avulsa) | `font-family` |

`text-2xs` é o caso perigoso: sem configuração, `twMerge` pode lê-la como cor de texto e **deixar de
conflitar** com `text-xs`. A configuração é obrigatória, não opcional.

## 2.3 Por que agora

O cromo (`src/core/Shell/Components/`) consome estes dois átomos em **seis** arquivos e tenta desfazer os
defaults deles pelo `className`. Enquanto o merge não existir, qualquer conserto de geometria no cromo
fica sujeito à mesma loteria. Esta plan é o piso da `plan-58`, e não entrega efeito visual sozinha.

`tailwind-merge` **já é `peerDependency`** (`>=2.2.0`) e já é usado em 6 arquivos de `src/` — não há
dependência nova a introduzir.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/components/atomic/Buttons/SarakButton.tsx` — compor as classes com merge; a `className` recebida
  é a última a entrar.
- `src/components/atomic/Buttons/SarakIconButton.tsx` — idem.
- `src/components/atomic/Buttons/hooks/useButtonLayoutStyles.ts` — a estratégia de largura para de emitir
  classe que o `fullWidth` não consegue derrotar (§2.2a).
- **Arquivo novo** — o helper de merge configurado com as utilitárias próprias (§2.2b), em
  `src/shared/` ou `src/components/atomic/hooks/`, conforme a regra de dependência de
  `arquitetura/00-mapa-do-modulo.md`. Um só, reusável; não duplicar a configuração em cada átomo.
- **Arquivo novo** — `gates/scripts/contrato/check-class-merge.mjs` (o gate da §7).
- **Arquivo novo** — a allowlist do gate em `gates/allowlists/`, com motivo por entrada.
- `package.json` — só a linha do script `class-merge:check` e a inclusão dele onde os outros
  `*:check` de contrato já rodam.
- Testes dos arquivos acima, em `__tests__/` ao lado de cada um.
- `docs/migracoes.md` — a nota para o consumidor (§5, passo 10). É **mudança de comportamento visível**
  ainda que aditiva em superfície: quem hoje passa `className` a um `SarakButton` e vê o override
  **perder** vai vê-lo **vencer** depois desta plan. Quem compensou o defeito por fora (estilo inline,
  `!important`, ou simplesmente aceitou o resultado) verá a tela mexer.

## 3.2 Fora (o que NÃO pode ser tocado)

- `src/core/Shell/**` — a geometria do cromo é a `plan-58`. Esta plan **não** muda um pixel de topbar ou
  sidebar de propósito; se o merge mudar a aparência deles, isso é resultado esperado do conserto e se
  descreve no resumo, mas **nenhuma edição** entra ali.
- `sizeClasses` de `SarakButton`/`SarakIconButton` — a métrica (`py-4 px-6` e afins) é a `plan-58`.
- **Os demais átomos que concatenam `className`.** Eles entram na **allowlist** do gate, com motivo, e
  são corrigidos em plan própria. Corrigi-los aqui estoura o escopo e a verificação.
- `package.json` fora da linha do script — **nenhuma** mudança de `dependencies`, `peerDependencies` ou
  versão.
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` — gerados ([[00-contexto]] §7).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre — regras inegociáveis, comandos, fronteiras |
| Spec fixa | `specs/00-regras-e-invariantes.md` | **R10** (composição atômica) e **R18** (gate declara o que não vê) |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | o que é superfície pública e o que muda ao mexer em átomo |
| Spec fixa | `specs/arquitetura/00-mapa-do-modulo.md` | regra de dependência — decide onde o helper novo pode morar |
| Spec fixa | `specs/arquitetura/02-design-engine.md` | como o átomo lê token; o merge não pode atropelar `style` inline |
| Spec fixa | `specs/01-gates-e-baseline.md` | **antes de rodar qualquer gate** — o baseline do `run_audit` não é zero |
| Spec fixa | `specs/11-testes-e-cobertura.md` | o que "suíte verde" significa e os tetos por base |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-refatorar-componente` | alterar assinatura/comportamento de átomo sem quebrar paridade |
| Skill | `ui-auditoria-modulo` | rodar a auditoria estrutural ao final |
| Skill | `test-unitario` | os testes novos |
| Código | `src/components/atomic/Buttons/SarakButton.tsx` | ler inteiro antes de editar |
| Código | `src/components/atomic/Buttons/SarakIconButton.tsx` | ler inteiro antes de editar |
| Código | `src/components/atomic/Buttons/hooks/useButtonLayoutStyles.ts` | onde nasce `w-max min-w-fit` |
| Código | `src/components/atomic/Feedback/SarakBadge.tsx` · `src/components/atomic/Modals/SarakModal.tsx` | como `twMerge` **já** é usado nesta base — siga o idioma existente |
| Código | `src/styles/_theme.css` · `src/styles/_typography.css` | a fonte das utilitárias próprias da §2.2b |
| Código | `gates/scripts/contrato/check-container-query-boundary.mjs` | **molde de gate desta base**: formato do cabeçalho de limites (R18), export testável, `main()` |
| Código | `gates/allowlists/barrelExclusions.mjs` | molde de allowlist com motivo por entrada |

# 5. Instruções de execução

1. **Ler antes de editar.** Os seis arquivos de código da §4 e as specs fixas listadas. Não repita a
   investigação da §2 — ela está medida.
2. **Criar o helper de merge**, configurado com as quatro utilitárias próprias da §2.2b nos grupos
   corretos. Ele é a única porta: nenhum átomo configura `twMerge` por conta própria.
   *Pronto quando:* existe teste que prova, para cada uma das quatro, que a classe do chamador substitui
   a do átomo (e não coexiste com ela).
3. **Aplicar em `SarakButton`.** A ordem de composição termina sempre na `className` recebida. O `style`
   inline devolvido por `getButtonStyles` **não** é tocado — merge é de classe, não de estilo.
   *Pronto quando:* `normal-case`, `tracking-normal` e `text-<qualquer>` passados por `className`
   derrotam os defaults `uppercase`, `tracking-widest` e o `text-*` do `size`.
4. **Aplicar em `SarakIconButton`**, com o mesmo critério.
5. **Resolver o `fullWidth` inerte** (§2.2a) em `useButtonLayoutStyles`: com largura cheia pedida, a
   estratégia não pode emitir classe de `min-width` que impeça o elemento de encolher.
   *Pronto quando:* um teste monta `SarakButton` com `fullWidth` e rótulo longo e prova que o elemento
   **não** carrega classe que o force além do container.
6. **Escrever o gate** `check-class-merge.mjs` (contrato da §7), no molde de
   `check-container-query-boundary.mjs`: cabeçalho com os **limites declarados (R18)**, função exportada e
   testável, `main()` com `--check`. A allowlist nasce com os átomos que **hoje** concatenam e não foram
   corrigidos aqui, cada entrada com motivo escrito.
   *Pronto quando:* existe um teste que constrói um caso violador e prova que o gate **reprova** — regra
   sem caso que falha não é regra ([[00-prompt-revisor]] §5.4).
7. **Registrar o script** `class-merge:check` no `package.json` e ligá-lo onde os demais `*:check` de
   contrato já rodam. Não invente gatilho novo.
8. **Rodar a suíte completa** — `npx vitest run`, a suíte inteira, não pastas a dedo. Teste que quebrar
   por causa desta mudança é **sinal**, não obstáculo: conserte a asserção se ela codificava o
   comportamento errado, e **relate cada um** no resumo.
9. **Rodar** `npm run audit` (comparar com `gates/baselines/audit-baseline.json`, **nunca** com zero),
   `npm run composicao-atomica:check`, `npm run barrel:check` e o gate novo.
10. **Escrever a nota em `docs/migracoes.md`**, no formato que as entradas vizinhas já usam. Ela diz o que
    muda para quem passa `className` a um botão (§3.1) e o que fazer se a tela mexeu. Não cite esta plan
    — comentário e documento não referenciam plan (`padrao-escrita`, `references/comentarios.md`).

# 6. Critérios de aceite

- [ ] `SarakButton` e `SarakIconButton` compõem classe por merge; a `className` do chamador é a última.
- [ ] Existe **um** helper de merge, configurado para `text-2xs`, `text-3xs`, `rounded-btn` e `font-tab`,
      com teste por classe provando substituição (não coexistência).
- [ ] `fullWidth` produz largura cheia **de fato**, sem piso de largura que impeça o encolhimento (§2.2a).
- [ ] O gate `class-merge:check` existe, tem cabeçalho de **limites declarados (R18)**, allowlist com
      motivo por entrada, e um teste que prova que ele **reprova** um caso violador.
- [ ] Nenhum arquivo de `src/core/Shell/**` foi editado.
- [ ] `package.json` mudou **apenas** na linha do script novo.
- [ ] `docs/migracoes.md` tem a entrada da mudança de comportamento, sem citar plan.
- [ ] `npx vitest run` verde; `npm run audit` sem violação nova contra o baseline.

# 7. Como verificar (uso do revisor)

**Gate:** `class-merge:check` — átomo que aceita `className` compõe a classe por merge, e não por
concatenação; a allowlist declara os que ainda não foram convertidos.

- `git status` + `git diff --stat` → só os arquivos da §3.1. Qualquer arquivo de `src/core/Shell/**`
  no diff reprova.
- Ler o diff inteiro de `SarakButton.tsx` e `SarakIconButton.tsx` → confirmar que a `className` recebida
  entra por último e que o `style` inline não foi tocado.
- `npx vitest run` → verde, saída colada.
- `node gates/scripts/contrato/check-class-merge.mjs --check` → verde; e o teste do gate provando a
  reprovação de um caso violador.
- `npm run composicao-atomica:check` → verde (R10 intacta).
- `npm run audit` → comparar com `gates/baselines/audit-baseline.json`.
- Ler o helper novo → confirmar as **quatro** utilitárias da §2.2b configuradas, e o teste de cada uma.
- Ler `useButtonLayoutStyles.ts` → confirmar que não sobra piso de largura sob `fullWidth`.

# 8. Destino da síntese

**Destino:** `specs/00-regras-e-invariantes.md` · `arquitetura/03-superficie-publica.md`

Texto pronto para transporte, a ser conferido contra o diff antes de escrever:

- **`00-regras-e-invariantes.md`** — regra nova, na categoria **verificável**, com o gate que a cobra:
  *"Átomo que aceita `className` compõe a classe do chamador por merge. A classe recebida vence a default
  do átomo; concatenar deixa o vencedor a cargo da ordem de emissão do Tailwind, que é acidental. Cobrada
  por `class-merge:check`, com allowlist declarada dos átomos ainda não convertidos."*
- **`arquitetura/03-superficie-publica.md`** — o fato de contrato: *"O `className` recebido por um átomo
  substitui a utilitária equivalente do átomo. As utilitárias próprias desta base — `text-2xs`, `text-3xs`,
  `rounded-btn`, `font-tab` — são reconhecidas pelo merge; classe própria que nasça depois precisa ser
  registrada nele, ou não conflita com nada."*

Não transportar: o inventário de offsets da §2.1 (é evidência de investigação, não verdade permanente do
sistema) nem a menção ao defeito corrigido ([[00-prompt-revisor]] §7.4).

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
