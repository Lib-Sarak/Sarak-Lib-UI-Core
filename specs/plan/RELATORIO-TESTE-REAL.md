---
tipo: "relatorio"
titulo: "Teste Real — ERP readota Sarak como packages/ui-kit (Spec 40 v5)"
data: "2026-07-24"
status: "Concluído (Propostas) — Projetos/Contratos ficam para a próxima rodada"
---

# Relatório — Teste Real (Spec 40 v5): Sarak readotado como `packages/ui-kit`

## 0. Ambiente e tempo

- Execução em sessão única, ERP em `C:\...\Code\Earendel\ERP`, lib em `C:\...\Code\Biblioteca\Sarak-Lib-UI-Core` (repositórios irmãos, mesmo disco).
- `pnpm@11.17.0` via `corepack pnpm` (não havia `pnpm` direto no PATH). `node v24.10.0`.
- Backend real (`src/server.ts`, porta 3000) já estava de pé com `SUPABASE_URL`/`SUPABASE_KEY` reais do `.env` da raiz — reaproveitado, não recriado.

## 1. Como o conector resolve `urlWeb` e a ressalva de mesma-origem (§3.2)

`Modulos/conector/web/src/App.tsx` mantém uma lista `MODULOS` com `urlWeb` vindo de env (`VITE_CONECTOR_PROPOSTAS_WEB_URL` etc., default `http://localhost:5175`). Clicar no link do módulo é uma **navegação de página inteira** (`<a href={modulo.urlWeb}>`, sem `preventDefault`) — não há SPA/router entre conector e módulo. Isso foi confirmado no código, não alterado.

**A ressalva do §3.2 se confirmou na prática:** em `pnpm dev` cada app roda em porta própria (conector 5174, Propostas 5175, backend raiz 3000) — **origens diferentes**, `localStorage` isolado por padrão do browser. O repositório **ainda não tem** um mecanismo real de "deploy único" para os fronts: `src/server.ts` hoje só serve `/api/v1/*` (Express puro), **não** faz `express.static` de nenhum `dist/` de módulo — o "servindo os fronts" do ADR 011 é uma promessa ainda não implementada neste repo (achado colateral, não é bug desta spec, registrado para o dono).

**Solução usada para o teste (harness, não faz parte do produto):** `scripts/prova-r5-deploy-unico.mjs` — um servidor Express mínimo, novo, que serve `conector/web/dist` na raiz e `Propostas/web/dist` em `/propostas`, proxeando `/api/*` para o backend real (porta 3000), tudo na **mesma origem** (porta 4400). Builds de produção feitos com `--base=/propostas/` (Propostas) e um `.env.production.local` temporário apontando `VITE_CONECTOR_PROPOSTAS_WEB_URL=http://localhost:4400/propostas` (removido ao final — não fica no repo). O script permanece no repo como ferramenta reutilizável para re-verificar R5 no futuro.

## 2. Prova de isolamento (§3.2.1) — grep real, saída colada

```
$ grep -rl "@sarak/lib-ui-core" --include="package.json" . | grep -v node_modules
./packages/ui-kit/package.json                          # ← único

$ grep -rn "Modulos/Contratos|Modulos/Projetos|Modulos/conector" Modulos/Propostas/web/src
(vazio)                                                   # ← Propostas não importa outro módulo/conector

$ grep -rn "Modulos/Propostas/web/src|Modulos/Projetos/web/src|Modulos/Contratos/web/src" Modulos/conector/web/src
(vazio)                                                   # ← conector não importa módulo por caminho de arquivo (só por URL)

$ grep -rln "@sarak/lib-ui-core" Modulos/*/web/src Modulos/*/web/package.json
(vazio)                                                   # ← nenhum módulo depende do Sarak direto

$ grep -rl "@erp/ui-kit" --include="package.json" Modulos/*/web
Modulos/Propostas/web/package.json
Modulos/conector/web/package.json                        # ← só os 2 que adotaram
```

