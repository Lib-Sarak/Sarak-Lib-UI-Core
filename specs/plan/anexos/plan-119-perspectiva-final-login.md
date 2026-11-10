# Perspectiva final do importador Sarak-Lib-Login (login-completo e login-provedores) — 2026-11-10

Relato do revisor do importador Login para o lote final da `plan-119` da lib. Só leitura: nenhum arquivo do importador ou da
lib foi editado e nenhum build foi rodado. Cada item foi conferido contra a **8.0.0 instalada** (`dist/`, `sarak-ui/`,
`docs/` em `node_modules/@sarak/lib-ui-core`), não contra a memória da campanha. Foram lidos antes, para não repetir: a §5.1
da plan-119, os anexos `plan-119-relatorio-erp.md` e `plan-119-relatorio-login.md`, e o `Sarak-Lib-Login/sugestoes-para-a-lib.md`.

**Versão instalada (os dois):** `node_modules/@sarak/lib-ui-core/package.json` → `"name": "@sarak/lib-ui-core", "version": "8.0.0"`;
`dist/BUILD_INFO.json` → `libVersion 8.0.0`, `baseCommit 015a84b`, `builtAt 2026-11-04T23:55:34Z`. Dependência
`github:Lib-Sarak/Sarak-Lib-UI-Core#v8.0.0`; o lock resolve em `git+ssh://…#dc1f8a48`.

## Notas antes das tabelas

- **Correção do nosso envio de 2026-11-05:** a sugestão 15 (nome acessível do `SarakSwitch`) foi dada como atendida, mas
  a 8.0.0 só acrescentou `aria-describedby`; o nome calculado continua "rótulo + descrição". Ela está na tabela B como
  viva, com reprodução.
- **Item novo (A1):** dois temas embarcados trazem imagem SVG embutida (data-URL base64) num token, e a documentação do
  payload não diz isso; os dois logins tiveram de escrever um validador próprio para conseguir salvá-los.
- **Limite da medição:** o aviso `IMPORT_IS_UNDEFINED` do `pdfjs-dist` (B, I31) vem da medição de 2026-11-05 registrada
  no `sugestoes-para-a-lib.md`; nesta rodada conferi que o `dist/` acessa o `pdfjs-dist` estaticamente e que o guia não o
  lista na tabela de avisos, mas não rodei o build de novo.

## A. Itens vivos (novos, fora da §5.1 e do `sugestoes-para-a-lib.md`)

| # | categoria | o que aconteceu | causa | onde o kit deveria ter avisado | peso | no importador |
|---|---|---|---|---|---|---|
| A1 | kit | O servidor recusava salvar dois temas embarcados, porque o `globalBackgroundImageUrl` deles é `data:image/svg+xml;base64,…` (`dist/organic-clay-*.js`, `dist/synthwave-retro-*.js`). O importador escreveu um validador de data-URL com lista de tipos, teto de 4096 caracteres e checagem de SVG ativo (`script`, `on*=`, `href`, `foreignObject`): login-completo `1c94156` e login-provedores `0161b07`, em `modules/access/core/domain/themes.ts` | a I32 documentou só a gramática das cores; os valores de imagem dos temas embarcados não aparecem em lugar nenhum | `docs/persistencia-de-tema.md:46` (o parágrafo do payload opaco), que hoje cita só `var()`/`color-mix()`; nenhuma ocorrência de `data:` ou "imagem" no documento | essencial (o tema não podia ser salvo) | contornado |

## B. Itens já registrados: estado na 8.0.0 instalada

