---
tipo: "plan"
titulo: "Tirar o domínio de dentro dos templates: dado e texto vêm do host"
objetivo: "Fazer nenhum componente da lib conhecer URL, cliente HTTP, rota de dominio, texto fixo em portugues ou conceito de um produto, de modo que os templates sirvam a qualquer sistema"
dominio: "Sarak-Lib-UI-Core / Templates / Genericidade"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "templates", "genericidade", "i18n", "auth", "dados"]
relacionados: ["[[03-superficie-publica]]", "[[10-seguranca-e-acessibilidade]]", "[[08-identidade-do-host-e-zero-marca]]", "[[003-remocao-backend-proprio]]"]
depende_de: "plan-95-icones-por-uma-porta-aberta-ao-consumidor"
retida_por: ""
destino_sintese: "arquitetura/03-superficie-publica.md + specs/10-seguranca-e-acessibilidade.md + specs/08-identidade-do-host-e-zero-marca.md + specs/00-regras-e-invariantes.md"
---

# 1. Objetivo

Um sistema qualquer usa `SarakTable`, `SarakForm`, `SarakStats`, `SarakChart` e `SarakAuthScreen` com **o
seu** dado, **o seu** fetch, **o seu** idioma e **a sua** marca: nenhum template da lib busca em URL, conhece
rota de domínio, carrega texto fixo em português nem conceito de um produto.

# 2. Contexto

**Decisão do dono (2026-10-03):** a lib é genérica e vai ser adotada aos poucos em qualquer tipo de sistema;
nada específico de um sistema entra. Medido em 2026-10-02, no `login-completo` (que consome a lib) e no Cripto
(que vai consumir):

| # | O que está embutido | Onde |
|---|---|---|
| 1 | **Um cliente HTTP interno com rotas de domínio.** `axios` com `baseURL = '/api'`, mais `apiKeysApi` (`/orchestrator/keys`), `usageApi`, `modelCatalogApi` e um `authApi` (`/auth/login`, `/auth/me`, `/auth/change-password`) — dentro de `src/`, contra a R32 | `src/shared/services/api.ts:22,70-185` |
| 2 | **Dez templates e hooks buscam por ele** quando recebem `endpoint`: `SarakChart`, `SarakForm`, `SarakManagementGrid`, `useCardGridState`, `useChartData`, `useFormData`, `useManagementGrid`, `useSarakStatsData`, `useSarakTableData` (e um do Discovery, que a `plan-94` remove). Num host com token em memória e fetch próprio, nenhum deles serve: o login só aproveitou `SarakStats` com `data` | `git grep -l "shared/services/api'" -- src` |
| 3 | **`SarakForm` não tem `onSubmit`**: exige `endpoint` e envia pelo cliente interno | `src/components/atomic/Templates/SarakForm.tsx:4,17` |
| 4 | **`SarakAuthScreen` carrega um produto**: textos fixos em português ("Login do Sistema", "Criação de Conta", "Verificação MFA", "ENTRAR COMO MASTER", "Acessar Sistema", "Ou continue com"), o conceito "Master", os selos "Secure"/"Neural", o subtítulo "Sovereign SSO Protocol" no botão social, `url("/noise.png")` buscado na raiz do host, cores fixas (`bg-blue-600`, `text-white`), `autoComplete` errado (`off` no e-mail, `new-password` no login), alternância "Primeiro Acesso" incondicional, e a cor do erro decidida por `error.includes('tentativas')` | `src/components/atomic/Templates/components/AuthForm.tsx:67-166` · `AuthFormFields.tsx:45-128` · `AuthHero.tsx:28,70-74` · `AuthSocialLogin.tsx:28` · `src/components/atomic/Buttons/SarakSocialButton.tsx:68,120` |
| 5 | **`SarakStats` supõe o dado de um produto**: `isActive`, `status === 'active'`, `error_details`; valor `> 1000` vira `1.2k` à força; ícone fixo `Activity`; `0` renderiza em branco (`String(x \|\| '')`); em erro devolve `null` | `src/components/atomic/Templates/SarakStats.tsx:42-62,92,99` |
| 6 | **`SarakTable` só renderiza `String(row[col])`** com caso especial para booleano ("Ativo/Inativo"); impõe título, busca, atualizar e uma coluna de ação com botão **sem `onClick`**; `text-white` fixo | `src/components/atomic/Templates/SarakTable.tsx:55-103,189-210` |
| 7 | **Gráficos com dado inventado**: o candlestick fabrica OHLC de `item.v` (`[v-10, v+10, v-20, v+20]`); o boxplot desenha três linhas fixas | `src/components/engines/charts/SubEngines/builders/statisticalCharts.ts:20-45` |
| 8 | **Textos fixos em português em átomos**: `SarakDataEmpty` ("Nenhum dado encontrado."), `SarakTable` (seis), `SarakAlert` ("Fechar aviso"), `SarakSpinner` ("Carregando"), `SarakToast` ("Fechar notificação") — nenhum passa pelo catálogo `useLibraryText` | `SarakDataEmpty.tsx:17` · `SarakTable.tsx:63-225` · `SarakAlert.tsx:94` · `SarakSpinner.tsx:10` · `SarakToast.tsx` |
| 9 | A R32 diz "gate pleno" e a `10-seguranca` §3.1 diz que o gate não existe — e `auditor_authcoupling` existe e **não vê** o `authApi` de `api.ts` | `specs/specs/00-regras-e-invariantes.md` (R32) · `specs/specs/10-seguranca-e-acessibilidade.md:294` · `gates/scripts/audit/auditor_authcoupling.mjs` |

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- `src/shared/services/api.ts` — **removido**, com os tipos que só ele usava.
- Os templates e hooks do item 2: `endpoint` e o fetch interno saem; o dado entra por `data` **ou** por uma
  função do host (`load: () => Promise<T>` / `onSubmit`), e o estado de carregamento/erro continua existindo.