- **Cada `web` builda standalone:** `Modulos/Propostas/web` (`npx tsc --noEmit` + `npx vite build`) e `Modulos/conector/web` (idem) rodados isoladamente, dentro da própria pasta, sem depender de nenhum outro módulo — verde nos dois.
- **`pnpm` sem phantom dep:** `packages/ui-kit` é a ÚNICA entrada com `@sarak/lib-ui-core` (via tarball local, ver §7); `Propostas/web` e `conector/web` resolvem o Sarak só através do symlink `node_modules/@erp/ui-kit` (confirmado fisicamente: `ls Modulos/Propostas/web/node_modules/@erp` → `ui-kit`).
- **Conector NÃO reescrito:** `App.tsx` mantém a mesma mecânica de redirect por `<a href>` + History API; a única adição foi uma rota `/design` interna (SPA local do PRÓPRIO conector, não mexe em como ele trata os outros módulos) e o `SarakUIProvider` no `main.tsx`.
- **`SarakShell`/`registerSarakModule`:** grep confirma zero uso em `Modulos/*/web/src` — nenhum módulo usa o modelo Shell-host.

## 3. `packages/ui-kit` — porta única (Fase 0)

`packages/ui-kit/` (pacote novo, `@erp/ui-kit`, sem build próprio — `exports` aponta direto pro `src/index.ts`, resolvido pelo `moduleResolution: "bundler"` do TS/Vite):
- `src/index.ts`: `export * from '@sarak/lib-ui-core'` + `export * from './themes'`.
- `src/themes.ts`: catálogo `ERP_THEMES` (2 temas: `erp-corporativo` claro, `erp-noturno` escuro) + `ERP_DEFAULT_THEME_ID` — é o "código compartilhado" que garante que Propostas e conector enxergam exatamente os mesmos temas por construção (§3.2).
- Dependência do Sarak: **não** aponta pro repositório-fonte da lib (ver achado de infraestrutura no §7) — usa um `.tgz` local (`npm pack` da lib) em `packages/ui-kit/vendor/`, documentado em `vendor/README.md` com o comando de atualização (equivalente ao `sarak:update` real).

## 4. Fase 1 — Propostas (features reais)

### 4.1 Listagem real (R1/R4)
`pages/Lista.tsx`: `useListaPropostas` (hook de dados, **intocado**) alimenta um `SarakDataTableImpl` (composição densa, colunar, com coluna fixada à direita) — estados loading (`SarakSkeleton`), error e empty tratados explicitamente, sem mock. Ação "Nova proposta" (`SarakButton`) abre o formulário.

### 4.2 Formulário real + persistência via curl (R2)
`pages/NovaProposta.tsx`: campos `SarakInput`/`SarakSelect`/`SarakTextarea`, validação de obrigatórios (cliente + link) e de JSON (`dados_extras`), feedback via `useToast()` do kit, grava via `POST /api/v1/propostas` (endpoint já existente do módulo, Supabase real).

**Persistência confirmada por curl** (sem passar pela UI):
```
$ curl -s -X POST http://localhost:3000/api/v1/propostas \
    -H "Content-Type: application/json" \
    -d '{"cliente_apelido":"Teste Spec40","valor_minimo":1000,"valor_maximo":2000,
         "moeda":"BRL","status_proposta":"rascunho",
         "link_proposta":"https://exemplo.com/teste-spec40","escopo":"...",
         "prazo":"7 dias","dados_extras":{"origem":"RELATORIO-TESTE-REAL","spec":40}}'

{"id":"b01d422e-...","hash":"23305","cliente_apelido":"Teste Spec40", ...}

$ curl -s http://localhost:3000/api/v1/propostas | grep "Teste Spec40"
"cliente_apelido":"Teste Spec40", ... (presente na releitura — persistiu de verdade)
```
O registro aparece na captura de tela do §6 (linha "Teste Spec40").

### 4.3 As 4 PAREDES — cada uma resolvida em React (R3)

| Parede | Onde | Como |
|---|---|---|
| 1. `dados_extras` (JSONB) | `Detalhe.tsx` | `JSON.stringify(proposta.dados_extras, null, 2)` num `<pre>` estilizado por tokens (`--sarak-color-bg-layer-1`) — formatado em JS puro, trivial |
| 2. `link_proposta` clicável | `Lista.tsx` (coluna) e `Detalhe.tsx` | `<SarakLink href={...} external>` — valida esquema seguro, abre em nova aba, ícone + texto a11y automáticos |
| 3. `moeda` do próprio registro | `ValorProposta.tsx` (reaproveitado, intocado) | `Intl.NumberFormat('pt-BR', { style: 'currency', currency: proposta.moeda })` — já era dinâmico, agora só troca a apresentação ao redor |
| 4. `status` | `Lista.tsx`/`Detalhe.tsx` | `<SarakBadge variant={variantDoStatus(status)}>` — heurística de cor sobre texto livre (banco não tem enum) |

## 5. Fase 2 — Central no conector

