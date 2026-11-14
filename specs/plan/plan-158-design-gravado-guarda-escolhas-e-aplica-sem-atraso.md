---
tipo: "plan"
titulo: "Gravar só as escolhas do design e aplicar sem atraso"
objetivo: "Fazer o design gravado conter o que o administrador escolheu, nunca o que a paleta calculou, para que trocar tema, paleta, tom da barra ou modo sempre chegue à tela, e fazer a escolha de uma opção no painel responder em menos de 200 ms"
dominio: "Design Engine / Persistência e rascunho"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "design-engine", "persistencia", "paleta", "painel", "desempenho"]
relacionados: ["[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[02-design-engine]]", "[[024-paleta-calculada-separada-do-tema]]", "[[009-persistencia-tenant-aware]]", "[[016-preferencias-do-usuario-separadas-do-tema]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "adr/026 + specs/09-temas-e-presets.md + specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

No sistema real, trocar tema, paleta, tom da barra ou modo claro/escuro muda a tela toda vez, inclusive depois de muitas aplicações
seguidas e com cache antigo no navegador, e escolher uma opção no painel responde em menos de 200 ms.

# 2. Contexto

**Medido no ERP (lib `v8.0.0`, 2026-11-10, navegador headless a 1440×900, aplicando pelo painel e medindo o cromo em `/proposals`).**
Os itens 6, 8 e 9 das anotações do dono ("Invertida não se aplica", "claro/escuro às vezes erra", "a barra não se aplica") têm uma
causa comum, em três partes, todas reproduzidas:

1. **A troca de tema herda.** Aplicar `High Contrast` e depois `Sarak Sovereign` pelo painel deixou gravadas as oito cores de superfície
   do High Contrast (`bgBaseColor`, `colorBgBody`, `topbarColor`, `sidebarColor`, `surfaceColor`, `colorBgLayer1`, `colorBgLayer2`,
   `cardBackgroundColor`, todas `#000000`). O design do ERP diferia do Sovereign recém-composto em 51 chaves: 15 iguais ao High
   Contrast e várias de outra paleta (`secondaryColor #518133`, `subtitleColor #5b8c3e`) com `colorPalette: ciano-violeta`. Isso
   contradiz [[09-temas-e-presets]] §4.3.3 ("o valor do tema anterior nunca fica"): é defeito, não regra a mudar.
2. **O Aplicar grava a paleta já calculada.** O primeiro Aplicar depois de limpar o design gravou `topbarColor`, `sidebarColor` e as
   superfícies com os valores calculados naquele instante. A partir daí a cor é *declarada*, e cor declarada vence o tom
   (09 §4.3.4: "uma cor declarada em `sidebarColor` ou `topbarColor` continua vencendo"): 8 de 8 presets de Topbar e todos os de
   Sidebar mudaram estrutura (borda, item ativo, raio, densidade, ícone, blur) e **nenhum** mudou o fundo.
3. **O cache local mantém o resto.** Em `hybrid`, `{ ...local, ...remoto }`: chave ausente no remoto não apaga a do cache (09 §4.4.1).
   Tirar as cores do servidor não mudou nada até apagar `sarak-ui-design-v9.0` do navegador.

**Com o dado limpo, o motor funciona:** `resolvePaletteForDesign` dá, para `ciano-violeta` escuro, `sidebarColor` `#061011` (neutro),
`#1d1432` (superfície), `#00383c` (primária) e `#ddeced` (invertida); no ERP, o fundo seguiu a Invertida e o modo claro trocou 3 de 3
vezes (~80 ms) e persistiu ao recarregar.

**Desempenho, medido com o Profiler do CDP no ERP:** escolher uma opção leva de 0,9 a 1,5 s até o painel responder; 1,1 s é trabalho
nativo (recálculo de estilo), ~0,5 s é JS. Cada escolha reescreve **7** elementos `<style>` de 13,6 KB (as variáveis responsivas de
cada escopo de prévia e de amostra) e a raiz carrega 37 KB de variáveis em linha; a página tem só 1.672 elementos. A espiada leva
350-400 ms (150 ms são `PEEK_DELAY_MS`, de propósito); o Aplicar trava ~300 ms; a troca claro/escuro (~80 ms) não é problema.

**Comportamento que fica como está** ([[06-painel-de-customizacao-e-preview]] §4): o rascunho aparece na tela real de quem edita
enquanto o painel está aberto, sem gravar. O que muda é só a saída: hoje, sair do painel com alterações pendentes descarta tudo
sem aviso (medido: 12 alterações perdidas ao clicar em outra rota).

**Dado já gravado é problema da lib, não do importador.** Os importadores têm designs gravados com cores calculadas e restos de temas
anteriores; a correção não pode pedir a ninguém que limpe banco ou `localStorage`.

# 3. Escopo

## 3.1 Dentro
- **Lote 0:** `specs/adr/026-<slug>.md` (novo, molde `specs/_templates/template-adr.md`) e a linha dele em `specs/adr/README.md`.
- **Lote 1 (o que se grava):** `src/core/Design/presets/themes/compose.ts`, `src/core/Design/palette/resolve.ts`,
  `src/core/Provider/hooks/useThemeSeed.ts`, `src/core/Provider/utils/overlayPreferences.ts`, os hooks de persistência do Provider
  (`useDesignManager`, `useDesignSync`, `useDesignStorageSync` e vizinhos em `src/core/Provider/hooks/`),
  `src/features/DesignEngine/hooks/useDesignDraft.ts` e `useLastAppliedSnapshot.ts`, e os testes de cada um.
- **Lote 2 (aplicar sem atraso):** `src/core/Design/components/DesignScope.tsx`, a injeção de variáveis
  (`DesignInjector`, `useDesignVariables` e o gerador das variáveis responsivas), `src/features/DesignEngine/hooks/useDesignDraftSync.ts`,
  `src/features/DesignEngine/Canvas/components/SampleScope.tsx`, `OptionTile.tsx`, `PresetGroupCatalog.tsx`, `peek.ts`, e um spec
  de navegador novo em `browser-tests/`.
- **Lote 3 (sair com alterações):** o aviso ao sair do painel com rascunho sujo — `src/features/DesignEngine/Main/` (o componente que
  monta o painel e o `ThemeActionBar.tsx`) e as chaves de texto no catálogo de `src/core/i18n/`.
- Em todos os lotes: `docs/migracoes.md` (próxima versão), `npm run guide` e `npm run dev-kit` se a superfície pública mudar.

## 3.2 Fora
- O cromo (Sidebar, Topbar, legibilidade do tom invertido, preferências): `plan-159`.
- A prévia e as amostras do painel além do necessário para o lote 2: `plan-160` e `plan-161`.
- Mudar o comportamento descrito em 06 §4 (rascunho na tela real, `Aplicar` como única porta de gravação, desfazer de um nível).
- Qualquer arquivo de importador. A correção dos dados gravados acontece na lib, ao carregar.
- Temas embarcados: nenhum valor muda. Se um tema embarcado depender de cor calculada gravada, relate.
- Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/09-temas-e-presets.md` §4.3, §4.3.1, §4.3.3, §4.3.4, §4.4 inteira, §4.7 | composição, paleta calculada, persistência, cache e preferência — o contrato que esta plan cumpre |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` §4, §4.1, §4.2, §6.1 | rascunho × persistido, modelo de desempenho, desfazer, `DesignScope` |
| Spec fixa | `arquitetura/02-design-engine.md` | o motor e o drafting |
| Spec fixa | `specs/00-regras-e-invariantes.md` | R6 (valor fora do contrato) e as regras de dado |
| Spec fixa | `specs/11-testes-e-cobertura.md` | onde os testes entram |
| ADR | `adr/024-paleta-calculada-separada-do-tema.md` · `adr/009-persistencia-tenant-aware.md` · `adr/016-preferencias-do-usuario-separadas-do-tema.md` · `adr/README.md` | as decisões que o ADR-026 estende; protocolo |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `test-e2e` · `ui-arquitetura-design` | escrita, testes de unidade e de navegador, a regra do Design Engine |
| Código | `src/core/Design/presets/themes/compose.ts` · `src/core/Design/palette/` (`resolve.ts`, `tone-plan.ts`) · `src/core/Provider/hooks/useThemeSeed.ts` · `src/core/Provider/utils/overlayPreferences.ts` · `src/features/DesignEngine/hooks/useDesignDraft.ts` · `src/core/Design/presets/themes/high-contrast.ts` (o tema que declara as oito cores) | ler antes de editar |
| Teste existente | `browser-tests/troca-de-tema.spec.ts` · `src/features/DesignEngine/hooks/__tests__/useDesignDraft.persistenceIntegration.test.tsx` | o teto de recálculo e a integração do rascunho que não podem regredir |

# 5. Instruções de execução

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 e status 🟠.**

**Lote 0 — decisão do que se grava (só documento).**
0.1. Leia a §4 e escreva o ADR-026 comparando, com custo nomeado, pelo menos: (A) o design gravado guarda só o que foi escolhido (tema,
paleta, tom, tokens ajustados à mão) e todo valor que a paleta calcula é recalculado ao carregar; (B) grava tudo, mas cada valor leva
a origem (calculado × escolhido) e o calculado é refeito quando a escolha muda; (C) outra que a leitura do código revelar. Para cada
uma: o formato que o importador recebe em `onSave` e devolve em `onLoad`, o que acontece com o dado já gravado, o custo no boot, e
como um token ajustado à mão sobrevive à troca de paleta.
0.2. O ADR diz como o dado já gravado (com restos de outro tema e cores calculadas) é tratado **pela lib** ao carregar, sem pedir
nada ao importador.
0.3. ADR em `🟡 Proposto`. O revisor leva ao dono; sem aprovação, o lote 1 não começa.

**Lote 1 — o design gravado guarda escolhas.**
1.1. Teste que reprova **antes** da correção: compor High Contrast e depois Sarak Sovereign pelo caminho do painel
(`useDesignDraft` + Aplicar) não deixa nenhuma chave com o valor do High Contrast que o Sovereign não declara.
1.2. Teste que reprova antes: depois de um Aplicar, trocar `sidebarTone`/`topbarTone` para `primary`, `surface` e `inverse` muda
`sidebarColor`/`topbarColor` para o valor de `resolvePaletteForDesign`; trocar `colorPalette` muda as superfícies.
1.3. Teste que reprova antes: um design gravado no formato de hoje (as 51 chaves do caso medido: use as chaves da §2 como fixture),
carregado com `strategy: 'hybrid'`, sai igual ao design limpo na tela — fundo, tom e modo claro.
1.4. Implemente a opção aprovada no ADR. A cor declarada pelo tema embarcado ou pelo host continua vencendo (09 §4.3.4); o que
deixa de vencer é a cor que a própria lib calculou e gravou.
1.5. Modo claro: com o design do caso medido, alternar claro/escuro 4 vezes muda `--sarak-color-bg-body`, `--sarak-sidebar-bg` e
`--sarak-card-bg` em todas.

**Lote 2 — aplicar sem atraso.**
2.1. Spec de navegador novo (`browser-tests/`): abrir a decisão Layout no painel, escolher uma opção da Sidebar e medir o tempo até o
painel responder (o botão `Aplicar` habilitado) e o número de recálculos de estilo, no mesmo molde de `troca-de-tema.spec.ts`. Rode
**antes** de mudar código e registre o número.
2.2. Ache, com o Profiler, o que reescreve os `<style>` a cada escolha e por que amostras fora da tela recalculam. A meta: uma escolha
não reescreve `<style>` de escopo cujo conteúdo não mudou, e a amostra fora da área visível não recalcula.
2.3. Meta medida no spec: escolher uma opção responde em **menos de 200 ms** a 1440×900 no harness; o teto de
`troca-de-tema.spec.ts` não sobe.
2.4. *(Nota do revisor, 2026-11-12, da medida da `plan-162`.)* Numa troca de tema, o escopo da prévia ao vivo
(`.sarak-design-scope`, classes `sarak-scope-*`) é remontado **8 vezes**, a ≈105 ms uma da outra. Cada vez tem marca própria e
≈529 variáveis escritas como estilo inline, e na última janela há ≈3.044 mutações de estilo inline em `div.sarak-card` da prévia
(trace do CDP, `invalidationTracking`). Meça junto com o 2.2 e trate como a mesma causa até que a medida diga o contrário.

**Lote 3 — sair com alterações pendentes.**
3.1. Com o rascunho sujo, sair do painel (navegar para outra rota da aplicação, fechar a aba) pergunta antes de descartar: ficar,
aplicar ou descartar. Sem rascunho sujo, nada pergunta. Teste de unidade para os dois casos.
3.2. Textos no catálogo de `src/core/i18n/` nos seis idiomas (o teste de paridade exige).

**Em todo lote:** `docs/migracoes.md`, se o importador vir diferença (formato gravado, aviso novo).

# 6. Critérios de aceite

- [ ] ADR-026 com as alternativas e o custo de cada uma, aprovado pelo dono antes do lote 1.
- [ ] Trocar de tema pelo painel não deixa valor do tema anterior (teste 1.1, que reprovava antes).
- [ ] Tom da barra e paleta mudam a cor depois de qualquer número de aplicações (teste 1.2, que reprovava antes).
- [ ] Design gravado no formato antigo é corrigido pela lib ao carregar, sem ação do importador (teste 1.3).
- [ ] Modo claro troca fundo, barra e card nas 4 alternâncias com o design do caso medido.
- [ ] Escolher uma opção no painel: menos de 200 ms, medido no spec de navegador novo, com o número de antes registrado.
- [ ] Teto de `troca-de-tema.spec.ts` sem subir.
- [ ] Sair com rascunho sujo pergunta; sem rascunho, não pergunta.
- [ ] Nota em `docs/migracoes.md`.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1.
- [ ] Prévia para o dono em `C:\tmp\sarak-previa-158\index.html` (lotes 1, 2 e 3), com capturas reais; o lote só fecha com o ok do dono nela.

# 7. Como verificar (uso do revisor)

**Gate:** teste — os testes 1.1 a 1.3 (unidade) e o spec de navegador do lote 2 com teto de tempo e de recálculo; nenhuma regra de
gate nova.

- Lote 0: as alternativas do ADR conferidas contra `compose.ts`, `resolve.ts` e a §4.4 da 09; o tratamento do dado já gravado
  descrito por chave.
- Lote 1: `git diff --stat` → só a §3.1; os testes 1.1 a 1.3 rodados sobre o código de antes, em cópia fora do repositório, e vistos
  reprovar; `npm run verify -- --tier=full`.
- Lote 2: o spec novo rodado por mim; `npm run build` + `cromo-css-real:check`; o número de antes e o de depois.
- Lote 3: o teste 3.1 lido; a paridade do catálogo de textos.
- No fim: repito no ERP a sequência medida (High Contrast → Sovereign → Invertida → modo claro), só depois de combinar com o dono que
  o ERP está livre.

# 8. Destino da síntese

**Destino:** `adr/026 + specs/09-temas-e-presets.md + specs/06-painel-de-customizacao-e-preview.md`

- **`adr/026`:** nasce no lote 0.
- **`09`:** §4.3.3/§4.3.4 (o que é escolhido × o que é calculado e quando se recalcula) e §4.4 (o formato gravado e o tratamento do
  dado antigo ao carregar).
- **`06`:** §4 (a pergunta ao sair com rascunho sujo) e §4.1 (o modelo de desempenho da escolha e o teto novo).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução (lote 0) — 2026-11-11

**Resultado:** Concluído

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-158-design-gravado-guarda-escolhas-e-aplica-sem-atraso.md
 M specs/plan/plan-162-resgatar-temas-antigos-como-temas-novos.md
```

**O que foi feito**
- Criei `specs/adr/026-design-gravado-guarda-so-as-escolhas.md` em `🟡 Proposto`, com três alternativas e o custo de cada (A: grava só escolhas; B: grava tudo com origem por chave; C: mantém o formato e refaz o que ainda é igual ao cálculo anterior). Cada uma responde: formato em `onSave`/`onLoad`, dado já gravado, custo no boot, sobrevivência do token ajustado à mão.
- A decisão proposta é a A, com o tratamento do dado antigo descrito na §2.2 do ADR (regra L1, sem pedir nada ao importador, sem gravar na hidratação) e o cache local com dois registros (§2.3).
- Acrescentei a linha 026 em `specs/adr/README.md`.
- Este bloco e o `status: 🟠`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/adr/026-design-gravado-guarda-so-as-escolhas.md` | criado | o ADR |
| `specs/adr/README.md` | alterado | linha do 026 na tabela |
| `specs/plan/plan-158-…md` | alterado | este resumo e o `status` |

**Verificações executadas**
- Lote só de documento: nenhum teste, `tsc` nem gate rodado. Conferi as alternativas contra o código por leitura: `compose.ts:52`, `resolve.ts:53-62`, `useThemeSeed.ts:113`, `overlayPreferences.ts:53-84`, `useDesignManager.ts:100-135`, `useDesignSync.ts:101`, `useDesignRemoteLoader.ts:106`, `useDesignDraft.ts:34-48,198,208-218`, e a §4.4 da spec 09.

**Critérios de aceite**
- [ ] ADR-026 aprovado pelo dono antes do lote 1 — motivo: depende do revisor/dono; o ADR está em `🟡 Proposto`.
- [x] ADR-026 com as alternativas e o custo de cada uma — evidência: frontmatter `alternativas_consideradas` e §2/§3 do ADR.
- Os demais critérios pertencem aos lotes 1 a 3 e não foram tocados.

**Decisões e suposições**
- Os specs 06/09 moram em `specs/specs/`, não em `specs/`; li de lá.
- O ADR não cita plan (a plan é removida na síntese).
- **Pontos que o dono precisa decidir ao aprovar:** (1) A × C — a C não muda nada para o importador, mas não entrega melhoria futura da régua de cor nem limpa resto de tema; (2) a perda única, no dado antigo, do ajuste manual de cor de papel (L1).
- Suposição conservadora: o schema publicado do dado gravado não foi localizado em `sarak-ui/` por mim; o ADR declara como conferência do lote de implementação se ele exige todas as chaves.

**Achados fora do escopo (não corrigidos)**
- A leitura do código não revela por qual caminho o resto do High Contrast entrou no design do ERP (os três merges de leitura ou o ramo parcial de `useDesignDraft.ts:198`). O ADR registra isso; o teste 1.1 do lote 1 deve apontá-lo.

**Pendências / riscos**
- Custo de boot da alternativa A não medido; o lote 1 mede.
- Nenhum código tocado; `npm run guide`/`dev-kit` não se aplicam a este lote.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-11-11 — lote 0 — 🔴 Reprovado (2 achados)

**Conferido por mim:** só documento (`specs/adr/026-…`, `specs/adr/README.md`, esta plan). As citações do ADR batem com o código:
`useDesignManager.ts:103` (`{ ...getSeedConfig(), ...parsed }`), `useDesignSync.ts:101` (`{ ...prev, ...parsed }`),
`useDesignRemoteLoader.ts:106` (`{ ...previous, ...loadedTheme.design }`), `useDesignDraft.ts:198` (o ramo `{ ...base, ...presetDesign }`
sem `themeId`) e `:208-218` (`applyFullConfigRaw(draft)` e `persistDesign(draft)`). As três alternativas têm custo nomeado, a régua da
`00-prompt-revisor` §5.2 passa, e a escolha da A com a regra L1 está bem argumentada.

1. `specs/adr/026-design-gravado-guarda-so-as-escolhas.md` §2.1 e §2.2 — o marcador `designFormat: 2` vai **dentro** do dicionário de
   tokens. Isso contradiz `specs/specs/09-temas-e-presets.md:409` (§4.4.2): "o payload é o dicionário de tokens e nada mais, e misturar
   identidade com valor obrigaria todo consumidor a filtrá-la antes de gravar" — a razão pela qual o id do tema já viaja como segundo
   parâmetro. E quebra importador real: o relato final do login (`specs/plan/anexos/plan-119-perspectiva-final-login.md`, linha C7) diz
   que "o servidor com lista de chaves recusa o tema a cada token novo" — uma chave `designFormat` seria recusada no `onSave`.
   Correção: o marcador viaja fora do dicionário, pelo mesmo caminho do id (parâmetro de `onSave`; campo do objeto que `onLoad` já pode
   devolver, `{ design, activeThemeId }`), e o cache local guarda o marcador junto do registro esparso, não dentro dele. Ajuste a §2.1,
   a §2.2 e o custo da alternativa A.
2. O ADR muda o contrato de `onSave`/`onLoad` (payload esparso; `onLoad` passa a substituir em vez de fundir) e não diz o efeito no
   nível da próxima versão. Critério: a plan pede, no 0.1, "o formato que o importador recebe em `onSave` e devolve em `onLoad`", e a
   [[03-versionamento-e-release]] decide o nível pela quebra de quem integra. Correção: uma linha nas Consequências com o nível (minor
   ou major) e o motivo, conferido contra a 03, incluindo o caso do importador que hoje guarda o design completo e o devolve.

**Ponto que vai ao dono depois da correção** (não é achado): a perda única, no dado antigo, do ajuste manual de cor de papel (L1).

**Status da plan: 🔵 Em correção.**

---

# 9.1 Resumo da execução (correção 1) — 2026-11-11

## Resumo da execução (correção 1) — 2026-11-11

**Achado 1 — corrigido.** `specs/adr/026-…` §2.1: o dicionário de `onSave` só tem escolhas, sem chave nova; o marcador `format` viaja
fora dele, como terceiro parâmetro de `onSave` e campo de `{ design, activeThemeId, format }` no `onLoad`, e o cache local o guarda ao
lado do registro esparso. §2.2 e o custo da alternativa A (frontmatter) ajustados; `designFormat` não aparece mais no ADR. Acrescentei o
caso que o novo desenho cria: importador que guarda só o primeiro argumento lê-se como dado antigo (L1), declarado em §2.2 e nas
Consequências.

**Achado 2 — corrigido.** Consequências do ADR: a mudança é **MAJOR**, pelo critério de `specs/specs/03-versionamento-e-release.md`
(quebra de quem integra por comportamento, sem export alterado), com quem quebra (validação por todas as chaves, leitura do design
gravado fora da lib como `sarakCreateThemeBootCss`, importador que guarda só o primeiro argumento), o caso do importador que guarda o
completo e o devolve (continua, pelo caminho do dado antigo) e a exigência de `## X.0.0 — ` em `docs/migracoes.md`.

**Suposição:** o nome `format` para o parâmetro/campo é proposta; a decisão final do nome fica com o dono ao aprovar. Só documento; nada
rodado. Arquivo alterado: `specs/adr/026-design-gravado-guarda-so-as-escolhas.md` e este bloco. `status: 🟠`.

## Nota do revisor — 2026-11-11 — achado 3, acrescentado ao veredito de hoje (mesma correção)

3. `specs/adr/026-design-gravado-guarda-so-as-escolhas.md` §2.1 — o baseline é `composeThemeDesign(tema do id, …)` com os condutores,
   e "cor declarada pelo tema ou pelo host continua vencendo a calculada". Mas escolher uma paleta no painel **já vence** a cor que o
   tema declara: `src/features/DesignEngine/Main/hooks/usePaletteSelection.ts:17` grava `colorPalette` e todas as cores calculadas no
   rascunho, por cima das do tema (o dono confirmou no uso, 2026-11-11). Pela §2.1 como está, essas cores são iguais ao cálculo, não
   são gravadas, e ao recarregar o baseline devolve a cor do tema: a paleta escolhida por cima de um tema de cor declarada se perderia.
   A `plan-164` ainda estende isso com "manter minha paleta" (a paleta vence o tema em toda troca). Correção: a §2.1 diz como a
   paleta escolhida pelo usuário vence a cor que o tema declara depois de recarregar (por exemplo, o baseline usa as cores do tema só
   para os papéis que a paleta escolhida não calcula), sem reabrir a decisão A.

## Veredito — 2026-11-11 — correção 1 (lote 0) — 🔴 Reprovado (achados 3 e 4)

**Conferido por mim:** achado 1 resolvido — o marcador saiu do dicionário (`onSave(design, activeThemeId, format)`, campo `format` no
objeto do `onLoad`, guardado ao lado do registro local; `designFormat` não aparece mais no ADR). Achado 2 resolvido — as Consequências
declaram **MAJOR**, com quem quebra e o caso do importador que guarda o completo.

3. **Pendente** (acrescentado na nota de hoje, depois que a correção 1 começou): `specs/adr/026-design-gravado-guarda-so-as-escolhas.md`
   §2.1 continua dizendo que o baseline é o tema composto e que a cor que o tema declara vence a calculada, sem dizer como a paleta
   escolhida pelo usuário — que hoje já vence a cor declarada do tema (`usePaletteSelection.ts:17`) — sobrevive a recarregar. Correção:
   a da nota do revisor de hoje.
4. `specs/adr/026-design-gravado-guarda-so-as-escolhas.md:79`, `:82`, `:118`, `:125` — `npm run -s section-pointers:check` acusa 4
   ponteiros `§4.4` mortos: o ponteiro de seção de outro arquivo precisa do nome dele junto (`[[09-temas-e-presets]] §4.4`), senão o gate
   o lê como seção deste ADR. Critério: o gate de ponteiros (o mesmo derruba o `audit:baseline` e o commit). Correção: nomear a spec em
   cada um; pronto quando `section-pointers:check` passa.
   **Fechado pelo revisor em 2026-11-11** (só prosa, para destravar o commit do worktree): os 4 ponteiros nomeiam
   `[[09-temas-e-presets]]`; `section-pointers:check` e `verify --tier=docs` verdes. A correção 2 trata só o achado 3.

**Status da plan: 🔵 Em correção.**

---

# 9.2 Resumo da execução (correção 2) — 2026-11-11

## Resumo da execução (correção 2) — 2026-11-11

**Achado 3 — corrigido.** `specs/adr/026-design-gravado-guarda-so-as-escolhas.md` §2.1 ganhou o parágrafo "A paleta escolhida pelo usuário
vence a cor que o tema declara, e sobrevive a recarregar": quando o condutor `colorPalette` difere do que o tema declara, o baseline usa as
cores calculadas pela paleta escolhida em todo papel que ela calcula (o que o tema declara e a paleta não calcula, e o resto do tema, fica);
o gravado é só `colorPalette`, sem as cores calculadas, e o ajuste manual posterior é gravado como escolha. Mantidos: o tema vence quando a
paleta é a dele (09 §4.3.4), o host continua vencendo a paleta escolhida, o tom da barra sem regra nova. O que o ADR não decide — a paleta
escolhida vencer o tema nas trocas seguintes ("manter minha paleta") — fica declarado como do ADR-027, coerente com a plan-164. A decisão A não foi reaberta.
O achado 4 não foi tocado (fechado pelo revisor); só nomeei a spec em dois ponteiros `§4.3` que a minha própria prosa nova introduziu.

**Verificações:** `npm run -s verify -- --tier=docs` → `[OK] nível "docs" verde` (plan-index, section-pointers, guide, dev-kit, Anel 0: 0 achado).
A primeira rodada acusou 2 ponteiros `§4.3` sem a spec nomeada (linhas 79-80); corrigidos e repetida a verificação.

**Arquivos alterados:** `specs/adr/026-…` e este bloco; `status: 🟠`. Sem código, sem commit.

## Veredito — 2026-11-11 — correção 2 (lote 0) — 🔴 Reprovado (achados 5 e 6)

**Conferido por mim:** o achado 3 foi tratado no lugar certo (§2.1). A paleta escolhida entra no baseline, o gravado é só
`colorPalette`, o tema vence quando a paleta é a dele, o tom da barra fica sem regra nova e o "manter minha paleta" foi
remetido ao ADR-027, coerente com a `plan-164`. Os 2 ponteiros `§4.3` novos nomeiam a spec; `section-pointers:check` verde.

`verify --tier=docs` falha em 2 verificações, nenhuma desta correção:
- `plan-index:check`: o status 🟠 foi gravado sem rodar `npm run plan-index` — sincronizado por mim com este veredito;
- `guide:check`: kit do consumidor defasado pelos temas novos da `plan-162` lote 1, em andamento no mesmo worktree.

5. `specs/adr/026-design-gravado-guarda-so-as-escolhas.md:79` — "Cor declarada pelo **host** continua vencendo a paleta
   escolhida, como na composição de hoje" não confere com o código. Hoje, escolher a paleta grava no rascunho toda cor que ela
   calcula, **sem olhar o host**:
   - `src/features/DesignEngine/Main/utils/paletteDraft.ts:98-107` monta o patch;
   - `src/features/DesignEngine/Main/hooks/usePaletteSelection.ts:38-39` o aplica.

   O `config` do host só entra na composição do tema (`src/core/Design/presets/themes/compose.ts:52`), não na escolha da paleta.
   Logo, hoje a paleta escolhida vence a cor do host, e isso fica gravado. Com a regra escrita, um host que declara
   `primaryColor` mais um usuário que escolhe a paleta X dão: o painel mostra o primário de X; depois de `Aplicar` e recarregar,
   o baseline devolve o primário do host. Isso contradiz o próprio parágrafo ("volta igual depois de recarregar").

   Critério: o comportamento atual do painel, e a frase "volta igual" do próprio ADR. Correção: a paleta escolhida vence a cor
   do host nos papéis que ela calcula, como hoje. Tirar "como na composição de hoje", e o caso host + paleta escolhida vira uma
   linha nas Consequências. Inverter (o host vencendo) mudaria o painel e exigiria decisão do dono; não é o que se pede aqui.

6. Mesmo parágrafo, "o baseline usa as cores **calculadas pela paleta escolhida**" (`:75`) — não diz **qual cálculo**, e hoje
   há dois que dão cores diferentes:
   - o painel calcula só com os tons da barra (`paletteDraft.ts:81-84` → `resolvePalette(input, mode, tones)`);
   - a composição calcula com o que o tema e o host declaram e corrige contra isso (`src/core/Design/palette/resolve.ts:60-61`,
     `correctPaletteAgainstDeclared`).

   Se o baseline usar o segundo, as cores que o painel gravou diferem dele e voltam a ser gravadas como escolha — o que a decisão A
   existe para impedir. Critério: §2.1, "escolha é a chave que difere do baseline" (só funciona se o baseline reproduz exatamente o
   que o painel escreve). Correção: o ADR fixa que o baseline calcula a paleta escolhida do mesmo jeito que o painel (mesma
   entrada: valor, modo e tons da barra) e que o lote 1 tem um teste de ida e volta (escolher → gravar → recarregar → mesmo
   design, nada gravado além de `colorPalette`). Aproveitar e citar `usePaletteSelection.ts` pelo caminho completo,
   apontando `:38-39` (onde o patch é aplicado) em vez de `:17` (o comentário).

Pronto quando os dois parágrafos estiverem corrigidos e `section-pointers:check` passar. O `guide:check` só passa com a
`plan-162` e não é critério desta correção.

**Status da plan: 🔵 Em correção.**

---

# 9.3 Resumo da execução (correção 3) — 2026-11-11

## Resumo da execução (correção 3) — 2026-11-11

**Achado 5 — corrigido.** `specs/adr/026-…` §2.1: saiu "como na composição de hoje". A paleta escolhida vence a cor declarada pelo tema **e
pelo host** nos papéis que ela calcula, como o painel faz hoje (`paletteDraft.ts:98-107`, `usePaletteSelection.ts:38-39`). O caso host + paleta
escolhida virou uma linha nas Consequências (Negativas), com a nota de que inverter exigiria decisão do dono.

**Achado 6 — corrigido.** §2.1 fixa que o baseline calcula a paleta escolhida com a mesma entrada do painel — valor, modo e tons da barra, como
em `resolveDraftPalette` (`src/features/DesignEngine/Main/utils/paletteDraft.ts:81-84`) — e não com a correção contra o que tema e host declaram
(`src/core/Design/palette/resolve.ts:60-61`), com o motivo. Registra o teste de ida e volta do lote 1 (escolher → gravar → recarregar → mesmo
design, nada gravado além de `colorPalette`). `usePaletteSelection.ts` agora citado pelo caminho completo em `:38-39`, não `:17`.

**Verificações:** ver abaixo (`section-pointers:check`, `plan-index`, `plan-index:check`). Só prosa; sem código; sem commit; `guide:check` não é critério.

## Veredito — 2026-11-12 — correção 3 (lote 0) — 🟢 Aprovado; o lote 1 espera a aprovação do ADR-026 pelo dono

**Conferido por mim:** `git diff` do ADR-026.
- Achado 5: a paleta escolhida vence a cor que o tema **e o host** declaram, nos papéis que ela calcula. É o que o painel faz
  (`paletteDraft.ts:98-107`, `usePaletteSelection.ts:38-39`). Sumiu o "como na composição de hoje", e o caso host + paleta
  escolhida virou uma linha nas Consequências negativas.
- Achado 6: o baseline usa o cálculo do painel (`resolveDraftPalette`, valor + modo + tons da barra), não a correção contra o
  que é declarado (`resolve.ts:60-61`). O teste de ida e volta do lote 1 ficou registrado.

`section-pointers:check` verde. O `plan-index:check` só acusava o status, sincronizado neste veredito.

Lote 0 fechado (achados 1 a 6). O ADR-026 segue 🟡 Proposto até o dono aprovar; só então o lote 1 é liberado.

**Status da plan: 🟡 Em execução** (lote 1 aguardando a aprovação do ADR-026).

## Nota do revisor — 2026-11-12 — prévia HTML para o dono aprovar

A pedido do dono, como nas campanhas anteriores: ao fim de lotes 1, 2 e 3, o executor gera `C:\tmp\sarak-previa-158\index.html`
com capturas reais do `dist/` ou do código-fonte (como as prévias da 136 a 149), mostrando antes e depois de trocar High Contrast → Sovereign, aplicar Invertida e alternar claro/escuro (cromo real), o tempo medido de cada escolha e o aviso ao sair com alterações. O resumo do lote dá o caminho.
O revisor confere a prévia antes do veredito, e o lote só fecha com o ok do dono nela (critério acrescentado à §6). A projeção da
campanha inteira, feita à mão, está em `C:\tmp\sarak-previa-campanha-9\index.html`: é referência de intenção, não de pixel.

## Nota do revisor — 2026-11-12 — ADR-026 aceito; o lote 1 começa depois da correção do lote 3 da `plan-162`

O dono aceitou o ADR-026 em 2026-11-12: alternativa A, regra L1 para o dado antigo e a perda única do ajuste manual assumida.
O ADR-027 foi aceito no mesmo dia.

**A ordem:** a correção do lote 3 da `plan-162` mexe nos mesmos hooks que este lote reescreve (`useThemeSeed.ts`,
`useDesignRemoteLoader.ts`, `useDesignSync.ts`). O lote 1 começa sobre o commit dela, nunca em paralelo.

**O que o lote 1 herda da 162** (sintetizada na 09 §4.3, commit `5214a31f`):
- Pelo cache ou pelo `onLoad`, só o id que a lib removeu (`SARAK_REMOVED_THEME_IDS`) cai no tema padrão, com um aviso por id.
  Outro id desconhecido mantém o design gravado, sem aviso: pode ser tema do importador ainda em carga.
- A validação mora no `ThemeIdGuard` de `useThemeSeed.ts`, que as três portas usam. O lote 1 reescreve esses hooks e mantém o guarda
  como a única fonte da decisão.
- A baseline do formato 2 parte do id **já validado**. `TemaRemovidoGravado.test.tsx` (13 casos) e `useResolvedThemeId.test.ts`
  continuam verdes.

**Lote 1 liberado** (a 162 foi commitada em `5214a31f`).

---

# 9.4 Resumo da execução (lote 1)

## Resumo da execução (lote 1) — 2026-11-13

**Resultado:** Concluído com pendências (a prévia espera o ok do dono; o spec de navegador e a suíte completa são do revisor)

**Estado do worktree ao iniciar**
```
(limpo) — HEAD 82c61dab, sobre 5214a31f (plan-162 lote 3)
```

**Teste 1.1 antes da correção (pedido no prompt): reprova.** Pelo cache local e pelo `onLoad` sozinhos, o caminho do painel (prévia
High Contrast → Aplicar → recarregar → prévia Sovereign → Aplicar) **já saía limpo** no código de antes: a troca em memória compõe do
padrão (`compose.ts:52`). O resto entra por um caminho que o ADR deixou em aberto e o teste achou: o ERP passa o design que gravou como
**`config` do host** no boot seguinte (`ERP/packages/ui-kit/src/themePersistence.ts:134-136`, `injectedThemePayload`), e o `config` vence
tudo o que o tema novo não declara. Com esse caminho, o 1.1 reprova antes da correção com **87 chaves** do High Contrast no design depois
de aplicar o Sovereign (`expected [ 'sidebarColor', …(86) ] to deeply equal []`). Por isso o 1.1 roda os dois casos (`it.each`): o do
cache/`onLoad` (controle, passava antes) e o do `config` injetado (reprovava). Antes da correção, 6 dos 7 casos do arquivo novo
reprovavam: 1.1-config (87 chaves), 1.2-sidebar e 1.2-topbar (`expected '#061011' to be '#00383c'`), 1.2-paleta (`[ 'sidebarColor', …(92) ]`
gravadas em vez de `[ 'colorPalette' ]`), 1.3 (`colorBgBody: '#000000'` em vez de `'#061011'`) e 1.5 (`--sarak-color-bg-body → light:
expected '#000000' not to be '#000000'`).

**O que foi feito**
- `src/core/Provider/utils/designChoices.ts` (novo) — a regra do ADR-026 §2.1/§2.2 em funções puras: `composeChoiceBaseline` (o tema do id
  resolvido para o modo, composto com `composeThemeDesign`, com os tons escolhidos e, quando a paleta escolhida difere da do tema, as cores
  dela calculadas como o painel calcula — `resolveChosenPalette(valor, modo, tons)`); `extractDesignChoices` (condutores que diferem do
  tema + toda chave que difere do baseline; o modo só se difere do nativo); `recomposeDesignChoices`; `replaceDesignChoice` (troca de tom
  no rascunho); `normalizeLegacyDesign` (regra L1: saem as chaves de `PALETTE_CALCULATED_KEYS` que o tema do id e o host não declaram;
  sem paleta válida, nada sai); `findThemeEntry`.
- `src/core/Design/palette/resolve.ts:64-87` — `PALETTE_CALCULATED_KEYS` (o mapa de papéis + os papéis de cada tom de barra) e
  `resolveChosenPalette` (o cálculo do painel, sem a correção contra o declarado).
- `src/core/Provider/hooks/useDesignChoices.ts` (novo) — `restoreSavedDesign` (formato 2 → refaz e **substitui**; sem marcador → funde
  como antes e passa pela L1; sem o tema em memória → funde como antes e fica pendente), `readCachedSavedDesign`, `deliverToOnSave`,
  o hook `useDesignChoices` (`restore`, `toPersisted`, `pendingRef`) e `useDeferredDesignRestore` (refaz quando o tema do gravado
  chega à memória; prop controlada manda e edição do usuário apaga a pendência).
- `src/core/Provider/hooks/useDesignManager.ts:102-111` — o boot lê o cache pelo formato dele; `:125-136` `persistDesign` grava as
  escolhas com o marcador (`onSave(escolhas, id, 2)`), o cache com o completo e o registro `::choices`; sem o tema em memória, o completo
  e sem marcador, como antes. `safeSetDesign` apaga a pendência.
- `src/core/Provider/hooks/useDesignSync.ts:108-114` — a re-hidratação do cache usa o mesmo `restore` (senão fundiria o cru por cima do
  corrigido).
- `src/core/Provider/hooks/useDesignRemoteLoader.ts:135-147` e `:172` — o `onLoad` com `format: 2` substitui; sem marcador, funde e passa pela L1;
  o refresh do cache em `'hybrid'` grava o registro de escolhas junto (`writeCachedDesign`).
- `src/core/Provider/utils/resolveStorageKey.ts:37-82` — a chave `::choices`, presa ao completo por assinatura (djb2): outra aba com lib
  anterior regrava o completo e o registro velho deixa de valer.
- `src/features/DesignEngine/hooks/useDesignDraft.ts:156-165` — trocar `sidebarTone`/`topbarTone` no rascunho refaz as cores que a paleta
  calcula (`replaceDesignChoice`); o que foi escolhido à mão fica.
- `src/core/Provider/designFormatTypes.ts` (novo), `types.ts:159-163`, `src/index.ts:32` — `SarakDesignFormat`, `SarakSavedDesign`;
  `onSave` ganhou o 3º parâmetro e `onLoad` o campo `format`. O `ThemeIdGuard` de `useThemeSeed.ts` não foi tocado: segue a única fonte
  da decisão sobre id gravado; o formato 2 só olha o id depois dela.
- `docs/migracoes.md` — entrada `## 9.0.0 — o design gravado guarda só as escolhas (MAJOR…)`; `docs/persistencia-de-tema.md` §1.1 e o
  exemplo multi-tenant; `docs/schema/postgres.sql`/`sqlite.sql` — coluna `design_format`; `sarak-ui/GUIA-FRONTEND.md` — os dois
  exemplos de `onSave` guardam o `format`; `npm run guide` regerou `sarak-ui/` (catálogo com os 2 tipos novos, carimbo).
- Testes novos: `designGravadoEscolhas.persistenceIntegration.test.tsx` (1.1 ×2, 1.2 ×3 com a ida e volta, 1.3, 1.5), `designChoices.test.ts`
  (15), `useDesignChoices.test.ts` (8). Testes existentes ajustados ao contrato novo (ver Decisões).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/utils/designChoices.ts` | criado | baseline, extrair, recompor, L1 |
| `src/core/Provider/hooks/useDesignChoices.ts` | criado | restaurar o gravado, montar o que se grava, recompor adiado |
| `src/core/Provider/designFormatTypes.ts` | criado | `SarakDesignFormat`, `SarakSavedDesign` |
| `src/core/Design/palette/resolve.ts` | alterado | `PALETTE_CALCULATED_KEYS`, `resolveChosenPalette` |
| `src/core/Provider/hooks/useDesignManager.ts` | alterado | boot e `persistDesign` pelo formato 2; pendência |
| `src/core/Provider/hooks/useDesignSync.ts` | alterado | re-hidratação pelo `restore` |
| `src/core/Provider/hooks/useDesignRemoteLoader.ts` | alterado | `onLoad` formato 2 substitui; L1; cache com escolhas |
| `src/core/Provider/utils/resolveStorageKey.ts` | alterado | registro `::choices` com assinatura |
| `src/core/Provider/types.ts` | alterado | assinatura de `onSave`/`onLoad` |
| `src/index.ts` | alterado | exporta os 2 tipos |
| `src/features/DesignEngine/hooks/useDesignDraft.ts` | alterado | tom da barra refaz as cores calculadas |
| `src/features/DesignEngine/hooks/__tests__/designGravadoEscolhas.persistenceIntegration.test.tsx` | criado | testes 1.1, 1.2, 1.3, 1.5 |
| `src/core/Provider/utils/__tests__/designChoices.test.ts` | criado | unidade da util |
| `src/core/Provider/hooks/__tests__/useDesignChoices.test.ts` | criado | unidade do hook |
| `src/core/Provider/hooks/__tests__/useDesignManager.test.ts` | alterado | 3 asserções de `onSave` com o `2` |
| `src/core/Provider/__tests__/TenantPersistence.test.tsx` | alterado | 2 asserções de `onSave` com o `2` |
| `src/features/DesignEngine/hooks/__tests__/themeApplication.persistenceIntegration.test.tsx` | alterado | o desfazer grava escolhas + `2` |
| `src/features/DesignEngine/hooks/__tests__/useDesignDraft.persistenceIntegration.test.tsx` | alterado | aplicar tema grava escolhas + `2` |
| `src/features/DesignEngine/Main/__tests__/LoginThemeApplication.test.tsx` | alterado | `onSave` recebe as escolhas + `2` |
| `docs/migracoes.md`, `sarak-ui/docs/migracoes.md` | alterado | entrada MAJOR 9.0.0 (a 2ª é cópia gerada) |
| `docs/persistencia-de-tema.md` | alterado | §1.1: formato, marcador, `onLoad` substitui, cache `::choices` |
| `docs/schema/postgres.sql`, `docs/schema/sqlite.sql` | alterado | coluna `design_format` |
| `sarak-ui/GUIA-FRONTEND.md` | alterado | exemplos de `onSave` com `format` |
| `sarak-ui/START-HERE.md`, `sarak-ui/VERSION`, `sarak-ui/catalog.json` | alterado | gerados por `npm run guide` |

**Verificações executadas**
- Arquivo novo, antes da correção → 6 de 7 reprovam (detalhe acima); depois → 7/7.
- `npx vitest run src/core/Provider src/features/DesignEngine src/core/Design` + os 6 testes de fora que usam `persistence`/`onLoad`/
  `localStorage` → **266 arquivos, 2266 testes, 0 falhas** (inclui `TemaRemovidoGravado.test.tsx` 13/13 e `useResolvedThemeId.test.ts`
  6/6). Na 1ª rodada, depois da implementação, 12 falharam em 5 arquivos: todas eram asserções do contrato antigo (ver Decisões).
- `npm run verify -- --tier=quick` → `[OK] nível "quick" verde` (tsc 0, `audit:baseline --with-tsc`, Anel 1, guide/dev-kit, Anel 0: 0 achado).
  A 1ª rodada acusou 2 erros de tipo meus e 3 violações do auditor de clean code minhas (`else if`, `types.ts` 263 e `index.ts` 251 linhas);
  corrigidos (`deliverToOnSave`; tipos em `designFormatTypes.ts`).
- Custo medido (o ADR §2.3 pedia): média de 50 execuções, design de 428 chaves, jsdom — extrair 26-27 ms; recompor+validar 13 ms;
  L1+validar 13-18 ms; trocar o tom no rascunho 37-38 ms. Uma medida anterior, com o baseline ainda sem validar e outra carga na máquina,
  deu 11 / 6 / 6 ms. O tema composto no modo nativo extrai `{}`.
- Prévia: `C:\tmp\sarak-previa-158\index.html` — o caso medido (Sovereign com as 8 superfícies do High Contrast, a secundária/subtítulo
  de outra paleta e a lateral Invertida) pelo cache e pelo `onLoad` em `'hybrid'`, `dist/` 8.0.0 × código-fonte, Chromium 1440×900:
  antes, fundo/lateral/topo/cartão `#000000` nas 4 alternâncias de modo; depois, lateral `#ddeced` (Invertida) e as 4 variáveis trocam
  a cada alternância. Dados em `dados.json`.
- **Não rodei:** suíte completa, `cromo-css-real:check`/specs de navegador, build (do revisor). `troca-de-tema.spec.ts` não foi tocado.

**Critérios de aceite**
- [x] Trocar de tema pelo painel não deixa valor do tema anterior — evidência: 1.1 (2 casos), reprovava antes pelo caminho do `config`.
- [x] Tom da barra e paleta mudam a cor depois de qualquer número de aplicações — 1.2 (sidebar e topbar, 3 tons, Aplicar + recarregar a
  cada um; paleta com ida e volta e só `colorPalette` gravado, `format: 2`).
- [x] Design gravado no formato antigo é corrigido pela lib ao carregar — 1.3 (cache + `onLoad` em hybrid; fundo, tom e modo claro iguais
  ao limpo; nenhum `onSave`).
- [x] Modo claro troca fundo, barra e card nas 4 alternâncias — 1.5 (variáveis emitidas) e a tabela da prévia.
- [x] Nota em `docs/migracoes.md` — entrada MAJOR 9.0.0.
- [ ] Suíte completa verde; `tsc` 0; baseline; Anel 1 — rodei `verify --tier=quick` (verde) e os consumidores; a suíte completa é do revisor.
- [ ] Prévia com o ok do dono — gerada; espera o dono.
- Os critérios dos lotes 2 e 3 não foram tocados.

**Decisões e suposições**
- **O id que recompõe é só o gravado** (o do `onLoad`, senão a chave `::active-theme-id` do cache), nunca o da semente ou da prop. A 1ª
  versão usava `resolveSeedThemeId()`; ao conferir `browser-tests/tema-sob-demanda.spec.ts:168-193` (design salvo sem id + `initialTheme`
  de outro tema), vi que ela aplicaria a L1 com o tema errado e violaria 09 §4.3.2 ("pinta do salvo; o id carrega depois, sem tocar o
  design") e o ADR §2.2 ("nunca se descarta valor por não saber de onde ele veio"). Gravado sem id fica como está.
- **Tom escolhido vence o tom do host no cálculo** (`designChoices.ts`, `composeChoiceBaseline`). Sem isso, um host que declara tom — o
  ERP, que devolve o gravado como `config` — tornaria impossível trocar o tom pelo painel. O ADR diz que o tom "não ganha regra nova";
  a regra que já existia (o tom do host vence o do tema, `resolve.ts:60`) continua; o que entra é o tom escolhido acima do do host,
  como a paleta escolhida já fica acima do host (ADR §2.1, achado 5). Para o revisor confirmar.
- **O tema composto em memória não muda**; o que muda é o que se grava e como se lê. O cache mantém o completo na chave de sempre (o
  primeiro quadro e a sincronização entre abas leem dele) e o registro `::choices` ao lado, preso ao completo por assinatura.
- **`onSave` com o 3º argumento só quando há marcador** (`deliverToOnSave`): quem declara `onSave(design, id)` segue recebendo dois.
- **Testes ajustados ao contrato novo, sem mudar o que provam:** 8 asserções esperavam `onSave(design, id)` e passaram a esperar o `2`; 2
  asserções esperavam a cor do próprio tema dentro do gravado (`primaryColor` do tema aplicado / do tema inicial) e passaram a esperar que
  ela **não** esteja lá (é baseline). Nenhum fixture de `onLoad` foi trocado.
- Atualizei também `docs/persistencia-de-tema.md`, `docs/schema/*.sql` e `sarak-ui/GUIA-FRONTEND.md`, fora da lista literal da §3.1: são o
  formato que o importador recebe (o ADR pede "o schema publicado do dado gravado é conferência do lote"); sem eles, o exemplo da lib
  ensinaria a descartar o marcador. O schema de referência não exigia todas as chaves (o `state_design` é opaco).
- `useLastAppliedSnapshot.ts`, `overlayPreferences.ts`, `compose.ts` e `useDesignStorageSync.ts` (na §3.1) não precisaram mudar: o desfazer
  passa por `persistDesign`, o modo recalcula certo com o dado corrigido (1.5), e a sincronização entre abas lê o completo.
- Nenhum tema embarcado mudou de valor; nenhum depende de cor calculada gravada.

**Achados fora do escopo (não corrigidos)**
- **ERP: `config` = o design gravado** (`themePersistence.ts:134-136`). Com o dado antigo injetado, o `config` é cor declarada pelo host e
  vence a paleta e o tom até o primeiro `Aplicar` desta versão, que grava só as escolhas; a partir daí o `config` traz só elas. E o
  `saveAppliedTheme` do ERP (`:47-54`) guarda só `{ design, activeThemeId }`: sem o `format` de volta, cada carga lê o gravado como antigo
  (L1) — o ajuste manual de cor de papel não dura. Os dois vão para a nota de migração, mas pedem campanha no ERP.
- `useDesignSync` tem 10 parâmetros (eram 9; o teto é 4) — acrescentei o `restoreSaved` em vez de reestruturar a assinatura.
- `resolve.ts:60`: na composição, `design.sidebarTone` sai do tema (o tema vence o host), mas a paleta é calculada com o tom do host
  (o host vence) — o design mostra um tom e pinta outro quando o host declara tom. Pré-existente.

**Pendências / riscos**
- MAJOR (ADR-026): importador que valida todas as chaves, que lê o gravado fora da lib (`sarakCreateThemeBootCss`) ou que não guarda o
  `format` muda de comportamento — na nota de migração.
- O spec de navegador `tema-sob-demanda.spec.ts` e os que leem o gravado (`plan-135`, `plan-140`, `login-theme-application`) não foram
  rodados por mim; pela leitura, `plan-135` espera `sidebarColor` ajustado à mão (é escolha, vai) e `plan-140` espera `colorPalette`
  (escolha, vai).
- Custo: trocar o tom no rascunho custa ~38 ms (jsdom) — entra no orçamento do lote 2 (200 ms por escolha).
- **Worktree mudou durante a execução, fora do meu escopo e sem toque meu:** `specs/00-backlog.md`, `specs/plan/plan-159-…md` (nota do
  revisor de 2026-11-13) e `specs/plan/plan-165-barra-lateral-volta-a-anatomia-antiga.md` (novo, não rastreado). O `00-indice.md` foi
  regenerado por mim com `npm run plan-index` depois do status 🟠 e já inclui a 165.

## Veredito — 2026-11-13 — lote 1 — 🔵 Em correção (achado 7; a forma está aceita)

**Conferido por mim:**
- `designChoices.ts` inteiro, contra o ADR-026 §2.1/§2.2.
- A prévia `C:\tmp\sarak-previa-158\`: antes, a Invertida não pega e o modo claro fica preto; depois, a lateral clara no escuro e as
  quatro variáveis trocam a cada alternância.
- **A suíte completa** (`npx vitest run`, a parte do `--tier=full` que o `quick` do executor não roda): 2074 arquivos, 5873 testes,
  **7 falhas, todas em `designGravadoEscolhas.persistenceIntegration.test.tsx`**. O mesmo arquivo, sozinho, passa 7 de 7 (cerca de
  2 s por caso).

**Aceito:**
- O formato 2 fora do dicionário e o 3º argumento de `onSave` só quando há marcador.
- O cache com o design completo e o registro `::choices` preso por assinatura.
- A regra L1 com "tema do id + host declarado".
- O id que recompõe ser só o gravado, nunca o da semente. A leitura de `tema-sob-demanda.spec.ts` que levou a isso está certa.
- **O tom escolhido vence o tom do host no cálculo.** É a mesma precedência que a paleta escolhida já tem (ADR-026 §2.1, achado 5),
  e sem ela o painel não troca o tom de um host que declara tom. Na síntese, a 09 §4.3.4 diz isso.
- Os arquivos fora da lista literal da §3.1 (`docs/persistencia-de-tema.md`, `docs/schema/*.sql`, `sarak-ui/GUIA-FRONTEND.md`). São o
  formato que o importador recebe, e o ADR pede essa conferência.
- Os 10 testes antigos ajustados ao contrato novo, sem mudar o que provam.

**Achado 7 — o teste novo reprova na suíte completa.**
- Sob a carga da suíte inteira (4 workers), os `waitFor` do arquivo estouram o padrão de 1 s, e o primeiro caso estoura o tempo do
  teste.
- A suíte completa é critério de aceite (§6), e ela está vermelha por causa deste arquivo.
- **Conserto:** o mesmo que os testes pesados do repositório já usam, com nome e motivo:
  - `configure({ asyncUtilTimeout: … })` com uma constante nomeada, como `CardDetailComposition.test.tsx:49`;
  - um tempo de teste explícito nos casos que recarregam o Provider.

  Não troque as asserções nem encurte o caminho que os casos percorrem.
- **Verificação:** a suíte completa, `npx vitest run`, verde, com o número de arquivos e de testes no resumo. Aqui ela não é
  redundante: é a falha.

**Para o backlog (não bloqueia):**
- `useDesignSync` passou de 9 para 10 parâmetros (o teto é 4). O auditor não acusa porque a violação já estava no baseline; ela só
  piorou.
- Os dois achados do ERP vão para a campanha do ERP:
  - o `config` do host é o próprio gravado;
  - o `saveAppliedTheme` descarta o `format`.

  A nota de migração já os descreve.

**Prévia para o dono:** `C:\tmp\sarak-previa-158\index.html`. O lote 1 só fecha com o ok dele nela, além da correção do achado 7.

**Status da plan: 🔵 Em correção.**

---

# 9.5 Resumo da execução (lote 1, correção 1)

## Resumo da execução (lote 1, correção 1) — 2026-11-13

**Resultado:** Concluído com pendências. O achado 7 está corrigido: o arquivo passa 7/7 dentro da suíte completa. A suíte completa
**não** fecha verde, mas por 3 falhas em arquivos de outra tarefa que mudou o worktree durante esta execução (abaixo).

**Estado do worktree ao iniciar**
O de antes desta correção: os arquivos do lote 1 (§9.4), mais `specs/00-backlog.md`, `specs/00-indice.md`,
`specs/plan/plan-159-…md` e `specs/plan/plan-165-…md` (não rastreado), do revisor.

**Achado 7 — corrigido.** `src/features/DesignEngine/hooks/__tests__/designGravadoEscolhas.persistenceIntegration.test.tsx:21-31`.
Segui o padrão de `CardDetailComposition.test.tsx:46-50`:
- `MOUNT_TIMEOUT_MS = 30_000` e `configure({ asyncUtilTimeout: MOUNT_TIMEOUT_MS })`, com o motivo num comentário;
- tempo de teste explícito em cada caso:
  - `RELOAD_CASE_TIMEOUT_MS = 6 × MOUNT_TIMEOUT_MS` nos três que recarregam o Provider (1.1, 1.2 tom, 1.2 paleta; `:185`, `:207`, `:230`),
    porque o 1.2 do tom faz até seis montagens;
  - `MOUNT_CASE_TIMEOUT_MS = MOUNT_TIMEOUT_MS + 15_000` nos dois que só montam (1.3, 1.5; `:277`, `:303`).

Nenhuma asserção nem caminho de caso mudou.

**Verificações executadas**
- O arquivo sozinho: 7/7.
- `npx vitest run` completo: **734 arquivos, 5873 testes: 5870 passaram, 3 falharam (em 3 arquivos), 0 pulados.**
  - Dentro dela, `designGravadoEscolhas…` passou 7/7, com os casos entre 1,0 e 4,5 s. Antes da correção, os mesmos casos estouravam o
    `waitFor` de 1 s e o teste de 5 s.
  - As 3 falhas não são deste lote:
    - `src/core/Design/palette/__tests__/role-map.test.ts`, 2 testes: `navActiveMarkerColor: expected 'accent' to be 'primary'` e a
      anatomia da barra lateral;
    - `src/core/Design/schema/__tests__/preferences.test.ts`, 1 teste: `expected 'menu' to be 'pinned'`;
    - `src/features/DesignEngine/Panels/__tests__/LayoutTab.test.tsx`: "Cannot find module". O arquivo aparece como apagado no worktree.

**Critérios de aceite**
- [x] Achado 7: o arquivo passa na suíte completa — evidência acima.
- [ ] Suíte completa verde — motivo: as 3 falhas acima, em arquivos que outra tarefa estava mudando durante esta execução.

**Achados fora do escopo (não corrigidos)**
- **O worktree mudou durante a execução, sem toque meu**, em arquivos que não estavam na fotografia. Pelo nome, é o trabalho da
  `plan-165` (anatomia da barra lateral). Exemplos:
  - `src/core/Design/palette/role-map.ts`, `src/core/Design/schema/preferences.ts`, `navigation.ts`;
  - `src/components/Layout/chrome/*`, `SarakShellNav.tsx`, `CustomizationPanelImpl.tsx`;
  - `LayoutTab.tsx` e o teste dele, apagados;
  - `browser-tests/barra-lateral-anatomia*`, `src/components/Layout/chrome/sidebarFrame.ts`;
  - `specs/specs/06`, `08`, `09` e `00-regras-e-invariantes.md`;
  - `.agents/skills/*`, `.githooks/pre-commit`, `gates/scripts/contrato/*`, `dist/sarak.css`.

  Parei de mexer em código e não toquei em nenhum deles. As 3 falhas da suíte estão nesses arquivos.
- `src/core/Design/palette/resolve.ts` continua só com as 25 linhas do lote 1 (`git diff --stat`). Já `role-map.ts`, vizinho dele,
  é da outra tarefa: os commits precisam sair separados.

**Pendências / riscos**
- A suíte completa só fecha verde depois que a outra tarefa terminar ou for isolada. Vale rodá-la de novo então.
- A prévia `C:\tmp\sarak-previa-158\index.html` ainda espera o ok do dono.

## Veredito — 2026-11-13 — correção 1 do lote 1 — achado 7 resolvido; o 🟢 espera só o ok do dono na prévia

**Conferido por mim:**
- O cabeçalho do arquivo de teste (`:21-31`) e os tempos por caso (`:185`, `:207`, `:230`, `:277`, `:303`): constante nomeada com
  motivo e `configure({ asyncUtilTimeout })`, como `CardDetailComposition.test.tsx`. Nenhuma asserção mudou.
- O resumo da suíte completa: o arquivo passou 7/7 dentro dela.

Não repeti a suíte.

**As 3 falhas da suíte não são deste lote:**
- `role-map.test.ts` e `preferences.test.ts` estão em arquivos da `plan-165`, em execução no mesmo worktree.
- `LayoutTab.test.tsx` foi apagado pela tarefa direta de higiene (backlog 35), já aprovada. O vitest pegou o arquivo durante a remoção.

Nenhuma dessas falhas toca arquivo da §3.1 desta plan.

**Achado 7: resolvido.**

**Falta para o 🟢:** o ok do dono na prévia `C:\tmp\sarak-previa-158\index.html`, que já foi levada a ele. Com o ok, o lote 1 fecha e
o commit sai separado do da 165, que divide o worktree.

**Status da plan: 🟠 Em revisão** (aguardando o dono na prévia).

## Veredito — 2026-11-13 — lote 1 — 🟢 Aprovado; o lote 2 segue

O dono aprovou a prévia `C:\tmp\sarak-previa-158\index.html` em 2026-11-13. Rodei `audit:baseline --with-tsc` no worktree atual:
igual ao baseline, sem regressão.

**O commit do lote 1 sai separado do da `plan-165`.** Três gerados do kit (`sarak-ui/catalog.json`, `START-HERE.md` e `VERSION`)
já misturam os dois lotes e vão no commit da 165. Lá eles são regenerados de qualquer forma.

**Lote 2 liberado.** Ele roda junto com a 165, que mexe em outros arquivos (cromo, paleta e schema da barra). Os dois usam
navegador, então confira os processos antes de abrir o Playwright, como nas rodadas anteriores. A nota 2.4 (a prévia remonta
8 vezes por troca) faz parte do lote.

**Status da plan: 🟡 Em execução** (lotes 2 e 3).
