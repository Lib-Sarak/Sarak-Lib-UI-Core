---
tipo: "plan"
titulo: "Achados de comportamento — o código fazendo coisa diferente do que promete"
dominio: "Sarak-Lib-UI-Core / Comportamento"
status: "🔴 A executar"
prioridade: "Máxima"
tags: ["plan", "bug", "comportamento", "seguranca-de-dados"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[07-responsividade-e-multidispositivo]]", "[[15-divida-conhecida]]"]
depende_de: "plan-06"
destino_sintese: "specs/06-painel-de-customizacao-e-preview.md · specs/07-responsividade-e-multidispositivo.md · specs/04-shell-e-discovery.md"
---

> ⚠️ **O escopo desta plan é PROVISÓRIO até a plan-03** — a triagem decide quais destes seis viram conserto e
> quais são aceitos como característica. O revisor reescreve antes de liberar.

# 1. Objetivo

Os seis comportamentos que contradizem a promessa da lib ou passam a cumpri-la, ou deixam de prometê-la — e
nenhum deles depende de sorte para não causar dano.

# 2. Contexto

Seis defeitos que **nenhum gate vê**. Nenhum é falha de documentação: é **o código fazendo coisa diferente do
que promete**.

**A ordem F1 → F2 não é preferência, é segurança.** O `CustomizationPanel` importa 7 abas e renderiza **uma**;
uma das mortas é a que contém o `localStorage.clear()`. Restaurar a navegação **ativa** a perda de dados.
Decidir na ordem inversa é a única forma de transformar código morto em bug de produção.

# 3. Escopo

## 3.1 Dentro — em ordem obrigatória

**F1 · `localStorage.clear()` — PRIMEIRO, e sozinho** *(achado 8)*
`AdvancedTab.tsx:21` apaga a **origem inteira** do consumidor e recarrega a página, enquanto o `confirm()`
promete "TODAS as configurações visuais". Token de sessão, preferências, carrinho — tudo o que o importador
guardou naquela origem.
**Conserto:** remover **apenas as chaves da lib** (o `storageKey` do Provider) e alinhar o texto do `confirm()`
ao que de fato acontece.
Hoje é **inalcançável**. Foi por isso que adiar foi seguro; é por isso também que **não pode ser adiado outra
vez** sem antes fechar F2.

**F2 · As abas inalcançáveis — decisão do dono, DEPOIS de F1**
7 abas importadas, 1 renderizada (`CustomizationPanel.tsx:3-9` × `:40`). As outras estão no bundle e fora de
alcance. As opções: **restaurar a navegação** (só depois de F1) ou **remover os imports mortos** (menos bundle,
menos superfície).

**F3 · `isGlass` é ramo morto** *(achado 9)* que renderizaria nav nenhuma. Só é inalcançável porque
`validateDesign` descarta o valor — está protegido **por acidente, não por desenho**. Ou o ramo passa a
funcionar, ou sai.

**F4 · `focusRingWidth` ignorado** *(achado 10)* pela regra global de foco. Token que existe, é validado e não
move nada — é um `--sx-*` com outra roupa: **promessa sem emissor**.

**F5 · Token de breakpoint move só 1 dos 3 caminhos** *(achado 11)* de responsividade. Trocar o token não muda
o comportamento nos outros dois, o que quebra a promessa "breakpoints são tokens do tema".

**F6 · `SarakTable` sem opt-out de colapso mobile** *(achado 12)*, enquanto o `SarakDataTable` tem
`responsive={false}`. Inconsistência de API entre dois componentes irmãos.

## 3.2 Fora
- ⛔ **F2 antes de F1.** Restaurar as abas antes de consertar o `clear()` **ativa a perda de dados** — é
  reprovação automática, mesmo que tudo o mais esteja certo.