`Modulos/conector/web/src/pages/Design.tsx` (novo) monta `<CustomizationPanel />` do kit sob uma rota interna `/design` (adicionada ao `App.tsx` do conector, sem mexer na mecânica de redirect dos outros módulos). `main.tsx` do conector ganhou `SarakUIProvider` com o mesmo `ERP_THEMES`/`ERP_DEFAULT_THEME_ID` do kit.

## 6. Fase 3 — Prova do R5 (a central atinge todas as telas)

**Mecanismo real (confirmado por leitura do código-fonte, `useDesignManager.ts`):** todo `SarakUIProvider` usa a MESMA `storageKey` por padrão (`DEFAULT_STORAGE_KEY`, não sobrescrita em nenhum dos nossos `main.tsx`); no **primeiro render**, o `useState` inicializador lê `localStorage.getItem(storageKey)` **de forma síncrona** e aplica antes da 1ª pintura — não depende de nenhum listener de `storage` (esse só sincronizaria abas *simultâneas*, fora do escopo aqui).

**Prova ao vivo (Playwright/Chromium real, contra o harness de mesma-origem, porta 4400):**
1. Conector carrega — `--sarak-accent-color` = `#2563eb` (tema seed `erp-corporativo`).
2. Navega para `/design`, troca para a aba real de aplicação de tema (`TemplatesTab`, alcançada pelo seletor de viewMode — ícone `FileJson`, ao lado de "preview"/"catalog"; **achado**: o card de preview do catálogo visual, `PresetsCatalog`, tem `onClick` no código-fonte mas o clique nele **não persistiu nenhuma mudança** no teste real — 0 chaves alteradas no `localStorage`; a aba que realmente aplica é `TemplatesTab`, registrado como achado a investigar no §7, não diagnosticado a fundo).
3. Clica "Aplicar Tema" no card "ERP Noturno (escuro)". `localStorage['sarak-ui-design-v9.0']` muda exatamente as 10 chaves do tema (`accentColor: #2563eb → #38bdf8`, `cardBackgroundColor`, `btnPrimaryBg`, etc.) — diff completo capturado.
4. **Navegação REAL de página inteira** (não SPA) para `http://localhost:4400/propostas` — `--sarak-accent-color` já chega **`#38bdf8`** (o novo valor) na primeira pintura.
5. `page.reload()` em Propostas — `--sarak-accent-color` continua `#38bdf8` (persistência sobrevive a reload).
6. Reload do PRÓPRIO conector (mesma página) também mostra `#38bdf8` (confirma que é o mesmo mecanismo, não uma coincidência de valores).

**Screenshot real da tela de Propostas já tematizada** (dado real do Supabase + tema aplicado no conector, sem tocar em Propostas diretamente): tabela com fundo escuro, badges coloridos por status, botões cyan (`#38bdf8`) — evidência visual de que R1+R3+R4+R5 convergem na mesma tela.

**Achado de fricção (não bloqueante):** dentro da MESMA sessão/página do conector, o token não repinta ao vivo imediatamente após "Aplicar Tema" sem um reload — só reflete após `page.reload()`. Não afeta o modelo real do ERP (a navegação entre módulos JÁ é sempre um reload de página, nunca SPA), mas é uma nuance de re-render a registrar para quem for usar `applyFullConfig` fora do fluxo de commit padrão.

## 7. Bugs/lacunas de componente — corrigidos NA LIB (nunca hackeados no ERP)

### 7.1 Inputs básicos ausentes do barril público (achado real, corrigido)
`SarakInput`, `SarakSelect`, `SarakTextarea`, `SarakSlider`, `SarakSwitch`, `SarakSearch` **existiam e já estavam registrados no Registry do motor de manifesto** (`nativeComponents.ts`), mas **nunca foram exportados em `src/index.ts`** — mesma classe de lacuna do `SarakLink` (achado pré-Spec-40). Sem essa correção, o formulário real de Propostas (a prova central do R2) seria impossível de escrever com os componentes do kit.

**Corrigido:** `src/index.ts` ganhou os 6 exports (+ tipos `Props` onde existiam). Gates rodados: `catalog:check` (em dia), `RegistryParity.test.tsx` (5/5 verdes), `npm run build` verde (DTS incluído), suíte completa em andamento (ver §9). Rebuild + `npm pack` + tarball atualizado em `packages/ui-kit/vendor/`.

