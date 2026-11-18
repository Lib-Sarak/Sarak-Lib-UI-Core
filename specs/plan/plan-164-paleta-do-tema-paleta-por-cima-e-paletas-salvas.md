---
tipo: "plan"
titulo: "Aplicar a paleta do tema, permitir a paleta escolhida por cima de qualquer tema e salvar paletas com nome"
objetivo: "Fazer escolher um tema aplicar as cores dele, deixar o usuário pôr uma paleta por cima de qualquer tema (inclusive dos que declaram cor) e salvar uma paleta criada com nome próprio, que aparece na galeria e serve à marca"
dominio: "Design Engine / Paleta e painel"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "paletas", "temas", "painel", "persistencia"]
relacionados: ["[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[024-paleta-calculada-separada-do-tema]]", "[[010-temas-salvos-pelo-usuario]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[017-porta-de-apagar-tema-simetrica-a-de-escrever]]"]
depende_de: ""
retida_por: ""
destino_sintese: "adr/027 + specs/09-temas-e-presets.md + specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Escolher um tema mostra as cores dele; o usuário que quiser ver um tema numa paleta específica liga "manter minha paleta" e a paleta
vale por cima de qualquer tema; e uma paleta criada no painel pode ser salva com nome, reaparece na galeria e é escolhível na marca.

# 2. Contexto

**Pedido do dono (2026-11-11):** "cada tema possui uma cor padrão; ao selecionar um tema deveríamos aplicar a cor padrão dele (faz parte
da personalidade de cada tema), porém gostaria de ter uma opção para a paleta sobressair o tema, no caso do usuário querer ver como
fica um tema numa paleta específica. Deve ser possível salvar uma paleta criada, como um tema, inclusive com nome próprio, para usar uma
paleta para a marca."

**O que existe hoje (lido em 2026-11-11):**
- Todo tema tem cor própria: **todos** declaram `colorPalette` (a trava `themes/__tests__/themePalettes.test.ts` o exige), e parte
  deles declara também papéis de cor por cima da paleta, que vencem a calculada ([[09-temas-e-presets]] §4.3.4). Medido em 2026-11-12,
  depois do lote 1 da `plan-162`: 23 temas, 11 com papéis declarados por cima (de 8 a 24 dos 92 de `PALETTE_ROLE_MAP`). *Corrigido
  pelo revisor em 2026-11-12: a versão anterior dizia "6 dos 19 declaram `colorPalette`, os outros 13 declaram as cores direto" —
  contagem errada (um `grep` que não via a chave entre aspas).*
- A troca de tema compõe e não herda ([[09-temas-e-presets]] §4.3.3): o tema escolhido aplica a cor que declara.
- **Escolher uma paleta no painel já vence a cor do tema:** `usePaletteSelection.ts` grava no rascunho `colorPalette` **e todas as cores
  que ela calcula**, por cima das que o tema declara (conferido pelo dono no uso e no código, 2026-11-11). O que não existe é a paleta
  sobreviver à troca de tema: escolher outro tema compõe as cores dele (09 §4.3.3).
- O painel cria paleta (`Main/components/PaletteCreator.tsx`, valor `custom:<tipo>:<#base>[,sec=…][,acc=…]`), mas não há como guardá-la
  com nome: ela vive só como valor de `colorPalette` no design.
- Temas salvos pelo usuário têm porta própria de escrita e de apagar ([[010-temas-salvos-pelo-usuario]],
  [[011-tema-salvo-por-uma-porta-de-escrita]], [[017-porta-de-apagar-tema-simetrica-a-de-escrever]]; 09 §4.6). Paleta não tem.

**Depende do que se grava.** A `plan-158` (ADR-026) muda o design gravado para guardar só escolhas; `colorPalette` e os tons são os
"condutores" dela. Esta plan parte desse formato, por isso vem depois da 158 — e depois da `plan-160`, que mexe na galeria de paletas
(espiada).

# 3. Escopo

## 3.1 Dentro
- **Lote 0:** `specs/adr/027-<slug>.md` (novo) e a linha dele em `specs/adr/README.md`.
- **Lote 1 (paleta do tema × paleta por cima):** `src/core/Design/presets/themes/compose.ts`, `src/core/Design/palette/resolve.ts` (só a
  regra de quem vence quando a paleta está "por cima"), `src/features/DesignEngine/hooks/useDesignDraft.ts`,
  `src/features/DesignEngine/Main/hooks/usePaletteSelection.ts`, `src/features/DesignEngine/Main/components/PaletteSection.tsx` e
  `PaletteGallery.tsx`; o token novo da escolha "manter minha paleta" nas três fontes de token, se o ADR decidir que é token; testes.