- ⛔ Mudar a superfície pública (`src/index.ts`) — é a plan-09.
- Itens do baseline de auditoria — plan-07.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` | o contrato do painel (F1/F2) |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | os 3 caminhos de responsividade (F5/F6) |
| Spec fixa | `specs/04-shell-e-discovery.md` | o cromo e a nav (F3) |
| Spec fixa | `specs/15-divida-conhecida.md` §3.1, §3.4 | os achados e o acoplamento que impõe a ordem |
| Skill | `test-unitario` | F1 e F5 exigem teste; ver §7 |

# 5. Instruções de execução

1. **F1 primeiro e sozinho.** Trocar `localStorage.clear()` por remoção das chaves da lib. Escrever o teste que
   prova que **uma chave alheia sobrevive ao reset** — é o critério que define o conserto.
2. Alinhar o texto do `confirm()` ao que o código faz. Prometer mais do que se faz é a origem do defeito.
3. **Só então F2** — apresentar as duas opções ao dono e aplicar a decisão dele.
4. F3: decidir com o dono se `isGlass` volta a funcionar ou sai. **Não deixar protegido por acidente.**
5. F4: ou `focusRingWidth` passa a mover a regra de foco, ou o token sai das 3 fontes. Token sem consumidor é
   promessa sem emissor.
6. F5: fazer o token mover os **três** caminhos, com teste nos três.
7. F6: dar ao `SarakTable` o mesmo opt-out do `SarakDataTable` — a API dos irmãos passa a ser a mesma.
8. **F1 e F6 exigem entrada em `docs/migracoes.md`** — mudam comportamento observável pelo consumidor.
9. Para cada item, declarar **qual gate passaria a pegá-lo** — ou que **nenhum** pega.

# 6. Prompt de execução

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-08-achados-comportamento.md.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/specs/06-painel-de-customizacao-e-preview.md,
specs/specs/07-responsividade-e-multidispositivo.md, specs/specs/15-divida-conhecida.md.
Skills a aplicar: padrao-typescript, test-unitario.

A ORDEM F1 → F2 É OBRIGATÓRIA E É SEGURANÇA: restaurar as abas antes de consertar o
localStorage.clear() ATIVA a perda de dados do consumidor. F2, F3 e F4 têm decisão do
dono — pare e pergunte, não escolha por ele.
Não commite. Ao terminar, escreva o resumo na própria plan.
```

# 7. Critérios de aceite

- [ ] **F1 tem teste que prova que uma chave alheia sobrevive ao reset.** Sem esse teste, F1 não está feito.
- [ ] O texto do `confirm()` descreve exatamente o que o código faz.
- [ ] F2 executado **depois** de F1, com a decisão do dono registrada.
- [ ] F3 e F4 com decisão do dono; nada permanece "protegido por acidente".
- [ ] **F5 com teste nos três caminhos** de responsividade.
- [ ] F6: `SarakTable` e `SarakDataTable` com a mesma API de opt-out.
- [ ] Entrada em `docs/migracoes.md` cobrindo F1 e F6.
- [ ] Cada item declara o gate que passaria a pegá-lo — ou que nenhum pega.
- [ ] Suíte verde; baseline de auditoria inalterado (ou regravado com justificativa).

# 8. Como verificar

- Teste de F1: gravar `chave-alheia` no `localStorage`, disparar o reset, confirmar que **sobreviveu**
- `git log --oneline` → o commit de F1 antecede o de F2
- Teste de F5: trocar o token de breakpoint e verificar os **3** caminhos
- `grep -n "responsive" src/components/**/SarakTable*` → o opt-out existe
- `docs/migracoes.md` → entrada com antes/depois de F1 e F6
- `npx vitest run` → verde

# 9. Destino da síntese

**Destino:** `specs/06-painel-de-customizacao-e-preview.md` (F1/F2) ·
`specs/07-responsividade-e-multidispositivo.md` (F5/F6) · `specs/04-shell-e-discovery.md` (F3) ·
`specs/00-regras-e-invariantes.md` se F4 virar regra de "token sem consumidor" ·
`specs/15-divida-conhecida.md` (as linhas fechadas saem)

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
