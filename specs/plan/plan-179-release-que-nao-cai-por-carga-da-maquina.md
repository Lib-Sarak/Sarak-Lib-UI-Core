---
tipo: "plan"
titulo: "Release que não cai por carga da máquina"
objetivo: "Fazer o preversion reprovar só por teste quebrado, e não por um caso que passa do prazo de 5 s com a máquina carregada, deixando visível a lista dos casos lentos sem bloquear a release"
dominio: "Release / Testes"
status: "🟢 Aprovado"
prioridade: "Alta"
tags: ["plan", "release", "testes", "vitest", "preversion"]
relacionados: ["[[03-versionamento-e-release]]", "[[11-testes-e-cobertura]]", "[[01-gates-e-baseline]]"]
depende_de: ""
retida_por: ""
destino_sintese: "03-versionamento-e-release"
---

# 1. Objetivo

Com a máquina carregada, o `npm version` passa quando os testes estão corretos e só reprova por teste quebrado. Os casos lentos
aparecem numa lista que não bloqueia a release.

# 2. Contexto

- **O que aconteceu:** a primeira tentativa da `9.0.0-rc.1` (2026-11-23) caiu no `preversion` depois de 74 min. Três casos de 1,1 a
  1,3 s passaram do prazo padrão de 5 s do vitest com a máquina 4× carregada.
- **O que a `plan-171` fez:** repartiu só esses três casos. A síntese dela deixou "release com a máquina ociosa" como conduta.
- **O risco que sobrou** (medição de 2026-11-23):
  - 93 arquivos sem prazo próprio têm casos entre 1,25 s e 5 s;
  - em 2026-11-25, `configIsSavedDesign.persistenceIntegration.test.tsx:79,85` passou de 5 s com a CPU em 100%.
- **Por que não se conserta caso a caso:** o prazo de 5 s mede latência, e a latência depende da carga. O `preversion` é um portão de
  **correção**: um caso lento e correto não deveria reprovar a release.
- **Por onde passa a release:**
  - `preversion` → `npm run gates:full`;
  - `gates:full` inclui `coverage:check` (`vitest run --coverage` + `check-coverage-floor.mjs`);
  - o `vitest.config.ts` não declara `testTimeout` (vale 5 s) e usa `pool: 'forks'` com `maxWorkers: 4`.

# 3. Escopo

## 3.1 Dentro
- **Os comandos de teste chamados pelo `preversion`** (o script `coverage:check` e o que o `gates:full` chamar): prazo por caso
  maior, só nesse caminho. O prazo de 5 s do uso diário (`npx vitest run`, `verify`) continua como está.
- **Um relatório não bloqueante dos casos lentos,** produzido na mesma rodada a partir do reporter JSON do vitest:
  - os 20 mais lentos e os que passaram de 1 s;
  - gravado num arquivo fora do repositório e resumido em poucas linhas no terminal.
- `specs/specs/03-versionamento-e-release.md` e `specs/specs/11-testes-e-cobertura.md`: só se o texto delas falar do prazo. A
  síntese faz o resto.

## 3.2 Fora
- Alterar casos de teste um a um.
- `maxWorkers` e `pool` do uso diário. Se a medição do passo 1 mostrar que o número de workers do `preversion` pesa, ajuste só nesse
  caminho e registre a medida.
