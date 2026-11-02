---
tipo: "plan"
titulo: "Compactar a linha de recurso, ajustar o indicador único, pôr o afixo dentro do campo e fazer as abas encolherem"
objetivo: "Fazer a linha de recurso ter layout e densidade compactos, o bloco de uma métrica preencher a célula e aceitar link, o prefixo e o sufixo poderem ficar dentro do campo, e as abas nunca transbordarem"
dominio: "Componentes / Lista, formulário e navegação"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "rc.5", "lista", "formulario", "abas"]
relacionados: ["[[anexos/rc5-contrato]]", "[[07-responsividade-e-multidispositivo]]", "[[11-testes-e-cobertura]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Os itens 8 a 11 do contrato da rc.5 entregues, com padrão que preserva o comportamento de hoje, provados em navegador real.

# 2. Contexto

Contrato em `specs/plan/anexos/rc5-contrato.md`, itens 8 a 11.

- **Item 8, `src/components/atomic/Templates/SarakResourceRow.tsx`:** a linha empilha tudo, com cerca de 300 px, e sobra espaço à direita: cinco itens por tela.
- **Item 9, `Templates/SarakStats.tsx`:** com uma métrica, o bloco não preenche a célula, e o rótulo quebra palavra por palavra. O ERP escreve `SarakCard` + `SarakValue` à mão para ter link.
- **Item 10, `Inputs/SarakInput.tsx`:** `prefixText` e `suffixText` saem fora da caixa, e os campos de uma linha ficam com larguras diferentes.
- **Item 11, `UX/SarakTabs.tsx`:** medido no ERP, 658 px de faixa em 446 px de `main`, e as últimas abas somem sem aviso.

**Responsividade por contêiner, nunca por janela** ([[07-responsividade-e-multidispositivo]] §6.1).

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Templates/SarakResourceRow.tsx`, `SarakStats.tsx`, `src/components/atomic/Inputs/SarakInput.tsx`, `SarakCurrencyInput`, `SarakMaskedInput`, `src/components/atomic/UX/SarakTabs.tsx` e testes.
- `src/core/i18n/` — textos novos, se houver, nos seis idiomas.
- `browser-tests/` — specs novos.

## 3.2 Fora
- Grade e camadas (plan-146). Gráficos (plan-147). Token novo: pare e reporte.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | nomes e padrões |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6.1 | contêiner |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | teclado, alvo de 44 px |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` §7 | navegador |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. **`SarakResourceRow`.** `layout` e `density`, com os padrões do contrato. Em `inline`: título, descrição e selos à esquerda, metadados em colunas, ações à direita, e empilha por container query. O `title` corta com reticências sem invólucro do consumidor, e a ação não passa da borda.
3. **`SarakStats`.** Uma métrica preenche a célula, e o rótulo não quebra por palavra. `href` na métrica torna-a link, com teclado e foco.
4. **`affixPlacement`.** Em `inside`, o texto fica dentro da borda, com espaço reservado por `padding`, e a largura do campo não muda. Vale para os três campos, se usarem o mesmo desenho; se não, diga no resumo.
5. **`SarakTabs`.** `overflow`. A faixa nunca passa do contêiner. `scroll` com rolagem própria e sinal de que há mais; `wrap` quebra linha; `menu` leva as que não cabem a um menu com teclado. Alvo de toque ≥ 44 px.
6. Depois de `npm run build`, rode os specs novos. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
7. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] `inline` reduz a altura da linha e empilha em contêiner estreito; o título corta; a ação não passa da borda — navegador.
- [ ] Sem as props novas, o desenho de hoje — teste.
- [ ] Uma métrica preenche a célula; `href` funciona por teclado — teste e navegador.
- [ ] Afixo dentro: campos de uma linha com a mesma largura — navegador.
- [ ] Abas: largura da faixa ≤ contêiner nos três modos, alvo ≥ 44 px — navegador.
- [ ] Catálogo atualizado.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/components/atomic` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- A CI mede a bateria no push.

# 8. Destino da síntese

**Destino:** `—`. A superfície nova fica no catálogo gerado.

---

# 9. Resumo da execução

---

# 10. Veredito
