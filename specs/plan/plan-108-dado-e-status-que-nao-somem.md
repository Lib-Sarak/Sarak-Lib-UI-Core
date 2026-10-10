---
tipo: "plan"
titulo: "Manter o ultimo dado na falha, carimbar a leitura e mostrar status sem depender so de cor"
objetivo: "Fazer os templates de dado manterem o ultimo dado com o horario quando o recarregamento falha, mostrarem quando o dado esta desatualizado, alinharem numeros em digitos tabulares e o selo de status ter forma, rotulo e cor do tema"
dominio: "Templates de dado / Feedback / Exibicao de dados"
status: "🟢 Aprovada"
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

## Resumo da execução — 2026-10-10

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- `useHostData.ts:32` concentra os quatro carregadores, preserva o último dado e carimbo em falha e registra a hora em sucesso.
- `SarakDataFreshness.tsx:11` e `SarakDataErrorNotice.tsx:10` apresentam carimbo, estado desatualizado, erro e ação de nova tentativa traduzidos.
- `SarakCardGrid.tsx:76`, `cardGridParts.tsx:35`, `SarakChart.tsx:81`, `SarakStats.tsx:59` e `SarakTableView.tsx:11` mantêm o conteúdo após falha e colocam o aviso acima dele.
- `SarakValue.tsx:52` usa dígitos tabulares; `SarakBadge.tsx:19` usa propriedades de status do tema e formas distintas que podem ser desligadas.
- `catalogEntries.part6.ts:140` inclui os novos textos nos seis idiomas; `docs/migracoes.md:224` registra a mudança como MAJOR na entrada `8.0.0`.
- Os geradores de catálogo e guia foram executados; os arquivos gerados listados abaixo acompanham a fotografia atual do worktree compartilhado.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `docs/component-catalog.json` | gerado | catálogo regenerado |
| `docs/component-catalog.md` | gerado | catálogo regenerado |
| `docs/migracoes.md` | alterado | subseção MAJOR sobre dados preservados e badges de status em `8.0.0` |
| `sarak-ui/GUIA-FRONTEND.md` | gerado | guia regenerado |
| `sarak-ui/START-HERE.md` | gerado | ponto de entrada do kit regenerado |
| `sarak-ui/VERSION` | gerado | versão/hash do kit regenerado |
| `sarak-ui/catalog.json` | gerado | catálogo do kit regenerado |
| `sarak-ui/docs/migracoes.md` | gerado | cópia gerada das notas de migração |
| `specs/plan/plan-108-dado-e-status-que-nao-somem.md` | alterado | status e resumo append-only desta execução |
| `src/components/atomic/Atoms/SarakValue.tsx` | alterado | números tabulares |
| `src/components/atomic/Atoms/__tests__/SarakValue.test.tsx` | alterado | asserção para dígitos tabulares |
| `src/components/atomic/Feedback/SarakBadge.tsx` | alterado | cores de status por propriedade do tema e formas opcionais |
| `src/components/atomic/Feedback/__tests__/SarakBadge.test.tsx` | alterado | cobertura de cores por status e formas |
| `src/components/atomic/Templates/SarakCardGrid.tsx` | alterado | estado de erro com dados preservados, carimbo e retry |
| `src/components/atomic/Templates/cardGridParts.tsx` | criado | filtros, cabeçalho e conteúdo do grid extraídos em partes menores |
| `src/components/atomic/Templates/SarakChart.tsx` | alterado | estado de erro com dados preservados, carimbo e retry; plot separado |
| `src/components/atomic/Templates/SarakStats.tsx` | alterado | estado de erro com métricas preservadas, carimbo e retry |
| `src/components/atomic/Templates/SarakTable.tsx` | alterado | prop `updatedAt` |
| `src/components/atomic/Templates/SarakTableErrorState.tsx` | alterado | aviso compartilhado e assinatura tipada |
| `src/components/atomic/Templates/SarakTableView.tsx` | alterado | mantém linhas e apresenta aviso/carimbo |
| `src/components/atomic/Templates/SarakTableViewParts.tsx` | alterado | props de estado e carimbo |
| `src/components/atomic/Templates/SarakDataErrorNotice.tsx` | criado | aviso compartilhado com ação de retry |
| `src/components/atomic/Templates/SarakDataFreshness.tsx` | criado | carimbo de leitura e estado desatualizado |
| `src/components/atomic/Templates/useSarakTableViewModel.ts` | alterado | encaminha `updatedAt` e estado de dados |
| `src/components/atomic/Templates/hooks/dataTimestamp.ts` | criado | valida e normaliza `Date`, string ou número |
| `src/components/atomic/Templates/hooks/useHostData.ts` | criado | carregamento compartilhado com retenção de dados em falha |
| `src/components/atomic/Templates/hooks/useCardGridState.ts` | alterado | usa carregamento compartilhado |
| `src/components/atomic/Templates/hooks/useChartData.ts` | alterado | usa carregamento compartilhado |
| `src/components/atomic/Templates/hooks/useSarakStatsData.ts` | alterado | usa carregamento compartilhado |
| `src/components/atomic/Templates/hooks/useSarakTableData.ts` | alterado | usa carregamento compartilhado e memoiza filtragem |
| `src/components/atomic/Templates/__tests__/SarakCardGrid.data.test.tsx` | alterado | retenção de cards e retry após falha |
| `src/components/atomic/Templates/__tests__/cardGridParts.test.tsx` | criado | filtragem por texto e filtros ativos |
| `src/components/atomic/Templates/__tests__/SarakChart.test.tsx` | alterado | retenção de pontos e retry após falha |
| `src/components/atomic/Templates/__tests__/SarakStats.test.tsx` | alterado | retenção de métricas, retry e dígitos tabulares |
| `src/components/atomic/Templates/__tests__/SarakTable.data.test.tsx` | alterado | retenção de linhas, retry e timestamps nos três formatos |
| `src/components/atomic/Templates/__tests__/SarakDataErrorNotice.test.tsx` | criado | mensagem de erro e ação opcional |
| `src/components/atomic/Templates/__tests__/SarakDataFreshness.test.tsx` | criado | horário, estado desatualizado e timestamp inválido |
| `src/components/atomic/Templates/hooks/__tests__/useHostData.test.ts` | criado | prioridade de dados do host e retenção após falha |
| `src/components/atomic/Templates/hooks/__tests__/useCardGridState.test.ts` | alterado | mantém cards e horário após falha de retry |
| `src/components/atomic/Templates/hooks/__tests__/useChartData.test.ts` | alterado | mantém pontos e horário após falha de retry |
| `src/components/atomic/Templates/hooks/__tests__/useSarakStatsData.test.ts` | alterado | mantém métricas e horário após falha de retry |
| `src/components/atomic/Templates/hooks/__tests__/useSarakTableData.test.ts` | alterado | mantém linhas e horário após falha de retry |
| `src/core/i18n/catalogEntries.part6.ts` | alterado | novos textos de carimbo e desatualização nos seis idiomas |