| id | estado | evidência / o que falta |
|---|---|---|
| I14 | resolvido | `index.js`: o `AuthForm` aceita `showCredentials` (padrão `!0`) |
| I21 · I29 | resolvido | os dois usam `installSarakTestEnvironment` (`tests/ui-core.setup.ts:3`), que remove o aviso `Could not parse CSS stylesheet` no `jsdomError` (`dist/testing.js`), mais `filterSarakTestConsoleLog` nos `vitest.config.ts` |
| I30 · sug. 5 | **vivo** | o `exports` do pacote não tem `./package.json` e não há `sarakGetBuildInfo`. O e2e lê a versão pelo caminho resolvido: completo `modules/hub/tests/e2e/journeys.spec.ts:90`, provedores `:124` (`createRequire`) |
| I31 · sug. 16 | **vivo (parcial)** | o guia diz que o `IMPORT_IS_UNDEFINED` é esperado (`sarak-ui/GUIA-FRONTEND.md:123-135`), mas a tabela **omite o `pdfjs-dist`**, e `SarakPDFViewerImpl-*.js` acessa `S.GlobalWorkerOptions`/`S.getDocument` de forma estática. O aviso continua no build do importador e esconde aviso real |
| sug. 1 · 3 · 4 · 8 | resolvido | a §1.1 diz que o rascunho só grava no `Aplicar (N)` (`persistencia-de-tema.md:29-39`); o payload é opaco, com `var()`/`color-mix()` (`:46`, `:54`); `dompurify` está no piso novo |
| sug. 6 | resolvido (texto) | `persistencia-de-tema.md:117-119`: um `onLoad` que só aparece depois da autenticação também inicia a carga. Falta só o exemplo lado a lado (antes e depois) |
| sug. 11 | não reproduz | o importador escolhe o tema por `[data-decision-row="theme"]` + `#presets-themes` (`journeys.spec.ts:475-484`); há um único `Fechar galeria` literal no `dist/` |
| sug. 15 | **vivo — o "atendido" do envio de 2026-11-05 estava errado** | `chunk-GBZMIUFP.js`: o `SarakSwitch` ganhou `aria-describedby`, mas o `<label>` ainda envolve o `<span>` da descrição, então o nome calculado continua "rótulo + descrição". **Reprodução:** `<SarakSwitch label="Ver pessoas" description="Lista e detalhe" />` → `getByRole('switch', { name: 'Ver pessoas', exact: true })` não acha o controle. Contorno: `aria-label` repetido em `modules/access/web/src/pages/roles/RoleEditor.tsx:91` |
| sug. 19 | **vivo (defeito)** | no `chunk-GBZMIUFP.js`, o `showToast` faz `g({type,message}), setTimeout(()=>g(null),3e3)` com dependências `[]`, sem `clearTimeout`. **Reprodução:** dois `showToast` com menos de 3 s entre eles (exportar o JSON e, logo depois, apagar o tema): o timer do primeiro apaga o segundo. Contornos: um `MutationObserver` que registra o aviso quando ele entra no DOM (`journeys.spec.ts:641`, `d82b885`/`db870c8`) e o recarregamento do painel antes de apagar e antes do 409 (`bc572a3`/`72be8f5`) |
| sug. 14 | **vivo (essencial; pedido na rc.3)** | `index.js`, `AuthFormFields`: o `<label>` sai sem `htmlFor`, o botão do olho (`SarakIconButton`) sai sem `aria-label`, e o bloco do `error` no `AuthForm` não tem `role="alert"`. Contorno: `input[autocomplete="username"/"current-password"]` (`journeys.spec.ts:771-772`, `modules/access/tests/web/input.test.tsx:33`) |
| sug. 13 | vivo | `SarakConfirmOptions` (`index.d.ts:4145-4156`) só tem `title`, `message`, `confirmLabel`, `cancelLabel` e `tone`, sem test id. Contorno: botão pelo texto (`journeys.spec.ts:689`) |
| sug. 10 | vivo | nenhum `data-theme-id` no `dist/`. Contorno: cartão filtrado pelo texto exato (`journeys.spec.ts:477-480`) |
| sug. 2 · 9 | vivo | a doc não lista os gestos do painel (rótulo, papel, alvo de teste) nem diz que salvar um tema **ativa** e grava o aplicado. `persistencia-de-tema.md` §1.2 (`:134-165`) descreve só a assinatura `onSave(theme, operation)` |
| sug. 12 | vivo | o JSDoc de `templateColumns` (`index.d.ts:2021-2023`) não diz que a pilha vertical é `"1fr"`. O importador escreve `templateColumns="1fr"` em 62 (completo) e 55 (provedores) lugares |
| sug. 17 | vivo | `console.error('[Sarak] CSS não detectado…')` (`chunk-TBRFK6NO.js`) não entra no `filterSarakTestConsoleLog` (`dist/testing.js` filtra só `Could not parse CSS stylesheet`) e aparece em todo teste jsdom |
| sug. 7 | vivo | com `github:…#v8.0.0`, o lock dos dois registra `git+ssh://` (`package-lock.json`). O guia (`:405`) cita `github:…#semver:` sem avisar desse efeito |
| sug. 18 · C7 | vivo | 10 títulos `##` de `docs/migracoes.md` sem versão (`:2150`, `:2190`, `:2267`, `:2312`, `:2446`, `:2501`, `:2553`, `:2590`, `:2630`, `:2742`); nenhuma seção de tokens acrescentados, removidos ou com valor novo; o `sarak-ui/catalog.json` não tem lista de tokens removidos (chaves: `tokens`, `designTokens`… sem histórico). O importador reconciliou o vocabulário à mão (`e5f542c`/`f09cd49`) |

## C. Linhas abertas da §5.1

| linha | ainda quer? | motivo |
|---|---|---|
| C1 | indiferente | os logins não injetam o tema antes do primeiro paint (o `index.html` só tem o script de entrada) e não sentiram falta |
| C3 | indiferente | os dois instalam pela tag (`github:…#v8.0.0`), não por `file:` |
| C4 | sim | o login não mantém regra de gate sobre o uso da lib (a porta única `packages/ui-kit` vale por convenção); um plugin opcional pegaria seletor por classe e prop inválida, que custaram rodadas |
| C6 | não | o slot do cromo serve; o seletor de organização é regra de negócio de cada sistema |
| I30 | sim | o selo só se confere lendo o `package.json` pelo caminho resolvido (B, I30) |
| C7 | sim | o servidor com lista de chaves recusa o tema a cada token novo; sem lista legível por máquina, a reconciliação é manual a cada versão |

Campanha de migração à 8.0.0 concluída: sim. Os dois estão em `#v8.0.0`, com a plan-124 e a gêmea plan-35 sintetizadas; os contornos acima continuam vivos no importador até a lib corrigir 14, 15 e 19.
