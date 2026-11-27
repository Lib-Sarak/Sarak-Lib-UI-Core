---
tipo: "plan"
titulo: "Quatro defeitos de componente: style do botão, textos do cartão de busca, barra do topo a 820 px e controle sem uso"
objetivo: "Fazer o style do importador vencer o do token no SarakButton, traduzir os textos fixos do SarakSearchCard, fazer a barra do topo do dot-matrix-elegant mostrar itens a 820 px e apagar o ResponsiveSliderControl sem uso"
dominio: "Componentes / Cromo"
status: "🟡 Em execução"
prioridade: "Média"
tags: ["plan", "rc2", "componentes", "i18n", "cromo"]
relacionados: ["[[00-regras-e-invariantes]]", "[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: ""
retida_por: ""
destino_sintese: "00-regras-e-invariantes"
---

# 1. Objetivo

- O `style` que o importador passa ao `SarakButton` vence o que o token escreve.
- O `SarakSearchCard` fala o idioma que vale.
- A 820 px, a barra do topo do `dot-matrix-elegant` mostra os itens que cabem.
- O painel não carrega controle sem uso.

# 2. Contexto

| Id | Defeito |
|---|---|
| B2 | `src/components/atomic/Buttons/SarakButton.tsx:80-81` espalha `...style` antes de `...getButtonStyles(design, variant, isHovered)`. A borda, a largura dela e as outras chaves que o token escreve ignoram o `style` do importador. Foi medido no botão de idioma do cromo, que teve de passar a `outline` por isso. Dentro da lib, passam `style` ao `SarakButton`: `SarakModal`, `SarakPagination` e `SarakResourceRow` |
| B3 | `src/components/atomic/Cards/SarakSearchCard.tsx:150-163` mostra "Visão Computacional", "Navegação Web" e "Modo Conversacional" fixos em português, no texto e no `aria-label` do `SarakSwitch`, em qualquer idioma |
| B4 | A 820 px, o `dot-matrix-elegant` mostra zero itens na barra do topo, todos no "Mais". A busca recolhida a 0 px continua somando dois vãos de 24 px, e esse espaço falta para o primeiro item. A spec `barra-de-topo-estreita` não pega o caso: ela confere que o próximo item não caberia, e com os vãos ele de fato não cabe |
| B6 | `ResponsiveSliderControl` (`src/features/DesignEngine/components/controls/BasicControls.tsx:83`) ficou sem uso em produção, porque o Command Center agora edita um ponto por vez |

# 3. Escopo

## 3.1 Dentro
- `SarakButton.tsx` e o teste dele. Confira os três usos internos (`SarakModal`, `SarakPagination`, `SarakResourceRow`) e os
  snapshots que mudarem.
- `SarakSearchCard.tsx`: os três textos e os `aria-label` saem do catálogo de textos, nos seis idiomas, num catálogo do boot
  (não em `catalogEntries.access`, `advanced`, `entries` ou `system`, que carregam sob demanda).
- O cromo da barra do topo (`src/components/Layout/chrome/` e `src/components/atomic/Navigation/`): a busca recolhida não soma vão.
- `browser-tests/barra-de-topo-estreita.spec.ts`: o caso do B4.
- `BasicControls.tsx`: apagar o `ResponsiveSliderControl` e o que só ele usa.

## 3.2 Fora
- Cores de tema e o botão de idioma: ele continua sem tinta e com contorno.
- **A `plan-187` corre em paralelo.** Fique fora de `src/styles/_print.css`, da `SarakDataTable` e da `SarakDataGrid`, e siga a trava
  de build da §5, passo 6.
- Fique fora de `gates/scripts/release/`. Prazo próprio em teste passa por `prazoDeTeste` (`src/shared/testing/prazoDeTeste.ts`), nunca literal.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R35 | o chamador vence o átomo |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` §2.1 | a barra do topo e o "Mais" |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §3.6 | os textos da lib |
| Skill | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `test-e2e` | sempre |

# 5. Instruções de execução

1. **B2.** Teste: `style={{ borderWidth: '3px' }}` num `SarakButton` com token de borda diferente → o botão desenha 3 px. Ele tem de
   falhar hoje. Inverta a ordem e rode os testes de `src/components/atomic` e `src/components/Layout`.
2. **B3.** Teste: com o idioma `en`, o cartão mostra os três textos em inglês, no texto e no `aria-label`.
3. **B4.**
   - Na spec de navegador: a 820 px, nos 25 temas, a busca recolhida não tem vão próprio e o primeiro item da lista aparece quando
     cabe. A spec tem de reprovar hoje no `dot-matrix-elegant`.
   - Corrija no cromo.
4. **B6.** Apague. `tsc` e o `barrel:check` provam que nada o usava.
5. **Verificação do executor:**
   - `npx vitest run src/components/atomic src/components/Layout src/features/DesignEngine/components`;
   - `npm run verify -- --tier=quick`;
   - **só no B4:** `npm run build` e `barra-de-topo-estreita` sozinha.
6. **Trava de build:** o build e a spec rodam com a trava `C:	mpsarak-build.lock`, a mesma da `plan-187`.
   - Pegue a trava com `node -e "require('fs').writeFileSync('C:/tmp/sarak-build.lock','plan-186',{flag:'wx'})"`. Se o comando
     falhar, outra plan está com ela: espere e tente de novo.
   - Solte com `node -e "require('fs').rmSync('C:/tmp/sarak-build.lock')"` depois da spec, inclusive se algo falhar.
   - Nunca apague a trava de outra plan. Se ela ficar parada mais de 30 minutos sem build rodando, relate.

# 6. Critérios de aceite

- [ ] Os testes do B2, do B3 e do B4 falhavam antes e passam depois.
- [ ] A 820 px, o `dot-matrix-elegant` mostra ao menos um item na barra do topo.
- [ ] Nenhuma referência ao `ResponsiveSliderControl` sobra em `src/`.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor não repete os comandos do executor. Ele confere:
- o diff;
- **mutação, em cópia:** o `...style` antes do `getButtonStyles` de novo → o teste do B2 reprova.

# 8. Destino da síntese

**Destino:** `00-regras-e-invariantes` (R35). Texto para transporte:

> O `style` do chamador também vence o do átomo: no `SarakButton`, ele é aplicado depois do que o token escreve.

---

# 9. Resumo da execução

---

# 10. Veredito
