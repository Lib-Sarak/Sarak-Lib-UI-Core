---
tipo: "plan"
titulo: "Completar entradas e utilitários que os sistemas montam à mão"
objetivo: "Fazer a lib oferecer seletor de cor, seletor de conjunto, tags, código de verificação, formulário gerado por campos, assistente, popover, copiar, QR, atalhos, permissão por condição, download com estados e gráfico avançado"
dominio: "Componentes / Entradas e utilitários"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "rc.5", "entradas"]
relacionados: ["[[anexos/rc5-contrato]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Peças menores, com evidência de uso, deixam de ser reescritas.

# 2. Contexto

Varredura de 2026-11-02 e inventário da lib:

| Peça | Evidência |
|---|---|
| Seletor de cor público | `ColorPicker.jsx` (Cripto, 429 linhas), `ThemeEditor.jsx` (Oss); a lib só tem controle interno |
| Seletor de conjunto com busca e filtros | `TranslatorSettings.tsx`, `ChatLab.tsx`, `ExcludedTokensCard` (Cripto) |
| Formulário por campos | `ContractMarkerFields` (ERP), `ContractForm.tsx` (orquestrador) |
| Download e visualização com estados | 5 `createObjectURL` no ERP, `ArvoreAtas.tsx` |
| Atalhos editáveis | `useShortcut.jsx` (Oss); a lib tem `useShortcutsManager` só interno |
| Assistente | `GovernanceWizard.jsx` (Cripto) |
| QR e copiar | `SecurityVault.tsx` (Auth) |
| Deduplicar toast | `notificationManager.js` (Cripto) |

Sem peça na lib, de uso previsível: tags, código de verificação, popover genérico, permissão por condição, gráfico avançado. **Excluídos por falta de evidência:** mapa, assinatura, painel arrastável, tabela de planos, tour.

# 3. Escopo

## 3.1 Dentro
- `src/components/atomic/` — as peças, com testes. `src/index.ts`, `src/core/i18n/`, `docs/migracoes.md`.

## 3.2 Fora
- Dependência nova, salvo QR, que é opcional (peer), como PDF. A lib não faz rede: download recebe a função do consumidor.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/rc5-contrato.md` | superfície |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | teclado, foco |
| Código | os arquivos do §2 | casos reais |
| **Skill** | `ui-novo-componente` · `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | componente · sempre · token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. `SarakColorInput`: público, com hex e campo, reaproveitando o controle do painel; alerta de contraste opcional.
3. `SarakSetPicker`: disponíveis × escolhidos, busca e filtros.
4. `SarakTagInput` e `SarakCodeInput` (OTP).
5. `SarakFieldRenderer`: gera campos de uma lista `{ name, type, label, required, options }`, com os átomos da lib, sem `eval` nem HTML.
6. `SarakWizard`: etapas com validação, compondo `SarakStepper`.
7. `SarakPopover`: com foco e camada da pilha.
8. `SarakCopyButton`, `SarakQRCode` (peer opcional).
9. `SarakFileAction`: baixar ou abrir com carregando, erro e nova tentativa; recebe `load(): Promise<Blob>`.
10. `useSarakShortcut` público; deduplicação de toast por `dedupeKey`.
11. `SarakGate`: `allowed`, `fallback`. A regra é do consumidor.
12. **Gráfico avançado:** `SarakChartEngine` ganha `extendOption?: (option) => option`, aplicada por último.
13. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Toda peça com teclado e rótulo acessível — teste.
- [ ] `SarakFieldRenderer` não executa conteúdo vindo de dado — teste.
- [ ] QR sem o peer mostra o fallback da lib — teste.
- [ ] Sem nova dependência obrigatória.
- [ ] Catálogo atualizado.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- Filtro dos arquivos novos, `npm run boot:measure` e `check-audit-baseline.mjs --with-tsc`. O boot tem 1,9 KB de folga: peça pesada fica atrás de `lazy`.

# 8. Destino da síntese

**Destino:** `—`. A superfície fica no catálogo gerado.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-02

**Resultado:** Concluído com pendências

**Estado do worktree ao iniciar**
(limpo)

**O que foi feito**
- `SarakColorInput` (`Inputs/SarakColorInput.tsx`, `internal/colorMath.ts`): seletor nativo + campo de texto que só grava o que `isValidColor` aceita; alerta de contraste (WCAG) opcional por `contrastAgainst`/`minContrast`.
- `SarakSetPicker`, `SarakTagInput`, `SarakCodeInput` (Inputs), `SarakFieldRenderer` (tipos: text, email, password, tel, url, number, date, textarea, select, checkbox, switch, color, tags; tipo desconhecido cai em `text`; rótulos só como texto do React).
- `SarakWizard` (Navigation), compõe `SarakStepper`; validação síncrona/assíncrona por etapa.
- `SarakPopover` (UX): `useFocusTrap` + `useOverlayLayer` (z-index acima da pilha), Esc/clique fora; `SarakGate`; `useSarakShortcut` + `sarakShortcutFromEvent`/`sarakFormatShortcut` (UX).
- `SarakCopyButton`, `SarakFileAction` (Buttons); `SarakQRCode` (Media, lazy, peer opcional `qrcode`, SVG desenhado em React; sem o peer mostra `SarakOptionalPeerFallback`).
- `SarakToast.tsx`: `dedupeKey` (mesma chave ativa atualiza o toast, reinicia a duração e devolve o mesmo id).
- `SarakChartEngine.tsx`: `extendOption` aplicada por último; entra em `ECHARTS_ONLY_PROPS`.
- i18n: `catalogEntries.entries.ts` (35 chaves × 6 idiomas) registrado em `catalog.ts`.
- Barris (`Inputs/Buttons/Navigation/UX/Media index.ts`, `src/index.ts`), `src/types/external.d.ts`, `package.json` (peer opcional `qrcode` + devDependency + `--external`), `scripts/test-optional-peer-consumer.mjs`, `package-lock.json`.
- Regenerados: `docs/component-catalog.*`, `sarak-ui/`, `sarak-dev/`; `dist/` mudou pelo `npm run build`.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/components/atomic/Inputs/{SarakColorInput,SarakSetPicker,SarakTagInput,SarakCodeInput,SarakFieldRenderer}.tsx`, `internal/colorMath.ts` | criado | peças de entrada |
| `src/components/atomic/Navigation/SarakWizard.tsx` | criado | assistente |
| `src/components/atomic/UX/{SarakPopover,SarakGate}.tsx`, `useSarakShortcut.ts` | criado | popover, gate, atalhos |
| `src/components/atomic/Buttons/{SarakCopyButton,SarakFileAction}.tsx` | criado | copiar, arquivo |
| `src/components/atomic/Media/SarakQRCode/{index.ts,SarakQRCodeImpl.tsx}` | criado | QR lazy |
| 14 arquivos `__tests__/` (um por peça, mais `colorMath` no teste do ColorInput, `SarakToast.dedupe`, e `extendOption` anexado a `SarakChartEngine.test.tsx`) | criado/alterado | testes |
| `SarakToast.tsx`, `engines/charts/SarakChartEngine.tsx` | alterado | `dedupeKey`, `extendOption` |
| `src/core/i18n/catalogEntries.entries.ts`, `catalog.ts` | criado/alterado | textos |
| barris, `src/index.ts`, `external.d.ts`, `package.json`, `package-lock.json`, script de peers | alterado | exportações e peer |
| `docs/component-catalog.*`, `sarak-ui/*`, `sarak-dev/*`, `dist/*` | regenerado | gerados |

**Verificações executadas**
- `npx vitest run` nas pastas tocadas (i18n, Navigation, UX, Buttons, Feedback, engines/charts, `atomic/__tests__`, 5 arquivos de Inputs, QR) → 90 arquivos, 743 testes verdes; depois do ajuste final, QR + CodeInput + ColorInput → 18/18.
- `npx tsc --noEmit` → 0 erros (duas vezes, a última após os ajustes).
- `npm run build` → exit 0 (inclui `public-types:check`, `barrel:check`, `catalog:check`, `guide:check`, `test:optional-peers`).
- `npm run verify -- --tier=quick` → 4 falhas na primeira rodada; as minhas (variable-contract `--sarak-input-radius`, R36 em `src/index.ts`, `else if` e hex do QR, teste do `Impl` fora do lugar) foram corrigidas e reverificadas por `variable-contract:check`, `check-trail-citation`, `run_audit` (sem achado nos meus arquivos), `dev-kit:check`/`guide:check`/`catalog:check` verdes. Não reroda o quick completo depois dos ajustes.
- Não rodei `boot:measure`, suíte inteira nem `audit:baseline` pós-ajuste.

**Critérios de aceite**
- [x] Toda peça com teclado e rótulo acessível — testes por peça (botões nativos, `role`/`aria-label`, Esc/Tab/setas).
- [x] `SarakFieldRenderer` não executa conteúdo de dado — `SarakFieldRenderer.test.tsx` (HTML no rótulo vira texto, tipo `javascript:` vira `text`, `__proto__`).
- [x] QR sem o peer mostra o fallback — `SarakQRCodeImpl.test.tsx`.
- [x] Sem nova dependência obrigatória — `qrcode` é peer opcional + devDependency.
- [x] Catálogo atualizado — `catalog:check` verde (138 componentes).

**Decisões e suposições**
- "Reaproveitando o controle do painel": `components/` não importa `features/`, então não importei `ColorControl`/`colorParts`; reescrevi a parte mínima (hex↔seletor, validação por `isValidColor`) em `internal/colorMath.ts`. Alfa e `var()`/`color-mix()` ficam só no campo de texto (sem controle de opacidade).
- Instalei `qrcode@^1.5.4` (`npm install -D`) para o vitest resolver o import; declarado também em `peerDependencies`/`peerDependenciesMeta`/`--external`/`OPTIONAL_PEERS`. `declare module 'qrcode'` em `external.d.ts` (sem tipos).
- QR com cores padrão preto/branco com `sarak-allow-*` (escâner exige escuro sobre claro; não segue o tema).
- `SarakPopover` participa de `useOverlayLayer`, que trava a rolagem da página enquanto aberto (comportamento do hook).
- `useSarakShortcut` mora em `UX/` (a `useShortcutsManager` está em `features/`, que `components/` não importa); não toquei nela.
- `extendOption` e o `SarakToast` ficam fora de `src/components/atomic/` literal (engines/charts) por exigência do passo 12.
- `docs/migracoes.md` não editado: tudo aditivo e opt-in.

**Achados fora do escopo (não corrigidos)**
- `variable-contract:check`: `SarakCarousel.tsx:97` e `SarakTour.tsx:118` (plan 155) com reserva diferente do padrão do token.
- `audit:baseline`: regressões em hardcoded/ghostvars/cleancode/composicaoatomica vêm majoritariamente de arquivos de 153/155; não afirmei zero depois dos meus ajustes.
- `docs/migracoes.md` e `package.json` tinham edições de outras plans no worktree.

**Pendências / riscos**
- `verify --tier=quick` e `boot:measure` não reexecutados após os últimos ajustes; a folga de 1,9 KB do boot não foi medida (as peças novas saem eager no barril, exceto o QR, que é lazy; `export *` custa zero para quem não usa).
- Consumidor que usar `SarakQRCode` sem instalar `qrcode` depende da configuração de peers opcionais do bundler, como o PDF.
- `dist/` está modificado pelo build e compartilhado com as outras plans.

---

## Resumo da execução (correção 1) — 2026-11-02

**Resultado:** Concluído

**Estado do worktree ao iniciar**
Alterações das plans 153/155 e o resumo anterior desta plan (não revertidos nem tocados).

**Achados**
1. `SarakFileAction.tsx` (`deliver`): `anchor.download = filename ?? ''` sempre — sem nome o clique não navega mais a aba. Teste: "sem filename o download segue por âncora com download vazio".
2. `SarakFileAction.tsx`: `INERT_OPEN_TYPES` (PDF, PNG/JPEG/GIF/WebP/AVIF/BMP, text/plain); `mode="open"` com qualquer outro tipo (HTML, SVG, XHTML, sem tipo) baixa. JSDoc de `mode` e de `onDone` registram o limite (entregue ≠ aberto/salvo; `window.open` devolve `null` com `noopener`). Testes: `it.each` de 4 tipos que baixam e 3 que abrem.
3. `SarakWizard.tsx`: `catch` em `advance` mostra `sarakErrorMessage(error)` na etapa; o botão volta a habilitar. Testes: `validate` que rejeita (sem `unhandledRejection`) e `onFinish` que rejeita e depois passa.
4. `SarakCodeInput.tsx` (`write`): caractere recusado retorna sem mudar valor nem foco; escrita na posição `min(index, value.length)` e foco em `posição + typed.length`. Testes: letra sobre célula preenchida; célula depois de lacuna.
5. `SarakFieldRenderer.tsx`: `required` repassado a `color` e `tags` (que passaram a aceitá-lo e o levam ao campo de texto) e a `checkbox`/`switch` (com `aria-required`). Teste: os quatro `toBeRequired`.
6. `SarakTagInput.tsx`: remoção por posição (a por valor apagava todas as repetidas) e chave `tag#ocorrência`. Teste: remover a segunda `a` de `['a','b','a']` dá `['a','b']`.
7. `docs/migracoes.md`: entrada "8.0.0 — entradas e utilitários que os sistemas montavam à mão" (MINOR, peer opcional `qrcode`, cada peça, `dedupeKey`, `extendOption`, trava de rolagem do popover). `npm run guide` e `npm run catalog` regenerados.

**Verificações executadas**
- `npx vitest run` em `Buttons/SarakFileAction`, `Navigation/SarakWizard` e `Inputs/__tests__` → 27 arquivos, 234 testes verdes.
- `npx tsc --noEmit` → 0 erros.
- `guide:check`, `catalog:check` (após `npm run catalog`), `check-trail-citation` → verdes. Sem build, sem suíte inteira, sem bateria, sem `verify --tier=quick`.

**Decisões e suposições**
- `SarakColorInput`/`SarakTagInput` ganharam a prop opcional `required` (necessária ao achado 5); entrou no catálogo gerado.
- `ColorInput` aplica `required` só ao campo de texto, não ao seletor nativo.

**Achados fora do escopo (não corrigidos)**
- Os da rodada anterior seguem (`SarakCarousel.tsx:97`, `SarakTour.tsx:118`, regressões de baseline de 153/155).

**Pendências / riscos**
- `dev-kit` não regenerado nesta rodada (contagem de gates/arquivos pode ter mudado por trabalho de 153/155); rode `npm run dev-kit` se o `dev-kit:check` acusar.

## Resumo da execução (correção 2) — 2026-11-02

**Resultado:** Concluído

**Estado do worktree ao iniciar**
Alterações das plans 153/155 e das execuções anteriores desta plan (não tocadas).

**Achados**
1. Teste instável em `SarakQRCodeImpl.test.tsx`, caso "sem o peer". **Reproduzido** com três `vitest run` de `Inputs`+`DataDisplay` em paralelo e o arquivo rodando ao lado: 1 falha em 3, `AssertionError: expected [] to have a length of 1 but got +0`. A causa **não** era a espera do `lazy`: o `console.warn` do `SarakOptionalPeerFallback` sai num `useEffect`, e `findByRole('alert')` volta assim que o alerta aparece, antes de o efeito rodar; a asserção do aviso lia as chamadas cedo demais. Correção em `SarakQRCode/__tests__/SarakQRCodeImpl.test.tsx`: o aviso agora é aguardado com `waitFor` (continua exigindo exatamente um `[SarakQRCode]`), as esperas do arquivo têm prazo explícito (`WAIT = { timeout: 10000 }`) e o arquivo fixa `testTimeout` de 20 s.

**Verificações executadas**
- Filtro `Media Inputs UX Buttons Navigation core/i18n`, duas vezes, antes da correção → 110 arquivos / 749 testes verdes nas duas (a falha não apareceu sem carga extra).
- `SarakQRCode` sob a mesma carga que reproduziu a falha, depois da correção → 4 rodadas, 4/4 em todas.
- Sem `tsc`, build, suíte inteira nem bateria (só testes alterados, sem código de produção).

**Decisões e suposições**
- Nenhum código de produção mudou: o aviso uma vez só é o contrato do fallback e foi mantido.

**Achados fora do escopo (não corrigidos)**
- Os das rodadas anteriores seguem.

**Pendências / riscos**
- Nenhuma conhecida; a reprodução é probabilística (1 em 3 sob carga), então 4/4 reduz mas não prova ausência.

# 10. Veredito

## Veredito — 2026-11-02 — 🔴 Reprovado

Rodado pelo revisor: filtro das peças 200/200, `tsc` 0 erros, `boot:measure` dentro do teto com as três plans no `dist/`. `SarakToast` e `extendOption` estão certos, e `SarakFieldRenderer` não transforma dado em HTML. `SarakPopover` trava a rolagem da página: é o preço de painel `fixed` preso ao gatilho, e fica como está.

1. **`SarakFileAction` tira o usuário do sistema.** `SarakFileAction.tsx:31` só escreve `download` com `filename`. Sem ele, o clique abre o `blob:` na própria aba, e o aplicativo some. A prop está documentada como opcional. O atributo `download` vai sempre, vazio quando não há nome.
2. **`mode="open"` executa conteúdo na origem do sistema.** `SarakFileAction.tsx:27` abre qualquer blob. HTML ou SVG enviado por um usuário roda com a origem do consumidor, e `noopener` não impede isso ([[10-seguranca-e-acessibilidade]]). Abra só tipos inertes: PDF, imagem rasterizada e texto puro. Os demais são baixados. Além disso, `window.open` devolve `null` com `noopener` e pode ser barrado por vir depois de `await`: `onDone` não pode afirmar entrega que não se pode conferir, então registre esse limite na documentação da prop.
3. **`SarakWizard` engole a falha.** `SarakWizard.tsx:56-68`: `validate` ou `onFinish` que rejeitam, como numa chamada de API, viram rejeição não tratada, sem aviso na tela. Mostre a mensagem na etapa, com `sarakErrorMessage`.
4. **`SarakCodeInput` apaga e desalinha.** `write` (`:52-58`): num campo só de dígitos, digitar uma letra sobre uma célula preenchida apaga o dígito. Digitar numa célula depois de lacuna grava o caractere na primeira posição livre e o foco vai para outra. Caractere recusado não muda o valor, e o foco e o valor seguem a mesma posição.
5. **`required` se perde.** `SarakFieldRenderer` só repassa `required` a texto, área e seleção. Em `color`, `tags`, `checkbox` e `switch`, o campo obrigatório não é anunciado. O critério é "Toda peça com teclado e rótulo acessível".
6. **Chave repetida.** `SarakTagInput` usa `key={tag}`, e com `allowDuplicates` remover uma etiqueta embaralha as demais.
7. **Nota de migração ausente.** `docs/migracoes.md` está na §3.1, e toda a superfície nova e o peer `qrcode` precisam dela. "Aditivo" é a classificação da nota, não motivo para não escrever.

**Verificação objetiva:** filtro das peças e `tsc`, uma vez cada, com teste de regressão por achado. Sem build, sem suíte inteira e sem bateria. Se `verify --tier=quick` for necessário, relate à parte o que vem das plans 153 e 155.

## Veredito — 2026-11-02 — 🔴 Reprovado (teste instável)

Os sete achados foram conferidos no código e estão corrigidos: `anchor.download` sempre presente, `INERT_OPEN_TYPES`, `catch` no `SarakWizard`, posição e foco de `SarakCodeInput`, `required` nos quatro tipos, chave por ocorrência em `SarakTagInput` e nota em `docs/migracoes.md`. `tsc`: 0 erros.

1. **`SarakQRCodeImpl.test.tsx`, caso "sem o peer", é instável.** Numa rodada do filtro falhou (213/214), e nas duas seguintes passou (214/214); sozinho passa 4/4. A mensagem da falha não foi capturada. A causa provável é a espera do componente `lazy` no tempo padrão de `findByRole`, sob carga: reproduza com o filtro antes de concluir. Isso derrubaria a CI e o `preversion` sem mudança real. Dê tempo explícito às esperas desse arquivo, como `sarakTestKit.test.tsx`, e mantenha o teste de um aviso só.

**Verificação objetiva:** esse arquivo, uma vez. O revisor repete o filtro.

## Veredito — 2026-11-02 — 🟢 Aprovado

A causa do teste instável era outra, e o executor a reproduziu: o aviso de `SarakOptionalPeerFallback` sai num `useEffect`, depois de `findByRole` voltar. A suspeita do veredito anterior estava errada. Filtro das peças rodado pelo revisor três vezes seguidas: 214/214 nas três. `tsc`: 0 erros. A reprodução é probabilística, então isso reduz o risco sem provar ausência; a suíte inteira da cópia limpa mede o resto.

O commit sai junto das plans 153 e 155. Destino da síntese conforme o frontmatter.
