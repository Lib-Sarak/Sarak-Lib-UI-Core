---
tipo: "plan"
titulo: "Levar a 4,5:1 o item ativo, o idioma, o botão de sair e o nome do usuário nas barras de tom contrastante e em degradê"
objetivo: "Fazer cada peça do cromo ficar em ao menos 4,5:1 (texto) ou 3:1 (ícone) sobre a barra que a desenha, inclusive nas paradas claras do degradê, e esvaziar a lista de exceções do teste das Personalidades"
dominio: "Cromo / Contraste"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "cromo", "contraste", "acessibilidade", "release-9-0-0"]
relacionados: ["[[05-cromo-e-slots]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md + specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

Toda peça do cromo é legível sobre a barra que a desenha, em todo tema, nos dois modos e em todo tom de barra:
- o texto (nome da marca, item comum, item ativo, nome do usuário, código do idioma) fica em ao menos 4,5:1;
- o ícone (avatar, engrenagem, sair) fica em ao menos 3:1.

O teste das Personalidades deixa de ter exceções.

# 2. Contexto

Três itens do backlog, promovidos pelo dono em 2026-11-21 para entrar antes da tag 9.0.0:

1. **#88 — barra de tom contrastante** (`inverse`, `primary`, `secondary`), medida em navegador:
   - **(a)** com barra em degradê no modo claro (`nebula-space`, `cyberpunk-neon`, `corporate-ledger`, `industrial-terminal`; neste, também
     a lateral), o item ativo em véu de 20% fica entre 3,4 e 4,4:1 sobre a parada clara. A [[09-temas-e-presets]] §4.3.4 promete o texto
     da barra nas duas paradas do degradê.
   - **(b)** o código do idioma (`src/components/atomic/Navigation/SarakShellLanguageSelector.tsx`, a 60% do texto forte) dá 3,2 a 4,4:1,
     e o botão de sair (`src/components/atomic/Navigation/SarakShellUserWidget.tsx`, vermelho misturado) dá 3,9:1 sobre a barra
     contrastante.
2. **#70 — três exceções isentas** em `KNOWN_BELOW_LIMIT` (`browser-tests/plan-145-personalidades.spec.ts`): o item ativo em pílula da
   topbar escura de `nebula-space` e de `aurora-veil` (4,4995) e o nome do usuário na lateral escura de `organic-clay` (4,48).
3. **#86 — par da paleta.** Nos tons contrastantes, o par "item ativo sobre o véu" da paleta fica abaixo do inativo em várias paletas (ex.:
   `oceano`, claro, `primary`: 5,02 × 7,23). Na tela, `src/components/Layout/chrome/chromeToneStyle.ts` troca o texto ativo pelo texto
   forte da barra. Falta medir no navegador se algum tema contrastante mostra o ativo menos legível que o inativo, e alinhar o par da
   paleta ao que a barra desenha.

As pílulas P/M/G em véu são da plan-159 e não entram aqui.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/components/Layout/chrome/` (`chromeToneStyle.ts` e o que calcula a cor da peça sobre a barra).
- `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx`, `src/components/atomic/Navigation/SarakShellUserWidget.tsx`.
- O cálculo do par de contraste da paleta para os tons de barra (`src/core/Design/palette/`), só o par "item ativo sobre o véu".
- `browser-tests/plan-145-personalidades.spec.ts` (só para esvaziar `KNOWN_BELOW_LIMIT`) e um spec novo para o degradê claro e os tons
  contrastantes.
- Testes de unidade dos arquivos acima e os snapshots que mudarem por esta plan.
- `docs/migracoes.md` e os gerados, se algo visível ao importador mudar.

## 3.2 Fora (o que NÃO pode ser tocado)

- A cor declarada dos temas (`src/core/Design/presets/themes/`): o contraste se resolve no cálculo da peça sobre a barra.
- O limiar dos testes (4,5:1 e 3:1).
- Os arquivos das plans 167, 168 e 169: `src/styles/_elements.css`, `SarakTitleCard.tsx`, os quatro specs da 167, os gráficos, o i18n e
  os gates.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.4 | o tom de barra e o texto nas duas paradas do degradê |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | a anatomia do cromo |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | contraste mínimo |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-arquitetura-design` | cor por token |
| **Skill** | `test-e2e` | os specs de navegador |
| Código | `src/components/Layout/chrome/chromeToneStyle.ts` | o texto ativo sobre o véu |
| Código | `src/components/atomic/Navigation/SarakShellLanguageSelector.tsx`, `src/components/atomic/Navigation/SarakShellUserWidget.tsx` | idioma e sair |
| Código | `browser-tests/plan-145-personalidades.spec.ts` (`KNOWN_BELOW_LIMIT`) | as exceções de hoje |

# 5. Instruções de execução

**Antes de medir: `npm run build`.** Os specs leem o `dist/`.

**Lote 1 — medir.** Escreva um spec que mede cada peça do cromo nos temas de degradê do #88, nos três tons contrastantes, nos dois modos e
nas duas paradas do degradê. Grave a tabela no resumo, com as peças abaixo do limite. Inclua o par "ativo × inativo" do #86.

**Lote 2 — corrigir.**

2.1. O item ativo, o idioma, o botão de sair e o nome do usuário passam a calcular a cor contra a parada menos favorável da barra.
Mantenha o desenho (véu, pílula, vermelho de sair) e mexa só na intensidade que falta.

2.2. O par "item ativo sobre o véu" da paleta passa a medir o que `chromeToneStyle.ts` desenha.

2.3. Esvazie `KNOWN_BELOW_LIMIT`. Se uma exceção não puder sair, pare e traga ao revisor com a medida.

2.4. Prévia (antes e depois) das barras afetadas, nos dois modos, em `C:/tmp/sarak-previa-170/`.

**Verificação:**
- Em cada lote: `npm run build`, os specs tocados e `npm run verify -- --tier=quick`.
- Rode as baterias de navegador **uma de cada vez**, nunca junto com a de outra plan. Rodar junto dá falha falsa de carga.

# 6. Critérios de aceite

- [ ] Tabela de medida por tema, tom, modo e parada no resumo do lote 1.
- [ ] Toda peça em ao menos 4,5:1 (texto) ou 3:1 (ícone) nas duas paradas, com spec que a guarda.
- [ ] `KNOWN_BELOW_LIMIT` vazio.
- [ ] O par da paleta igual ao que a barra desenha.
- [ ] `tsc` 0, baseline sem regressão, Anel 1 verde, `docs/migracoes.md` atualizado se o importador vê diferença.
- [ ] Prévia com o ok do dono.

# 7. Como verificar (uso do revisor)

**Gate:** o spec das Personalidades sem exceção e o spec novo do degradê.

- `git diff --stat` → só os arquivos de §3.1.
- `npm run build` e `npx playwright test -c browser-tests/playwright.config.ts plan-145-personalidades` mais o spec novo → verde.
- Anel 1, `check-audit-baseline --with-tsc` e Anel 0 sobre as linhas adicionadas.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md + specs/10-seguranca-e-acessibilidade.md`

- **09 §4.3.4:** a peça calcula a cor contra a parada menos favorável, e o par da paleta mede o que a barra desenha.
- **10:** os limites de texto e ícone no cromo, sem exceções.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
