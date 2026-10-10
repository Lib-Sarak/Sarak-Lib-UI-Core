---
tipo: "plan"
titulo: "Dar ao host o controle das preferencias do usuario no cromo"
objetivo: "Permitir que o host declare o modo de cor inicial, inclusive system, e desligue qualquer widget de preferencia do cromo, sem tocar na escolha que o usuario ja fez"
dominio: "Provider / Preferencias do usuario / Cromo"
status: "🟢 Aprovada"
prioridade: "Media"
tags: ["plan", "preferencias", "modo-de-cor", "provider", "cromo", "widgets"]
relacionados: ["[[09-temas-e-presets]]", "[[05-cromo-e-slots]]", "[[016-preferencias-do-usuario-separadas-do-tema]]", "[[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md + specs/05-cromo-e-slots.md"
---

# 1. Objetivo

O host passa a decidir duas coisas que hoje não alcança: **o modo de cor que vale enquanto o usuário não escolheu
nenhum** (`light`, `dark` ou `system`, este acompanhando o sistema operacional em tempo real) e **quais widgets de
preferência o cromo mostra** — inclusive tamanho de fonte, orientação da navegação e idioma.

# 2. Contexto

**Modo de cor inicial.** O modo é uma **preferência do usuário** ([[09-temas-e-presets]] §4.7,
[[016-preferencias-do-usuario-separadas-do-tema]]): `SarakUserPreferences.colorMode` aceita
`'light' | 'dark' | 'system'` (`src/core/Provider/preferencesTypes.ts`), o botão do cromo grava `light`/`dark`
(`SarakShellThemeToggle.tsx`) e `overlayPreferences.ts` (`resolveColorModeTarget`) traduz `system` pelo
`prefers-color-scheme` acompanhado por `usePreferencesSystemColorScheme.ts`. **Sem preferência salva**,
`resolveColorModeTarget` devolve `undefined` e vale o modo nativo do tema: o host não tem como dizer "comece
seguindo o SO". Pedido do dono em 2026-10-10, ao comparar com o modelo antigo (o consumidor `Novo` escolhia um tema
claro ou escuro por `themeBase`).

**Widgets que não se desligam.** [[05-cromo-e-slots]] §2.2.1 diz que o cromo nasce com todos os widgets
"e o consumidor desliga o que não quiser", e o [[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]] faz da composição
da barra uma decisão do sistema. Mas `SarakChromeWidgets` (`src/components/Layout/chrome/chromeWidgets.ts:56-67`)
só tem `search`, `themeToggle`, `user`, `notifications` e `collapse`; os widgets de **tamanho de fonte**,
**orientação da navegação** e **idioma** (`CHROME_WIDGET_IDS`, `src/core/Design/schema/preferences.ts`) não têm teto
de código — `useChromeDefaultWidgets.ts:174-176` registra que "as outras três preferências não têm teto, só a posição
decide". Além disso, o comentário de `chromeWidgets.ts:52-54` diz que o idioma fica fora do padrão, e não fica
(ele monta com dois ou mais idiomas habilitados).

Restrições que vêm da spec e não mudam:
- a preferência é **do usuário** e nunca vira tema; o padrão do host **não é gravado** (a lib não grava sem
  mudança, [[09-temas-e-presets]] §4.4.2);