- `src/components/atomic/Templates/components/Auth*.tsx`, `SarakAuthScreen.tsx`,
  `src/components/atomic/Buttons/SarakSocialButton.tsx` — textos pelo catálogo, sem conceito de produto, sem
  marca, sem recurso buscado na raiz do host, `autoComplete` correto, alternâncias opcionais por prop.
- `SarakStats.tsx`, `SarakTable.tsx`, `SarakDataEmpty.tsx`, `SarakAlert.tsx`, `SarakSpinner.tsx`, `SarakToast.tsx` —
  os itens 5, 6 e 8 (sem adicionar capacidade nova; isso é da `plan-97` e da `plan-98`).
- `src/components/engines/charts/SubEngines/builders/statisticalCharts.ts` — candlestick aceita OHLC
  (`open`/`high`/`low`/`close`) e boxplot aceita os cinco valores; sem dado, não desenha.
- `src/core/i18n/**` — as chaves novas, nos idiomas do catálogo.
- `gates/scripts/audit/auditor_authcoupling.mjs` — o escopo passa a cobrir rota de autenticação em qualquer
  arquivo de `src/`, com fixture.
- `package.json` — `axios` sai dos peers se ninguém mais o usar.
- `docs/migracoes.md`; `docs/component-catalog.*`, `sarak-ui/`, `sarak-dev/`, `dist/` regenerados.

## 3.2 Fora (o que NÃO pode ser tocado)

- **Capacidade nova de componente** (célula customizada, paginação com resumo, KPI com delta, confirmação,
  modal com tamanhos): são das `plan-97` e `plan-98`.
