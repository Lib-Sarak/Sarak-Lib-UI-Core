---
tipo: "plan"
titulo: "Fazer o tema aplicado voltar certo no recarregamento, sem piscar o cache velho"
objetivo: "Fazer o tema aplicado voltar no recarregamento com o id certo e sem piscar um tema antigo do cache local, com a falha de gravacao do importador visivel e o kit ensinando o escopo por organizacao"
dominio: "Provider / Persistência de tema"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "persistencia", "tema", "provider", "importador", "rc"]
relacionados: ["[[09-temas-e-presets]]", "[[03-superficie-publica]]", "[[12-kit-do-consumidor]]", "[[009-persistencia-tenant-aware]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md + arquitetura/03-superficie-publica.md + specs/12-kit-do-consumidor.md"
---

# 1. Objetivo

Depois de aplicar ou salvar um tema e recarregar — no mesmo navegador ou em outro —, o tema na tela, o tema marcado como ativo no painel
e o gravado no importador são o mesmo desde o primeiro quadro; e quando a porta do importador falha, o usuário vê a falha.

# 2. Contexto

Pergunta do dono (2026-10-22): onde e como os temas modificados são salvos e reaplicados. O caminho medido:

- **Lib.** O aplicado vai ao `localStorage` (`sarak-ui-design-v9.0`, com `::tenant:<id>`; `src/core/Provider/constants.ts`,
  `utils/resolveStorageKey.ts`) e à porta `persistence.onSave(design, activeThemeId)` (`hooks/useDesignManager.ts:104-122`). Boot:
  semente → `localStorage` por cima (`:86-97`) → `onLoad` fundido por cima, com o id (`hooks/useDesignRemoteLoader.ts:93-101`). Temas
  nomeados: `saveTheme` (`hooks/useThemeCollection.ts:75-91`) chama `theme.onSave` e só voltam pelo `customThemes` do consumidor.
  Rascunho do painel: só memória (o "Aplicar" persiste).
- **ERP.** Aplicado: `PUT /api/v1/hub/tema` → `hub_ui_applied_theme` (uma linha global). Criados: `PUT /api/v1/hub/temas/:id` →
  `hub_ui_created_themes`. No boot, o servidor injeta `{design, activeThemeId, temasCriados}` no HTML.
- **Lacunas da lib:**
  1. o id do tema ativo não vai ao `localStorage` (só o design, `useDesignManager.ts:110`): até o `onLoad` voltar — ou para sempre, se
     ele falhar —, o painel marca o tema padrão como ativo com o design do usuário na tela;
  2. o cache local vence o `config` que o host injeta (`useDesignManager.ts:90-93`), e o resultado do `onLoad` nunca é escrito de volta
     no cache (só edição do usuário grava, `:148-151`): depois que outro dispositivo troca o tema, cada recarga pinta o tema velho e
     troca — o piscar que a injeção existia para evitar;
  3. a porta de escrita do aplicado não tem contrato de falha observável pela lib (a do importador engole 403/500 e a lib registra
     sucesso e não tenta de novo, `useDesignManager.ts:117-118`).
- **Lacunas do ERP** (não são desta plan; vão para a sessão de revisor do ERP): `saveAppliedTheme` sem `response.ok`; o `activeThemeId`
  injetado não chega ao Provider; o aplicado é global.
- **Decisão do dono (2026-10-23):** o login ainda está sendo feito no ERP; depois dele, o tema aplicado é **por organização**. A lib já
  isola por `tenantId` ([[009-persistencia-tenant-aware]]); o kit precisa ensinar a ligar organização → `tenantId` → porta.
- **A `plan-119` mexia nas mesmas portas de tema** (`useThemeCollection.ts`, `docs/persistencia-de-tema.md`). O lote 7 dela fechou
  em 2026-10-23 e o que falta (o lote final, que depende dos importadores) só corre **depois** desta plan. Por isso esta plan não
  espera mais por ela (revisor, 2026-10-23).

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/hooks/useDesignManager.ts`, `useDesignRemoteLoader.ts`, `useThemeSeed.ts`, `useDesignSync.ts` — só o que os passos
  pedirem; o tipo das opções de persistência; `utils/resolveStorageKey.ts` se a forma do dado no cache mudar.
- O aviso de falha de gravação (toast já existente da lib) e o i18n dele.
- `docs/persistencia-de-tema.md`, `sarak-ui/GUIA-FRONTEND.md` (o caminho por organização), `docs/migracoes.md` (`## 8.0.0`) e o
  artefato de referência do formato persistido ([[13-instalacao-e-atualizacao]]).
- Testes; um caso em `browser-tests/` (harness `importador-temas` existente).

## 3.2 Fora
- O painel e o fluxo de salvar/duplicar/criar (`plan-119`).
- O ERP — nenhuma linha; as três lacunas dele vão como relatório para a sessão do ERP.
- A semântica de `strategy` (`local`/`hybrid`/`remote`) além do que os passos 1.2-1.3 descrevem.
- Specs fixas (síntese do revisor); versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/09-temas-e-presets.md` (§4.3, §4.4, §4.4.1, §4.4.2, §4.6, §4.7) | ordem do boot; `strategy`/`tenantId`; o par design + id; a lib não grava sem mudança; preferência |
| Spec fixa | `arquitetura/03-superficie-publica.md` (portas `onSave`/`onLoad`) | contrato público das portas |
| Spec fixa | `arquitetura/02-design-engine.md` (§3, §3.3) | `useThemeSeed`, `useDesignSync` |
| Spec fixa | `specs/12-kit-do-consumidor.md` · `specs/13-instalacao-e-atualizacao.md` | o que o kit ensina; o artefato do formato persistido |
| ADR | `adr/009-persistencia-tenant-aware.md` · `adr/011-tema-salvo-por-uma-porta-de-escrita.md` | isolamento por tenant; porta única de escrita |
| Plan aberta | `specs/plan/plan-119-kit-de-importacao-aprendido-nos-importadores.md` | o que ela já mudou nas portas de tema |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `ui-integra-consumidor` (o kit) | escrita, testes, kit |
| Código | os arquivos da §3.1 | ler antes de editar |

# 5. Instruções de execução

Um lote; resumo na §9 e status 🟠.

1. O cache local guarda o **par** design + id do tema ativo; no boot, o id do cache é usado até o `onLoad` responder (precedência de
   [[09-temas-e-presets]] §4.3 mantida: prop controlada > `onLoad` > cache > semente).
2. O resultado do `onLoad` que difere do cache é escrito de volta no cache (sem chamar `onSave` — hidratação não é edição).
3. Quando o host fornece o design do boot como fonte da verdade (o `config` injetado no HTML), ele vence o cache local no primeiro
   quadro; definir **como o host declara isso** sem quebrar quem hoje depende do cache vencendo (opção explícita, documentada; padrão de
   hoje preservado). O porquê vai no resumo.
4. A porta `onSave` pode sinalizar falha (rejeitar a promessa); a lib então mantém a alteração na tela, mostra o aviso localizado, não
   registra como gravado e tenta de novo na próxima mudança. O contrato e o exemplo copiável em `docs/persistencia-de-tema.md`.
5. O kit ensina o escopo por organização: `tenantId` = organização logada, porta do importador indexada pela organização, e o que
   acontece na troca de organização (já recarrega sem remontar).
6. **Primeiro quadro sem clarão** (medido em 2026-10-23: no celular, com o evento `load` já disparado, a página ainda é branca —
o `<html>` não tem fundo e o do `body` só chega com o JavaScript). A lib entrega ao host um meio de pintar o fundo do tema antes do
JavaScript (o mesmo dado que o host já injeta), documentado no kit; teste de navegador: o primeiro quadro tem o fundo do tema.
7. Testes de cada item; caso de navegador: com cache velho e `config`/`onLoad` novos, o primeiro quadro pinta o tema novo (no modo do
   passo 3) e o painel marca o id certo; com `onSave` rejeitando, o aviso aparece. Nota em `docs/migracoes.md`.

# 6. Critérios de aceite

- [ ] Recarregar mantém o id ativo certo no painel antes e depois do `onLoad`.
- [ ] O `onLoad` atualiza o cache; outro dispositivo trocando o tema não faz a próxima recarga piscar o velho (no modo do passo 3).
- [ ] `onSave` que rejeita gera aviso visível, não é registrado como gravado e é tentado de novo.
- [ ] Contrato, exemplo e caminho por organização no kit; nota de migração.
- [ ] Primeiro quadro com o fundo do tema, antes do JavaScript, no caminho que o kit ensina.
- [ ] Boot sem portas, `strategy: 'local'` e `'remote'` com o comportamento de hoje (testes existentes verdes).

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento do Provider, coberto por teste e caso de navegador.

- `npm run verify -- --tier=full`; vitest de `src/core/Provider`; `npm run build` + o caso novo em `browser-tests/`.
- `npm run guide:check` (o kit).
- `git diff --stat` → só a §3.1.
- Relatório ao ERP entregue pelo revisor ao dono (as três lacunas da §2), sem edição no ERP.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md + arquitetura/03-superficie-publica.md + specs/12-kit-do-consumidor.md`

- **`09` §4.4/§4.4.2:** o cache guarda o par; o `onLoad` atualiza o cache sem gravar na porta; como o host declara que o boot injetado
  vence o cache.
- **`03`:** `onSave` pode rejeitar, e o que a lib faz.
- **`12`:** o tema por organização (organização → `tenantId` → porta).

---

# 9. Resumo da execução

---

# 10. Veredito
