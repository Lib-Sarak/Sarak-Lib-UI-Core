---
tipo: "plan"
titulo: "Dar aos gráficos escolha de padrão, cor com sentido, rótulo legível, escala real e eixo sem sobreposição"
objetivo: "Fazer o SarakChartEngine ter hachurado opcional, cor por item pelo token, rótulo interno legível, valor na barra, funil na escala real e marcas de eixo que não se sobrepõem, em todos os temas"
dominio: "Componentes / Gráficos"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "rc.5", "graficos"]
relacionados: ["[[anexos/rc5-contrato]]", "[[11-testes-e-cobertura]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Os itens 2 a 7 do contrato da rc.5 entregues, com o padrão preservado, salvo os itens 2 e 6.

# 2. Contexto

Contrato em `specs/plan/anexos/rc5-contrato.md`, itens 2 a 7. O motor é `src/components/engines/charts/`, sobre ECharts.

- **Item 2:** `SubEngines/useEChartsTheme.ts:132` fixa `decal: { show: true }`: toda barra sai hachurada.
- **Item 3:** a cor vem da paleta em sequência, e "Recusada" pode sair verde. `series[].color` já aceita nome de token.
- **Item 4:** rótulos internos saem escuros sobre cor escura.
- **Item 5:** `config.thickness` não vale em barra, e as barras horizontais saem finas.
- **Item 6:** `SubEngines/builders/advancedCharts.ts:149-150` usa `min: 0` e `max: HEATMAP_MAXIMUM`, e a dica mostra o número normalizado.
- **Item 7:** marcas do eixo sobrepõem em largura estreita, e a última corta na borda.

# 3. Escopo

## 3.1 Dentro
- `src/components/engines/charts/` e testes.
- `browser-tests/` — os itens 4 e 7 se medem no navegador.
- `docs/migracoes.md`: itens 2 e 6.

## 3.2 Fora
- ECharts em si e tipos novos de gráfico. Cor escrita à mão: tudo sai de token.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | nomes e padrões |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` §7.3 | cor esperada vem da página |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §3.6 | formatação pelo `locale` |
| Código | `src/components/engines/charts/SarakChartEngine.tsx` | props e `series[].color` |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. **`pattern`.** Padrão `false`. Ligado, o `decal` volta como hoje.
3. **`getPointColor`.** Mesmos nomes de `series[].color`. `undefined` cai na paleta. Vale para `bar` de uma série, `pie`, `funnel` e `treemap`.
4. **Rótulo.** Escolha pelo contraste com o fundo do item, entre tokens de texto, ≥ 4,5:1, com o `pickOnColor` da lib. Medido no navegador nos 19 temas, em `pie` e `funnel`.
5. **`showValues` e espessura.** Valor na ponta da barra, formatado por `valueFormat`. `'auto'` esconde quando não cabe. `config.thickness` vira `barMaxWidth`. Zero mostra a categoria, sem barra.
6. **Funil.** Escala pelo maior valor; `funnel` sobrescreve. A dica mostra o valor recebido.
7. **Eixo.** `axis.maxTicks` e `axis.compact`. Sem prop, a quantidade de marcas se ajusta à largura, e a margem reserva o rótulo final. `compact` usa `1,2 mi` no eixo, pelo `locale`, e o valor inteiro na dica.
8. `docs/migracoes.md`: itens 2 e 6, orientando a ligar `pattern` quando a cor for o único sinal.
9. Depois de `npm run build`, rode os specs de gráfico. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
10. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Sem `pattern`, nenhum `decal`; com ele, o de hoje — teste.
- [ ] `getPointColor` nos quatro tipos; `undefined` cai na paleta — teste.
- [ ] Rótulo interno ≥ 4,5:1 nos 19 temas × 2 modos — navegador.
- [ ] Valor na ponta formatado, espessura e zero — teste.
- [ ] Funil pelo maior valor e dica com o número real — teste.
- [ ] Sem sobreposição de marcas nem corte em largura estreita — navegador.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/components/engines` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- A CI mede a bateria no push.

# 8. Destino da síntese

**Destino:** `—`. A superfície nova fica no catálogo gerado e na `## 8.0.0` de `docs/migracoes.md`.

---

# 9. Resumo da execução

---

# 10. Veredito
