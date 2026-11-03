---
tipo: "plan"
titulo: "Adicionar painel arrastável, mapa, assinatura, tour, carrossel e exportação Excel"
objetivo: "Fazer a lib oferecer painel de widgets arrastáveis, mapa, campo de assinatura, tour guiado, carrossel e exportação Excel, carregados sob demanda e sem peso no boot do consumidor"
dominio: "Componentes / Recursos avançados"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc.5", "dashboard", "mapa", "assinatura"]
relacionados: ["[[anexos/rc5-contrato]]", "[[10-seguranca-e-acessibilidade]]", "[[07-responsividade-e-multidispositivo]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/specs/10-seguranca-e-acessibilidade.md"
---

# 1. Objetivo

A lib cobre também os recursos que os sistemas ainda não pediram, mas costumam pedir, sem custar nada a quem não os usa.

# 2. Contexto

Decisão do dono em 2026-11-02: estes itens entram, mesmo sem uso nos sistemas varridos, para antecipar demanda.

**Três restrições vêm das regras da lib:**
- **Peso:** o boot não cresce. Cada peça fica atrás de carga sob demanda, com a dependência em `peerDependencies` opcional, como PDF e gráficos, e com `SarakOptionalPeerFallback` quando faltar.
- **A lib não faz rede** ([[10-seguranca-e-acessibilidade]] §3.2), e o mapa precisa de blocos de mapa. Não há provedor padrão: o consumidor passa `tileUrl`, e o componente entra na allowlist do gate de rede da `plan-151`, com motivo.
- **Assinatura não tem validade jurídica por si:** a peça devolve imagem e traços, e quem registra data, autor e prova é o consumidor. A documentação diz isso.

# 3. Escopo

## 3.1 Dentro
- Componentes novos em `src/components/atomic/`, com testes e lazy no barril.
- `package.json`: peers opcionais.
- `src/core/i18n/`, `docs/migracoes.md`, `browser-tests/`, e a `ALLOWLIST` de `gates/scripts/contrato/check-no-network.mjs`.

## 3.2 Fora
- Dependência obrigatória nova. Provedor de mapa embutido ou chave de API. Geocodificação.
- Edição inline e visões salvas: já existem na `SarakDataTable`.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | superfície |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | rede, teclado, conteúdo externo |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` §6.1 | contêiner, toque |
| Código | `src/components/atomic/DataDisplay/SarakDataTable/` | exportação |
| **Skill** | `ui-novo-componente` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | componente · sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree. Meça `npm run boot:measure`, e declare no resumo cada peer proposto e o motivo da escolha. Prefira o que a lib já declara como peer (`react-grid-layout`, `@dnd-kit`). Se precisar de peer novo, pare e reporte antes de instalar.
2. **`SarakDashboardGrid`:** widgets arrastáveis e redimensionáveis; `layout` + `onLayoutChange`, com a persistência no consumidor. Teclado para mover e redimensionar. Modo só leitura. Colapsa a uma coluna em contêiner estreito.
3. **`SarakMap`:** `tileUrl`, `center`, `zoom`, `markers`, `onMarkerClick`, atribuição obrigatória, sem rede antes de receber `tileUrl`. Sem peer ou sem URL, mostra o fallback.
4. **`SarakSignaturePad`:** canvas próprio, sem peer, com mouse, toque e caneta; limpar, desfazer; devolve PNG e traços. Tem alternativa acessível: digitar o nome.
5. **`SarakTour`:** passos com alvo, destaque, próximo, voltar, pular; foco preso, Esc e posição por contêiner. Reaproveita `SarakSpotlight` e a pilha de camadas (`useOverlayLayer`). Quem lembra que o usuário já viu é o consumidor.
6. **`SarakCarousel`:** sem autoplay por padrão, setas, pontos, gesto, teclado, e respeita movimento reduzido.
7. **Exportação Excel:** `exportXlsx` ao lado da CSV, com peer opcional carregado só no clique; respeita formato, moeda e colunas visíveis; bloqueia fórmula vinda de dado (célula iniciada com `=`, `+`, `-`, `@`).
8. Spec de navegador por peça, nos dois modos e em contêiner estreito. `npm run boot:measure` de novo. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Boot do consumidor sem crescimento — `boot:measure`.
- [ ] Peer ausente mostra fallback — teste por peça.
- [ ] Mapa sem nenhuma requisição antes de `tileUrl` — navegador.
- [ ] Painel arrastável e tour funcionam por teclado — navegador.
- [ ] Assinatura por mouse e toque, com alternativa acessível — navegador.
- [ ] Excel sem injeção de fórmula — teste.
- [ ] Prévia em HTML para o dono.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo. O `SarakMap` entra na allowlist do gate de rede.

- Filtro dos arquivos novos, `boot:measure` e `check-audit-baseline.mjs --with-tsc`.
- A prévia aberta; o veredito fecha com a aprovação do dono.

# 8. Destino da síntese

**Destino:** `specs/specs/10-seguranca-e-acessibilidade.md` §3.2: o mapa é a exceção de rede, sempre por URL do consumidor.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-02

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- `SarakDashboardGrid` (`DataDisplay/SarakDashboardGrid/`): `react-grid-layout` já declarado como peer opcional, atrás de `React.lazy`; teclado (setas movem, Shift+setas redimensionam, com troca de lugar ao saltar sobre vizinho), `readOnly`, empilha em uma coluna abaixo de `narrowBelow` (480 px do contêiner); `dashboardLayout.ts` é a conta pura.
- `SarakMap` (`Media/SarakMap/`): mapa de blocos próprio (Web Mercator), lazy, sem peer; `tileUrl` validada (`https`, `http`, `//` ou caminho absoluto, com `{z}{x}{y}`); sem URL usável não há `<img>` e aparece o aviso; atribuição obrigatória por tipo.
- `SarakSignaturePad` (`Inputs/SarakSignaturePad/`): canvas próprio, eventos de ponteiro, limpar/desfazer, devolve `{ png, strokes, typedName? }`; alternativa acessível digitando o nome.
- `SarakTour` (`UX/SarakTour/`): portal, `useFocusTrap` + `useOverlayLayer`, destaque no alvo, cartão posicionado e preso dentro do contêiner.
- `SarakCarousel` (`Media/SarakCarousel/`): sem autoplay por padrão, setas, pontos, gesto, teclado; movimento reduzido desliga rotação e animação.
- Excel: `tableXlsx.ts` (`sarakExportXlsx`, `sarakTableToXlsx`, `sarakDownloadXlsx`) + `xlsxFile.ts` (zip "store" + XML próprios), carregado por `import()` no clique; respeita formato/moeda, `columnState` e neutraliza `= + - @ tab CR`.
- Textos nos 6 idiomas: `src/core/i18n/catalogEntries.advanced.ts` (+ `catalog.ts`). Barris: `DataDisplay/index.ts`, `Media/index.ts`, `UX/index.ts`, `Inputs/index.ts`, `src/index.ts` (assinatura e Excel). Nota em `docs/migracoes.md`. Spec de navegador `browser-tests/plan-155-recursos-avancados.spec.ts` + `fixtures/plan-155-entry.tsx`.
- Gerados: `npm run catalog` e `npm run guide` (o build exigiu `guide:check`).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/DataDisplay/SarakDashboardGrid/*` | criado | painel (lazy), layout puro, 4 arquivos de teste |
| `src/components/atomic/Media/SarakMap/*` | criado | mapa, matemática, testes |
| `src/components/atomic/Media/SarakCarousel/*` | criado | carrossel, hook de autoplay, testes |
| `src/components/atomic/Inputs/SarakSignaturePad/*` | criado | assinatura, canvas, hook, testes |
| `src/components/atomic/UX/SarakTour/*` | criado | tour, posição, testes |
| `src/components/atomic/DataDisplay/SarakDataTable/tableXlsx.ts`, `xlsxFile.ts`, `__tests__/tableXlsx.test.ts` | criado | exportação Excel |
| `src/core/i18n/catalogEntries.advanced.ts` | criado | textos |
| `src/core/i18n/catalog.ts`, `src/index.ts`, barris de `DataDisplay`, `Media`, `UX`, `Inputs` | alterado | só as linhas desta plan; o resto é da 153/154 |
| `docs/migracoes.md` | alterado | seção da plan-155 |
| `browser-tests/plan-155-recursos-avancados.spec.ts`, `fixtures/plan-155-entry.tsx` | criado | spec de navegador |
| `docs/component-catalog.*`, `sarak-ui/*`, `dist/` | gerado | regenerados por `catalog`, `guide`, `build` (misturam o trabalho da 153/154) |

**Verificações executadas**
- `npx vitest run` nas pastas/arquivos novos → 11 arquivos, 69 testes verdes (mais os dois testes de hook adicionados depois: 4 arquivos, 21 testes verdes).
- `npx tsc --noEmit -p .` → sem erros.
- `barrel:check` 138 componentes em dia · `catalog:check` em dia · `prefix:check` ok · `public-types:check` ok (antes do build final) · `network:check` ok.
- `npm run build` → exit 0 (precisou de `npm run guide` antes); inclui `test:optional-peers` com e sem peers: ok.
- `npm run boot:measure` → antes 388,1 KB gzip (ref 384,8); depois 394,7 KB (ref 391,7), teto 396,8: OK. O delta inclui o trabalho da 153/154 no mesmo worktree; não consegui isolar o das minhas peças (são lazy ou exports nomeados sem uso no boot).
- `npm run verify -- --tier=quick` (rodado duas vezes): `audit:baseline --with-tsc` e `variable-contract:check` ficaram verdes depois de corrigir meus achados. Restam fora de mim: `check-trail-citation` (`src/index.ts:196`, comentário da plan-154), `dev-kit:check` (defasado, gerado) e `plan-index:check` (plan-154 em revisão no frontmatter).

**Critérios de aceite**
- [ ] Boot do consumidor sem crescimento — `boot:measure` passa no teto, mas o número cresceu junto com a 153/154; não isolado.
- [x] Peer ausente mostra fallback — `SarakDashboardGrid.peerAusente.test.tsx`.
- [ ] Mapa sem nenhuma requisição antes de `tileUrl` — provado em teste (sem `<img>`); a prova em navegador está escrita e NÃO rodou (ver Pendências).
- [ ] Painel e tour por teclado — navegador: escrito, não rodou; teclado provado em jsdom.
- [ ] Assinatura por mouse e toque — navegador: escrito, não rodou.
- [x] Excel sem injeção de fórmula — `tableXlsx.test.ts` (6 prefixos, cabeçalho, arquivo sem `<f>`).
- [ ] Prévia em HTML para o dono — não gerada (depende do mesmo harness).

**Decisões e suposições**
- Sem peer novo: mapa, assinatura, carrossel, tour e escritor de `.xlsx` são código da lib. Por isso o Excel não usa um peer carregado no clique, e sim módulo próprio carregado por `import()` no clique. Peers declarados: só `react-grid-layout` (já existia).
- `exportXlsx` se chama `sarakExportXlsx`: `prefix:check` exige `sarak` no nome.
- Allowlist do `check-no-network.mjs` NÃO recebeu o mapa: o gate não vê `<img>` (limite 4 declarado no cabeçalho) e entrada sem ocorrência reprova. O motivo está em `docs/migracoes.md` (CSP `img-src`).
- `SarakSpotlight` não foi reaproveitado: é uma paleta de comandos; o tour usa `useFocusTrap` e `useOverlayLayer`, que são o mecanismo da spec 10 §2.4.
- Só painel e mapa têm fronteira `lazy`; tour, carrossel e assinatura são exports nomeados sem dependência (zero custo no boot por tree-shaking).
- Em grade compactada, seta para baixo sem vizinho abaixo não muda nada (o painel sobe de volta); sobre vizinho, os dois trocam de lugar.

**Achados fora do escopo (não corrigidos)**
- `src/index.ts:196` comenta "(plan-154)" e quebra R36 (`check-trail-citation`): é da plan-154.
- `browser-tests/build-harness.mjs` falha com `pngjs` (`zlib`, `util`, `stream`, `assert`, `buffer`) depois que o `SarakQRCode` da plan-154 entrou no `dist/`: todo spec de navegador que empacota `@sarak/lib-ui-core` está quebrado, não só o meu.

**Pendências / riscos**
- Spec de navegador `plan-155-recursos-avancados.spec.ts` escrito e não executado (harness acima). Nada dele foi provado em navegador real: mapa sem requisição, teclado do painel/tour, mouse e toque na assinatura, contêiner estreito, os dois modos. A prévia HTML também depende disso.
- O arrastar do painel com o mouse é do `react-grid-layout`; sem o CSS dele (`react-grid-layout/css/styles.css`) a alça de redimensionar some (documentado na migração).
- `dist/`, `sarak-ui/` e o catálogo foram regenerados com o trabalho da 153/154 dentro.


---

## Resumo da execução (correção 1) — 2026-11-02

**Achado 1 — harness.** `browser-tests/build-harness.mjs` passou a honrar o campo `browser` (forma de objeto) do `package.json` de cada pacote: `browserFieldTarget` e `readBrowserEntry`, aplicados à resolução de especificador nu e de arquivo resolvido; troca de arquivo (`./lib/index.js` → `./lib/browser.js`) e `false` vira módulo vazio. O `qrcode` continua na árvore. Evidência: `erro-no-bloco.spec.ts` 5/5 verdes (antes: `Build failed with 6 errors`).

**Achado 2 — navegador e prévia.** Causa extra encontrada: o `SarakCarousel` não estava exportado em `Media/index.ts` (o barril não acusava); corrigido, com `catalog`, `guide` e `npm run build` (exit 0) refeitos. `plan-155-recursos-avancados.spec.ts`: 13/13 verdes (painel, mapa sem requisição e com blocos, assinatura por mouse e toque por CDP, tour por teclado e em 320 px, carrossel e movimento reduzido, nos dois modos). Dois testes do tour precisaram de ajuste de seletor do próprio spec (`Próximo` ambíguo com `Próximo slide`: agora escopo no diálogo). Prévia: `C:\tmp\sarak-previa-155\index.html` (abrir com `?modo=dark&largura=900`; `?tile=1` pede blocos a um domínio de teste que não existe), captura `previa-dark.png` conferida à vista, e `exemplo.xlsx` ao lado. A prévia é uma cópia: o mapa aparece no estado sem `tileUrl`.

**Achado 3 — assinatura no papel.** `signatureCanvas.ts`: `exportSignaturePng` redesenha numa tela à parte com `SIGNATURE_EXPORT_INK` (`rgb(0, 0, 0)`); a tela visível segue a cor do tema. Teste novo: com o tema pintando `rgb(250,250,250)`, a tinta no instante do `toDataURL` é a escura, nos traços e no nome digitado.

**Achado 4 — slide oculto.** `SarakCarousel.tsx`: o slide fora de vista ganha `inert` (repassado como atributo, já que o React 18 não o trata como booleano). Teste novo: `inert` no oculto, ausente no atual, trocando ao avançar.

**Achado 5 — estilos do `.xlsx`.** `xlsxFile.ts`: `STYLES_XML` ganhou `cellStyles` com o estilo `Normal` (o `cellStyleXfs` já existia). O `openpyxl`, com avisos como erro, abre `exemplo.xlsx` sem aviso; a aba sai `Contas`, `=1+1` e `@cmd` como texto. Teste novo confere as duas tags.

**Verificação objetiva:** `npm run build` uma vez (com a 153 e a 154 no worktree) → exit 0, incluindo `test:optional-peers`; spec desta plan 13/13; `erro-no-bloco` 5/5; filtro das peças 13 arquivos, 76 testes verdes; `tsc` limpo; `audit:baseline --with-tsc`, `variable-contract:check` e `public-types:check` ok.

**Decisões e suposições:** o `build-harness.mjs` não estava listado no §3.1, mas o achado 1 manda alterá-lo. Nada da 153/154 foi revertido; só toquei `Media/index.ts` (uma linha) além dos arquivos desta plan.

**Pendências / riscos:** nenhuma dos achados. `dev-kit:check` e o `check-trail-citation` da plan-154 não foram revistos nesta rodada (fora do escopo).


# 10. Veredito

## Veredito — 2026-11-02 — 🔴 Reprovado

Rodado pelo revisor: filtro das peças 74/74. Uma planilha gerada abriu no `openpyxl`, com zip íntegro, aba saneada e `=1+1` como texto. `tileUrl` só aceita origem segura, e não há rede antes dela. A escolha de escritor próprio no lugar de peer está aceita: nenhuma dependência nova. O mapa fora da `ALLOWLIST` também está aceito: o gate não vê `<img>`, e entrada sem ocorrência reprovaria. `SarakSpotlight` não servia ao tour, e a pilha de camadas foi reusada.

1. **A bateria de navegador está fora do ar.** Confirmado: `erro-no-bloco`, que passava, agora falha com `Build failed with 6 errors` em `pngjs`. `browser-tests/build-harness.mjs` resolve `qrcode` pelo `main` (Node), e não pelo campo `browser`, que aponta para `lib/browser.js`. A falha é do harness, e o consumidor com Vite passa em `test:optional-peers`. Corrija o harness para honrar o `browser` do pacote, sem tirar o `qrcode` da árvore.
2. **Quatro critérios sem evidência.** Depois do item 1, rode `plan-155-recursos-avancados`: mapa sem requisição, painel e tour por teclado, assinatura por mouse e toque, contêiner estreito e dois modos. Gere a prévia em `C:\tmp\sarak-previa-155\index.html`, conferida à vista, com um `.xlsx` real ao lado, para o dono abrir no Excel.
3. **Assinatura some no papel.** `signatureCanvas.ts:20`: a tinta vem da cor do tema, e o PNG é transparente. Em tema escuro, a imagem salva tem traço claro e sai invisível no documento branco. A tela segue o tema, mas o PNG devolvido sai sempre com tinta escura, com teste.
4. **Slide oculto segue no Tab.** `SarakCarousel.tsx`: o slide fora de vista só tem `aria-hidden`. Um link ou botão dentro dele recebe foco, e o leitor de tela lê o vazio. Torne o slide oculto `inert`, com teste.
5. **`xlsxFile.ts`:** o `openpyxl` avisa `Workbook contains no default style`. Declare `cellStyleXfs` e `cellStyles` em `STYLES_XML`, para o arquivo seguir o formato que o Excel espera.

**Verificação objetiva:** `npm run build` uma vez, com a `plan-153` e a `plan-154` no worktree, o spec desta plan, `erro-no-bloco` e o filtro das peças. Sem suíte inteira e sem bateria.

## Veredito — 2026-11-02 — 🟢 Aprovado

Os cinco achados foram conferidos no código: `browserFieldTarget` no harness, `SarakCarousel` no barril, `exportSignaturePng` com tinta escura, `inert` no slide oculto e `cellStyles` em `STYLES_XML`. Rodado pelo revisor: `plan-155`, `telas-de-sistema` e `erro-no-bloco` 35/35 contra o `dist/` real; filtro 34/34; `exemplo.xlsx` aberto no `openpyxl` sem aviso. O dono aprovou a prévia em 2026-11-02 e abriu o `.xlsx` no Excel: `=1+1` e `@cmd` saem como texto, e o total soma certo.

O boot subiu com os catálogos de texto das três plans, registrado no backlog #65 e não nas peças desta plan, que são lazy ou sem dependência. O commit sai junto das plans 153 e 154.
