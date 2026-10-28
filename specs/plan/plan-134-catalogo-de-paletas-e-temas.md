---
tipo: "plan"
titulo: "Entregar o catálogo de paletas e fazer os 19 temas usarem paleta"
objetivo: "Fazer a lib embarcar de 12 a 15 paletas prontas cobrindo os cinco tipos de harmonia e os 19 temas declararem uma paleta em vez de cores escritas à mão, com a hierarquia de título refeita pela regra comum e aprovada pelo dono numa prévia antes e depois"
dominio: "Temas / Paletas"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "rc.4", "paletas", "temas"]
relacionados: ["[[anexos/rc4-contrato]]", "[[plan-133-motor-de-paletas]]", "[[09-temas-e-presets]]"]
depende_de: "plan-133-motor-de-paletas"
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md"
---

# 1. Objetivo

Os 19 temas embarcados tiram as cores de uma paleta (`colorPalette`) e guardam só as sobrescritas de cor intencionais; o catálogo tem de
12 a 15 presets nomeados; o dono aprova o resultado visual antes do veredito.

# 2. Contexto

O motor e a regra do cálculo são da `plan-133` (leia o §2 dela). Um preset é **só a entrada**: `{ id, nome, tipo, base, sec?, acc? }`.
A curadoria aqui é **escolher boas entradas**, não editar tons.

**Os temas mudam de cor de propósito** — a hierarquia de título feita à mão em cada tema é o defeito que o dono apontou. Mas **nenhum
tema perde a identidade**: a entrada da paleta de cada tema nasce das cores que ele tem hoje (`primaryColor`, `secondaryColor`,
`accentColor` do modo padrão viram `base`, `sec`, `acc`), e temas com cores parecidas podem compartilhar o mesmo preset.

Cada tema hoje declara cor em `design` e no bloco `contraparte` (ex.: `minimalist-airy.ts:244-353` e `:547-574`). O que a paleta passa
a produzir sai dos dois blocos; o que fica é sobrescrita **justificada** (um comentário de uma linha por chave mantida: por quê).

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/palette/presets.ts` — os presets (substitui o preset de teste da `plan-133`), com rótulos no
  `catalogEntries.palette.ts`.
- Os 19 arquivos de `src/core/Design/presets/themes/<id>.ts` — `colorPalette` e a poda das cores.
- `src/core/Design/presets/themes/catalog.generated.ts` — regenerado por `npm run themes:catalog` (é desta plan: nenhuma outra toca temas).
- Testes de tema que fixam valores de cor (atualizar o valor esperado, nunca afrouxar a asserção).
- A prévia (§5 passo 4), **fora do repositório**.
- `docs/migracoes.md` — subseção na `## 8.0.0` (Q8 do contrato).

## 3.2 Fora
- O motor (`palette/` além de `presets.ts`), o painel, o kit.
- Tokens que não são cor; temas de importador.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-133-motor-de-paletas.md` §2 | a regra do cálculo |
| Contrato | `specs/plan/anexos/rc4-contrato.md` §1.9, §5 Q8, **§9** | o que entregar e como verificar |
| Spec fixa | `specs/09-temas-e-presets.md` §2.1, §5.2, §5.3, §6 | contraparte, diversidade medida, o que o tema declara, travas |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-criar-tema` · `ui-criar-preset` | sempre · temas e presets |

# 5. Instruções de execução

1. Fotografe o worktree.
2. Presets: de 12 a 15, com ao menos dois de cada tipo, e as entradas que os 19 temas pedem.
3. Temas: `colorPalette` + poda; cada cor mantida tem a linha de justificativa.
   Depois, remova a marca `optionalForTheme` de `colorPalette` (`src/core/Design/schema/colors.ts`) e, se nenhum outro token a usar, o
   mecanismo inteiro (`src/core/Design/types.ts`, `gates/scripts/contrato/helpers/theme-completeness-core.ts` e o cabeçalho de
   `check-theme-completeness.ts`): o tema embarcado volta a declarar todo token estético (`theme-completeness:check` verde com os 19).
4. **Prévia antes/depois:** capturas dos 19 temas × 2 modos no `HEAD` e no worktree, com a mesma tela de amostra (título, subtítulo,
   texto, cartão, botão, tabela, status), numa página HTML lado a lado em
   `C:\tmp\sarak-rc4-paletas\index.html`, mais uma grade dos presets (cada um × 2 modos). **Pare aqui** e marque a plan
   `🟠 Em revisão` com o caminho da prévia no resumo: o dono aprova ou devolve ajustes de entrada antes de seguir.
5. Depois da aprovação: `npm run themes:catalog`, subseção em `docs/migracoes.md`, `npm run verify -- --tier=quick` uma vez, resumo colado.

# 6. Critérios de aceite

- [ ] De 12 a 15 presets, ≥ 2 por tipo — teste sobre o registro.
- [ ] Os 19 temas declaram `colorPalette` — teste sobre o registro de temas. Toda cor mantida tem justificativa — conferido na leitura
  do diff (comentário não é testável).
- [ ] `auditor_contraste` e as travas da [[09-temas-e-presets]] §6 sem regressão (no `audit:baseline` do `quick`).
- [ ] Diversidade do catálogo (`themes:diversity`) não piora — número antes/depois no resumo.
- [ ] Prévia aprovada pelo dono (registro no resumo, com a data).

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo — o `auditor_contraste` e as travas de tema já cobrem.

- `npx vitest run src/core/Design/presets src/core/Design/palette` — uma vez.
- `npm run themes:diversity` — uma vez (número antes/depois).
- A prévia é aberta pelo dono; o revisor confere só que ela cobre os 19 × 2 e os presets × 2.
- Diff dos temas lido: só cor e `colorPalette` mudaram; cada cor mantida justificada.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md` — §5 (catálogo) ganha: "Os temas embarcados tiram a cor de uma paleta; o que declaram de cor é
sobrescrita justificada", e o número de presets por tipo sai do registro (R17, nunca transcrito).

---

# 9. Resumo da execução

---

# 10. Veredito