- **Lote 2 (paletas salvas):** o token da lista de paletas no schema (três fontes de token), `src/features/DesignEngine/Main/components/PaletteCreator.tsx`, `PaletteGallery.tsx` (grupo "Minhas
  paletas"), o atalho de marca (`Main/components/BrandShortcut.tsx`, `Main/hooks/useBrandForm.ts`), textos no catálogo de
  `src/core/i18n/`, testes; `docs/persistencia-de-tema.md`, `sarak-ui/GUIA-FRONTEND.md` (autoria) e o artefato de referência do dado
  persistido ([[13-instalacao-e-atualizacao]]).
- Em todo lote: `docs/migracoes.md`, `npm run guide`, `npm run dev-kit`.

## 3.2 Fora
- O catálogo de paletas prontas: `plan-163`. Os temas resgatados: já entregues (09 §5).
- O motor de paleta (escala, papéis, contraste) além da regra de precedência do lote 1.
- O formato do design gravado: `plan-158` (esta plan o usa como está).
- Qualquer arquivo de importador. Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/09-temas-e-presets.md` §4.3.3, §4.3.4, §4.4 inteira, §4.6 | composição, paleta calculada e quem vence, persistência e portas, salvar em runtime |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` §2.3, §2.4, §4, §5.1 | o caminho do painel, paletas no painel, rascunho × persistido, exportar × salvar |
| Spec fixa | `specs/13-instalacao-e-atualizacao.md` | o artefato de referência do dado persistido |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §3.6 | textos novos do cromo/painel no catálogo, se forem do usuário final |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | token novo nas três fontes, se houver |
| ADR | `adr/024-paleta-calculada-separada-do-tema.md` · `adr/010-temas-salvos-pelo-usuario.md` · `adr/011-tema-salvo-por-uma-porta-de-escrita.md` · `adr/017-porta-de-apagar-tema-simetrica-a-de-escrever.md` · `adr/026-design-gravado-guarda-so-as-escolhas.md` · `adr/README.md` | paleta × tema; o padrão das portas de tema salvo; o formato gravado |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `ui-arquitetura-design` · `ui-novo-componente` (se houver token novo) | escrita, testes, Design Engine, paridade |
| Código | `src/core/Design/presets/themes/compose.ts` · `src/core/Design/palette/resolve.ts` · `src/core/Design/palette/parser.ts` · `src/features/DesignEngine/Main/components/PaletteCreator.tsx` · `src/features/DesignEngine/Main/hooks/usePaletteSelection.ts` · `docs/persistencia-de-tema.md` | ler antes de editar |

# 5. Instruções de execução

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 e status 🟠.**

**Lote 0 — ADR (só documento).** O dono já decidiu (2026-11-11); o ADR-027 registra as decisões com as alternativas e o custo:
0.1. **"Manter minha paleta" é do sistema:** um token do design, escolhido pelo administrador no painel e gravado como escolha. Desligado
(padrão), escolher um tema aplica as cores dele; ligado, a paleta selecionada é aplicada por cima de qualquer tema, em toda troca. Vale
para todo usuário. Alternativas recusadas: preferência do usuário ([[016-preferencias-do-usuario-separadas-do-tema]]) e estado só do
painel.
0.2. **Com o toggle ligado, a paleta vence todas as cores que ela calcula**, inclusive as que o tema declara — o mesmo que escolher a
paleta faz hoje no painel. Sem pergunta ao dono: é o comportamento atual estendido à troca de tema.
0.3. **A paleta salva mora no próprio design do sistema:** uma chave com a lista `{ id, nome, valor }` (o valor é o `colorPalette`
`custom:…`), gravada pelo mesmo `onSave` do design. Recomendação do revisor como "a mais simples", que o dono confirma ao aprovar o ADR: nenhuma porta nova,
nenhuma tabela nova, nenhum código novo no importador. Custo nomeado: uma chave nova no design (servidor que valida a lista de chaves,
como o dos logins, precisa aceitá-la uma vez) e o payload cresce com o número de paletas. Alternativas recusadas: porta nova simétrica à
de tema salvo (código novo em todo importador) e entrada na tabela de temas (paleta misturada com tema, filtro em todo lugar).
0.4. Confira, contra o ADR-026 da `plan-158`, que a paleta escolhida e a lista de paletas são escolhas que o formato gravado preserva,
e que a paleta escolhida por cima de um tema de cor declarada sobrevive a recarregar.
0.5. ADR em `🟡 Proposto`. O revisor leva ao dono; sem aprovação, o lote 1 não começa.

**Lote 1 — paleta do tema × paleta por cima.**
1.1. Teste que fixa o comportamento padrão: para cada tema embarcado, escolher o tema no painel aplica a cor dele (a paleta que declara,
ou as cores que declara), mesmo que antes houvesse outra paleta escolhida.
1.2. Teste que reprova antes: com "manter minha paleta" ligado e uma paleta escolhida, trocar para um tema de cor declarada mostra a
paleta escolhida nos papéis decididos no ADR (0.2); trocar de novo para outro tema mantém a paleta.
1.3. Controle no painel, junto da galeria de paletas, com o estado visível ("a paleta escolhida vale por cima do tema"); desligá-lo
volta às cores do tema atual.

**Lote 2 — paletas salvas.**
2.1. No criador de paleta, "Salvar paleta" com nome; nome repetido pergunta antes de substituir; apagar pede confirmação.
2.2. A galeria mostra um grupo "Minhas paletas" com as salvas, escolhíveis e com espiada como as outras.
2.3. O atalho de marca ("Usar minha marca") oferece as paletas salvas.
2.4. A lista é gravada pelo `Aplicar`, como o resto do design; teste de integração pelo Provider real: salvar, aplicar, recarregar,
apagar.
2.5. Documentação do importador: `docs/persistencia-de-tema.md`, o guia e o artefato de referência; `docs/migracoes.md`.

# 6. Critérios de aceite

- [ ] ADR-027 aprovado pelo dono antes do lote 1.
- [ ] Escolher qualquer tema aplica a cor dele (teste por tema).
- [ ] "Manter minha paleta" faz a paleta valer por cima de qualquer tema, inclusive os de cor declarada (teste que reprovava antes).
- [ ] Paleta salva com nome, listada em "Minhas paletas", escolhível na marca, gravada no design do sistema e apagável.
- [ ] Documentação do importador e `docs/migracoes.md` atualizadas.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1; paridade de token (se houver token novo).
- [ ] Prévia para o dono em `C:\tmp\sarak-previa-164\index.html` (os lotes de código), com capturas reais; o lote só fecha com o ok do dono nela.

# 7. Como verificar (uso do revisor)

**Gate:** teste — os testes de cada lote; nenhuma regra de gate nova.

- Lote 0: as alternativas do ADR conferidas contra `compose.ts`, `resolve.ts` e as portas de tema salvo.
- Lote 1: o teste 1.2 rodado sobre o código de antes, em cópia fora do repositório, e visto reprovar; `npm run verify -- --tier=full`.
- Lote 2: o teste de integração pela porta; `npm run verify -- --tier=full`; `npm run build` + `cromo-css-real:check` se o painel
  mudar de desenho.

# 8. Destino da síntese

**Destino:** `adr/027 + specs/09-temas-e-presets.md + specs/06-painel-de-customizacao-e-preview.md`

- **`adr/027`:** nasce no lote 0.
- **`09`:** §4.3.4 (quem vence com a paleta por cima) e §4.6 ou seção nova (paleta salva e a porta dela).
- **`06`:** §2.4 (o controle "manter minha paleta", o grupo "Minhas paletas" e o salvar no criador).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

## Resumo da execução (lote 0) — 2026-11-12

**Resultado:** Concluído

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-160-previa-mostra-o-efeito-de-toda-opcao.md
 M specs/plan/plan-164-paleta-do-tema-paleta-por-cima-e-paletas-salvas.md
```

**O que foi feito**
- `specs/adr/027-paleta-do-tema-paleta-por-cima-e-paletas-salvas-no-design.md` criado, no molde do `template-adr.md`, em `🟡 Proposto`. Registra as decisões 0.1 a 0.3 (§2.1 toggle do sistema, §2.2 paleta vence tudo o que calcula, §2.3 paleta salva no design) com quatro alternativas e o custo de cada: A escolhida; B preferência do usuário ou estado do painel (0.1); C porta própria e D tabela de temas (0.3).
- O ADR cita o ADR-026 como premissa (§1) e não repete o formato dele. A §2.4 diz como o toggle, a paleta escolhida por cima de tema de cor declarada e a lista de paletas salvas são gravados nesse formato (0.4): são escolhas do design do sistema, cada uma uma chave que difere do baseline do 026.
- `specs/adr/README.md:68` — linha do 027 na tabela.
- `npm run dev-kit` rodado (a plan manda em todo lote): `sarak-dev/` regenerado, porque o ADR novo o defasou.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/adr/027-paleta-do-tema-paleta-por-cima-e-paletas-salvas-no-design.md` | criado | ADR-027 |
| `specs/adr/README.md` | alterado | linha do 027 |
| `sarak-dev/state.json`, `sarak-dev/GUIA-MANUTENCAO.md`, `sarak-dev/START-HERE.md` | alterado | gerados por `npm run dev-kit` |
| `specs/plan/plan-164-…md` | alterado | este resumo e o `status` |

**Verificações executadas**
- `npm run -s verify -- --tier=docs` (1ª vez) → `plan-index:check`, `section-pointers:check`, `guide:check`, Anel 0 (185 linhas, 0 achados) OK; `dev-kit:check` FAIL (3 arquivos defasados).
- `npm run -s dev-kit` → regenerado (139 componentes, 424 tokens, 44 gates).
- A 2ª rodada de `verify --tier=docs` está feita no passo seguinte, depois do `plan-index` (resultado abaixo).

**Critérios de aceite**
- [x] ADR-027 escrito, `🟡 Proposto` — evidência: o arquivo; a aprovação do dono é do revisor, e sem ela o lote 1 não começa.
- [x] Alternativas conferidas contra `compose.ts:30-55` e `usePaletteSelection.ts:38-39` (lidos).
- [ ] Os demais critérios da §6 pertencem aos lotes 1 e 2.

**Decisões e suposições**
- Nomes dos tokens (toggle e lista de paletas) **não** foram fixados: o ADR deixa para o lote 1/2 pela paridade das três fontes.
- A lista é valor estruturado; o ADR registra que a comparação com o baseline do 026 tem de ser por igualdade profunda e que a regra L1 não pode tratá-la como cor (conferência do lote 2).
- "Ligar o toggle sem paleta escolhida antes vale a paleta vigente" é suposição minha, registrada como detalhe do lote 1 — o dono não decidiu isso.
- Pus uma quarta alternativa (D, tabela de temas) separada da C, porque 0.3 recusa as duas com custos distintos.

**Achados fora do escopo (não corrigidos)**
- Não-rastreados `browser-tests/_probe160.mjs` e `browser-tests/fixtures/plan-160-previa-entry.tsx` apareceram durante a execução; não estavam na fotografia e não são meus (parecem da plan-160). Não toquei.

**Pendências / riscos**
- Se o ADR-026 mudar na aprovação, o 027 se ajusta na mesma rodada.
- O trecho "Voltar atrás é caro…" e a ausência de teto para a lista de paletas são julgamento meu; o lote 2 mede.

---

## Resumo da execução (lote 1) — 2026-11-16

**Resultado:** Concluído com pendências (a prévia para o dono não foi gerada)

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
```
(Durante a execução apareceram, vindos das plans 159 e 161 em paralelo e não tocados por mim: `src/components/atomic/Navigation/*`, `src/features/DesignEngine/Canvas/*`, `ThemeActionBar.tsx`, `ThemeDecisionOptions.tsx`, `ThemeDecisionView.tsx`, `catalogEntries.part2.ts`, `dist/sarak.css`, `browser-tests/*` e os não rastreados `horizontalOverflow.ts`, `useHorizontalOverflow.ts`, `OptionSampleFrame.tsx`. Nenhum foi necessário para o lote.)

**O que foi feito**
- Token novo `keepPalette` (boolean, `functional`, padrão `false`) nas três fontes: `schema/colors.ts`, `catalog/theme_table_mapping.json` (coluna `colors_and_atmosphere`) e `catalog/partitions/colors_and_atmosphere.json`; gerados `design-token-ids.ts` e `design-token-docs.json` por `npm run token-types`. O leitor é `applyKeptPalette` (R40: `token-reader:check` OK).
- `core/Design/palette/resolve.ts`: `applyKeptPalette(design, chosen)` — com `keepPalette` ligado e paleta válida, grava `colorPalette` e TODA cor que a paleta calcula (mesma entrada de `resolveChosenPalette`, com os tons das barras do design), inclusive as que o tema declara.
- `presets/themes/compose.ts`: `keepPalette` entra em `THEME_PRESERVED_KEYS` e a composição termina com `applyKeptPalette(design, prev.colorPalette ?? host.colorPalette)`. Desligado, nada muda.
- `Provider/utils/designChoices.ts`: `keepPalette` vira condutor (`DRIVER_KEYS`) e `composeChoiceBaseline` o repassa à composição, para o design gravado (ADR-026) recompor a mesma tela ao recarregar, inclusive quando a paleta escolhida é a do próprio tema.
- `Provider/utils/overlayPreferences.ts`: com `keepPalette`, a troca claro/escuro não traz de volta a cor que o tema declara (`themeOverrides` vazio; contraparte sem as chaves `PALETTE_CALCULATED_KEYS`).
- Painel: `useDesignDraft.ts` trata `updateDraft('keepPalette', …)` por `utils/keepPalette.ts` (`toggleKeepPalette`): ligar aplica a paleta vigente por cima das cores declaradas pelo tema; desligar devolve ao rascunho `colorPalette` e as cores calculadas do tema atual e preserva o resto do rascunho. A extração do bloco de aviso da troca de modo para `utils/discardsCustomColor.ts` foi necessária para o arquivo ficar em 245 linhas (teto 250); comportamento igual.
- `PaletteSection.tsx`: `SarakSwitch` "Manter minha paleta" junto da galeria, com a descrição que muda com o estado (ligado: "A paleta escolhida vale por cima do tema…"). Textos em seis idiomas em `catalogEntries.palette.ts` (`paletteKeepLabel`, `paletteKeepOff`, `paletteKeepOn`).
- `docs/migracoes.md`: entrada 9.0.0 do `keepPalette`. `npm run guide` e `npm run dev-kit` rodados (429 tokens).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/schema/colors.ts`, `catalog/theme_table_mapping.json`, `catalog/partitions/colors_and_atmosphere.json`, `Provider/generated/design-token-ids.ts`, `design-token-docs.json` | alterado | token `keepPalette` |
| `src/core/Design/palette/resolve.ts` | alterado | `applyKeptPalette` |
| `src/core/Design/presets/themes/compose.ts` | alterado | preserva e aplica `keepPalette` |
| `src/core/Provider/utils/designChoices.ts`, `overlayPreferences.ts` | alterado | condutor do gravado; troca de modo |
| `src/features/DesignEngine/hooks/useDesignDraft.ts` | alterado | caminho de `keepPalette`; bloco de modo extraído |
| `src/features/DesignEngine/utils/keepPalette.ts`, `discardsCustomColor.ts` | criado | `toggleKeepPalette`; aviso de troca de modo |
| `src/features/DesignEngine/Main/components/PaletteSection.tsx` | alterado | o interruptor |
| `src/core/i18n/catalogEntries.palette.ts` | alterado | três textos × seis idiomas |
| testes: `themes/__tests__/keepPalette.test.ts` (novo), `utils/__tests__/keepPalette.test.ts` (novo), `designChoices.test.ts`, `overlayPreferences.test.ts`, `PaletteSection.test.tsx` | criado/alterado | ver verificações |
| `docs/migracoes.md` | alterado | entrada do token |
| `sarak-ui/*`, `sarak-dev/*` | alterado | gerados por `guide` e `dev-kit` (carregam também o efeito dos componentes das plans 159/161 em curso) |

**Verificações executadas**
- 1.1: `themes/__tests__/keepPalette.test.ts` → para cada tema embarcado, escolher o tema aplica a paleta e os papéis que ele declara, mesmo com outra paleta escolhida antes (`keepPalette` desligado).
- 1.2: o mesmo arquivo, com `keepPalette` ligado → cada tema ganha a paleta escolhida em todo papel que ela calcula, e a segunda troca mantém a paleta. Rodado sobre o `HEAD` em cópia fora do repositório (`git archive` + junção; `git status` idêntico antes e depois; `node_modules` íntegro): 52 falhas ali; no worktree passam.
- `npx vitest run src/core/Provider src/core/Design/presets src/core/Design/__tests__ …/PaletteSection.test.tsx src/features/DesignEngine/utils` → 109 arquivos, 1274 testes verdes.
- `npx vitest run src/features/DesignEngine/Main src/features/DesignEngine/utils src/features/DesignEngine/hooks src/core/Provider/utils src/core/Design/presets/themes src/core/Design/palette` (pasta de paletas do painel e vizinhos) → 121 de 122 arquivos verdes; o 122º (`PaletteSection.test.tsx`) quebrou porque `SarakSwitch` exige o Provider, foi consertado e roda 12/12.
- `npx tsc --noEmit -p .` → 0 erros no estado final (1 erro de tipo no meu teste, corrigido).
- `npm run verify -- --tier=quick` → gates de contrato OK (token-reader, token-docs, token-types, theme-completeness, panel-contract, dev-kit, guide; Anel 0: 1387 linhas, 0 achados). O baseline do `run_audit` acusou 2 órfãos de cobertura (`useHorizontalOverflow.ts`, `OptionSampleFrame.tsx`) e 1 arquivo de 282 linhas (`SarakShellNav.tsx`): todos das plans 159/161, não meus. O `tsc` que ele acusou era o meu e foi corrigido.
- `npm run token-release-notes:check` → falha em 5 tokens contra a entrada `8.0.0` (`brandDisplay`, `keepPalette`, `preferenceNavCollapsePositionTopbar`, `sidebarActiveGlass`, `userAvatarStyle`): quatro não são meus, e o gate compara com a entrada 8.0.0 enquanto a campanha anota em 9.0.0. Registrei `keepPalette` na entrada 9.0.0, que é a convenção do arquivo.

**Critérios de aceite**
- [x] ADR-027 aprovado antes do lote 1 — o ADR está 🟢 Aceito (2026-11-12).
- [x] Escolher qualquer tema aplica a cor dele (teste por tema) — `themes/__tests__/keepPalette.test.ts`, bloco 1.
- [x] "Manter minha paleta" faz a paleta valer por cima de qualquer tema, inclusive os de cor declarada (reprovava antes: 52 falhas no `HEAD`).
- [ ] Paleta salva, "Minhas paletas", marca — lote 2.
- [ ] Documentação do importador (`persistencia-de-tema.md`, guia, artefato) — lote 2; `migracoes.md` do lote 1 feito.
- [ ] Suíte completa, baseline, Anel 1 — são do revisor (§3 item 8 do prompt do executor); o `quick` está acima.
- [ ] Prévia para o dono em `C:\tmp\sarak-previa-164\index.html` — **não gerada**: pedi só o lote 1 e a prévia exige `dist/` e capturas reais, o que conflita com o build/CSS dos outros executores em paralelo. Fica para o revisor decidir quando.

**Decisões e suposições**
- Nome do token: `keepPalette`; `kind: functional` (igual em todo tema, o tema não o declara).
- "Ligar sem paleta escolhida antes vale a paleta vigente" (ADR): ligar aplica a vigente (a do tema, na prática) por cima das cores declaradas. Tratei o aviso do revisor (11 temas com papéis declarados): ligar já tira essas cores do rascunho para a tela mostrar o que a troca de tema vai manter, e o texto do controle diz isso quando ligado. Sem pergunta: ajustes manuais de cor no momento de ligar são substituídos pelas cores da paleta, e desligar também devolve as cores do tema.
- Ligar/desligar mexe só em `colorPalette` e nas chaves que a paleta calcula (`PALETTE_CALCULATED_KEYS`); o resto do rascunho fica.
- Fora da lista da §3.1, mas necessários: `designChoices.ts` (reload com a paleta do próprio tema), `overlayPreferences.ts` (a troca de modo devolvia a cor do tema por cima da paleta) e dois utilitários novos; justifico por 0.4 do lote 0 e pelo teto de 250 linhas.
- `usePaletteSelection.ts` e `PaletteGallery.tsx` não precisaram mudar.
- No teste do painel mantive o mock de `useOverlay`, agora parcial (`importOriginal`), porque `SarakSwitch` exige o `SarakUIProvider`.

**Achados fora do escopo (não corrigidos)**
- `src/core/i18n/catalogEntries.palette.ts:220` — o hook acusa identificador com termo em português (`palettePresetAzulProjeto`); é do catálogo de paletas, anterior a esta execução.
- `token-release-notes:check` já estava vermelho para `brandDisplay`, `preferenceNavCollapsePositionTopbar`, `sidebarActiveGlass` e `userAvatarStyle`.

**Pendências / riscos**
- Prévia ao dono (acima) e navegador: não rodei spec de navegador nem `build:css`.
- Servidor que valida a lista de chaves do design precisa aceitar `keepPalette` (anotado em `migracoes.md`).
- `sarak-ui/` e `sarak-dev/` foram regenerados com o worktree compartilhado: o diff deles mistura o meu token com o das plans 159/161; conferir ao commitar (`git commit -- <caminhos>`).


---

## Resumo da execução (lote 2) — 2026-11-17

**Resultado:** Concluído com pendências (o ok do dono na prévia; a suíte completa e o navegador inteiro são do revisor)

**Estado do worktree ao iniciar**
```
(limpo)
```
(Durante a execução apareceram, de outras tarefas em paralelo e não tocados por mim: `package.json`, `scripts/verify-changes.mjs`, `src/core/Design/catalog/partitions/{branding_config,layout_and_navigation}.json`, `schema/{navigation,system}.ts`, `presets/components/cards.ts`, `DecisionTokenList.tsx`, `CardsCatalog.tsx`, `src/core/i18n/presetTexts/*`, `catalogEntries.tokenNotes.ts`, `tokenNotes.ts`, `DecisionTokenRow.tsx`, `browser-tests/{painel-avisa-a-verdade,textura-muda-pixel}.spec.ts`, entre outros.)

**O que foi feito**
- **Token `savedPalettes`** (texto, `functional`, padrão `''`) nas três fontes — `schema/colors.ts`, `catalog/theme_table_mapping.json` (coluna `colors_and_atmosphere`) e `catalog/partitions/colors_and_atmosphere.json` — e `design-token-ids.ts`/`design-token-docs.json` gerados por `npm run token-types`. Leitor: `savedPalettesOf` (`src/core/Design/palette/savedPalettes.ts`); `token-reader:check` OK.
- **`src/core/Design/palette/savedPalettes.ts`** (novo): lista `{ id, name, value }` ↔ texto compacto (`id|nome|valor` separados por `~`), `decode` tolerante, `savePalette` (nome igual substitui; teto de 24; nome até 40 caracteres), `removeSavedPalette`, `sanitizePaletteName` (só letras, números, espaço e `-_.,&+!?@#%`: nada que abra string ou bloco numa variável CSS).
- **`Provider/utils/validation.ts`**: `savedPalettes` passa por `normalizeSavedPalettes` (descarta entrada inválida; o valor gravado à mão com aspas ou chaves chega limpo).
- **`presets/themes/compose.ts`**: `savedPalettes` entra em `THEME_PRESERVED_KEYS` e é reposto por cima do tema depois da composição (`compose.ts:59-60`). Sem isso, um tema salvo pelo painel — que traz o padrão `''` de todo token (`exportTheme.ts` `resolveCompleteDesign`) — apagava a lista ao ser aplicado.
- **Painel:** `hooks/useSavedPalettes.ts` (novo: salvar com pergunta de substituição, apagar com confirmação, tudo em rascunho); `PaletteCreator.tsx` ganha "Nome da paleta" + "Salvar paleta" + mensagem de situação (`onSave` opcional); `PaletteSection.tsx` liga o hook, fecha o criador depois de salvar e mostra a mensagem; `PaletteGallery.tsx` reescrita em grupos recolhíveis (`Minhas paletas` + um por tipo), só o grupo da paleta escolhida abre, linha de salva com botão de apagar; `hooks/useOpenGalleryGroups.ts` (novo, extraído por excesso de estado no clean-code) abre "Minhas paletas" quando a lista cresce.
- **Marca:** `useBrandForm.ts` (`paletteId`, `brandPaletteValue`, `brandPatch` com a lista) e `BrandShortcut.tsx` (campo "Paleta da marca", só quando há salvas; "Gerar da cor acima" mantém o comportamento de antes).
- **Textos:** `catalogEntries.paletteSaved.ts` (novo, 17 chaves × 6 idiomas) ligado em `catalog.ts`.
- **Meta de Cores (nota do revisor de 2026-11-17):** a decisão rolava 6,11 alturas (4032 px de 660 px: galeria 2523 px + "Ajustes principais" 1384 px). Agora rola **1,51** (994 px). Duas mudanças: a galeria por grupos recolhidos e `ThemeDecisionView.tsx` — "Ajustes principais" abre recolhido quando tem mais de oito controles (`MAIN_TOKENS_OPEN_LIMIT`). `utils/decisions.ts`: a decisão que tem o grupo `palettes` toma `savedPalettes` para si (`SECTION_OWNED_TOKEN_IDS`), para a lista não aparecer como campo de texto nos ajustes. `browser-tests/plan-161-catalogo-proporcional.spec.ts`: removida a exceção `NOT_IN_LOTE_1` de Cores — o limite dela passa a ser o `MAX_SCROLL_SCREENS = 2.5` das outras decisões, e a medida de amostra também.
- **Documentação:** `docs/migracoes.md` (entrada 9.0.0 de `savedPalettes`), `docs/persistencia-de-tema.md` (parágrafo das duas chaves de paleta), `sarak-ui/GUIA-FRONTEND.md` (autoria: paleta de marca com nome e "Manter minha paleta"); `docs/schema/*.sql` não muda (o design é JSONB/JSON opaco). `npm run guide` e `npm run dev-kit` rodados (432 tokens).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/palette/savedPalettes.ts` | criado | formato, leitor e operações da lista |
| `src/core/Design/schema/colors.ts`, `catalog/theme_table_mapping.json`, `catalog/partitions/colors_and_atmosphere.json` | alterado | token `savedPalettes` |
| `src/core/Provider/generated/design-token-ids.ts`, `design-token-docs.json` | alterado (gerado) | token novo |
| `src/core/Provider/utils/validation.ts` | alterado | normaliza `savedPalettes` |
| `src/core/Design/presets/themes/compose.ts` | alterado | preserva a lista por cima do tema |
| `src/core/i18n/catalogEntries.paletteSaved.ts`, `catalog.ts` | criado/alterado | 17 textos × 6 idiomas |
| `src/features/DesignEngine/Main/hooks/{useSavedPalettes,useOpenGalleryGroups}.ts` | criado | salvar/apagar; grupos abertos |
| `Main/hooks/useBrandForm.ts`, `Main/components/{BrandShortcut,PaletteCreator,PaletteGallery,PaletteSection,ThemeDecisionView}.tsx`, `utils/decisions.ts` | alterado | ver acima |
| testes novos: `savedPalettes.test.ts` (palette e themes), `validation.savedPalettes.test.ts`, `useSavedPalettes.test.ts`, `useOpenGalleryGroups.test.ts`, `ThemeDecisionView.mainTokens.test.tsx`, `decisions.savedPalettes.test.ts`, `savedPalettes.persistenceIntegration.test.tsx` | criado | ver verificações |
| testes alterados: `PaletteGallery.test`, `PaletteGallery.registry.test`, `PaletteSection.test`, `PaletteCreator.test`, `BrandShortcut.test`, `useBrandForm.test` | alterado | grupos recolhidos; salvar, escolher, apagar, marca |
| `browser-tests/plan-161-catalogo-proporcional.spec.ts` | alterado | Cores deixa de ser exceção |
| `docs/migracoes.md`, `docs/persistencia-de-tema.md`, `sarak-ui/GUIA-FRONTEND.md` | alterado | ver acima |
| `sarak-ui/*`, `sarak-dev/*` | alterado (gerado) | `guide` e `dev-kit`; carregam também o efeito das tarefas em paralelo |
| `specs/plan/plan-164-…md` | alterado | este resumo e o `status` |

**Verificações executadas**
- `npx tsc --noEmit -p .` → 0 erros.
- `npm run verify -- --tier=quick` (2ª rodada, no estado final) → tudo OK (`tsc`, `audit:baseline --with-tsc` sem regressão, `barrel`, `catalog`, `token-types`, `token-docs`, `token-reader`, `theme-completeness`, `panel-contract`, `persistence-doc`, `guide`, `dev-kit`, Anel 0: 0 achados) **menos** `plan-index:check`: `plan-161` está `🟠` no frontmatter e `🟡` no índice (do revisor, não desta plan). A 1ª rodada acusou 1 valor fixo (`min-h-[1em]`, meu) e 1 aviso de clean code (`PaletteGallery` com 4 `useState/useEffect`, meu); os dois foram corrigidos.
- `npx vitest run src/features/DesignEngine src/core/Design src/core/Provider src/core/i18n` (rodada ampla, antes dos três últimos arquivos de teste e do aviso da seção) → 290 de 292 arquivos, **2908 de 2911 testes verdes**; as 3 falhas são tempo estourado (5 s) em `switch-glass-border.test.ts` (2; a nota do revisor de 2026-11-17 já as dá como falha também no `HEAD`) e `BarSample.test.tsx` (1, que passa isolado). Os arquivos de teste que escrevi depois dessa rodada, mais `PaletteSection`/`PaletteCreator`/`PaletteGallery`/`BarSample`, rodados em seguida: todos verdes.
- Teste do `compose` reprova sem a correção: com a linha de reposição desligada, "um tema que traz o padrão do schema (vazio) … não apaga a lista" cai (1 falha em 4); restaurada, 4/4. As demais afirmações não reprovam sem ela porque `THEME_PRESERVED_KEYS` já cobre o caso de tema sem a chave.
- **Integração pelo Provider real** (`savedPalettes.persistenceIntegration.test.tsx`, 3/3): salvar é rascunho (`onSave` não chamado, `systemDesign` vazio); `Aplicar` grava `savedPalettes: 'sp-1|Marca azul|custom:analogous:#2563eb'` com `format: 2`; recarregar devolve a lista; trocar de tema aplicado a mantém; apagar (diálogo real, botão "Apagar") + `Aplicar` tira a chave do gravado, e recarregar não a traz de volta.
- **Navegador** (`plan-161-catalogo-proporcional.spec.ts -g "Cores|Forma"`) → Cores `{scrollHeight: 994, clientHeight: 660, screens: 1.51}` com o limite de 2,5 (antes 6,11 / 4032 px); Forma 1,72 (antes 3,07).
- **Prévia** `C:\tmp\sarak-previa-164\lote2\index.html` (9 capturas reais do código-fonte, sem tocar o `dist/`; `medidas.json` ao lado; o `index.html` do lote 1 ganhou o link): Cores curta; criador com nome; salvar → "Minhas paletas"; nome repetido pergunta; escolher a salva; **Aplicar → `onSave` recebeu `savedPalettes`, recarregar a página → a paleta e a escolha seguem, `Aplicar` desabilitado (nenhum desvio)**; marca oferece a salva; apagar pede confirmação; grupo some vazio. Limite: Chromium escuro 1440×900.

**Critérios de aceite**
- [x] Escolher qualquer tema aplica a cor dele — lote 1, inalterado.
- [x] "Manter minha paleta" — lote 1, inalterado.
- [x] Paleta salva com nome, listada em "Minhas paletas", escolhível na marca, gravada no design do sistema e apagável — `PaletteSection.test.tsx` ("paletas salvas com nome"), `BrandShortcut.test.tsx` ("paletas salvas"), `savedPalettes.persistenceIntegration.test.tsx`.
- [x] Documentação do importador e `docs/migracoes.md` — acima.
- [x] Meta de Cores ≤ 2,5 alturas, medida pelo spec da 161 com o limite de Cores igual ao das outras — 1,51.
- [ ] Suíte completa verde, Anel 1 e baseline — são do revisor; o `quick` está acima (verde fora o `plan-index` da 161).
- [ ] Ok do dono na prévia do lote 2 — a prévia está pronta; falta o ok.

**Decisões e suposições**
1. **A lista é gravada como texto compacto, não como lista estruturada.** O ADR-027 §2.3/§2.4 diz "chave com a lista `{ id, nome, valor }`" e "valor estruturado, igualdade profunda". O dicionário de tokens só tem valor simples (`SarakTokenValue = string | number | boolean | …`; o gerador de tipos, a validação por tipo e a variável CSS que o motor emite para todo token, nenhum aceita lista). Gravei `id|nome|valor` separados por `~` num token `string`; `savedPalettesOf`/`encodeSavedPalettes` são a leitura e a escrita, e a comparação com o baseline do 026 é por igualdade de texto (mais simples que a profunda). Consequência para o ADR: a decisão (a lista mora no design, mesmo `onSave`, nenhuma porta nova) segue; a forma do valor mudou. **O revisor decide se ajusta o ADR-027 §2.3/2.4 na síntese.**
2. **Teto de 24 paletas e de 40 caracteres no nome** — o ADR deixou "o lote mede e, se preciso, impõe um teto". Medida: ≈ 60 caracteres por paleta, 24 paletas ≈ 1,5 KB por `Aplicar`; o teto é de interface e de leitura (`MAX_SAVED_PALETTES`), não fecha porta.
3. **Salvar não escolhe a paleta**; escolher é o clique na galeria (ou "Usar esta paleta" no criador), como com as demais. Depois de salvar, o criador fecha para o "Minhas paletas" aparecer (a mensagem fica na seção).
4. **O token fica fora da busca e do ajuste fino** (`SECTION_OWNED_TOKEN_IDS` em `decisions.ts`): um campo de texto cru com a lista não serve a ninguém. Fica na contagem da decisão (a decisão Cores aparece como alterada quando só a lista muda).
5. **Os "Ajustes principais" de qualquer decisão com mais de oito controles abrem recolhidos**, não só os de Cores. A meta de Cores não fechava sem isso (a galeria sozinha deixava 2,3 alturas só de ajustes principais). Efeito colateral medido: Forma foi de 3,07 para 1,72. Se o dono quiser a regra só em Cores, é uma condição em `ThemeDecisionView.tsx`.
6. **O filtro por tipo esconde "Minhas paletas"** (só "Todas" a mostra). Suposição de desenho; os chips não ganharam um "Minhas".
7. **Duas paletas salvas com o mesmo valor** marcam as duas como escolhidas (o `colorPalette` é o mesmo). Aceito: o nome é diferente, o efeito é igual.
8. `usePaletteSelection.ts` não mudou; `useBrandForm.ts`/`BrandShortcut.tsx` entram por 3.1 (atalho de marca).

**Achados fora do escopo (não corrigidos)**
- `browser-tests/plan-161-catalogo-proporcional.spec.ts`: no `HEAD` (cópia fora do repositório, `git archive` + junção; `node_modules` íntegro depois, e a cópia apagada) o teste "rolagem e amostras de cada decisão" **já reprova** 4 decisões contra o limite de 2,5: Tema 8,51 (5614 px), Fontes 4,85 (3199 px), Forma 3,07 e Componentes 3,96 (2611 px); Layout passa com 2,47. Hoje (com este lote) Forma passa (1,72) por efeito da decisão 5 acima; Tema, Fontes e Componentes seguem reprovando e são da 161, não desta plan.
- `src/core/Design/palette/__tests__/switch-glass-border.test.ts`: 2 testes estouram 5 s sob carga (já anotado pelo revisor como falha também no `HEAD`).
- `token-release-notes:check` segue acusando a entrada `8.0.0` para `keepPalette`, `savedPalettes` e outros (compara com 8.0.0 enquanto a campanha anota em 9.0.0); registrei `savedPalettes` na entrada 9.0.0, como o lote 1 fez.
- **`keepPalette` tem o mesmo defeito que corrigi para `savedPalettes`:** um tema salvo pelo painel traz `keepPalette: false` (padrão do schema) e, ao ser aplicado, vence a chave preservada pela composição, então desliga "Manter minha paleta" sem aviso. Não toquei (lote 1, fora do escopo); a correção é a mesma reposição de `compose.ts:59-60`.
- Os "Transform failed" que a 1ª rodada ampla acusou em `ThemeSearchResults`, `ThemeSidebarContent`, `LoginThemeApplication`, `ThemeColumn.integration` e `presetSearch` eram arquivos de outra tarefa em edição no mesmo instante; passam depois.

**Pendências / riscos**
- Ok do dono na prévia do lote 2.
- Servidor que valida a lista de chaves do design (como o dos logins) precisa aceitar `savedPalettes` — anotado em `docs/migracoes.md` e em `docs/persistencia-de-tema.md`.
- `sarak-ui/` e `sarak-dev/` foram regenerados com o worktree compartilhado: o diff deles mistura este lote com o das tarefas em paralelo; conferir ao commitar (`git commit -- <caminhos>`).
- `src/core/i18n/catalog.ts`, `colors_and_atmosphere.json`, `theme_table_mapping.json` e `design-token-ids.ts` também têm edições de outras tarefas misturadas com as minhas.
- Não rodei a suíte completa, o `build` nem `cromo-css-real:check` (o painel mudou de desenho, o §7 da plan pede os dois ao revisor).

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Nota do revisor — 2026-11-12 — lote 0 liberado antes da `plan-160`

O lote 0 é só o ADR-027 e registra decisões que o dono já tomou em 2026-11-11. Ele parte do formato do ADR-026 (gravar só
escolhas), que segue 🟡 Proposto: o ADR-027 o cita como premissa e, se o ADR-026 mudar na aprovação, o 027 se ajusta na mesma
rodada. Os lotes 1 e 2 continuam esperando a 158 e a 160.

**Lote 0 liberado.**

## Veredito — 2026-11-12 — lote 0 — 🟢 Aprovado; o lote 1 espera a aprovação do ADR-026 e do ADR-027 pelo dono

**Conferido por mim:** `specs/adr/027-paleta-do-tema-paleta-por-cima-e-paletas-salvas-no-design.md` inteiro e a linha em
`specs/adr/README.md`.
- As decisões 0.1 a 0.3 estão registradas como o dono as tomou, com quatro alternativas e o custo de cada uma.
- O ADR-026 é citado como premissa, sem repetir o formato dele.
- A §2.4 diz como o toggle e a lista são gravados no formato do 026 e o que o lote 2 confere: a igualdade profunda da lista e a
  regra L1, que não pode tocá-la.
- "Atalho de marca" existe no painel (`ThemeDecisionList.test.tsx:21`).

Um erro de fato, nascido na minha §1 desta plan e copiado no ADR: "6 dos 19 declaram `colorPalette`, os outros 13 declaram as
cores direto". Medi pelo `SARAK_ALL_THEMES` real: os 23 temas declaram `colorPalette`, e a trava `themePalettes.test.ts` já o
exigia; 11 deles declaram também de 8 a 24 papéis de cor por cima. Corrigi a §1 desta plan e o §1 do ADR. Nenhuma decisão
muda.

**Para o lote 1:** como todo tema declara paleta, "ligar o toggle sem paleta escolhida antes vale a paleta vigente" (ADR,
Consequências) sempre tem valor. Mas, nos 11 temas com papéis declarados por cima, a troca de tema com o toggle ligado leva
só a paleta, não esses papéis: a cor na tela antes da troca não é exatamente a que segue. O lote 1 trata e testa esse caso, e
o painel o diz quando acontece.

`npm run -s verify -- --tier=docs` verde depois das correções.

**Status da plan: 🟡 Em execução** (lotes 1 e 2 esperam o ADR-026, o ADR-027, a `plan-158` e a `plan-160`).

## Nota do revisor — 2026-11-12 — prévia HTML para o dono aprovar

A pedido do dono, como nas campanhas anteriores: ao fim de os lotes de código, o executor gera `C:\tmp\sarak-previa-164\index.html`
com capturas reais do `dist/` ou do código-fonte (como as prévias da 136 a 149), mostrando um tema de cor declarada com e sem "Manter minha paleta", trocando de tema; salvar, escolher e recarregar uma paleta salva. O resumo do lote dá o caminho.
O revisor confere a prévia antes do veredito, e o lote só fecha com o ok do dono nela (critério acrescentado à §6). A projeção da
campanha inteira, feita à mão, está em `C:\tmp\sarak-previa-campanha-9\index.html`: é referência de intenção, não de pixel.

## Nota do revisor — 2026-11-16 — as plans citadas foram sintetizadas

As `plan-158`, `plan-160`, `plan-163` e `plan-165` foram sintetizadas e removidas. Toda citação a elas nesta plan passa a valer
pela spec fixa:
- `plan-158` → [[09-temas-e-presets]] §4.3.3 e §4.4.1–4.4.2 (o que se grava), [[06-painel-de-customizacao-e-preview]] §4 e §4.1 (sair com rascunho, desempenho) e o ADR-026.
- `plan-160` → [[06-painel-de-customizacao-e-preview]] §2.4, §6.2–6.6 (a prévia, a espiada, as telas por grupo).
- `plan-163` → [[09-temas-e-presets]] §4.3.4 e §5 (paletas, régua de deslocamento, contraste).
- `plan-165` → [[05-cromo-e-slots]] §2.1.4, §2.2 e §2.4 (anatomia da barra lateral) e [[09-temas-e-presets]] §4.3.4 (faixas da marca).

O código delas está no `HEAD`. Ao executar, leia a spec fixa, e não a plan. `depende_de` fica vazio: nada mais bloqueia esta
plan por dependência de outra plan.

## Veredito — 2026-11-17 — lote 1 — 🔵 Em correção (dois itens objetivos)

**Como medi:** numa cópia fora do repositório (`git archive HEAD` com junção), com os 20 arquivos desta plan e nada das plans 159 e
161.
- **Unidade:** `npx vitest run src/core src/features/DesignEngine src/components/atomic/Navigation src/components/Layout` → 341
  arquivos, 7 falhas. Rodei os 6 arquivos de novo, na cópia desta plan e numa cópia equivalente ao `HEAD`:
  - **Desta plan:**
    - `PreviewCanvas.test.tsx` ("propriedades de estilo reais") e `AtmosphereCatalog.test.tsx` ("abas de mídia/textura") quebram
      no snapshot. O token novo sai na raiz da prévia como `data-sx-keep-palette="false"` e `--sarak-keep-palette`, e os
      snapshots não foram atualizados.
    - O filtro da execução não incluiu `DesignEngine/Canvas`, consumidor de todo token emitido.
  - **Não são desta plan:**
    - `switch-glass-border.test.ts` estoura o tempo de 5 s também no `HEAD`.
    - `PaletteGallery.registry`, `compose.test` e `BarSample` passaram na repetição.
    - Os três vão ao backlog (89).
- **Gates do commit e `check-audit-baseline --with-tsc`** na cópia: verdes, baseline sem regressão. Os `guide:check` e
  `dev-kit:check` caem só na cópia, porque os kits regenerados no worktree misturam as três plans.
- **Diff lido:**
  - `applyKeptPalette` em `resolve.ts` e a chamada no fim de `composeThemeDesign`;
  - o condutor em `designChoices.ts` e o filtro em `overlayPreferences.ts`;
  - `toggleKeepPalette` e `discardsCustomColor`, equivalente ao bloco que saiu de `useDesignDraft.ts`;
  - o interruptor em `PaletteSection.tsx` e os textos nos seis idiomas.
- **As portas:** o Provider (`useDesignSync`), o painel (`useDesignDraft`), a Personalidade (`personalityDraft.ts`) e o apagar tema
  (`useThemeDeletionHandler`) passam todos por `composeThemeDesign`, e por isso a regra vale em todas.
- **O teste 1.2 reprova antes:** 52 falhas no `HEAD`, segundo o resumo. Não repeti, e a leitura do teste confirma que ele compara cada
  papel calculado com a paleta escolhida.
- **Fora da §3.1, com justificativa aceita:** `designChoices.ts`, `overlayPreferences.ts` e os dois utilitários novos. Recarregar e
  trocar de modo são parte do 0.4, e a extração serve ao teto de 250 linhas.

**Achados**
1. **Snapshots** (`src/features/DesignEngine/Canvas/__tests__/__snapshots__/PreviewCanvas.test.tsx.snap` e
   `Canvas/components/__tests__/__snapshots__/AtmosphereCatalog.test.tsx.snap`):
   - rode `npx vitest run src/features/DesignEngine/Canvas`;
   - leia o diff antes de qualquer `-u`: a única mudança desta plan é `data-sx-keep-palette` e `--sarak-keep-palette`;
   - atualize só o `PreviewCanvas`.
   O `AtmosphereCatalog` já tem as linhas do `keepPalette` no worktree, porque o `vitest -u` da `plan-161` as absorveu junto com o
   desenho novo dela. Não rode `-u` nele: confira as 8 linhas e diga no resumo. Ele vai no commit da 161.
2. **Prévia não gerada** (§6; nota de 2026-11-12):
   - Gere `C:\tmp\sarak-previa-164\index.html` sem escrever no `dist/`: harness do código-fonte com
     `buildHarness(entry, { useSourceLibrary: true })` e a folha CSS gerada na pasta do próprio harness, como faz
     `browser-tests/topbar-mais.spec.ts`.
   - Mostre um tema de cor declarada (`sarak-sovereign-classic`) com "Manter minha paleta" desligado e ligado.
   - Mostre a troca para um segundo tema com o interruptor ligado.
   - Mostre o interruptor no painel, nos dois estados, com o texto que muda.
   - A parte das paletas salvas é do lote 2.

**Como fechar** (verificação objetiva): o filtro `src/features/DesignEngine/Canvas` verde, o resumo com as linhas do diff dos
snapshots e o caminho da prévia. O revisor reroda só esse filtro e confere a prévia.

**Commit:** junto com o lote 1 da `plan-159`, que divide `docs/migracoes.md` e os kits com esta plan, depois desta correção e do ok
do dono nas duas prévias.

**Status da plan: 🔵 Em correção.**

## Resumo da execução (correção do veredito de 2026-11-17) — 2026-11-17

**Resultado:** Concluído.

1. **Snapshots.** `npx vitest run src/features/DesignEngine/Canvas` deu 1 falha (PreviewCanvas) e 255 passando; o AtmosphereCatalog já passava. Li o diff do PreviewCanvas antes do `-u`: só entram `data-sx-keep-palette="false"` (2 linhas, uma por raiz) e `--sarak-keep-palette: false` no `style` (2 linhas); sem o token, as linhas de estilo são idênticas. Rodei `-u` só em `PreviewCanvas.test.tsx` (4 inserções, 2 remoções; 3/3 passam). No AtmosphereCatalog não rodei `-u`: o diff do worktree tem 8 linhas com `keep-palette`, absorvidas pelo `-u` da plan-161; vai no commit da 161.
2. **Prévia.** `C:\tmp\sarak-previa-164\index.html` (com 6 capturas e `medidas.json`), gerada por harness do código-fonte (`useSourceLibrary`) com o CSS gerado na pasta do harness; `dist/` intocado; harness e scripts temporários removidos. Tema `sarak-sovereign-classic`: desligado, escolher paleta pergunta antes de descartar 22 cores e a troca para Cyberpunk Neon Classic traz a cor dele (#00ff64); ligado, sem pergunta, e a troca mantém a paleta (#718095). O interruptor aparece nos dois estados com o texto que muda. Limite: só Chromium escuro 1600×900; paletas salvas são do lote 2.

## Veredito — 2026-11-17 — lote 1, correção — 🟢 Aprovado no código; o lote fecha com o ok do dono na prévia

**Como medi (as três correções juntas):** numa cópia fora do repositório com o worktree inteiro (plans 159, 161 e 164), com
`npm run build` completo:
- navegador: `topbar-mais`, `barra-de-topo-estreita`, `plan-141-presets-do-painel` inteiro, `plan-161-catalogo-proporcional`,
  `login-theme-application`, `plan-122-preview-mode`, `plan-160-previa-mostra-a-opcao`, `plan-160-moldura-e-largura`,
  `troca-de-tema` e `css-que-so-o-navegador-mede` → **100 de 100 verdes**;
- unidade: `npx vitest run src/features/DesignEngine src/components/atomic/Navigation src/components/Layout src/core/Provider
  src/core/Design`, com a máquina livre → **340 arquivos, 3.408 verdes**;
- gates do hook (Anel 1 e auditoria) no worktree real: verdes, baseline sem regressão.

**Achados do veredito anterior**
1. O snapshot do `PreviewCanvas` só ganhou as quatro linhas do `keepPalette` (`data-sx-keep-palette` e `--sarak-keep-palette`, nas
   duas raízes). O do `AtmosphereCatalog` não foi regravado: as linhas do token já estavam lá, e ele vai no mesmo commit.
2. A prévia foi gerada do código-fonte, sem tocar o `dist/` (`C:\tmp\sarak-previa-164\index.html`). Conferi as capturas:
   - desligado, a troca para o Cyberpunk Neon Classic traz a cor do tema (#00ff64);
   - ligado, a paleta escolhida fica (#718095);
   - o texto do interruptor muda com o estado.

   Os cartões de tema da galeria ainda têm o desenho antigo, que o lote 2 da `plan-161` troca.

**Falta, para fechar o lote:** o ok do dono na prévia. Depois dele, a plan vai a 🟡 para o lote 2.

**Commit:** junto com as plans 159 e 161, depois da correção da 159.

**Status da plan: 🟠 Em revisão** (aguardando o ok do dono).

## Nota do revisor — 2026-11-17 — meta de rolagem de Cores no lote 2

Decisão do dono na `plan-161`: a decisão Cores (hoje 6,1 alturas da área de 660 px a 1440×900) passa a ter, no lote 2 desta plan,
a meta de **no máximo 2,5 alturas**, a mesma das outras decisões. Meça com o spec `plan-161-catalogo-proporcional.spec.ts`, que já
declara a medida, e baixe o limite de Cores nele para 2,5 no mesmo lote. Critério acrescentado ao lote 2.

## Nota do revisor — 2026-11-17 — ok do dono na prévia do lote 1

O dono aprovou a prévia (`C:\tmp\sarak-previa-164\index.html`). Ele perguntou por que, na etapa 2, a cor é a mesma com o interruptor
desligado e ligado. Resposta: escolher uma paleta aplica a paleta nos dois estados. A diferença dessa etapa é a pergunta antes de
descartar as 22 cores do tema (1 com o interruptor desligado, 0 com ele ligado) e o texto do interruptor. A cor se separa na troca de
tema (etapa 3). O código do lote saiu no commit `9f08de71`.

**Lote 1 fechado. Status da plan: 🟡 Em execução** (lote 2).

## Veredito — 2026-11-18 — lote 2 — 🔵 Em correção (um item objetivo, do lote 1)

**Como medi**
- No worktree real, `npx vitest run` de `compose.test.ts`, `src/core/Design/palette`, os testes novos de `savedPalettes` (tema,
  validação e integração pelo Provider), `src/features/DesignEngine/Main` e `src/features/DesignEngine/utils`: 90 de 90 arquivos e
  1173 de 1173 testes verdes.
- **Diff lido:** `savedPalettes.ts`, `validation.ts`, `compose.ts`, `useSavedPalettes.ts`, `useOpenGalleryGroups.ts`,
  `PaletteGallery.tsx`, `PaletteCreator.tsx`, `PaletteSection.tsx`, `useBrandForm.ts`, `BrandShortcut.tsx`, `decisions.ts` e
  `ThemeDecisionView.tsx`. O nome passa por uma lista de caracteres permitidos que exclui os separadores `|` e `~`.
- **Sonda** (`npx tsx` sobre `composeThemeDesign`): um tema com todo padrão do schema (o que o painel salva), aplicado sobre um
  design com "Manter minha paleta" ligado e uma paleta escolhida, devolve `keepPalette: false` e nenhum `colorPalette`.
  `savedPalettes` e `systemName` sobrevivem.

**Achado**
1. **Aplicar um tema salvo pelo painel desliga "Manter minha paleta" e perde a paleta escolhida.** É o defeito que o resumo aponta
   em "fora do escopo", e a sonda o confirma. Ele é do lote 1 desta plan (critério "a paleta vale por cima de qualquer tema"), então
   se corrige aqui. A causa é a mesma do `savedPalettes`: a chave preservada perde para o padrão que o tema traz.
   - Critério: com um tema que traz o padrão do schema, `keepPalette` ligado e a paleta escolhida seguem. Vale também para toda
     chave de `THEME_PRESERVED_KEYS` com padrão definido no schema, e não só para estas duas. O teste reprova sem o conserto.

**Atribuição corrigida:** o "`plan-161-catalogo-proporcional` já reprova no `HEAD`" do resumo veio de uma cópia sem `npm run build`,
que lê o `dist/` da última release. Na cópia com build (veredito do lote 3 da 161), o spec passa inteiro.

**Para o dono (com a prévia):** a decisão 5 do resumo recolhe os "Ajustes principais" em **toda** decisão com mais de oito controles,
não só em Cores (Forma foi de 3,07 para 1,72 alturas). Se o dono quiser isso só em Cores, é uma condição em `ThemeDecisionView.tsx`.

**ADR-027:** a forma do valor (texto compacto num token `string`, comparado por igualdade de texto) entrou como nota de
implementação no próprio ADR. A decisão não muda.

**Como fechar** (verificação objetiva): o teste novo e `compose.test.ts`. O revisor reroda só esses. A medida de navegador (Cores,
`cromo-css-real:check`) e a suíte completa ficam para a verificação conjunta das três plans, antes do commit.

**Commit:** junto com o lote 3 da `plan-159` e o lote 3 da `plan-161`, depois das correções e do ok do dono nas prévias.

**Status da plan: 🔵 Em correção.**

## Resumo da execução (correção do veredito de 2026-11-18) — 2026-11-18

**Resultado:** Concluído.

1. **Conserto.** Em `composeThemeDesign`, para cada chave de `THEME_PRESERVED_KEYS` que existe no padrão do schema: se o tema resolvido traz exatamente o padrão dela (o que o painel salva), vale o valor do design anterior (ou do host). O tema que declara um valor diferente do padrão continua vencendo (`systemName`, `mode`). Isso substitui a reposição só de `savedPalettes`.
2. **Testes** em `compose.test.ts`: um com `keepPalette` ligado, paleta escolhida, `savedPalettes` e `systemName` sobre um tema com todo padrão do schema, e um que percorre toda chave preservada com padrão no schema. Sem o conserto (condição trocada por `false`) os dois reprovam; restaurado, passam.
3. **Verificação.** `compose.test.ts`: 16 de 16. Vizinhos (`src/core/Design/presets`, `src/core/Design/hooks`, `src/features/DesignEngine/hooks`): 37 arquivos, 530 testes verdes. `tsc`: 0 erros.
4. **Efeito colateral a saber.** Um tema que declara `mode: 'dark'` (o padrão) sobre um design anterior em `light` agora mantém `light`; é a mesma regra, e nenhum teste existente depende do contrário.

**Status da plan: 🟠 Em revisão.**

## Veredito — 2026-11-18 — lote 2, correção — 🟢 Aprovado no código; o lote fecha com o ok do dono na prévia

**Como medi:** `compose.test.ts` e os vizinhos que compõem tema (`src/core/Provider/hooks`, `src/features/DesignEngine/hooks` e
`utils/__tests__`): 56 de 56 arquivos e 422 de 422 testes verdes. O executor fez a mutação (os dois testes novos reprovam sem o
conserto). O `tsc` acusa 1 erro, em `neutralCardBase.ts:21`, que é da correção da `plan-161` em andamento, não desta plan.

**O efeito colateral declarado** (um tema que declara `mode: "dark"` não troca um design anterior em `light`) **não chega à tela**.
Toda chamada que aplica tema resolve o tema para o modo pedido antes de compor:
- `useDesignSync.ts`, pelo modo do design anterior;
- a galeria, em `PresetsCatalog.tsx:57`, pelo `draftMode`;
- o tema de referência, escolhido pelo modo do rascunho.

O `mode` que chega à composição já é o pedido.

**Falta, para fechar o lote 2:**
- o ok do dono na prévia (`C:\tmp\sarak-previa-164\lote2\index.html`);
- a resposta dele sobre os "Ajustes principais" recolhidos em toda decisão com mais de oito controles, ou só em Cores.

**Commit:** junto com o lote 3 da `plan-159` (fechado) e o lote 3 da `plan-161`, depois da verificação conjunta com build.

**Status da plan: 🟠 Em revisão** até o ok do dono.

## Nota do revisor — 2026-11-18 — ok do dono na prévia do lote 2

O dono aprovou a prévia `C:\tmp\sarak-previa-164\lote2\index.html`. Os "Ajustes principais" recolhidos em toda decisão com mais
de oito controles (decisão 5 do resumo) ficam como foram executados e aprovados na prévia.

**Lote 2 fechado, e com ele a plan (o lote 2 é o último). Status da plan: 🟢 Aprovada**, à espera da síntese (destino: ADR-027, [[09-temas-e-presets]] e [[06-painel-de-customizacao-e-preview]]). O commit sai junto com a `plan-159` e o lote 3 da `plan-161`.
