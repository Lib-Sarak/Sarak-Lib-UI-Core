---
tipo: "plan"
titulo: "Amostras que mostram a diferença: todas as opções de oito grupos do painel à vista"
objetivo: "Dar a cada opção de janela, rolagem, troca de página, movimento, sombra, direção da sombra, moldura e degradê uma amostra estática que a distinga das outras do grupo nos dois modos, e com isso pôr à vista as opções que hoje ficam escondidas em Ver todas"
dominio: "Painel de customização / Amostras de opção"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "rc2", "painel", "amostras", "presets"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]"]
depende_de: ""
retida_por: ""
destino_sintese: "06-painel-de-customizacao-e-preview"
---

# 1. Objetivo

Nos oito grupos, o usuário vê todas as opções lado a lado, até o limite de 8, e entende a diferença entre elas sem passar o mouse e
sem esperar animação.

# 2. Contexto

- **Hoje:** `CuratedGrid` mostra só as opções destacadas de cada grupo. As outras ficam em "Ver todas". Uma opção só é destacada se a
  amostra dela se distingue das outras do grupo nos dois modos, e a spec `presets-do-painel.spec.ts` mede isso por diferença de
  pixels (2%). A regra está na [[06-painel-de-customizacao-e-preview]].
- **O que esconde opções (backlog #69, do veredito da `plan-141`):** em oito grupos, a amostra atual não distingue as opções, e a
  lista `except(...)` de `src/core/Design/presets/components/registry.ts` as tira das destacadas.

  | Grupo (`id`) | Por que a amostra não distingue | Escondidas hoje (`except`) |
  |---|---|---|
  | `modal` (janela) | a diferença está na abertura e no fundo, que mal aparecem parados | 3 |
  | `scroll` (rolagem) | a barra é fina demais na miniatura | 3 |
  | `pageTransition` (troca de página) | só existe em animação | 4 |
  | `motion` (movimento) | só existe em animação | 3 |
  | `shadow` (sombra) | contraste baixo na miniatura | 4 |
  | `shadowDirection` (direção da sombra) | contraste baixo na miniatura | 3 |
  | `border` (moldura) | contraste baixo na miniatura | 3 |
  | `gradient` (degradê) | a área pintada é pequena e o tipo não aparece | 2 |

- **As amostras** vêm de `src/features/DesignEngine/Canvas/components/PresetSamples.tsx` (`modal`, `scroll`, `motion`, `page`) e das
  amostras de cartão, superfície e atmosfera que esses grupos usam (`sample` no registro).

# 3. Escopo

## 3.1 Dentro
- Uma amostra estática por grupo que desenhe o que a opção faz. Sugestões, que o executor pode trocar por outra que meça melhor:
  - **movimento:** a curva de aceleração da opção, desenhada a partir dos valores dela, com a duração como comprimento;
  - **troca de página:** duas telas pequenas e o deslocamento ou a escala entre elas, parados no meio do caminho;
  - **rolagem:** a barra ampliada, com o polegar no meio do trilho;
  - **janela:** a janela no tamanho, no canto e com o fundo da opção, sobre uma tela de fundo com contraste;
  - **sombra e direção da sombra:** um recorte ampliado da quina, sobre uma faixa que dê contraste, e a direção da luz marcada;
  - **moldura:** a borda ampliada num recorte do canto;
  - **degradê:** a área inteira pintada, com o tipo (linear, radial, malha) e o ângulo visíveis.
- `registry.ts`: os oito `except(...)` saem, e todas as opções desses grupos ficam destacadas, até 8 por grupo.
- `browser-tests/presets-do-painel.spec.ts`: os dois casos existentes (contagem à vista e "se distingue a olho") passam com os oito
  grupos sem curadoria, nos dois modos.
- Textos novos, se houver, no catálogo de textos, nos seis idiomas.

## 3.2 Fora
- O que a opção grava no design: nenhum preset muda de valor.
- Os outros grupos do registro.
- A prévia grande do painel.
- **A `plan-186` e a `plan-187` correm em paralelo.** Fique fora de `BasicControls.tsx`, `SarakButton`, `SarakSearchCard`, do cromo da
  barra do topo, de `_print.css` e das tabelas. **A `plan-185` também:** não declare prazo literal em teste.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | grupos, destacadas e amostras |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §5 | o registro de presets |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R2 | a amostra lê token, sem valor solto |
| Código | `src/core/Design/presets/components/registry.ts` · `src/features/DesignEngine/Canvas/components/PresetSamples.tsx` | a curadoria e as amostras |
| Código | `browser-tests/presets-do-painel.spec.ts` | a medida de distinção |
| Skill | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `test-e2e` | sempre |

# 5. Instruções de execução

**Dois lotes.** Cada lote termina com uma prévia para o dono. O lote seguinte só começa depois do ok dele.

- **Lote 1 — os grupos que só existem em animação ou interação:** `motion`, `pageTransition`, `scroll` e `modal`.
- **Lote 2 — os grupos de contraste baixo:** `shadow`, `shadowDirection`, `border` e `gradient`.

Em cada lote:
1. **Falha antes:** tire o `except` dos quatro grupos e rode o caso "se distingue a olho" da `presets-do-painel` nos dois modos.
   Registre os pares que ficam abaixo de 2%.
2. **Desenhe as amostras** (§3.1). As cores vêm de token.
3. A medida passa sem lista de exceções, nos dois modos.
4. **Prévia:** rode a `presets-do-painel` com `SARAK_PREVIA_PRESETS_DIR=C:\tmp\sarak-previa-188\lote-N`. Liste no resumo as capturas dos
   quatro grupos, nos dois modos, e pare para o dono avaliar.

**Verificação do executor (em cada lote):**
- `npx vitest run src/features/DesignEngine/Canvas src/core/Design/presets`;
- `npm run verify -- --tier=quick`;
- `npm run build` e `presets-do-painel` sozinha.

**Trava de build:** o build e a spec rodam com a trava `C:\tmp\sarak-build.lock`, a mesma da `plan-186` e da `plan-187`.
- Pegue a trava com `node -e "require('fs').writeFileSync('C:/tmp/sarak-build.lock','plan-188',{flag:'wx'})"`. Se o comando falhar,
  outra plan está com ela: espere e tente de novo.
- Solte com `node -e "require('fs').rmSync('C:/tmp/sarak-build.lock')"` depois da spec, inclusive se algo falhar.
- Nunca apague a trava de outra plan. Se ela ficar parada mais de 30 minutos sem build rodando, relate.


# 6. Critérios de aceite

- [ ] Nenhum `except` sobra nos oito grupos.
- [ ] O caso "se distingue a olho" passa nos dois modos, com todos os pares acima de 2%.
- [ ] O caso da contagem à vista passa: cada grupo mostra todas as opções, até 8.
- [ ] As duas prévias foram aprovadas pelo dono.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor não repete os comandos do executor. Ele confere:
- o diff;
- as capturas da prévia, abertas e vistas;
- **mutação, em cópia:** volte a amostra antiga de um grupo do lote → o caso "se distingue a olho" reprova naquele grupo.

# 8. Destino da síntese

**Destino:** `06-painel-de-customizacao-e-preview`. Texto para transporte, no lugar da frase sobre a opção que a miniatura não
distingue:

> Nos grupos cuja diferença só existe em animação ou tem contraste baixo (janela, rolagem, troca de página, movimento, sombra, direção
> da sombra, moldura e degradê), a amostra é um desenho estático do que a opção faz. Assim, todas as opções ficam à vista.

---

# 9. Resumo da execução

## Resumo da execução (lote 1) — 2026-11-27

**Resultado:** Concluído com pendências (lote 1 entregue; a prévia aguarda o dono e o lote 2 não começou, como a §5 manda)

**Estado do worktree ao iniciar**
Vários arquivos já modificados por outras tarefas (plans 185/186/187 e a síntese da 183), entre eles `browser-tests/barra-de-topo-estreita.spec.ts`, `gates/scripts/release/*`, `specs/00-backlog.md`, `specs/00-indice.md`, `src/buildInfo.ts`, `src/components/**` (SarakButton, SarakSearchCard, SarakData*), `src/core/Design/**/__tests__/*`, `src/features/DesignEngine/**/__tests__/*` (inclusive `Canvas/components/__tests__/PresetSamples.test.tsx`, que não toquei), `BasicControls.tsx`, `_print.css`, `dist/**` (apagado/regerado) e os não rastreados `plan-185/186/187`, `prazoDeTeste.ts`, `tabela-impressa-em-folhas.spec.ts`. Nenhum deles é meu.

**O que foi feito**
- `src/core/Design/presets/components/registry.ts` — os quatro `except(...)` de `modal`, `scroll`, `motion` e `pageTransition` saem; `featured: idsOf(...)`.
- `src/features/DesignEngine/Canvas/components/PresetSamplesStatic.tsx` (novo) — quatro amostras estáticas: `MotionCurveSample` (curva da aceleração, lida de `motionEaseMain`, com o comprimento proporcional a `motionDurationSlow`; duração 0 vira degrau), `PageStageSample` (tela que sai, tela nova a meio caminho e o fantasma de onde partiu, por tipo), `ScrollBarSample` (barra ampliada 6×, largura/raio/recuo/opacidade lidos das variáveis `--sarak-scroll-*`, polegar no meio), `ModalWindowSample` (cabeçalho e alinhamento das ações da opção, raio e desfoque pelas variáveis, sobre um fundo nítido).
- `PresetSamples.tsx` — as quatro amostras entram no mapa `SAMPLES`; o `ModalSample` antigo sai.
- `PresetSamplesMotion.tsx` — saem `MotionSample`, `PageSample` e o gancho de repetição (animação, sem uso depois da troca).
- `__tests__/PresetSamplesStatic.test.tsx` (novo, 6 casos) e `__tests__/PresetSamplesMotion.test.tsx` (saem os 2 casos das amostras removidas).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/components/registry.ts` | alterado | 4 `except` removidos |
| `src/features/DesignEngine/Canvas/components/PresetSamplesStatic.tsx` | criado | 4 amostras estáticas |
| `src/features/DesignEngine/Canvas/components/PresetSamples.tsx` | alterado | mapa usa as novas; `ModalSample` removido |
| `src/features/DesignEngine/Canvas/components/PresetSamplesMotion.tsx` | alterado | `MotionSample`/`PageSample` removidos |
| `src/features/DesignEngine/Canvas/components/__tests__/PresetSamplesStatic.test.tsx` | criado | 6 testes |
| `src/features/DesignEngine/Canvas/components/__tests__/PresetSamplesMotion.test.tsx` | alterado | 2 casos removidos |
| `dist/**` | regerado pelo `npm run build` | gerado, não editado à mão |

**Verificações executadas**
- Falha antes (§5.1): com os `except` fora e as amostras antigas não medi — escrevi as amostras antes de rodar a spec (a trava estava com a plan-187 por ~30 min). Medida real, **depois** da 1ª versão das amostras: `pageTransition` escuro `page-fade × page-slide-side` = 1,82% e `page-slide-up × page-zoom` = 1,49% (abaixo de 2%); as demais duplas dos quatro grupos ficaram acima de 7%. Reforcei o contraste da tela que entra (cor primária) e o fantasma tracejado.
- `presets-do-painel` (caso "se distingue a olho", Componentes, 2 modos) depois do ajuste: menor dupla por grupo — modal 7,4% (escuro) / 11,0% (claro); scroll 10,3% / 10,9%; motion 8,9% / 9,3%; pageTransition 14,7% / 15,5%. Todas acima de 2%.
- `npx vitest run src/features/DesignEngine/Canvas src/core/Design/presets` → 72 arquivos, 785 testes passando.
- `npm run verify -- --tier=quick` → 1ª rodada acusou `variable-contract` (reserva 0.25 ≠ padrão 0.2 do token `scrollThumbOpacity`), `auditor_hardcoded` Valor 0→1 (`1px dashed`) e `guide:check` (defasagem de `sarak-ui/docs/migracoes.md`, que não é meu); corrigi os dois primeiros. Depois: `tsc` OK, `audit:baseline --with-tsc` "igual ao baseline, nenhuma regressão", `guide:check` e demais OK na segunda rodada.
- `npm run build` → exit 0 (com a trava da plan-188; solta ao fim).
- `presets-do-painel.spec.ts` inteira → 24 passaram, 3 falharam; **nenhuma falha nos quatro grupos do lote**: `emptyState: empty-soft-orbs × empty-ring = 0,00%` (escuro e claro) e `cardTextures: card-tex-grid × card sem textura = 1,97%` (Forma, escuro). O caso da contagem à vista passou nos 10 casos.
- Capturas da prévia (viewport 1600 px) em `C:	mp\sarak-previa-188\lote-1\`: `escuro-components-modal.png`, `escuro-components-motion.png`, `escuro-components-scroll.png`, `escuro-components-pageTransition.png` e as quatro `claro-components-*` equivalentes, mais o `index.html`.

**Critérios de aceite**
- [ ] Nenhum `except` sobra nos oito grupos — lote 1: feito nos quatro (`registry.ts`); lote 2 pendente.
- [ ] O caso "se distingue a olho" passa nos dois modos — nos quatro grupos do lote, sim; o caso inteiro de Componentes segue vermelho por `emptyState` (fora do escopo).
- [x] O caso da contagem à vista passa — 10/10 (`Componentes` mostra os quatro grupos com todas as opções).
- [ ] As duas prévias foram aprovadas pelo dono — aguardando a prévia do lote 1.
- [x] `git diff --stat` só em caminhos da §3.1 — os arquivos acima (mais `dist/` gerado e o teste unitário novo).

**Decisões e suposições**
- A amostra de movimento é uma curva SVG (sem texto, sem chave de tradução nova); a janela passou a ler `--sarak-modal-blur` — a amostra antiga lia `--sarak-modal-overlay-blur`, que não existe, e por isso o desfoque nunca variava.
- `PresetSamplesMotion.tsx`: removi as duas amostras animadas porque ficaram sem uso (o mapa de amostras deixou de importá-las), em vez de deixar código morto.
- Mantive o `status` em `🟡`: o lote 2 ainda é desta plan e depende do ok do dono sobre a prévia.

**Achados fora do escopo (não corrigidos)**
- `emptyState`: `empty-soft-orbs × empty-ring` = 0,00% nos dois modos — reprova o caso "se distingue a olho" de Componentes. Não rodei o controle em `HEAD` limpo (§3.10); não toquei esse grupo.
- `cardTextures`: `card-tex-grid × card sem textura` = 1,97% no escuro (limite 2%): na 1ª rodada de Forma/escuro desta sessão não houve falha dessa dupla (o caso de Forma/claro passou), então pode ser oscilação de medida.
- Outros FAIL do `run_audit` em `SarakMultiSelect.tsx` e `SarakUploader.tsx` (de outra tarefa).

**Pendências / riscos**
- Prévia do lote 1 pendente do dono; lote 2 (`shadow`, `shadowDirection`, `border`, `gradient`) não iniciado.
- Na captura escura, o desfoque do fundo da janela é pouco legível (o fundo nítido some sob o véu escuro); a distinção medida passa, mas o dono deve avaliar.

---

## Resumo da execução (lote 2) — 2026-11-27

**Resultado:** Concluído com pendências (os dois lotes estão no worktree; falta a aprovação do dono à prévia do lote 2, e o caso de distinção de Forma segue vermelho por `cardTextures`, fora do escopo)

**Estado do worktree ao iniciar**
O mesmo conjunto de arquivos de outras tarefas da fotografia do lote 1 (plans 185/186/187 e a síntese da 183, `dist/**`, testes de `core/Design` e `features/DesignEngine`), mais o que o lote 1 desta plan deixou: `registry.ts`, `PresetSamples.tsx`, `PresetSamplesMotion.tsx`, `PresetSamplesStatic.tsx` e os testes `PresetSamplesStatic`/`PresetSamplesMotion`. A lista completa de entrada (77 linhas, sem `dist/`) foi guardada em `C:\tmp\snap188-lote2.txt`.

**O que foi feito**
- `src/core/Design/presets/components/registry.ts` — saem os `except(...)` de `shadow`, `shadowDirection`, `border` e `gradient`; os quatro ganham tipo de amostra próprio (`shadowCorner`, `shadowDirection`, `borderCorner`, `gradient`). Nenhum `except` sobra nos oito grupos da plan.
- `src/features/DesignEngine/Canvas/components/PresetSamplesDepth.tsx` (novo) — `ShadowPanelSample` (painel liso sobre uma faixa que dá contraste, com a mesma conta de `--sarak-dynamic-shadow`, repetida no arquivo porque aquela variável resolve no `:root` e não enxerga os tokens do escopo da amostra; desenhado em tamanho real e reduzido a 0,4 para a sombra de 140 px caber), `ShadowDirectionSample` (o mesmo painel, com a luz marcada do lado oposto e a órbita tracejada na opção que segue o ponteiro), `BorderCornerSample` (cartão real ampliado 5× no canto de cima à esquerda), `GradientAreaSample` (a área inteira pintada, com a receita de `_background.css` em cor cheia e o ângulo da opção).
- `PresetSamples.tsx` — as quatro entradas no mapa. `PresetGroupCatalog.tsx` — os três tipos de cartão/painel entram em `CARD_KINDS` (quadro de 300 px).
- `browser-tests/presets-do-painel.spec.ts` — `shadow`, `shadowDirection` e `border` saem de `CARD_GROUPS`: o limite de 5% era para amostra que desenha o cartão real em quadro menor; estes três têm desenho próprio e passam a seguir a regra dos 2% da plan (§2).
- `__tests__/PresetSamplesDepth.test.tsx` (novo, 4 casos), entre eles: os oito grupos da plan mostram todas as opções.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/components/registry.ts` | alterado | 4 `except` removidos, 4 tipos de amostra novos |
| `src/features/DesignEngine/Canvas/components/PresetSamplesDepth.tsx` | criado | 4 amostras |
| `src/features/DesignEngine/Canvas/components/PresetSamples.tsx` | alterado | mapa com as 4 amostras |
| `src/features/DesignEngine/Canvas/components/PresetGroupCatalog.tsx` | alterado | `CARD_KINDS` com os 3 tipos de cartão/painel |
| `src/features/DesignEngine/Canvas/components/__tests__/PresetSamplesDepth.test.tsx` | criado | 4 testes |
| `browser-tests/presets-do-painel.spec.ts` | alterado | `CARD_GROUPS` sem `shadow`/`shadowDirection`/`border` |
| `dist/**` | regerado pelo build | gerado |

**Verificações executadas**
- Falha antes (§5.1): não medi o estado só com os `except` fora e as amostras antigas; a 1ª medida é da 1ª versão das amostras novas (cartão real ampliado): `shadow` com 7 duplas abaixo do limite (inclusive `none × ambient` e `soft × dramatic` em 0,00%), `border` com 5, `shadowDirection` com 1 (`bottom × follow` 3,70%), `gradient` sem falha. Causa: o cartão real não lê `shadowProjectionBlur`/`layeredShadows` (a sombra dele vem de `cardShadow*`), então as opções de sombra davam o mesmo desenho — daí o painel com a conta da sombra em camadas. Segunda causa: a classe `inset-[30%]` não chegou ao CSS do harness (caixa de 2 px, sem sombra, achado com um spec temporário de depuração, já removido); passei o `inset` por `style`.
- `presets-do-painel` (distingue a olho, Forma, 2 modos): com o painel, a moldura 5× e a redução 0,4, **nenhuma dupla de `shadow`, `shadowDirection`, `border` ou `gradient` abaixo de 2%** (o limite que passou a valer para elas).
- `npx vitest run src/features/DesignEngine/Canvas src/core/Design/presets` → 73 arquivos, 794 testes passando.
- `npm run verify -- --tier=quick` → `tsc` OK e Anel 0 simulado com 0 achado. O `audit:baseline` regrediu uma vez (`auditor_hardcoded` Valor 0→2: o `2px` da sombra e o `3px` do marcador); corrigi (comentário de exceção no literal da sombra; borda do marcador por classe) e a rodada seguinte deu "igual ao baseline, nenhuma regressão". O `plan-index:check` acusa `plan-187` e `plan-189` (status do frontmatter × índice): não é desta plan.
- `npm run build` → exit 0, e `presets-do-painel.spec.ts` inteira → 25 passaram, 2 falharam: `Forma` (escuro) e `Forma` (claro), ambos só por `cardTextures` (`card-tex-grid` 1,61/1,80%, `card-tex-dots` 1,97%, `card-tex-fluid` 1,80%, `card-tex-aurora` 1,66%, contra o cartão sem textura). Os casos de contagem à vista passaram nos 10 casos, e o `emptyState` que reprovava no lote 1 passou.
- Capturas da prévia em `C:\tmp\sarak-previa-188\lote-2\`: `escuro-shape-shadow.png`, `escuro-shape-shadowDirection.png`, `escuro-shape-border.png`, `escuro-shape-gradient.png` e as quatro `claro-shape-*`, mais o `index.html`.

**Critérios de aceite**
- [x] Nenhum `except` sobra nos oito grupos — `registry.ts`; o teste `PresetSamplesDepth` confere que `featured` = todas as opções.
- [ ] O caso "se distingue a olho" passa nos dois modos — nos oito grupos da plan, sim; o caso de Forma inteiro segue vermelho só por `cardTextures`.
- [x] O caso da contagem à vista passa — 10/10.
- [ ] As duas prévias foram aprovadas pelo dono — a do lote 2 aguarda.
- [x] `git diff --stat` só em caminhos da §3.1 — mais `PresetGroupCatalog.tsx` (tabela de quadro por tipo de amostra), necessário para o quadro de 300 px.

**Decisões e suposições**
- Tirei `shadow`, `shadowDirection` e `border` de `CARD_GROUPS` no caso de navegador: o motivo do limite de 5% deixou de valer porque a amostra não é mais o cartão real em quadro menor. Declaro porque afrouxa uma medida; o limite de 2% da plan §2 continua valendo para eles.
- A sombra é um painel liso com a conta repetida de `--sarak-dynamic-shadow`, e não o cartão real: o cartão real não lê os tokens que as opções de sombra mudam.
- `shadow-dir-follow` e `shadow-dir-bottom` produzem a mesma sombra por desenho (sem ponteiro, a luz que segue cai em `bottom`); a distinção na amostra é a luz marcada e a órbita tracejada.

**Achados fora do escopo (não corrigidos)**
- `cardTextures` abaixo de 2% nos dois modos de Forma. No lote 1 só `card-tex-grid` aparecia (1,97%); mudou entre as rodadas sem eu mexer no grupo, e o worktree tem alterações de outras tarefas em `SarakButton`/cartões. Não rodei o controle em `HEAD` limpo.
- `PresetSamplesReal.tsx` e `__tests__/PresetSamplesReal.test.tsx` apareceram modificados durante a execução e não estavam na fotografia; não toquei neles (a plan-189, do estado vazio, é a provável dona) e não os desfiz.
- `plan-index:check` com `plan-187` e `plan-189` divergentes (índice × frontmatter).

**Pendências / riscos**
- A prévia do lote 2 aguarda o dono.
- Em `Para cima` e `Para baixo` a luz marcada fica no lado oposto ao da sombra; o dono deve confirmar se é essa a leitura que ele quer.

# 10. Veredito

## Veredito (lote 1) — 2026-11-27 — código conferido; prévia com o dono

**Código:** os quatro `except` de `modal`, `scroll`, `motion` e `pageTransition` saíram. As amostras novas (`PresetSamplesStatic.tsx`)
leem token, e as animadas que ficaram sem uso foram apagadas. A janela passou a ler `--sarak-modal-blur`, porque a amostra antiga
lia uma variável inexistente.

**Conferência do revisor:**
- `tsc --noEmit`: 0 erros.
- `audit:baseline`: igual ao baseline. O `1px` solto e o reservado de `0.25` foram corrigidos.
- `trail-citation` e `variable-contract` em dia.

**Medida do executor (caso "se distingue a olho", menor par por grupo):** janela 7,4% e 11,0%; rolagem 10,3% e 10,9%; movimento 8,9%
e 9,3%; troca de página 14,7% e 15,5%.

**Prévia do lote 1, vista pelo revisor** (`C:\tmp\sarak-previa-188\lote-1\`), para o dono decidir:
- **Movimento:** cada curva se lê, e "Instantâneo" é um degrau. Bom.
- **Rolagem:** a barra ampliada distingue fina, padrão, grossa e pílula. Bom.
- **Troca de página:** "Subir", "Deslizar de lado" e "Aproximar" se leem. "Esmaecer" e "Sem transição" parecem quase iguais a olho
  (o cartão um pouco mais apagado), embora o pixel passe.
- **Janela:** "Clássica" e "Centralizada" só diferem no alinhamento do texto. O fundo de "Flutuante e reta" fica embolado, com
  elementos sobrepostos. No escuro, o desfoque do fundo quase não aparece.

O lote 2 só começa depois do ok do dono, com ou sem ajustes nestes pontos.

**Prévia do lote 1 aprovada pelo dono em 2026-11-27, como está.** O lote 2 está liberado. O achado do `emptyState` virou a `plan-189`, que corre em paralelo.

## Veredito (lote 2) — 2026-11-27 — código conferido; prévia com o dono

**Código:** os `except` de `shadow`, `shadowDirection`, `border` e `gradient` saíram, e nenhum sobra nos oito grupos. As amostras
novas (`PresetSamplesDepth.tsx`) leem token. Aceito tirar os três grupos de `CARD_GROUPS`: a amostra deixou de ser o cartão real,
e vale o limite de 2% da §2.

**Mutação, em cópia:** com a amostra de `shadow` de volta ao cartão real, o caso "se distingue a olho" reprova nos dois modos com
`shadow-none × shadow-ambient = 0.00%` e `shadow-soft × shadow-dramatic = 0.00%`.

**Conferência do revisor:** `tsc --noEmit` com 0 erros; `audit:baseline` igual ao baseline (os dois literais do lote foram
corrigidos); `trail-citation` OK; vitest de Canvas, presets, DataDisplay e Feedback: 164 arquivos, 1375 testes passando.

**O caso de Forma segue vermelho, e não é deste lote.** Numa cópia limpa do `HEAD`, o caso já reprova:
`cardTextures: card-tex-grid × card sem textura = 1.97%`. No worktree, quatro texturas caem entre 1,61% e 1,97%. A amostra de
`cardTextures` não mudou nesta plan. O critério "passa nos dois modos" fica cumprido nos oito grupos desta plan, e o caso de
`cardTextures` vai para o backlog.

**Prévia do lote 2, vista pelo revisor** (`C:\tmp\sarak-previa-188\lote-2\`), para o dono decidir:
- **Sombra:** cada opção se lê. "Ambiente" e "Suave" são próximas. No claro, "Sem sombra" mostra o painel quase sumido.
- **Direção da sombra:** o ponto marca a luz, e a sombra cai do lado oposto. "Segue a luz" tem a órbita tracejada. Bom.
- **Moldura:** o canto ampliado distingue "Técnica" (tracejada) e "Dupla". "Sólida", "Com brilho" e "Sem moldura" ficam
  próximas a olho. As letras roxas cortadas ("NO") do título do cartão aparecem no canto e não dizem nada.
- **Degradê:** as quatro se leem. Bom.

O lote fecha com o ok do dono, com ou sem ajustes nestes pontos.

**Prévia do lote 2 aprovada integralmente pelo dono em 2026-11-27.** As duas prévias estão aprovadas. O critério do caso de Forma vale para os oito grupos desta plan; `cardTextures` ficou no backlog (#1).

## Veredito final — 2026-11-27 — 🟢 Aprovada