**Verificações executadas**
- `npm run catalog` → gerou catálogo para 102 componentes.
- `npm run guide` → gerou o kit com 105 componentes, 437 tokens e 117 ícones.
- `npm run catalog:check` → catálogo em dia.
- `npm run guide:check` → kit em dia (7 arquivos).
- `npm run barrel:check` → 102 componentes registrados, 0 faltas.
- `npm run audit:baseline` → igual ao baseline de 2026-08-11, sem regressão.
- Validador `padrao-typescript` nos arquivos do escopo → nenhum achado de alta confiança; os seis números de massa no teste de gráfico são heurísticas de baixa confiança, conforme a regra da skill.
- Busca por `green-500|red-500|yellow-500|blue-500` em `SarakBadge.tsx` → sem ocorrências.
- `npx tsc --noEmit` → saiu com 1 erro em `src/components/atomic/Media/SarakPDFViewer/__tests__/usePdfDocument.test.ts:4`, fora do escopo 105; nenhum erro reportado nos arquivos desta plan.
- `npx vitest run` focado nos 10 testes do escopo → 10 suítes falharam antes da coleta, com `EPERM` ao renomear arquivos temporários; 0 testes executados.
- `npx vitest run` (suíte completa) → interrompido após vários arquivos reportarem `0 test`; o resumo final não foi obtido. Nenhuma estratégia alternativa ou repetição foi usada.
- `npm run build`, `npm run build:js`, `npm run build:css` e `public-types:check` → não executados, conforme instrução do usuário.