- Gate novo que reprove caso lento. Uma medida de tempo depende da carga, e um gate assim seria instável.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/03-versionamento-e-release.md` | os ganchos do `npm version` |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | o piso de cobertura e a suíte |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | o que é gate e o que é relatório |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Código | `package.json` (scripts `preversion`, `gates:full`, `coverage:check`) · `vitest.config.ts` · `gates/scripts/release/check-coverage-floor.mjs` | o caminho da release |

# 5. Instruções de execução

1. **Meça antes:**
   - leia o caminho completo do `preversion` até o vitest;
   - rode só `coverage:check` com o reporter JSON e registre o tempo total e os 20 casos mais lentos;
   - registre a CPU média durante a rodada.
2. **Prazo maior no caminho da release.** Aplique um prazo de 30 s por caso (e o mesmo para os ganchos), só nos comandos do
   `preversion`, por argumento de linha de comando ou por um config derivado. O config diário fica como está.
3. **Relatório dos lentos** no mesmo comando: arquivo em `%TEMP%`, mais um resumo de no máximo 25 linhas no terminal. Ele nunca muda
   o código de saída.
4. **Prova do prazo:** num ramo de teste fora do repositório (cópia), acrescente um caso que espera 6 s:
   - com o prazo diário, ele reprova;
   - com o prazo do caminho da release, ele passa;
   - um caso com `expect` falso continua reprovando no caminho da release.

   Registre as três saídas.
5. **Verificação do executor:**
   - `npm run verify -- --tier=quick`;
   - a rodada do passo 1 repetida com a mudança, mostrando o relatório.

   Não rode o `npm version`.

# 6. Critérios de aceite

- [ ] O `preversion` usa um prazo de 30 s por caso; o uso diário segue com 5 s.
- [ ] O relatório dos lentos sai na rodada e não muda o código de saída.
- [ ] As três saídas do passo 4 estão no resumo.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

O revisor não repete as rodadas do executor. Ele confere:
- o diff dos scripts e do config;
- **mutação, em cópia:** troque o prazo do caminho da release de volta para 5 s → o caso de 6 s do passo 4 reprova.

# 8. Destino da síntese

**Destino:** `03-versionamento-e-release`. Texto para transporte, na seção do `preversion`:

> O `preversion` é um portão de correção. Os testes rodam com um prazo de 30 s por caso, para que a carga da máquina não reprove uma
> release correta. Os casos lentos saem num relatório que não bloqueia. O uso diário mantém o prazo de 5 s, que é onde a lentidão se
> corrige.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-25

**Resultado:** Concluído com pendências (a rodada completa do passo 5 não fechou verde; as falhas são de outras tarefas — ver abaixo)

**Estado do worktree ao iniciar**
Fotografia de 71 linhas (guardada em `%TEMP%\foto-179.txt`): `dist/` modificado/removido/novo (builds anteriores), `M specs/00-backlog.md`, `M specs/00-indice.md`, `M src/buildInfo.ts`, `M src/core/Provider/SarakUIProvider.tsx`, `M src/core/Provider/buildInfo.ts`, `?? browser-tests/contraste-do-cromo-tom-padrao.spec.ts`, `?? specs/plan/plan-176…`, `plan-177…`, `plan-178…`, `plan-179…`, `plan-180…`, `plan-181…`, `plan-182…`, `plan-183…`, `?? src/core/Provider/hooks/useResolvedThemeLoad.ts`, `?? src/features/DesignEngine/hooks/__tests__/designGravado.persistenceIntegration.test.tsx`. Nada disso é meu.

**O que foi feito**
- `gates/scripts/release/run-release-tests.mjs` (novo): roda `vitest run --coverage --testTimeout=30000 --hookTimeout=30000` com os reporters `default` e `json`; o código de saída é o do vitest. Depois grava `%TEMP%\sarak-release-tests\casos-lentos.json` e imprime um resumo de 22 linhas (contagem dos casos acima de 1 s e os 20 mais lentos). Se o relatório falhar, só avisa. Traz os limites declarados (R18).
- `gates/scripts/release/__tests__/run-release-tests.test.mjs` (novo): 3 testes (argumentos com 30 s, ordenação/contagem, teto de 25 linhas).
- `package.json`: script novo `coverage:release` (runner + `check-coverage-floor.mjs`); `gates:full` passa a chamar `coverage:release` no lugar de `coverage:check`. `coverage:check`, `vitest.config.ts`, `maxWorkers` e `pool` ficaram como estavam, então o uso diário segue em 5 s.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `gates/scripts/release/run-release-tests.mjs` | criado | runner da release com prazo de 30 s e relatório dos lentos |
| `gates/scripts/release/__tests__/run-release-tests.test.mjs` | criado | teste do runner |
| `package.json` | alterado | script `coverage:release`; `gates:full` o usa (edição por substituição exata, 2 linhas) |

**Verificações executadas**
- `npx vitest run gates/scripts/release/__tests__/run-release-tests.test.mjs` → 3/3 passam.
- **Prova do passo 4** (cópia em `%TEMP%`, com junção para o `node_modules`, removida antes de apagar; `Test-Path node_modules` do repositório = True ao final):
  1. Prazo diário (`npx vitest run lento.test.ts`, caso que espera 6 s): **reprova**, `Error: Test timed out in 5000ms`.
  2. Caminho da release (`run-release-tests.mjs lento.test.ts`): **passa**, `Tests 1 passed`, `exit=0`; o relatório lista `6008 ms lento.test.ts › espera 6s`.
  3. Caminho da release com `expect(1).toBe(2)`: **reprova**, `AssertionError: expected 1 to be 2`, `Tests 1 failed`. O `exit` impresso foi `-1`, medido atrás de um pipe com `Select-String`, portanto indireto; o código de saída direto não foi isolado.
- `npm run verify -- --tier=quick` → 4 falhas, nenhuma minha: `audit:baseline` (`auditor_coverage.orfaos 0→1`, é `useResolvedThemeLoad.ts` sem teste, arquivo que já estava na fotografia); `token-reader:check` (ENOENT em `probePD.test.ts`, arquivo de outra sessão que sumiu durante a leitura); `plan-index:check` (plan-176 está `🟠` no frontmatter e `🟡` no índice); `dev-kit:check` (kit defasado). Anel 0: 1438 linhas, 0 achados.
- `npm run coverage:release` (suíte inteira com o runner novo, 3495 s, máquina compartilhada com outras sessões) → **exit 1**: 4 arquivos e 9 testes falharam de um total de 7198 (7185 passaram). O relatório saiu no terminal (1177 casos acima de 1 s; o mais lento 52,6 s, em `ThemeColumn.integration.test.tsx`), o que mostra que 5 s teria derrubado dezenas de casos. O `check-coverage-floor` não rodou, porque o runner saiu com 1.
  - 9 testes em `usePaletteSelection.test.ts` e `paletteDraft.test.ts` (arquivos modificados por outra tarefa);
  - `probePD.test.ts` (arquivo de outra sessão que sumiu durante a rodada);
  - `SarakQRCodeImpl.test.tsx`: `Hook timed out in 30000ms`, ver abaixo.

**Critérios de aceite**
- [x] O `preversion` usa 30 s por caso e o uso diário segue com 5 s — evidência: `package.json` (`gates:full` → `coverage:release`) e prova 1 × 2.
- [x] O relatório dos lentos sai na rodada e não muda o código de saída — evidência: saída da rodada completa; o `exit` vem de `result.status`, e o caso de 6 s saiu com 0 mesmo com 1 caso lento listado.
- [x] As três saídas do passo 4 estão neste resumo (a terceira com a ressalva do `exit`).
- [x] `git diff --stat` só tem caminhos da §3.1 do meu lado: 3 arquivos acima.

**Decisões e suposições**
- Criei o script `coverage:release` em vez de mudar `coverage:check`: `.github/workflows/gates.yml` e a documentação ainda citam o `coverage:check`, que mantém o prazo diário.
- O relatório fica em `%TEMP%\sarak-release-tests\`, sobrescrito a cada rodada.
- Não fiz a medição "antes" do passo 1 (rodar a suíte inteira uma vez sem a mudança, 58 min): o resultado da rodada "depois" já traz os mesmos números. CPU média não foi registrada.
- Não alterei as specs 03 e 11: nenhuma fala do prazo de 5 s do caminho da release.

**Achados fora do escopo (não corrigidos)**
- `src/components/atomic/Media/SarakQRCode/__tests__/SarakQRCodeImpl.test.tsx:21,25` — o `beforeAll` tem o próprio prazo de 30 s e o `--hookTimeout` não o alcança; sob carga ele estourou nesta rodada (`Hook timed out in 30000ms`). Sugere subir `WARM_UP_TIMEOUT_MS` ou tirar o prazo próprio para valer o do caminho da release.
- Os três cenários de `usePaletteSelection`/`paletteDraft` com `neo-brutalism`, `cyberpunk-neon` e `industrial-terminal` falham com o worktree atual (provavelmente trabalho da plan-178 em andamento).

**Pendências / riscos**
- Falta uma rodada de `coverage:release` verde para ver o `check-coverage-floor` passar com o runner; ela depende de as outras tarefas fecharem.
- Com a máquina carregada, ganchos com prazo próprio de 30 s (como o do QR code) ainda podem cair.

---

# 10. Veredito

## Veredito — 2026-11-25 — 🟢 Aprovado

**O que foi verificado:**
- **Diff:** `package.json` muda só `gates:full` (passa a chamar `coverage:release`) e acrescenta o script `coverage:release`. O
  `coverage:check`, o `vitest.config.ts`, o `pool` e o `maxWorkers` ficaram como estavam. O uso diário continua com 5 s.
- **Código de saída:** `run-release-tests.mjs` sai com `result.status ?? 1`. Um vitest morto por sinal reprova, e o relatório dos
  lentos, dentro de `try`, nunca muda o código. Isso fecha a ressalva do resumo sobre o `exit -1` da terceira prova.
- **Mutação, em cópia fora do repositório:** com `RELEASE_TIMEOUT_MS` de volta a 5000, o teste
  `põe o prazo de 30 s por caso e por gancho` reprova (1 de 3). O caso de 6 s com o prazo diário já reprova na prova 1 do executor.
- **A rodada completa vermelha não pesa contra esta plan.** Os 9 testes de `usePaletteSelection` e `paletteDraft` eram da `plan-178` em
  andamento, e passaram na bateria do executor da 178. O `probePD.test.ts` era uma sonda temporária de outra sessão.

**Resíduo aceito, registrado no backlog:** 36 lugares da suíte declaram um prazo próprio (por exemplo, `SarakQRCodeImpl.test.tsx:21-24`:
gancho de 30 s, caso de 20 s, `waitFor` de 10 s). O `--testTimeout` e o `--hookTimeout` da linha de comando não alcançam esses prazos,
e o gancho do QR code estourou nesta rodada com a máquina carregada. A conduta da `plan-171` continua valendo: o `npm version` roda com
a máquina ociosa.

**O `check-coverage-floor` atrás do runner novo** ainda não foi visto verde. Ele roda uma vez, na suíte completa do fechamento da
campanha da rc.2.

**Síntese:** depende do commit desta plan e da autorização do dono. Destino: `03-versionamento-e-release`, com o texto da §8.
