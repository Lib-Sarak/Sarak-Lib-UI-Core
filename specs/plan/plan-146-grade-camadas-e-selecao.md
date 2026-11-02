---
tipo: "plan"
titulo: "Corrigir o espaço entre colunas da grade, a confirmação atrás da gaveta e a seleção do controle segmentado"
objetivo: "Fazer a grade e o flex respeitarem o espaço nos dois eixos, a confirmação abrir sempre acima de gaveta e modal com o foco correto, e a opção selecionada do controle segmentado se distinguir em todos os temas"
dominio: "Componentes / Layout e camadas"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "rc.5", "layout", "camadas"]
relacionados: ["[[anexos/rc5-contrato]]", "[[07-responsividade-e-multidispositivo]]", "[[10-seguranca-e-acessibilidade]]", "[[11-testes-e-cobertura]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/07-responsividade-e-multidispositivo.md + specs/specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

Os defeitos do pedido do ERP para a rc.5 (itens 1, 12 e 13 do contrato) deixam de existir, provados em navegador real.

# 2. Contexto

Contrato em `specs/plan/anexos/rc5-contrato.md`. O ERP terminou as telas na rc.4 e pediu estes acabamentos.

**Item 1, grade.** `src/components/atomic/hooks/useStructuralStyles.ts:47` envia `columnGap: undefined` depois de `gap`, e o React limpa a propriedade longa: com `gap="spacing-md"` e `templateColumns`, o computado é `gap: 16px normal`, com zero entre colunas. **Vermelho no navegador, verde no jsdom.**

**Item 12, camadas.** `SarakDrawer.tsx:110` soma 1 à camada de modal, e a confirmação usa a camada de modal. O ERP mediu o clique no centro da confirmação caindo no fundo da gaveta, e hoje contorna fechando a gaveta. Número fixo não resolve: a gaveta pode abrir sobre modal, e vice-versa.

**Item 13.** Visto no ERP em temas escuros: opção selecionada igual às outras. `aria-checked` já existe. Falta medir.

**Depois do commit de 140 e 143:** o item 1 muda o estilo emitido e, com ele, snapshots do painel.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/hooks/useStructuralStyles.ts`, `useStructuralStyles.presets.ts` e testes.
- `src/components/atomic/Layouts/SarakGrid.tsx`, `SarakFlex.tsx` — `rowGap` e `columnGap`.
- Revisão de estilos com propriedade curta e longa juntas em `src/components/atomic/` (seções, cartões, `SarakDescriptionList`).
- `src/components/atomic/Modals/` — `SarakOverlayProvider`, `SarakDrawer`, `SarakModal` e a pilha.
- `src/components/atomic/Templates/SarakSegmentedControl.tsx`, se a medição confirmar.
- `browser-tests/` — specs novos. `docs/migracoes.md`.

## 3.2 Fora
- Token novo de camada, salvo se a pilha exigir, e aí pare e reporte. Gráficos, lista, formulário e abas (plans 147 e 148).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | nomes e padrões |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §4 | `SarakGrid` |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | foco preso, teclado |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` §7 | o que o navegador mede |
| Código | `src/components/atomic/Modals/hooks/useFocusTrap.ts` | foco |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. **Grade.** Spec de navegador primeiro, vermelho: dois filhos lado a lado distam o token. Depois o conserto: nenhuma chave `undefined` em estilo com `gap`. `rowGap` e `columnGap` vencem `gap` no eixo deles.
3. **Revisão.** Procure estilo com propriedade curta e longa juntas em `src/components/atomic/`, com chave que possa ser `undefined`. Liste no resumo o que achou e corrigiu.
4. **Pilha.** Uma pilha única de camadas abertas: a camada nova fica acima da última aberta, seja gaveta, modal ou confirmação. Sem número fixo por tipo. Sem mudança para quem abre uma camada só.
5. **Foco.** O foco preso passa à confirmação e volta à gaveta ao fechar.
6. **Prova da camada:** em navegador real, `elementFromPoint` no centro da confirmação aberta sobre gaveta cai na confirmação; nos dois sentidos de abertura; modo embarcado incluído.
7. **Item 13.** Meça a opção selecionada contra as outras nos 19 temas, nos dois modos, pelo contraste não textual de 3:1. Se reprovar, a seleção ganha contraste próprio por token. Se passar, diga no resumo, com os números.
8. `docs/migracoes.md`: itens 1 e 12.
9. Depois de `npm run build`, rode os specs novos e os de layout e cromo afetados. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
10. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Distância entre dois filhos igual ao token, nos dois eixos, em navegador real; vermelho antes.
- [ ] `rowGap` e `columnGap` vencem `gap`; sem eles, `gap` nos dois eixos — navegador.
- [ ] `elementFromPoint` cai na confirmação sobre gaveta e modal; foco volta — navegador.
- [ ] Controle segmentado medido nos 19 temas × 2 modos.
- [ ] Catálogo atualizado.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/components/atomic` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- Leitura dos specs novos; a CI mede a bateria no push.

# 8. Destino da síntese

**Destino:** `specs/specs/07-responsividade-e-multidispositivo.md` §4 (`rowGap`, `columnGap`) + `specs/specs/10-seguranca-e-acessibilidade.md` (pilha de camadas e foco).

---

# 9. Resumo da execução

---

# 10. Veredito