- O motor de gráficos além dos dois builders do item 7.
- O Provider e a persistência (`plan-93`); o cromo ([[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]); os ícones (`plan-95`).
- Qualquer tela, fluxo ou texto de domínio (login, cripto, ERP) — a lib não ganha nada deles.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` | R12 (zero-marca), R32 (indiferente à autenticação), R16 (zero-gambiarra no consumidor), R18 |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | §3.1 (autenticação é do host), §3.2 (rede é do host), §3.6 (tradução) — e a divergência com a R32 a corrigir |
| Spec fixa | `specs/specs/08-identidade-do-host-e-zero-marca.md` | o que conta como marca vazando |
| Spec fixa | `specs/adr/003-remocao-backend-proprio.md` | a decisão de a lib não ter backend — o cliente HTTP interno é resíduo dela |
| Spec fixa | `specs/arquitetura/03-superficie-publica.md` | §6.3 (templates de dado: `data` vence `endpoint` — muda) e §4.3 (nomes) |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | §3 (remover `endpoint` é MAJOR) e §5 |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | §3.2 — mock só de I/O externo |
| Contexto | `specs/00-contexto.md` · `specs/00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `ui-refatorar-componente` | mudar assinatura publicada |
| **Skill** | `test-unitario` | os testes |
| Código | `src/core/i18n/useLibraryText.ts` · `catalog.ts` | como um texto é lido e em quantos idiomas |
| Código | os arquivos de §3.1 | ler antes de editar |

# 5. Instruções de execução

1. **A porta de dado**: todo template que buscava por `endpoint` passa a aceitar `data` **ou** `load` (função
   do host que devolve o dado); `SarakForm` ganha `onSubmit`. O cliente interno e `api.ts` saem. Teste por
   template: com `load` que rejeita, o estado de erro aparece; com `data`, nenhuma chamada acontece.
2. **`SarakAuthScreen` genérico**: textos pelo catálogo; o rótulo de cada botão e título é prop com default
   traduzido; "Master", "Neural", "Secure", "Sovereign SSO Protocol" e o `noise.png` saem; cadastro, MFA e
   social são opt-in por prop; `autoComplete` padrão do navegador (`username`/`current-password`); a
   gravidade do erro vem de uma prop, não do texto.
3. **`SarakStats` sem produto**: nenhuma suposição sobre as chaves do dado; `0` renderiza `0`; nada vira
   `1.2k` por conta própria; em erro, renderiza o estado de erro.
4. **`SarakTable` sem produto**: nada de "Ativo/Inativo"; sem botão sem ação; sem `text-white`; título,
   busca e atualizar opcionais.
5. **Gráficos honestos**: candlestick e boxplot desenham o dado recebido; sem dado, estado vazio.
6. **Textos**: os cinco átomos do item 8 lêem do catálogo. Teste: com outro idioma, o texto muda.
7. **O gate de acoplamento de autenticação** passa a ver rota de autenticação em qualquer arquivo de `src/`
   (fixture: um `api.get('/auth/me')` solto). A divergência entre R32 e a `10-seguranca` §3.1 vai para a
   síntese.
8. `docs/migracoes.md`: nota MAJOR — `endpoint` sai, `load`/`onSubmit` entram; `axios` deixa de ser peer; o
   que mudou no `SarakAuthScreen`.
9. `npm run build` · `npm run guide` · `npm run catalog` · `npm run dev-kit` · `npx tsc --noEmit` ·
   `npx vitest run` · `npm run audit` → verdes; `npm run zero-brand:check` verde.

# 6. Critérios de aceite

- [ ] `src/shared/services/api.ts` não existe; `git grep -n "axios\|baseURL\|/api'" -- src` → vazio.
- [ ] Nenhum template tem prop `endpoint`; cada um tem `data` ou `load`; `SarakForm` tem `onSubmit` (testes).
- [ ] `git grep -n -i "master\|neural\|sovereign\|noise.png\|tentativas" -- src/components` → vazio.
- [ ] Teste: `SarakStats` com `{ total: 0 }` renderiza `0`; com `{ total: 1500 }` renderiza `1500`.
- [ ] Teste: `SarakTable` sem `onAction` não renderiza botão de ação.
- [ ] Teste: candlestick com `{ open, high, low, close }` desenha esses valores.
- [ ] Teste por átomo do item 8: o texto muda com o idioma.
- [ ] O gate de acoplamento acusa a fixture e passa sobre a base.
- [ ] `docs/migracoes.md` tem a nota; `npm run zero-brand:check`, `build`, `tsc`, `vitest` verdes; `audit`
      sem regressão.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` novo — o `auditor_authcoupling` (R32) é alargado; a genericidade dos textos é teste de
módulo.

- `git status` + `git diff --stat` → só §3.1.
- Os `grep` dos critérios 1 e 3.
- Mutação do gate com a fixture → acusa.
- Rodar isolados os testes dos critérios 2, 4, 5, 6 e 7; `npx vitest run` inteiro.
- `node gates/scripts/contrato/check-minor-no-removal.mjs` → o que saiu bate com a nota.
- `npm run build` · `npm run zero-brand:check` · `npx tsc --noEmit` · `npm run audit`.

# 8. Destino da síntese

**Destino:** `arquitetura/03-superficie-publica.md + specs/10-seguranca-e-acessibilidade.md + specs/08-identidade-do-host-e-zero-marca.md + specs/00-regras-e-invariantes.md`

- **`03-superficie-publica`** §6.3 reescrita — *o dado vem do host*: `data` ou `load`; nenhum template faz
  rede; `SarakForm` entrega por `onSubmit`.
- **`10-seguranca`** §3.1 e §3.2 — a lib não tem cliente HTTP; a divergência sobre o gate da R32 corrigida
  (o gate existe e o que ele cobre).
- **`08-identidade-do-host`** — o template de autenticação não carrega marca nem conceito de produto.
- **`00-regras`** R32 — estado e vão atualizados; R12 — o que o gate de marca passou a ver, se mudou.

> A síntese é ato do **revisor** ([[00-prompt-revisor]]), e o gatilho é do **usuário**: o revisor propõe ao
> aprovar e espera autorização. Esta seção apenas a prepara.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

---

# 11. Síntese

<!-- Preenchido pelo REVISOR na síntese (00-prompt-revisor.md §7.4), imediatamente antes da remoção da plan.
     Append-only. O que foi transportado, e o que ficou de fora. -->
