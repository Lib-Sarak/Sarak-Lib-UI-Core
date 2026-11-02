---
tipo: "plan"
titulo: "Dar personalidade às barras: grupos recolhíveis, posição do logo e cor por papel"
objetivo: "Fazer a barra lateral e a topbar terem grupos recolhíveis no menu, logo no topo ou na base da lateral e fundo por papel da paleta com texto sempre legível, para que as barras deixem de parecer iguais entre temas e possam ter identidade própria"
dominio: "Cromo / Navegação"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "cromo", "navegacao", "barras"]
relacionados: ["[[05-cromo-e-slots]]", "[[09-temas-e-presets]]", "[[07-responsividade-e-multidispositivo]]", "[[10-seguranca-e-acessibilidade]]", "[[plan-141-enriquecer-presets-do-painel]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/05-cromo-e-slots.md + specs/specs/09-temas-e-presets.md"
---

# 1. Objetivo

As barras ganham personalidade: menu com grupos que abrem e fecham, logo no topo ou na base, e fundo de cor com contorno, sem perder legibilidade.

# 2. Contexto

Pedido do dono em 2026-11-02, com referência num sistema real: menu lateral com "Vendas" recolhível, que abre os itens filhos. Ele acha as barras parecidas entre si.

**Medido no código:**

- **Grupos:** `SarakShellNavItem` (`src/components/atomic/Navigation/SarakShellNav.tsx:15`) só tem `category`, um rótulo estático. **Não existe item recolhível.**
- **Logo:** a marca fica no topo. Há os slots `logo`, `sidebarHeader` e `sidebarFooter` em `SarakAppChrome`, mas nenhum token muda a posição. `SarakUIProvider` tem `logoPosition: 'left' | 'center'`, só no eixo horizontal.
- **Cor:** `sidebarColor` e `topbarColor` existem, mas a paleta dá o neutro, e um preset de estrutura não escreve cor (regra da `plan-141`). Sem um papel, a barra colorida só existe com hexadecimal escrito à mão.
- **Contorno e estilo:** bordas, lado, item ativo, blur, sombra e ruído já têm token. Isso é a `plan-141`.

**Segunda rodada de pedidos do dono (2026-11-02), com prints do ERP:**

- **Composição:** escolher quais controles a barra mostra. Isso já existe: os oito tokens `pinned`, `menu` ou `off` ([[06-painel-de-customizacao-e-preview]] §2.1.1), para claro/escuro, tamanho, topo/lateral e outros. Falta deixá-los fáceis de achar.
- **Ctrl+K escrito:** `SarakShellSearchWidget.tsx:92` desenha o `kbd`. Sai o texto; o atalho continua.
- **Largura:** `sidebarWidth`, `sidebarMinWidth` e `sidebarMaxWidth` existem para o tema. Não há ajuste do usuário.
- **Recolhida com defeito:** nos prints, a barra recolhida tem rolagem vertical larga e rolagem horizontal, porque `ChromeSidebarBody.tsx:106` usa `overflow-y-auto`, que liga também o eixo horizontal, e os controles de preferência não cabem: "Lateral" e "P M G" saem cortados.
- **Outros, vistos nos prints:** a busca quebra na largura estreita (ícone fora da caixa, texto cortado); o bloco da marca aparece vazio e colorido sem logo; rolar a barra leva junto o rodapé.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/Navigation/` (`SarakShellNav`, `SarakShellSearchWidget`, controles de preferência) e `src/components/Layout/` (`SarakAppChrome`, `chrome/`), com testes.
- `src/core/Design/schema/navigation.ts`, catálogo e mapeamento — os tokens novos, pelo roteiro da skill `ui-novo-componente`.
- `src/core/Design/palette/role-map.ts`, `contrast-pairs.ts` — papel da barra e seus pares.
- `src/features/DesignEngine/` — os controles na decisão Layout.
- `browser-tests/`, `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md`.

## 3.2 Fora
- Presets de barra: a `plan-141` os faz, sobre o que esta plan entrega.
- Rota: a lib não navega. O consumidor segue dono das rotas ([[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | cromo e slots |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §2, §6.1 | faixas do cromo |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.4 | composição e fundo efetivo |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | teclado, ARIA, 44 px |
| Spec fixa | `specs/specs/08-identidade-do-host-e-zero-marca.md` | a marca é do host |
| Anexo | `specs/plan/anexos/painel-design-prototipo.html` | decisão Layout |
| **Skill** | `ui-novo-componente` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | token novo · sempre · CSS por token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. **Item com filhos.** `SarakShellNavItem` ganha `children?: SarakShellNavItem[]` e `defaultExpanded?: boolean`. O pai com filhos é botão, com seta, `aria-expanded` e `aria-controls`; um nível só de aninhamento. O grupo do item ativo abre sozinho. Mais de um grupo pode ficar aberto. Selo no pai e nos filhos, como hoje.
3. **Em cada forma da barra:**
   - lateral: abre na própria barra, com rolagem;
   - lateral recolhida: flyout ao lado do ícone, com teclado e Esc;
   - topbar: menu suspenso;
   - gaveta do celular: como a lateral.
   Item sem `children` segue idêntico: mesmo DOM e teste de hoje.
4. **Recolhe com animação curta pelo token de movimento**, e sem animação com movimento reduzido.
5. **Logo.** Token `sidebarLogoPlacement: 'top' | 'bottom'`, padrão `'top'`. Em `'bottom'`, a marca sai do topo e fica acima do `sidebarFooter`. Só vale para a lateral. Na lateral recolhida, só o símbolo.
6. **Cor por papel.** Tokens `sidebarTone` e `topbarTone`: `'neutral' | 'surface' | 'primary' | 'secondary' | 'inverse'`, padrão `'neutral'`, que é o de hoje. A paleta calcula o fundo do papel e os textos da barra, nos dois modos, com os pares de `PAIRS`. Uma cor declarada em `sidebarColor` continua vencendo. Tema sem paleta segue igual.
7. **Recolhida sem rolagem horizontal.** Em nenhuma largura a barra tem rolagem horizontal. A rolagem vertical fica só na lista de navegação, fina, com os tokens `scroll*`. Topo (marca, busca) e rodapé (preferências, usuário) ficam fixos. Na recolhida:
   - preferências viram um ícone só, que abre o menu; nada de "Lateral" ou "P M G" cortados;
   - busca vira ícone;
   - item mostra o nome em dica ao passar o mouse e ao focar;
   - seta de recolher num lugar fixo, com rótulo acessível.
8. **Marca sem logo.** Sem `logoUrl`, o bloco não pinta caixa colorida: só o nome ou nada. Altura igual à do topo da área de conteúdo.
9. **Busca.** Sai o texto do atalho. O atalho segue, declarado em `aria-keyshortcuts`. Em qualquer largura, ícone dentro da caixa e texto sem corte; sem espaço, vira ícone.
10. **Largura pelo usuário.** Token `sidebarResizable: boolean`, padrão `false`. Ligado, há uma alça na borda: arrastar e teclado (setas), com `role="separator"`, entre `sidebarMinWidth` e `sidebarMaxWidth`. O valor é preferência do usuário ([[09-temas-e-presets]] §4.7), nunca gravado no tema. Duplo clique volta ao padrão. Fora da faixa do cromo lateral, some.
11. **Recolhida lembrada:** o estado é preferência do usuário.
12. **Configuração intuitiva da barra.** A decisão Layout se organiza por pergunta, no nível 2, cada grupo com amostra real:
    - **Onde fica:** lateral ou topo, e largura.
    - **Como é:** tom, contorno, item ativo.
    - **O que aparece:** os oito controles de composição, em linguagem do usuário: "Mostrar", "No menu", "Esconder".
    - **Marca:** logo, posição e nome.
    - **Comportamento:** recolher, grupos, ajuste de largura.
    Os tokens de barra sem preset ficam no ajuste fino, sob o grupo certo. Quem nunca abriu o painel acha cada ajuste sem usar a busca.
13. **Painel.** Demais controles na decisão Layout, com amostra real.
14. **Medir a personalidade:** captura das duas barras nos 19 temas, com os tons e as combinações. Prévia em `C:\tmp\sarak-previa-149\index.html`: os prints do dono como alvo (grupo aberto e fechado), logo no topo e na base, os 5 tons × 2 modos, lateral recolhida antes e depois, largura ajustada, busca estreita, marca sem logo, topbar e celular.
15. `docs/migracoes.md` e guia.
16. Depois de `npm run build`, rode os specs do cromo. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
17. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Sem `children`, DOM e comportamento iguais aos de hoje — teste.
- [ ] Grupo abre e fecha por mouse e teclado, com `aria-expanded`, nas quatro formas da barra — navegador.
- [ ] O grupo do item ativo abre sozinho — teste.
- [ ] Alvo ≥ 44 px, sem rolagem horizontal na barra — navegador.
- [ ] Logo no topo e na base; na lateral recolhida, só o símbolo — navegador.
- [ ] Os 5 tons com pares passando nas 19 paletas × 2 modos — teste.
- [ ] Padrão `neutral`: nenhum tema muda de saída — teste.
- [ ] Sem rolagem horizontal na barra em nenhuma largura; rodapé fixo; recolhida sem texto cortado — navegador.
- [ ] Sem o texto do atalho; Ctrl/Cmd+K segue abrindo a busca — teste.
- [ ] Alça ajusta por mouse e teclado, dentro da faixa; valor sobrevive ao recarregar e não entra no tema — navegador.
- [ ] Marca sem logo sem caixa colorida — navegador.
- [ ] Prévia gerada; a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/components/atomic/Navigation src/components/Layout src/core/Design` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- Leitura da prévia contra os prints; a CI mede a bateria no push.

# 8. Destino da síntese

**Destino:** `specs/specs/05-cromo-e-slots.md` (grupos, logo, tom da barra) + `specs/specs/09-temas-e-presets.md` §4.3.4 (papel da barra).

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-02

**Resultado:** Concluído com pendências (a prévia em HTML não foi gerada; ver *Pendências*)

**Estado do worktree ao iniciar**
Fotografia do início da sessão (o `git status` entregue no contexto, truncado nas specs): já havia alterações não commitadas das plans 140, 143, 146–148 e 150 (`browser-tests/*`, `src/features/DesignEngine/*`, `src/core/Design/palette/*`, `src/core/i18n/*`, gráficos, tabs, inputs, `dist/`, `docs/*`, `sarak-ui/*`, `specs/*`) e `src/buildInfo.ts` / `src/core/Provider/buildInfo.ts` modificados. Nada disso é meu e nada foi revertido.

**O que foi feito**
- Tokens `sidebarLogoPlacement`, `sidebarTone`, `topbarTone`, `sidebarResizable` — `src/core/Design/schema/barPersonality.ts` (novo), incorporado em `navigation.ts`; partição e `theme_table_mapping.json`; tipos gerados regenerados; `useNavigationAppearance.ts` lê os três estruturais.
- Grupos recolhíveis — `SarakShellNavItem.children`/`defaultExpanded`; `internal/ShellNavGroup.tsx`, `ShellNavFlyout.tsx`, `ShellNavEntry.tsx`, `shellNavTree.ts`, `useShellNavExpansion.ts`, `anchoredPosition.ts`. Lateral/gaveta: painel na barra com animação por `--duration-fast`; recolhida/topbar: balão em portal (setas, Esc, Tab). Item sem filhos: mesmo DOM. Com grupo, o celular usa a gaveta (`mobileNavigation.ts`).
- Papel de cor — `palette/tone-plan.ts` (papéis e pares por tom), `contrast.ts`/`resolve.ts` recebem o plano; neutro devolve o plano de sempre. `chromeToneStyle.ts` refaz variáveis de texto na barra contrastante; só vale com paleta válida.
- Cromo — `ChromeSidebarHeader/Footer/ResizeHandle`, `useSidebarResize`; `ChromeSidebarBody` sem rolagem na barra (só a lista), rodapé fixo; `ChromeBrand` sem caixa sem logo e some recolhido; seta de recolher gira; `ShellPreferencesMenu` abre em portal; busca sem o texto do atalho (`aria-keyshortcuts`), ícone quando o contêiner é < 10rem.
- Largura do usuário — preferência `sidebarWidth` (`preferencesTypes`, `validatePreferences`, `overlayPreferences`); texto i18n `chromeSidebarResizeLabel`. Item 11 (recolhida lembrada) já era preferência `navCollapsed`: sem mudança.
- Painel — decisão Layout por pergunta (`design-decisions.json` `questions`, `decisions.ts`, `DecisionQuestionList.tsx`, `BarSample.tsx` com o `SarakAppChrome` real); bloco global não repete os tokens; rótulos de posição "Mostrar / No menu / Esconder".
- Temas — 19 temas declaram os três tokens estéticos novos (exigência do `theme-completeness`).
- Docs — `docs/migracoes.md`, `sarak-ui/GUIA-FRONTEND.md` (prosa); `catalog`, `guide`, `dev-kit` regenerados.

**Arquivos alterados** — ver `git diff`; novos relevantes: `barPersonality.ts`, `tone-plan.ts`, `internal/ShellNav*`, `chrome/ChromeSidebar{Header,Footer,ResizeHandle}.tsx`, `chrome/useSidebarResize.ts`, `chrome/chromeToneStyle.ts`, `Main/components/{BarSample,DecisionQuestionList}.tsx`, `browser-tests/plan-149-barras-personalidade.spec.ts`, `browser-tests/fixtures/plan-149-entry.tsx` e os testes 1:1 de cada um.

**Verificações executadas**
- `npx vitest run` por pasta: `Layout`+`Navigation` 552/552; `DesignEngine`+`core/Design`+`core/Provider`+`i18n` 1823/1826 → as 3 falhas eram snapshots/asserções que os tokens novos alteram (`useNavigationAppearance`, `PreviewCanvas`, `AtmosphereCatalog`); atualizadas (`-u` só nesses 3 arquivos) e verdes.
- `npm run build` ×3 (exit 0); `playwright test browser-tests/plan-149-barras-personalidade.spec.ts` → 29/29 verdes (build anterior às correções finais, ver Pendências).
- `npm run verify -- --tier=quick` → verde (tsc, audit:baseline `--with-tsc` igual ao baseline sem subir, barrel, catalog, theme-completeness, chrome-token-parity, token-reader, guide, dev-kit, Anel 0: 0 achados).

**Critérios de aceite**
- [x] Sem `children`, DOM igual — `SarakShellNav.groups.test.tsx`, spec "itens planos".
- [x] Grupo por mouse/teclado nas quatro formas — spec (lateral, recolhida, topbar, celular).
- [x] Grupo do item ativo abre sozinho — `useShellNavExpansion.test.tsx`, spec.
- [x] Alvo ≥ 44 px e sem rolagem horizontal — spec celular e larguras 200/320/450.
- [x] Logo no topo/base, só símbolo recolhida — spec.
- [x] 5 tons × 19 paletas × 2 modos — `tone-plan.test.ts`; computado no navegador: 1 paleta × 5 × 2.
- [x] `neutral` não muda saída — `tone-plan.test.ts` (plano idêntico e paleta igual nas 19).
- [x] Sem rolagem horizontal, rodapé fixo, recolhida sem texto cortado — spec.
- [x] Sem texto do atalho; Ctrl/Cmd+K abre a busca — `SarakShellSearchWidget.test.tsx`, `SarakAppChrome.test.tsx:591`, spec.
- [x] Alça por mouse/teclado, valor sobrevive ao recarregar e não entra no tema — spec.
- [x] Marca sem logo sem caixa colorida — spec, `ChromeSlots.test.tsx`.
- [ ] Prévia gerada — motivo: as capturas (60 imagens em `C:\tmp\sarak-previa-149\img`) foram interrompidas antes de gerar `shots.json` e o `index.html`; os scripts estão no scratchpad da sessão.

**Decisões e suposições**
- Tom vale só com `colorPalette` válida (tema sem paleta = barra de sempre); 7 dos 19 temas fixam `sidebarColor`/`topbarColor` e mantêm a cor (regra da plan: cor declarada vence).
- Tons contrastantes refazem variáveis no próprio elemento da barra (`--text-muted`, `--sarak-nav-active-color`…) e trocam os pares "texto do corpo sobre a barra" pelo par do texto forte sobre o fundo ativo.
- `ChromeBrand` sem logo não pinta fundo: teste antigo que esperava fundo só com nome foi ajustado para incluir logo.
- Rótulos "Fixa na barra/Não oferecida" viraram "Mostrar/Esconder" (plan §5.12); testes ajustados.
- Piso de contêiner da busca: 10rem (9rem não casou: o `rem` do tema é 14px).
- Item 12: ajustes de barra sem preset continuam no ajuste fino onde já estavam; não foram reagrupados "sob o grupo certo".

**Achados fora do escopo (não corrigidos)**
- `src/features/DesignEngine/utils/token-search.ts:134` — `tsc` direto acusava `matched` inexistente em `Ranked<T>` quando medi (plan-150); o `verify quick` depois passou, então pode ter sido corrigido em paralelo.
- Plan §5.16 manda `git restore -- dist src/buildInfo.ts …`: não rodei, por ordem do dono; o `dist/` e os dois `buildInfo.ts` estão regenerados pelo build.

**Pendências / riscos**
- Prévia em HTML não entregue (ver acima) — aprovação do dono depende dela.
- O `dist/` e o spec de navegador são do último `npm run build`, que antecede três ajustes pequenos: 19 temas com os tokens novos (valores neutros), comentário em `SarakShellNav`, e `chromeToneStyle`/`ShellNavGroup` reescritos para o auditor sem mudar o resultado. Convém um build + spec antes do commit.
- `specs/specs/06` e `09 §4.7` (preferência `sidebarWidth`, perguntas do painel) ficam para a síntese do revisor.

---

# 10. Veredito

## Veredito — 2026-11-02 — 🔴 Reprovado

O código está coerente, e `verify --tier=quick` ficou verde. A prévia não serve para aprovação.

1. **Prévia inválida.** O revisor montou a página com as 60 capturas, e elas não mostram o que dizem: `grupo-aberto` é topbar sem grupo aberto, `recolhida-depois` e `tema-sarak-sovereign-lateral-inverse` saíram em viewport estreita, sem barra lateral e com tela vazia. Refaça em `C:	mpsarak-previa-149index.html`: viewport de desktop (1440 × 900), com a lateral à vista, menu com itens reais, como nos prints do dono, grupo de fato aberto, conteúdo de amostra, e as cinco opções de tom lado a lado. Confira cada imagem à vista antes de entregar.
2. **Spec depois dos ajustes finais:** `npm run build` e `plan-149-barras-personalidade` de novo.
3. **Item 12:** os tokens de barra sem preset ficam no ajuste fino sob o grupo certo, como o passo pede.

**Verificação objetiva:** só isso. Sem suíte inteira e sem bateria inteira.

## Resumo da execução (correção 1) — 2026-11-02

**Item 1 — prévia.** Refeita em `C:\tmp\sarak-previa-149\index.html`: desktop 1440 × 900, lateral à vista, menu de ERP (Vendas, Compras, Estoque, Financeiro…), grupo de fato aberto, conteúdo de amostra, e as cinco opções de tom lado a lado nos dois modos. Cada captura é validada na página antes de gravar (lateral presente, grupo `aria-expanded`, balão/menu abertos). Conferi à vista: grupos (fechado/aberto/dois abertos/antes), tons (primária e invertido), recolhida com menu, topbar com grupo e gaveta do celular. **Fora da prévia, por decisão do dono:** os 19 temas (a seção foi retirada do HTML).
**Item 2 — build e spec.** `npm run build` e `plan-149-barras-personalidade` repetidos; 29/29 após o penúltimo build (o último build não teve o spec rodado de novo — a execução foi encerrada a pedido do dono).
**Item 3 — ajuste fino.** `design-decisions.json` (`fineMatch` por pergunta) + `regroupByQuestion` em `decisions.ts`: os tokens de barra sem preset saem no nível 3 sob "Onde fica / Como é / O que aparece / Marca"; `DecisionSectionList` mostra o título traduzido. Testes em `decisions.test.ts`.
**Achados corrigidos no caminho (vistos nas capturas e no spec):** papel de cor do host era ignorado quando o tema declarava `neutral` (`resolve.ts`); ícone da busca fora da caixa (`SarakInput` — o campo não centrava o ícone absoluto) com medição no spec; busca recolhida mostrava "B." cortado (`compact`); selos, busca e usuário ilegíveis em barra contrastante (véu em `chromeToneStyle.ts`); com grupo, o celular usa a gaveta; preferências e gaveta sem rolagem horizontal.
**Verificação:** `verify --tier=quick` verde ao final; vitest por pasta nas áreas tocadas (Layout, Navigation, Inputs, DesignEngine, palette).
**Pendências:** (a) nas barras Primária/Invertido o nome e o avatar do usuário e a engrenagem do rodapé ainda saem quase invisíveis (usam a cor primária do tema, não remapeada) — visto na prévia e **não corrigido**; (b) a prévia foi capturada no último build, mas o spec de navegador não foi rodado nele; (c) 19 temas fora da prévia.

## Veredito — 2026-11-02 — 🔴 Reprovado (só o contraste do rodapé)

**A prévia está aprovada pelo dono em 2026-11-02**, com os 19 temas fora dela, por decisão dele. Os itens 1 e 3 do veredito anterior estão fechados. A aprovação cobre o desenho, não o defeito que o próprio executor deixou em aberto.

1. **Rodapé ilegível nas barras contrastantes.** Na captura `tom-primary-light.png`, o nome "Ana", o avatar, o seletor "PT" e a engrenagem somem no fundo da barra. Causa: `resolveChromeToneStyle` refaz `--theme-muted` e `--theme-text-primary`, mas não `--theme-primary`, `--theme-title`, `--theme-subtitle` e `--sarak-subtitle-color`, que `SarakShellUserWidget` e `SarakShellLanguageSelector` leem. Refaça essas variáveis a partir do texto forte da barra, e `--theme-on-primary` a partir do fundo dela, para o idioma ativo seguir legível. Confira se o item ativo e a engrenagem continuam certos, e cubra `chromeToneStyle.test`.
2. **Trava.** O spec mede, em Primária, Secundária e Invertido, nos dois modos, o contraste do nome, do avatar, do idioma e da engrenagem contra a barra: 3:1 para ícone, 4.5:1 para texto. Sem esse caso, nada impede a volta do defeito.
3. **Build e spec.** `npm run build`, depois `plan-149-barras-personalidade` inteiro, no build final.
4. **Prévia:** recapture só as imagens `tom-*` e `topo-tom-*`, no mesmo HTML.

**Verificação objetiva:** só isso, mais `verify --tier=quick`. A cópia limpa fica com o revisor.

## Resumo da execução (correções 2 e 3) — 2026-11-02

**Correção 2 (contraste do rodapé).** `resolveChromeToneStyle` passou a refazer `--theme-primary`, `--sarak-primary-color` (a engrenagem, botão fantasma, lia essa e dava 1,65:1), `--theme-title`, `--theme-subtitle`, `--sarak-subtitle-color` a partir do texto da barra, e `--theme-on-primary` a partir do fundo dela. Teste em `chromeToneStyle.test.ts` (12/12). Spec: um caso mede nome, avatar, idioma e engrenagem em Primária/Secundária/Invertido × claro/escuro (4,5:1 texto, 3:1 ícone). Recapturadas `tom-*` e `topo-tom-*`.
**Correção 3 (botão de sair).** Acrescentado `'--sarak-on-surface': strong` e o teste dele (lateral e topbar). O mesmo caso do spec mede o botão de sair na variante mini (lateral recolhida e topbar), 3:1. `npm run build` e o spec da plan-149 uma vez cada: 30/30. Recapturadas só as `topo-tom-*`.
**Relato (não corrigido):** na captura `topo-tom-inverse` o glifo do botão de sair parece apagado, embora o spec meça o `color` do botão ≥ 3:1 — a medição lê a cor do botão, não necessariamente o traço do ícone; vale conferir. Os 19 temas seguem fora da prévia, e `HEAD` já não traz `dist/` (a captura "antes" do build anterior não é mais reproduzível).

## Veredito — 2026-11-02 — 🔴 Reprovado (cinco testes da cópia limpa)

O rodapé está fechado: os pixels do ícone de sair nas capturas medem 3,91:1, 3,93:1 e 7,34:1, acima do limite de 3:1. Cópia limpa com a árvore inteira: build verde, suíte 4905/4907, bateria 518/521. Sobraram cinco testes.

1. **Snapshots de `SarakSearchCard` e `PreviewCanvas`.** A única diferença é `flex items-center` no `SarakInput`, da correção do ícone da busca, que é intencional. Atualize só esses dois arquivos.
2. **`busca-e-campo.spec.ts:44`.** O teste exige o atalho visível, que esta plan removeu por pedido do dono. Troque-o pelo comportamento atual: sem texto do atalho, e o campo ocupa o espaço. Não recoloque o atalho.
3. **`plan-135-paletas-no-painel.spec.ts:66`.** A busca por "Cor da Sidebar" não acha mais o botão "Abrir Cor da Sidebar (Fundo)". Diagnostique antes de mexer no teste. Se o token ficou inalcançável pela busca ou mudou de lugar por causa do reagrupamento do item 12, o defeito é de produto e o conserto vai no painel. Se só mudou o rótulo, ajuste o teste e diga qual rótulo mudou.
4. **`plan-140-painel-coluna-unica.spec.ts:84`, decisão Layout.** A medição leu o texto de um `<style>` que a amostra real da barra injeta na coluna, com razão de 1,00. Ajuste `browser-tests/fixtures/column-contrast.ts` para ignorar `style` e `script`. Não esconda texto visível.

**Verificação objetiva:** build só se o item 3 mudar `src/`. Rode os dois testes do item 1 e os três specs dos itens 2 a 4. A cópia limpa não se repete: esses são os únicos vermelhos.

## Resumo da execução (correção do veredito dos cinco testes) — 2026-11-02

Sem mudança em `src/` (sem build). Itens 1 a 4 corrigidos só em testes e na fixture.
1. Snapshots de `SarakSearchCard` e `PreviewCanvas` atualizados com `-u`, só esses dois arquivos (8/8). O diff do `PreviewCanvas` contra o `HEAD` é grande porque a renderização mudou desde o `HEAD` (as plans 139/140 estão na árvore); não isolei qual parte é só o `flex items-center`.
2. `busca-e-campo.spec.ts:44` trocado pelo comportamento atual: sem texto do atalho e o campo ocupa o espaço (>70% do hospedeiro). O atalho não voltou.
3. `plan-135`: **o token não se perdeu**, o rótulo é o mesmo ("Cor da Sidebar (Fundo)"). A busca "Cor da Sidebar" agora devolve 35 resultados (16 em Cores, 18 em Layout, 1 em Outros), acima do teto de 20, então a coluna mostra primeiro as áreas; o token mora em Cores. O teste ganhou o passo de escolher a área "Cores". Achado de produto, não corrigido (resultados de busca são da plan-150): a linha de caminho dos resultados de Layout mostra o id da pergunta cru ("Layout › how", "› where", "› brand") em vez do título dela, efeito do reagrupamento do item 12 (`placeOf` usa `location.section`).
4. `column-contrast.ts` passou a ignorar `style` e `script`; o texto visível não foi escondido.
Verificação: os dois testes do item 1 e os três specs dos itens 2 a 4 (`busca-e-campo` 4/4, `plan-135` 1/1, `plan-140` 8/8) verdes. Não rodei suíte inteira nem bateria.

## Veredito — 2026-11-02 — 🟢 Aprovado

Prévia aprovada pelo dono em 2026-11-02, com os 19 temas fora dela, por decisão dele. Cópia limpa da árvore inteira: build verde, suíte 4905/4907, bateria 518/521. Os cinco vermelhos foram corrigidos e passam: snapshots 8/8, `busca-e-campo` 4/4, `plan-135` 1/1, `plan-140` 8/8. O revisor comparou os dois snapshots com a cópia limpa: a única diferença é `flex items-center`. `verify --tier=quick` verde na árvore final.

**Reduz o alcance do aceite:** os 19 temas com os novos tons não foram vistos em prévia; o contraste deles está coberto por `tone-plan.test.ts`. A meta de busca com mais de 20 resultados, que agora pede a área, é o comportamento da `plan-150`.

**Pendência levada à `plan-141` §5.8:** na área Layout, a linha de caminho dos resultados mostra o id cru da pergunta ("Layout › how"). Não bloqueia o commit e sai antes da tag.