### 7.2 `SarakDataTable` (export lazy) perde a genericidade de tipo (fricção, não corrigido aqui)
O export público `SarakDataTable = lazy(() => import(...))` (para code-splitting) não aceita `<Proposta>` como argumento de tipo — limitação conhecida do `React.lazy` com componentes genéricos. Usei `SarakDataTableImpl` (export direto, já documentado pela própria lib "para teste") para manter `rows`/`columns` tipados com `Proposta`, ao custo de perder o code-splitting daquele componente específico. Registrado como fricção de ergonomia (R6), não como bug — não corrigido nesta spec.

### 7.3 `SarakTextarea` não aceita `label` (diferente de `SarakInput`/`SarakSelect`) — fricção
Descoberto ao escrever `NovaProposta.tsx`: `SarakInput`/`SarakSelect` recebem `label`, `SarakTextarea` não (só herda atributos nativos de `<textarea>`). Contornado com um wrapper `RotuloDeCampo` local no ERP (React+tokens, "opção A" do ciclo). Não é bug — é inconsistência de API entre 3 componentes irmãos, candidata a pequena melhoria futura na lib.

### 7.4 `SarakEmptyState` não aceita mensagem customizada — fricção
Só tem 3 variantes de ilustração genérica (`minimal`/`abstract`/`geometric`), sem prop de texto. Para "Nenhuma proposta ainda." usei um `<p>` próprio com tokens (opção A), em vez do componente de feedback dedicado.

### 7.5 Barril público força bundle pesado mesmo sem uso (achado real, não corrigido — é escopo da Spec 41)
`export * from '@sarak/lib-ui-core'` no `ui-kit` reexporta TUDO, incluindo componentes pesados lazy (`SarakChartEngine`/echarts, `SarakPDFViewerImpl`/pdfjs, `SarakFlowEngine`/reactflow, `SarakMarkdownRendererImpl`, `SarakDataGridImpl`, `CustomizationPanel`). O `vite build` de Propostas — que usa só `SarakDataTableImpl`/`SarakBadge`/`SarakLink`/`SarakButton`/`SarakSkeleton`/inputs — ainda assim gera no `dist/` chunks separados de **1.2 MB** (`pdf.worker`), **736 KB** (prism/syntax-highlighter), **479 KB** (PDFViewer), **374 KB** (ChartEngine), **139 KB** (FlowEngine), porque o code-splitting do Rollup precisa resolver TODO o grafo alcançável a partir do `export *`, mesmo que o app nunca importe esses símbolos. Como são chunks separados (não no bundle principal), o BROWSER nunca baixa esse peso em produção real (só ocupa disco/CDN) — mas é peso morto real, e é exatamente o problema que a **Spec 41 (Piso de Bundle)**, já planejada, existe para resolver. Não tentei corrigir aqui (fora de escopo, dependência de ordem já documentada no roteiro).

## 8. Matriz R1–R9

| # | Medição | Resultado |
|---|---|---|
| R1 | `packages/ui-kit` como porta única + Propostas com listagem real sobre dado real via componentes do kit | ✅ PASS |
| R2 | Formulário real grava via `api/`, com validação/feedback | ✅ PASS (curl confirmado, §4.2) |
| R3 | As 4 paredes caídas em React | ✅ PASS (§4.3) |
| R4 | ≥1 composição densa real | ✅ PASS (`SarakDataTableImpl`, coluna fixada) |
| R5 | Central altera tema de TODAS as telas, provado no deploy único (harness mesma-origem), persiste | ✅ PASS (§6, Playwright real) |
| R6 | Onde faltou componente, React+tokens; fricções registradas | ✅ PASS (§7.2–7.4) |
| R7 | Bug/lacuna real corrigido NA LIB, contado | ✅ PASS (§7.1 — 1 lacuna real corrigida; §7.5 achado registrado p/ Spec 41) |
| R8 | Sarak em 1 `package.json`; conector NÃO reescrito; `SarakShell` não usado | ✅ PASS (§2) |
| R9 | `npm run build` do ERP verde; app real de pé | ✅ PASS (raiz + Propostas + conector, os 3 builds verdes) |

## 9. Gates da lib (pós-correção do §7.1)
- `npm run catalog:check` — em dia.
- `npx vitest run src/core/Manifest/__tests__/RegistryParity.test.tsx` — 5/5 verdes.
- `npm run build` — verde completo (DTS incluído).
- `npm pack` — tarball de 58 arquivos / ~757 KB, igual ao baseline anterior (nenhum arquivo novo vazou pro pacote).
- Suíte completa (`npx vitest run`) — iniciada; resultado a anexar em `00-progresso.md` (não bloqueia este relatório, mudança é aditiva/exports novos, baixo risco de regressão).

