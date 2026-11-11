---
tipo: "plan"
titulo: "Gravar só as escolhas do design e aplicar sem atraso"
objetivo: "Fazer o design gravado conter o que o administrador escolheu, nunca o que a paleta calculou, para que trocar tema, paleta, tom da barra ou modo sempre chegue à tela, e fazer a escolha de uma opção no painel responder em menos de 200 ms"
dominio: "Design Engine / Persistência e rascunho"
status: "🔴 A executar"
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

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