- preferência **não oferecida** pelo tema é ignorada (§4.7) — o padrão do host também;
- `widgets` é **teto**: omitido = ligado, `false` desliga; ele nunca liga o que o tema não oferece.

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/preferencesTypes.ts` — `SarakPreferencesOptions.defaultColorMode?: SarakColorModePreference`.
- `src/core/Provider/utils/overlayPreferences.ts` e/ou `src/core/Provider/hooks/usePreferencesManager.ts` — a precedência: preferência salva → `defaultColorMode` → modo nativo do tema.
- `src/components/atomic/Navigation/SarakShellThemeToggle.tsx` — só se for preciso para o botão mostrar o modo efetivo vindo do SO.
- `src/components/Layout/chrome/chromeWidgets.ts` e `useChromeDefaultWidgets.ts` — as três chaves novas de `widgets` (`fontSize`, `navigationStyle`, `language`) como teto, e o comentário desatualizado.
- Testes dos arquivos tocados; artefatos regenerados (`npm run catalog`, `npm run guide`).
- `docs/migracoes.md` — nota aditiva na seção da próxima versão.

## 3.2 Fora
- O schema de tokens (o padrão de modo é do **host**, não do tema; não vira token).
- Oferecer `system` como terceira opção no botão de modo — decisão de interface separada.
- Renomear as chaves existentes de `widgets` (`themeToggle`, `collapse`) — é MAJOR sem ganho.
- Qualquer spec em `specs/`; o painel de autoria.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/09-temas-e-presets.md` §2.1, §4.4.2, §4.7 | contraparte, "não grava sem mudança", preferência sobreposta |
| Spec fixa | `specs/05-cromo-e-slots.md` §1 (linha `widgets`), §2.2.1 e §2.2.2 | o teto de código e a composição da barra |
| ADR | `adr/016-preferencias-do-usuario-separadas-do-tema.md` | por que preferência não é tema |
| ADR | `adr/018-um-cromo-so-e-o-consumidor-e-dono-das-rotas.md` | a composição da barra é do sistema |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | os casos da §5 |
| Código | `src/core/Provider/utils/overlayPreferences.ts`, `src/core/Provider/hooks/usePreferencesManager.ts`, `src/core/Provider/hooks/usePreferencesSystemColorScheme.ts` | a resolução atual do modo |
| Código | `src/components/Layout/chrome/chromeWidgets.ts`, `src/components/Layout/chrome/useChromeDefaultWidgets.ts`, `src/core/Design/schema/preferences.ts` | o teto atual dos widgets |

# 5. Instruções de execução

1. Acrescentar `defaultColorMode` às opções de preferência, com JSDoc que diga a precedência e que o valor não é gravado; aplicar a precedência na resolução do modo, só quando o tema oferece a preferência de modo.
2. Acrescentar `fontSize`, `navigationStyle` e `language` a `SarakChromeWidgets`, com o mesmo contrato das chaves que já existem (omitido = ligado, `false` desliga), aplicadas como teto em `useChromeDefaultWidgets`; corrigir o comentário de `chromeWidgets.ts`.
3. Testes do modo: (a) sem preferência salva e `defaultColorMode: 'system'`, o design efetivo segue o SO e muda quando o `matchMedia` muda; (b) preferência salva vence o padrão; (c) o padrão não escreve no `localStorage` nem chama `onSave`; (d) tema que não oferece a preferência ignora o padrão; (e) sem `defaultColorMode`, nada muda.
4. Testes dos widgets: com o tema oferecendo cada uma das três preferências, `widgets: { <chave>: false }` tira o widget da barra e do ⚙; omitida, ele aparece como hoje.
5. Regenerar catálogo e kit; nota de migração aditiva (duas opções novas).
6. Rodar a verificação da §7.

# 6. Critérios de aceite

- [ ] Os cinco casos do passo 3 e os do passo 4, cada caso novo com teste que falharia sem a mudança.
- [ ] `defaultColorMode` e as três chaves novas de `widgets` aparecem em `dist/index.d.ts` com JSDoc.
- [ ] Abrir em `system` e clicar no botão de modo grava a escolha do usuário, que passa a valer.
- [ ] O comentário de `chromeWidgets.ts` descreve o que o código faz com o idioma.
- [ ] Suíte completa verde; `tsc` 0; `audit:baseline` sem regressão; catálogo, kit e barril em dia.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento do Provider e do cromo, coberto pelos testes dos passos 3 e 4.

- `git diff --stat` → só a §3.1 e os gerados.
- Mutação: ignorar `defaultColorMode` na resolução → os casos (a) e (d) falham; gravar o padrão → o caso (c) falha; ignorar uma das chaves novas de `widgets` → o teste dela falha.
- `grep -n "defaultColorMode\|navigationStyle?:" dist/index.d.ts` → presentes.
- `npx vitest run` · `npx tsc --noEmit` · `npm run audit:baseline` · `npm run catalog:check` · `guide:check` · `barrel:check`.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md + specs/05-cromo-e-slots.md`

Para a [[09-temas-e-presets]] §4.7, depois da tabela das preferências:

> **O host escolhe o modo inicial.** `options.preferences.defaultColorMode` (`light`, `dark` ou `system`) vale
> enquanto o usuário não escolheu um modo — `system` acompanha o sistema operacional em tempo real. A escolha do
> usuário vence; o padrão do host nunca é gravado, e é ignorado se o tema não oferece a preferência de modo.

Para a [[05-cromo-e-slots]] §1, na linha de `widgets`: a lista de chaves passa a incluir `fontSize`,
`navigationStyle` e `language`, com o mesmo contrato de teto.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

### Execução — 2026-10-10

**Resultado:** implementação realizada; revisão pendente por falhas de ambiente e verificações do workspace compartilhado.

**Estado inicial:** worktree limpo antes desta execução.

**Implementado:**
- `src/core/Provider/preferencesTypes.ts`: `defaultColorMode` com contrato de precedência, oferta pelo tema e não persistência.
- `src/core/Provider/hooks/usePreferencesManager.ts`: preferência salva vence o default do host; `system` usa o esquema acompanhado em tempo real; o default não dispara persistência nem `onSave`.
- `src/components/Layout/chrome/chromeWidgets.ts` e `useChromeDefaultWidgets.ts`: `fontSize`, `navigationStyle` e `language` aplicados como teto na barra e no menu; comentário atualizado.
- Testes adicionados para os cinco casos de modo e para as três chaves de widgets.
- `docs/migracoes.md`: subseção MINOR aditiva em `## 8.0.0`; catálogo e kit regenerados.