## 10. Veredito condicional

**Propostas convenceu.** As 4 paredes caem trivialmente em React com o kit; a listagem/detalhe/formulário são todos dado real com persistência confirmada; a central de tema atinge as duas telas testadas (conector + Propostas) no deploy único, com evidência de browser real (Playwright) e captura de tela. O isolamento do ERP não foi tocado — nenhum módulo passou a depender de outro, o conector não foi reescrito, e o Sarak vive num único `package.json`.

**Fase 4 (expansão condicional) — decisão desta rodada: PARAR aqui.** `Projetos/web` (funcional, só Lista) é o próximo candidato natural — mesma receita (trocar `<ul>` por `SarakDataTableImpl`/tokens, registrar `@erp/ui-kit`), baixo risco. `Contratos/web` é stub, fica de fora até ganhar telas reais. Não expandido nesta sessão por gestão de escopo/tempo, não por achado que desaconselhe — registrado como próximo passo, não como bloqueio.

**Achado de infraestrutura para o dono decidir (fora do escopo desta spec corrigir):** o "deploy único" do ADR 011 hoje só existe para a API (`src/server.ts`); os fronts (`conector/web`, `Propostas/web` etc.) ainda não têm um mecanismo real de serving em produção — nem sequer separado por módulo (Vercel), nem único. `scripts/prova-r5-deploy-unico.mjs` é um esqueleto funcional que pode virar esse mecanismo real (ou inspirá-lo), mas isso é decisão de infraestrutura do ERP, não desta spec.

## 11.1 Achado operacional pós-entrega — tela branca / "Invalid hook call" em `pnpm dev`

Depois deste relatório escrito, um dev server de `Propostas/web` **aberto antes** da adição do `@erp/ui-kit` ao `package.json` (rodando desde bem antes das mudanças desta sessão) mostrou tela branca com:
```
Invalid hook call. Hooks can only be called inside the body of a function component...
Uncaught TypeError: Cannot read properties of null (reading 'useState') at App (App.tsx:12:29)
```

**Diagnóstico:** cache stale de `optimizeDeps` do Vite (`node_modules/.vite`) — o processo antigo continuava servindo o pré-bundle de dependências de ANTES do `@erp/ui-kit` existir; como o kit reexporta `react`/`react-dom` por outro caminho de resolução, o dev server antigo enxergava (na memória, via cache) duas referências de React não reconciliadas — sintoma clássico de "multiple copies of React", mas **não é** duplicata real de pacote.

**Confirmado no disco:** só existe **uma** cópia física de `react@19.2.8` no `pnpm store` (`node_modules/.pnpm/react@19.2.8`) — tanto `Propostas/web` quanto `packages/ui-kit` resolvem para ela. Não é erro de resolução de dependências.

**Corrigido:** `node_modules/.vite` apagado em `Propostas/web` e `conector/web`; processo antigo da porta 5175 (de pé desde muito antes das mudanças) encerrado. Dev server limpo, subido de novo → renderizou corretamente, com dado real (inclusive o registro "Teste Spec40" criado via curl no §4.2) e tema aplicado.

**Nota para qualquer dev server aberto ANTES desta sessão terminar:** reiniciar (`Ctrl+C` + subir de novo) — qualquer processo iniciado antes da adição do `@erp/ui-kit` pode ter o mesmo cache stale. Isto é comportamento esperado do Vite ao adicionar uma dependência nova a um workspace com o dev server já rodando, não uma regressão da integração.

## 11. Pendências / próximos passos
- Aguardar resultado da suíte completa da lib (§9) e anexar ao `00-progresso.md`.
- Fase 4: adotar `Projetos/web` (condicional, já aprovado pelo veredito de Propostas).
- Dono do ERP: registrar o ADR que supera o 009 (§1.2 da spec) — segue como follow-up, não bloqueou esta execução.
- Lib: avaliar 7.2 (genérico do `SarakDataTable` lazy), 7.3 (`SarakTextarea.label`), 7.4 (`SarakEmptyState` mensagem customizada) como pequenas melhorias; 7.5 já é escopo da Spec 41.
- Investigar por que o clique no card do `PresetsCatalog` (mostruário visual) não persiste, enquanto `TemplatesTab` (aba "templates") persiste corretamente — os dois chamam `onApply`/`handleApply` no código-fonte; possível divergência de wiring de props entre os dois caminhos.