**Critérios de aceite**
- [x] Os quatro templates preservam dados e exibem erro/retry; testes correspondentes adicionados — evidência: `SarakCardGrid.tsx:93`, `SarakChart.tsx:122`, `SarakStats.tsx:84`, `SarakTableView.tsx:26`.
- [x] `updatedAt` aceita `Date`, string e número; o modo `load` carimba sucesso e a falha mantém o horário — evidência: `useHostData.ts:32`, `dataTimestamp.ts:1`.
- [x] O badge usa as propriedades de status do tema, sem classes Tailwind de cor fixa, e tem forma desligável — evidência: `SarakBadge.tsx:19`.
- [x] `SarakValue` usa `tabular-nums`, também aplicado aos valores de `SarakStats` — evidência: `SarakValue.tsx:52`.
- [ ] Item 22 removido do backlog — reservado ao revisor, conforme a plan.
- [ ] Suíte completa verde e `tsc` global sem erros — coleta Vitest bloqueada por `EPERM`; typecheck ainda aponta o erro fora do escopo citado acima.
- [x] Baseline, catálogo, kit e barril em dia — evidência nas saídas acima.

**Decisões e suposições**
- Um hook compartilhado concentra a retenção de dados, erro, loading e carimbo para evitar quatro implementações divergentes.
- O badge soft combina a cor tokenizada com `color-mix`; o solid mantém o texto do tema e colore fundo/borda pelo status.
- A execução foi encerrada sem trocar paralelismo, cache ou configuração de teste, para respeitar a instrução sobre `EPERM`.

**Achados fora do escopo (não corrigidos)**
- `src/components/atomic/Inputs/SarakMultiSelect.tsx:118` e `SarakUploader.tsx:118` — auditoria aponta `<input>` nativo cru; arquivos da plan 105.
- `src/components/atomic/Media/SarakPDFViewer/__tests__/usePdfDocument.test.ts:4` — import de `SarakUIProvider` não resolvido no typecheck; arquivo da plan 105.

**Pendências / riscos**
- Os testes foram escritos, mas não executaram devido ao erro de ambiente do Vitest; o revisor deve repetir a suíte quando a execução concorrente e o `EPERM` não estiverem presentes.
- A validação global de tipos depende do ajuste pertencente à plan 105; as verificações de build e tipos públicos ficam para o revisor, como solicitado.

## Resumo da execução (correção 1) — 2026-10-10

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
Árvore compartilhada com alterações já existentes da execução da plan 108 e das plans 105/106; consulte o resumo anterior para a fotografia inicial. Os arquivos fora deste escopo foram preservados.