**Verificações:**
- Passaram: `npm run catalog`, `npm run guide`, `npm run catalog:check`, `npm run guide:check`, `npm run barrel:check` e `git diff --check` nos arquivos desta execução.
- `npx tsc --noEmit`: falhou somente em arquivos das plans paralelas `SarakRichText.test.tsx` e `usePdfDocument.test.ts`; nenhum erro nos arquivos desta plan.
- `npm run audit:baseline`: regressão reportada em `auditor_coverage.mjs.orfaos` (0 → 2). O relatório detalhado não foi executado, para não investigar arquivos das plans paralelas.
- `npx vitest run`: 432 suítes falharam antes de executar testes, com `EPERM` ao renomear diretórios temporários do Vitest e quatro encerramentos inesperados de workers. Nenhuma alteração de pool, worker ou timeout foi feita.
- Validador AST: sem violações de tipagem/limiares nos arquivos novos; apontou `console.error` e `console.warn` preexistentes nos hooks tocados.
- `build`, `build:js` e `public-types:check` não executados conforme instrução; `dist/` fica para regeneração do revisor.

**Critérios pendentes:** suíte de testes executada com sucesso; `tsc` verde no workspace; baseline sem regressão; declaração pública em `dist/index.d.ts` e conferência funcional do botão de modo pelo revisor.

**Escopo paralelo:** alterações pertencentes às plans 105 e 108 foram mantidas no workspace compartilhado e não foram corrigidas nem revertidas.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-10-10 — 🟢 Aprovado

**Validação isolada** (`HEAD` + os 6 arquivos da plan): 2 arquivos de teste, 27/27 verdes; `tsc` 0; `audit:baseline` igual. **Mutação:** os testes da plan contra o `HEAD` → os 6 novos falham (modo fixo do host sem escolha salva; `system` acompanhando o SO; o padrão não grava nem chama `onSave`; `widgets.fontSize/navigationStyle/language: false` tiram a preferência da barra e do menu). **Diff lido:** `withHostDefaultColorMode` só aplica o padrão sem `colorMode` salvo; a gravação passou a acontecer só por `updatePreferences` (flag `shouldPersistPreferencesRef`) — hidratação, carga remota e sincronização entre abas não gravam, o que segue "a lib não grava sem mudança" ([[09-temas-e-presets]] §4.4.2); as três chaves novas de `widgets` aplicadas como teto; o comentário de `chromeWidgets.ts` corrigido. A regressão `auditor_coverage.orfaos` 0 → 2 relatada na execução era do estado intermediário da árvore e não aparece na árvore final.

**Suíte completa, na árvore com as plans 105, 106 e 108 juntas:** `npx vitest run` → 438 arquivos e 2659 testes verdes (2026-10-10; uma primeira rodada teve 2 estouros de tempo em ganchos de testes que varrem o repositório, `kitGenerator` e `check-barrel-parity` — passaram sozinhos, e a repetição veio inteira verde). Na mesma árvore: `tsc` 0, `audit:baseline` igual ao baseline. `npm run build` oficial (rodado pelo revisor, com rede) e `npm run dev-kit`: `public-types:check`, `barrel:check`, `catalog:check`, `guide:check` e `dev-kit:check` em dia. `dist/index.d.ts` traz `defaultColorMode` e as chaves `fontSize`/`navigationStyle` de `widgets`.

**Critérios de aceite:** todos atendidos.
