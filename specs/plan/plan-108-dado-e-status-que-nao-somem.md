---
tipo: "plan"
titulo: "Manter o ultimo dado na falha, carimbar a leitura e mostrar status sem depender so de cor"
objetivo: "Fazer os templates de dado manterem o ultimo dado com o horario quando o recarregamento falha, mostrarem quando o dado esta desatualizado, alinharem numeros em digitos tabulares e o selo de status ter forma, rotulo e cor do tema"
dominio: "Templates de dado / Feedback / Exibicao de dados"
status: "🟡 Em execução"
prioridade: "Media"
tags: ["plan", "estados", "templates", "status", "acessibilidade", "mobile"]
relacionados: ["[[03-superficie-publica]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: ""
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md"
---

# 1. Objetivo

Num celular com rede que oscila, o recarregamento que falha **não apaga a tela**: o último dado fica, com o horário
da leitura e o aviso de erro com "Tentar de novo". Números de dado não "pulam" ao atualizar, e o selo de status se lê
sem cor (forma + rótulo), nas cores do tema.

# 2. Contexto

Avaliação de 2026-10-10 contra um material de design system para mobile ("seis estados de toda tela de dados":
vazio, carregando, sucesso, erro, parcial, desatualizado; "falha não apaga a tela: o último dado fica, com o
horário"). Medido no `HEAD`:

- **A falha apaga a tela.** `useSarakTableData` guarda as linhas antigas quando o `load` rejeita
  (`Templates/hooks/useSarakTableData.ts`, o `catch` não limpa `data`), mas `SarakTableView.tsx:15` troca **todo** o
  conteúdo pelo estado de erro quando há `error`. O mesmo vale para `SarakCardGrid.tsx:210`, `SarakChart.tsx:63` e
  `SarakStats.tsx:67`. Só o `SarakManagementGrid.tsx:107` mostra um alerta e mantém o dado.
- **Não há carimbo de leitura.** Nenhum template diz quando o dado foi lido; não existe estado "desatualizado".
- **Números proporcionais.** `SarakValue` (`Atoms/SarakValue.tsx`) e `SarakStats` não usam `tabular-nums`; só
  calendário, seletor de horário e intervalo usam.
- **Selo só de cor, e de cor fixa.** `Feedback/SarakBadge.tsx:55-72` pinta `success`/`danger`/`warning`/`info` com
  cores fixas do Tailwind (`green-500`, `red-500`…), não pelos tokens de status, e não tem forma por status (item 22
  do backlog, promovido nesta plan). WCAG 1.4.1: cor nunca é o único meio.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Templates/` — `SarakTable` (view e view model), `SarakCardGrid`, `SarakChart`, `SarakStats` e os hooks de dado deles (`hooks/useSarakTableData.ts`, `useCardGridState.ts`, `useChartData.ts`, `useSarakStatsData.ts`).
- `src/components/atomic/Atoms/SarakValue.tsx` — dígitos tabulares.
- `src/components/atomic/Feedback/SarakBadge.tsx` — cores pelos tokens de status e forma por status.
- `src/core/i18n/catalogEntries.part*.ts` — textos novos (carimbo, desatualizado), nos idiomas do catálogo.
- Testes dos arquivos tocados; artefatos regenerados (`npm run catalog`, `npm run guide`); `docs/migracoes.md`, nota na seção da próxima versão.

## 3.2 Fora
- `SarakManagementGrid` (já mantém o dado), `SarakForm` (não é exibição), `SarakDataTable`/`SarakDataGrid` (grades sem `load`).
- Cache, nova tentativa automática ou modo offline — a lib não faz rede ([[10-seguranca-e-acessibilidade]] §3.2).
- Qualquer spec em `specs/`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `arquitetura/03-superficie-publica.md` §6.3 e §6.3.1 | o contrato de `data`/`load` e dos três estados |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §3 e §3.6 | acessibilidade e textos traduzidos |
| Spec fixa | `specs/09-temas-e-presets.md` §4.4.3 | os tokens de status com consumidor |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | os casos da §5 |
| **Skill** | `ui-arquitetura-design` | cor por token, sem hexadecimal |
| Código | `src/components/atomic/Templates/SarakManagementGrid.tsx` | o padrão que já mantém o dado com alerta |
| Código | `src/components/atomic/Templates/SarakTableView.tsx`, `src/components/atomic/Templates/hooks/useSarakTableData.ts` | o estado atual |

# 5. Instruções de execução

1. Nos quatro templates da §3.1: com dado já carregado, a falha de um recarregamento mantém o dado na tela e mostra o erro (com `onRetry`/"Tentar de novo") acima dele; sem dado nenhum, o estado de erro continua como hoje.
2. Carimbo de leitura: no modo `load`, o template guarda o horário da última leitura bem-sucedida e o mostra, curto ("Leitura das 22:12", no idioma da lib); no modo `data`, o host pode informar `updatedAt` (`Date`, `string` ou `number`). Depois de uma falha, o carimbo marca o dado como **desatualizado**.
3. `SarakValue` e os números do `SarakStats` em `font-variant-numeric: tabular-nums`.
4. `SarakBadge`: as variantes de status leem os tokens de status do tema (sem cor fixa) e desenham, por padrão, uma forma distinta por status (por exemplo ● ▲ ◆), desligável por prop; o rótulo continua sendo o conteúdo.
5. Testes: falha depois de sucesso mantém as linhas/cartões/métricas e mostra o erro (falha no código atual); carimbo presente e marcado como desatualizado depois da falha; `SarakBadge` sem classe de cor fixa e com a forma por status; `SarakValue` com `tabular-nums`.
6. Regenerar artefatos; nota de migração (o selo muda de desenho por padrão — classificar).
7. Rodar a verificação da §7.

# 6. Critérios de aceite

- [ ] Nos quatro templates, falha depois de sucesso mantém o dado e mostra o erro com "Tentar de novo" (teste que falha no `HEAD`).
- [ ] Carimbo de leitura no modo `load` e `updatedAt` no modo `data`; "desatualizado" depois de uma falha.
- [ ] `grep -nE "green-500|red-500|yellow-500|blue-500" src/components/atomic/Feedback/SarakBadge.tsx` → vazio; forma por status presente e desligável.
- [ ] `SarakValue` e `SarakStats` com `tabular-nums`.
- [ ] Item 22 removido do `00-backlog` pelo revisor no veredito.
- [ ] Suíte completa verde; `tsc` 0; `audit:baseline` sem regressão; catálogo, kit e barril em dia.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento dos templates e dos átomos, coberto pelos testes do passo 5.

- `git diff --stat` → só a §3.1 e os gerados.
- Mutação: voltar o `if (error)` que troca a tela inteira num template → o teste dele falha.
- `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline` · `catalog:check` · `guide:check` · `barrel:check`.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md`

Para a §6.3, depois de "o estado de erro se ela rejeita", pronto para transporte:

> Com dado já carregado, uma falha de recarregamento **não apaga a tela**: o dado fica, com o erro e "Tentar de novo"
> acima dele. O template mostra o horário da última leitura (no modo `data`, o que o host passar em `updatedAt`) e o
> marca como desatualizado depois de uma falha.

Para a §6.3.1: `SarakValue` e `SarakStats` usam dígitos tabulares; o `SarakBadge` de status tem forma, rótulo e a cor
do token de status.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