**O que foi feito**
- `SarakBadge.tsx` — as variantes sólidas de status usam texto escuro; teste mede contraste mínimo de 4,5:1 sobre as cores embarcadas, nas paletas base e contrapartes disponíveis.
- `SarakBadge.tsx` e `SarakBadge.test.tsx` — o aviso usa ▲, o crítico usa ◆ e as expectativas acompanham a convenção da plan.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Feedback/SarakBadge.tsx` | alterado | Contraste do texto sólido e formas de aviso/crítico corrigidos. |
| `src/components/atomic/Feedback/__tests__/SarakBadge.test.tsx` | alterado | Expectativas dos símbolos e medição de contraste dos temas embarcados. |
| `specs/plan/plan-108-dado-e-status-que-nao-somem.md` | alterado | Registro desta correção; status voltou para revisão. |

**Verificações executadas**
- `npx tsc --noEmit` → concluído com código 0.
- `npx vitest run src/components/atomic/Feedback/__tests__/SarakBadge.test.tsx` → falhou antes da coleta, com `EPERM` ao renomear arquivo temporário; 0 testes executados. Não houve repetição nem mudança de configuração.

**Critérios de aceite**
- [x] Texto das variantes sólidas legível sobre os tokens de status embarcados — evidência: `SarakBadge.test.tsx`, teste de contraste mínimo WCAG AA em todas as paletas base e contrapartes disponíveis.
- [x] Formas seguem a convenção de aviso/crítico — evidência: `SarakBadge.tsx` e expectativas em `SarakBadge.test.tsx`.
- [ ] Teste do SarakBadge executado — motivo: `EPERM` antes da coleta; validação isolada fica para o revisor, conforme instrução do usuário.

**Decisões e suposições**
- Usei `text-black` nas variantes sólidas; as medições do teste exigem contraste mínimo 4,5:1 para cada cor de status incluída nos temas embarcados.

**Achados fora do escopo (não corrigidos)**
- Nenhum nesta rodada.

**Pendências / riscos**
- A suíte focada não coletou testes por causa do `EPERM`; o revisor deve validar a plan isolada na cópia de `HEAD` descrita no veredito.

## Resumo da execução (correção 2) — 2026-10-10

**Resultado:** Concluído

**Estado do worktree ao iniciar**
```text
MM specs/plan/plan-108-dado-e-status-que-nao-somem.md
M  src/components/atomic/Templates/SarakCardGrid.tsx
A  src/components/atomic/Templates/cardGridParts.tsx
```

**O que foi feito**
- `cardGridParts.tsx` — `CardGridHeader` ganhou uma fronteira ancestral `@container`, e `CardGridResults` envolve o grid responsivo em um ancestral com a mesma classe; o gate é por arquivo e consulta descendentes.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Templates/cardGridParts.tsx` | alterado | Fronteiras `@container` locais para os estilos responsivos. |
| `specs/plan/plan-108-dado-e-status-que-nao-somem.md` | alterado | Registro da correção do achado da rodada 3. |

**Verificações executadas**
- `npm run container-query-boundary:check` → `[OK]` em todos os arquivos verificados.
- `npx tsc --noEmit` → concluído com código 0.

**Critérios de aceite**
- [x] O gate `container-query-boundary:check` passa — evidência: saída `[OK]`.
- [x] Typecheck global sem erros — evidência: saída com código 0.

**Decisões e suposições**
- A fronteira foi colocada num ancestral real dos elementos responsivos, em vez de no próprio grid, para que as container queries tenham um contexto válido.

**Achados fora do escopo (não corrigidos)**
- Nenhum nesta rodada.

**Pendências / riscos**
- Nenhum identificado para o achado desta rodada. `npm run build` não foi executado, conforme instrução do usuário.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-10 — 🔴 Reprovado

**Como foi verificado:** a árvore está compartilhada com a 105 e a 106; a 108 foi validada **isolada** — cópia de `git archive HEAD` fora do repositório com só os 34 arquivos desta plan (`Templates/`, `SarakValue`, `SarakBadge`, `catalogEntries.part6.ts`, inclusive os novos não rastreados) e `node_modules` por junção. Nela: **14 arquivos de teste, 58/58 verdes**; `tsc` **0**; `audit:baseline` igual ao baseline. **Mutação:** os testes da plan contra o código do `HEAD` → **19 testes novos falham** (retenção do dado nos quatro templates e nos quatro hooks, carimbo nos três formatos de `updatedAt`, tokens do `SarakBadge` e `tabular-nums`). Lido o diff: `useHostData` concentra a retenção (a falha não limpa `data` nem `updatedAt`); `SarakDataErrorNotice` acima do conteúdo; `SarakDataFreshness` com `Intl` no idioma da lib; nota MAJOR dentro da entrada `## 8.0.0`, sem separador novo. Critérios de retenção, carimbo, `tabular-nums` e "sem cor fixa no badge" atendidos.

**Achados:**

1. `src/components/atomic/Feedback/SarakBadge.tsx` (`VARIANT_CLASSES`, variantes de status `solid`) — com `soft={false}`, o texto das variantes de status passou a ser `text-theme-text` (`--color-theme-text` → `--text-main`) sobre a cor **cheia** do status. Num tema escuro, isso é texto claro sobre o âmbar do aviso (`statusWarningColor: #f59e0b` no `sarak-sovereign`): cerca de **2:1**, abaixo de 4,5:1 (R31, [[10-seguranca-e-acessibilidade]]); no `HEAD` o aviso sólido usava texto preto. O selo sólido tem de ficar legível nos dois modos — com uma cor de texto que contraste com a cor do status, provada por teste ou medida nos temas embarcados.
2. `SarakBadge.tsx` (`STATUS_SHAPES`) — `danger: ▲` e `warning: ◆` invertem a convenção que a própria plan exemplifica ("● ▲ ◆" para normal, aviso, crítico) e a do material de origem: o triângulo é o sinal universal de **aviso**. Trocar para `warning: ▲` e `danger: ◆`, e o teste acompanhar.

## Veredito — 2026-10-10 (rodada 2) — 🟢 Aprovado

**Achados da rodada anterior, conferidos:** (1) as variantes sólidas de status usam `text-black`; `SarakBadge.test.tsx` confere a classe no componente **e** mede preto contra a cor de status de todos os temas de `SARAK_GLOBAL_THEMES`, base e contraparte, exigindo ≥ 4,5:1 — voltar ao texto do tema derruba o primeiro caso; (2) `warning: ▲`, `danger: ◆`, com o teste acompanhando. Validação isolada (`HEAD` + os 34 arquivos da plan): 63/63, `tsc` 0, `audit:baseline` igual. **Limite que fica:** o texto preto é garantido para as cores de status embarcadas; um tema do consumidor com cor de status escura perde contraste na variante sólida (a `soft`, padrão, não é afetada).

**Suíte completa, na árvore com as plans 105, 106 e 108 juntas:** `npx vitest run` → 438 arquivos e 2659 testes verdes (2026-10-10; uma primeira rodada teve 2 estouros de tempo em ganchos de testes que varrem o repositório, `kitGenerator` e `check-barrel-parity` — passaram sozinhos, e a repetição veio inteira verde). Na mesma árvore: `tsc` 0, `audit:baseline` igual ao baseline. `npm run build` oficial (rodado pelo revisor, com rede) e `npm run dev-kit`: `public-types:check`, `barrel:check`, `catalog:check`, `guide:check` e `dev-kit:check` em dia. `dist/index.d.ts` traz `updatedAt`.

**Critérios de aceite:** todos atendidos. O item 22 já saiu do `00-backlog` (promovido nesta plan).

## Veredito — 2026-10-10 (rodada 3) — 🔴 Reprovado (aprovação reaberta)

**Por que reabre:** o `pre-commit` barrou o commit desta plan no Anel 1. O revisor aprovou sem rodar os gates do Anel 1 — o `container-query-boundary:check` não roda no `build` nem no `run_audit` —, e a falha é da revisão tanto quanto da execução. Rodados agora todos os gates do Anel 1 na árvore: só este falha.

**Achado:**

1. `src/components/atomic/Templates/cardGridParts.tsx` (arquivo novo desta plan) chama `getGridStyles` e `getResponsiveStackStyles`, que emitem classes `@min-[…]`, sem plantar `@container` num ancestral **no mesmo arquivo** — o `@container` ficou em `SarakCardGrid.tsx`, e o gate é por arquivo (limite declarado dele). `npm run container-query-boundary:check` → `[ERROR]`. Regra: [[07-responsividade-e-multidispositivo]] §6.1. Enquanto isto não passar, o `pre-commit` barra **qualquer** commit, inclusive o das plans 105 e 106: o gate varre `src/` inteiro.

## Veredito — 2026-10-10 (rodada 4) — 🟢 Aprovado

**Achado da rodada 3, conferido:** `cardGridParts.tsx` planta `@container` no ancestral do `CardGridHeader` e num invólucro do `CardGridResults`, no mesmo arquivo; `container-query-boundary:check` → `[OK]`. O `md:items-center` do cabeçalho já existia no `HEAD` (não é desta plan).

**Desta vez com todos os gates do Anel 1 do `pre-commit`, na árvore com as plans 105, 106 e 108:** `container-query`, `container-query-boundary`, `persistence-doc`, `class-merge`, `icon-port`, `chrome-token-parity`, `gate-limits`, `deep-import`, `zero-brand`, `barrel`, `catalog`, `guide`, `dev-kit` — todos verdes; `tsc` 0; `audit:baseline` igual ao baseline; `src/components/atomic/Templates` → 49 arquivos, 137 testes verdes (o único snapshot que toca a grade, o do `SarakCoreCard`, inalterado). A mudança é um invólucro e uma classe; a suíte completa da rodada 2 vale para o resto.
