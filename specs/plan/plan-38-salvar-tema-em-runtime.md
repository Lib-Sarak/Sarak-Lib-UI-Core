---
tipo: "plan"
titulo: "Permitir que o usuário final salve temas criados, sem depender de deploy"
dominio: "Sarak-Lib-UI-Core / Design Engine / Painel / Persistência"
status: "⛔ Bloqueada"
prioridade: "Média"
tags: ["plan", "painel", "temas", "persistencia", "adr-010"]
relacionados: ["[[010-temas-salvos-pelo-usuario]]", "[[009-persistencia-tenant-aware]]", "[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "plan-34"
destino_sintese: "specs/specs/09-temas-e-presets.md · specs/specs/06-painel-de-customizacao-e-preview.md"
objetivo: "Um usuário final, sem acesso ao código do importador, cria um tema no painel, salva, e o tema aparece na lista a partir daí, sem redeploy — ⛔ PARADA em decisão do dono: o tipo `ThemePreset` que o ADR-010 manda reaproveitar tem `id` de união FECHADA e não cabe em tema autorado em runtime (ver §2.0)"
---

# 1. Objetivo

Um usuário final do sistema importador — sem acesso ao repositório — cria um tema no painel de customização,
clica em **Salvar**, e esse tema passa a aparecer na lista de temas disponíveis, sobrevivendo a reload, sem
que ninguém precise mexer em código ou fazer deploy.

# 2. Contexto

**Depende da `plan-34`** — reaproveita a chave tenant-aware que ela implementa; o backend do importador decide
o escopo (por tenant, por usuário, ou os dois) usando o mesmo mecanismo.

**Decisão já tomada em [[010-temas-salvos-pelo-usuario]]** — leia-a inteira antes de começar; ela é o
contrato que esta plan implementa, não uma sugestão.

O que a investigação já mediu, `arquivo:linha` — não refaça a leitura:

- `src/features/DesignEngine/Main/components/SaveThemeModal.tsx` — hoje é **só exportação**: título
  "Exportar Tema (JSON)", texto explícito (`:76-79`) *"a Sarak UI não tem backend próprio: 'salvar' um tema é
  baixar um arquivo JSON"*. Este fluxo **fica intocado**.
- `src/features/DesignEngine/Main/hooks/useThemePersistenceHandlers.ts:19-24,34-48` — `handleExportTheme` é o
  único handler de persistência hoje; chama `buildThemeExportPayload` + `downloadThemeJson`
  (`src/features/DesignEngine/Main/utils/exportTheme.ts`). Nenhuma chamada de rede.
- `src/features/DesignEngine/Library/ThemeList.tsx:47-65` — recebe `layouts` (temas embutidos) e
  `customThemes` (a prop de código) como duas listas separadas e as concatena (`allThemes`). **Não há
  terceira fonte.**
- O tipo `ThemePreset` (`src/core/Design/presets/themes/index.ts:48-53`) é o shape que **parecia** servir
  tanto para os temas embutidos quanto para o que `buildThemeExportPayload` produz. **Não serve** — ver a
  emenda §2.0.

## 2.0 🔴 EMENDA — 2026-08-12: o tipo do ADR-010 NÃO é implementável como escrito

Ao conferir esta plan contra o código **antes de liberá-la**, o revisor mediu o tipo que o
[[010-temas-salvos-pelo-usuario]] §2 manda reaproveitar. Ele **não cabe** num tema salvo em runtime:

```ts
export type ThemePresetId = (typeof THEME_PRESET_IDS)[number];   // união FECHADA dos 23 ids embarcados

export interface ThemePreset {
    id: ThemePresetId;        // ← 🔴 aqui
    name: string;
    description: string;      // ← obrigatório
    design: Record<string, unknown>;
    contraparte?: Partial<SarakDesignState>;
}
```

`src/core/Design/presets/themes/index.ts:46-53`.

**Um tema criado pelo usuário final tem `id` arbitrário** (`slugifyThemeId` de um nome livre) — e
`ThemePresetId` só aceita os 23 ids que a lib embarca. O ADR-010 diz *"reaproveita o tipo `ThemePreset` já
existente (`{ id, name, description, design }`)… nenhum tipo novo é criado"*, e **isso confunde SHAPE com
TIPO**: a [[09-temas-e-presets]] §2.1 item 4 afirma que *"o mesmo formato serve para os dois lados"* — e é
verdade sobre o **formato**. O ADR leu formato como tipo.

**A prova de que o código já sabia disso:** `buildThemeExportPayload` **não devolve `ThemePreset`** — devolve
`ThemeExportPayload` (`src/features/DesignEngine/Main/utils/exportTheme.ts:4-8`), que é
`{ id: string; name: string; design: SarakDesignState }`. O tipo separado existe **exatamente** porque o
`ThemePresetId` fechado não serve para tema autorado.

### ⚠️ E há uma segunda camada: R1, gate pleno

O shape certo (`ThemeExportPayload`) mora em **`src/features/DesignEngine/`**. As três portas novas moram em
**`src/core/Provider/types.ts`**. E **`src/core/` não importa `features/`** — é a **R1**, cobrada por
`auditor_arquitetura.mjs` ([[00-regras-e-invariantes]] R1). Tipar as portas com `ThemeExportPayload` como ele
está hoje **derruba o gate**.

### 🔴 A decisão é do DONO, não do executor — e a plan está PARADA nela

Três saídas, todas com custo. **Nenhuma é do executor**, porque todas mexem em contrato público e/ou num ADR
aceito:

| # | Saída | Custo |
|---|---|---|
| **A** | **Mover o shape para `core/`** — um tipo em `src/core/Design/presets/themes/` (ex.: `SavedTheme`, `{ id: string; name: string; description?: string; design }`), e `ThemeExportPayload` passa a ser um alias dele | Cria **um nome de tipo novo** no barril público (MINOR aditivo). Contraria a letra do ADR-010 (*"nenhum tipo novo"*), respeita o espírito (não inventa shape). Não quebra ninguém |
| **B** | **Abrir `ThemePresetId`** para `string` (ou `ThemePresetId \| (string & {})`) | Toca o tipo dos **23 temas embarcados** e afrouxa a checagem que hoje pega id de tema inventado em tempo de compilação. É **MAJOR**, e paga um preço em outro lugar para resolver aqui |
| **C** | **ADR novo (011)** que substitua o recorte de tipo do 010, mantendo o resto | O caminho mais correto pelo protocolo desta pasta (ADR é imutável; decisão nova = arquivo novo — [[adr/README]]). Custa um ADR e um ciclo |

**Recomendação do revisor: A + C.** A saída **A** é a mais barata e não quebra nada; e como ela contraria a
letra de um ADR aceito, o registro honesto é um **ADR-011** curto declarando o recorte corrigido —
exatamente o que o protocolo desta pasta prescreve para "a decisão mudou em uma conclusão". Foi assim que o
008 substituiu o 007 **numa única conclusão**, mantendo o resto do 007 vigente.

> ⚠️ **Por que isto não é detalhe de implementação que o executor resolve:** ele teria de escolher entre
> **quebrar a R1** (gate pleno, reprova sozinho), **quebrar o tipo público dos 23 temas** (MAJOR silencioso)
> ou **contrariar o ADR** que o próprio prompt de execução manda não reabrir. Qualquer uma das três é
> decisão de contrato — e a plan que empurra decisão de contrato para o executor é a plan que está errada.

**Enquanto esta decisão não for tomada, a `plan-38` NÃO deve ser liberada para execução.** As plans 34–37
não dependem dela e seguem normalmente.

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/types.ts` — adicionar `onSaveTheme`, `onLoadThemes`, `onDeleteTheme` a
  `options.persistence`, exatamente como definidos em [[010-temas-salvos-pelo-usuario]] §2.
- `src/features/DesignEngine/Main/components/SaveThemeModal.tsx` — ganha a ação **Salvar**, ao lado de
  "Exportar JSON" (dois caminhos no mesmo modal, ou uma variante nova — a critério do executor, documentando
  a escolha). "Salvar" só aparece/fica habilitada quando `onSaveTheme` está configurado.
- `src/features/DesignEngine/Main/hooks/useThemePersistenceHandlers.ts` — `handleSaveTheme` novo, chamando
  `onSaveTheme` com um `ThemePreset` montado a partir do rascunho atual (reaproveitar
  `buildThemeExportPayload`/`resolveCompleteDesign` para garantir que o tema salvo também nasce **completo**,
  igual ao export — [[09-temas-e-presets]] §4.5).
- Hook novo (nome a critério do executor, ex. `useSavedThemes`) que busca a lista via `onLoadThemes` — ao
  montar o painel ou ao abrir o seletor de temas, a critério do executor — com estado de carregamento e de
  erro; erro **degrada silenciosamente** (a lista de temas salvos fica vazia, com aviso discreto), nunca
  quebra o painel.
- `src/features/DesignEngine/Library/ThemeList.tsx` (e/ou `Canvas/components/PresetsCatalog.tsx`, o que for
  a fronteira real de onde a lista é montada) — ganha uma terceira seção ("Meus Temas" ou nome equivalente)
  com o resultado de `onLoadThemes`, e uma ação de apagar (com confirmação) chamando `onDeleteTheme`.
- **Cada tema vindo de `onLoadThemes` passa por `validateDesign`/`auditTokenContract` antes de ser
  oferecido como aplicável** — é dado não-confiável, mesma fronteira de [[10-seguranca-e-acessibilidade]]
  §2.1. Não é um caminho novo de aplicação de tema; é o caminho normal, alimentado por uma fonte nova.
- Testes ao lado de cada arquivo tocado (R8): `handleSaveTheme` chama `onSaveTheme` com o payload certo;
  sem a porta configurada, "Salvar" não aparece/fica desabilitada; apagar chama `onDeleteTheme` e remove da
  lista local; erro em `onLoadThemes` não derruba o painel; tema recebido de `onLoadThemes` com chave/valor
  fora do contrato é descartado com warn, igual a qualquer outro tema de origem externa.

## 3.2 Fora
- ⛔ **Editar ou renomear** um tema já salvo — fora deste corte, por decisão do ADR-010 §2.
- ⛔ **Qualquer backend embarcado na lib.** Zero endpoint, zero `fetch` da lib para servidor próprio. As três
  portas são sempre chamadas pelo consumidor.
- ⛔ Mudar o fluxo de "Exportar JSON" existente — continua intocado, é o caminho do desenvolvedor.
- ⛔ Layout/CSS do painel (`plan-35`), performance do rascunho (`plan-36`), modo essencial (`plan-37`) — não
  misture escopos, mesmo que os arquivos se cruzem.
- ⛔ Decidir **quem pode ver quais temas salvos** (permissão, compartilhamento entre usuários do mesmo
  tenant) — é decisão do backend do importador; a lib só lista o que `onLoadThemes` devolver, sem opinião.
- ⛔ `src/core/Provider/hooks/useDesignManager.ts` e os demais arquivos que a `plan-34` já toca — esta plan
  não mexe na persistência do **design ativo**, só na coleção de **temas salvos**.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| ADR | `specs/adr/010-temas-salvos-pelo-usuario.md` | o contrato exato que esta plan implementa |
| ADR | `specs/adr/009-persistencia-tenant-aware.md` | a chave tenant-aware que o backend do importador reaproveita |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §2 · §4.5 | o shape `ThemePreset` e a regra "tema exportado nasce completo" |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §2.1 | a fronteira `validateDesign` — tema de `onLoadThemes` é dado hostil, como qualquer outro |
| Spec fixa | `specs/specs/00-regras-e-invariantes.md` R6 · R8 | contrato de valor; teste ao lado |
| **Skill** | `padrao-escrita` · `padrao-typescript` | sempre |
| **Skill** | `test-unitario` | todo conserto muda comportamento e leva teste |
| Código | `SaveThemeModal.tsx`, `useThemePersistenceHandlers.ts`, `ThemeList.tsx`, `exportTheme.ts` | ler antes de editar |

# 5. Instruções de execução

0. **Confirme que a decisão de tipo da emenda §2.0 está escrita nesta plan.** Se não estiver, **pare** — o
   passo 1 é impossível de fazer certo sem ela.
1. **Estender o tipo** (`types.ts`) com as três portas de [[010-temas-salvos-pelo-usuario]] §2, **usando o
   tipo que a §2.0 fixar** — não `ThemePreset`, que tem `id` de união fechada e não cabe em tema autorado em
   runtime. **Pronto quando** o tipo compila, `npm run audit` segue no baseline (**a R1 não pode acender**) e
   o JSDoc de cada porta explica o contrato (o que recebe, o que devolve, quando é chamada).
2. **`handleSaveTheme`** em `useThemePersistenceHandlers.ts` — monta o `ThemePreset` completo (reaproveitando
   `buildThemeExportPayload`/`resolveCompleteDesign`) e chama `onSaveTheme`. Tratar erro com o mesmo padrão
   de `handleExportTheme` (`showToast('warning', ...)`).
3. **UI do botão "Salvar"** em `SaveThemeModal.tsx` — visível/habilitado só quando `onSaveTheme` existe.
   Documentar a escolha de UI no resumo (modal único com duas ações, ou variante nova).
4. **`useSavedThemes`** — busca `onLoadThemes()` (assíncrono), guarda `{ themes, isLoading, error }`. Erro
   não propaga exceção — vira lista vazia + estado de erro consumível pela UI.
5. **Validar cada tema recebido** antes de oferecê-lo como selecionável — mesma fronteira que já protege
   `localStorage`/arquivo. **Pronto quando** um teste prova que um tema de `onLoadThemes` com chave inválida
   é descartado com warn, sem quebrar a lista dos demais.
6. **Seção "Meus Temas" em `ThemeList.tsx`** — junta `layouts` + `customThemes` + os temas de
   `useSavedThemes`, cada fonte visualmente distinguível (a lib já distingue "Advanced"/"Base" hoje — seguir
   o mesmo padrão de seção, não inventar um novo).
7. **Apagar** — ação com confirmação, chama `onDeleteTheme(id)`, remove da lista local em caso de sucesso;
   erro mantém o tema na lista e avisa.
8. **Fechar.** Rodar, nesta ordem, e colar a saída real no resumo: `npx vitest run` (INTEIRA) ·
   `node gates/scripts/audit/run_audit.mjs` ·
   `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` · `npx tsc --noEmit` · `git diff --stat`.

# 6. Prompt de execução

> 🔴 **NÃO EMITA ESTE PROMPT AINDA.** A emenda §2.0 (2026-08-12) parou esta plan numa decisão de contrato
> que é do dono: qual tipo as três portas usam. O prompt abaixo será completado com a saída escolhida
> **antes** de a plan ser liberada. Emiti-lo como está manda o executor escolher entre quebrar a R1, quebrar
> o tipo público dos 23 temas, ou contrariar o ADR-010.

```
Leia specs/00-prompt-executor.md e execute specs/plan/plan-38-salvar-tema-em-runtime.md.

Pré-requisito 1: a plan-34 tem de estar 🟢 Aprovada (reaproveita a chave tenant-aware).
Pré-requisito 2: a decisão de tipo da emenda §2.0 tem de estar tomada e escrita na plan.
                 LEIA A §2.0 ANTES DA §3 — o ADR-010 cita um tipo que não cabe.

Contexto obrigatório antes de começar: specs/00-contexto.md, specs/00-knowledge.md,
specs/adr/010-temas-salvos-pelo-usuario.md (O CONTRATO — não o reabra),
specs/adr/009-persistencia-tenant-aware.md, specs/specs/09-temas-e-presets.md §2 e §4.5,
specs/specs/10-seguranca-e-acessibilidade.md §2.1 (tema de origem externa é dado hostil),
specs/specs/00-regras-e-invariantes.md R6 e R8.
Skills a aplicar: padrao-escrita, padrao-typescript, test-unitario.

O CONTRATO JÁ FOI DECIDIDO no ADR-010: onSaveTheme, onLoadThemes, onDeleteTheme,
reaproveitando o tipo ThemePreset que já existe. CRUD é só criar+listar+apagar — SEM
editar/renomear, é decisão explícita do ADR, não esquecimento.

Todo tema recebido de onLoadThemes é DADO NÃO-CONFIÁVEL — passa por validateDesign antes
de ser oferecido como aplicável, exatamente como um tema de localStorage ou arquivo.

LINHAS VERMELHAS:
  · Você NÃO cria backend, endpoint, fetch para servidor da lib. As três portas são
    sempre chamadas pelo CONSUMIDOR.
  · Você NÃO implementa editar/renomear tema salvo.
  · Você NÃO mexe no fluxo de "Exportar JSON" existente — continua intocado.
  · Você NÃO mexe em src/core/Provider/hooks/useDesignManager.ts nem nos arquivos da
    plan-34 — esta plan é sobre a COLEÇÃO de temas salvos, não o design ativo.
  · Você NÃO decide permissão/compartilhamento entre usuários — isso é do backend do
    importador.

Todo conserto leva teste ao lado (R8), incluindo o teste de validação de tema recebido
de onLoadThemes com dado fora do contrato.

Não commite. Ao terminar, escreva o resumo na própria plan e mova o status para
🟠 Em revisão.
```

# 7. Critérios de aceite

- [ ] `onSaveTheme`, `onLoadThemes`, `onDeleteTheme` existem no tipo, com JSDoc explicando o contrato.
- [ ] "Salvar" só aparece/fica habilitada quando `onSaveTheme` está configurado; sem a porta, nada muda em
      relação ao painel de hoje.
- [ ] Tema salvo é **completo** (mesma regra do export — `resolveCompleteDesign`), não um subconjunto do
      rascunho.
- [ ] Tema recebido de `onLoadThemes` passa por `validateDesign`/`auditTokenContract` antes de ser oferecido
      como selecionável — evidência: teste com payload fora do contrato sendo descartado com warn.
- [ ] Erro em `onLoadThemes` não quebra o painel — lista vazia + estado de erro, nunca exceção não tratada.
- [ ] `ThemeList` (ou onde a fronteira real estiver) mostra os temas salvos numa seção própria, ao lado de
      `layouts`/`customThemes`.
- [ ] Apagar chama `onDeleteTheme`, remove da lista em sucesso, mantém e avisa em erro.
- [ ] "Exportar JSON" continua funcionando exatamente como antes — nenhum teste existente dele mudou de
      expectativa.
- [ ] `npx vitest run` inteira, verde, não encolheu.
- [ ] `run_audit` sem regressão; `npx tsc --noEmit` → 0 erros.
- [ ] `git diff --stat` — só os arquivos de §3.1 (mais os testes correspondentes).

# 8. Como verificar (uso do revisor)

```bash
git diff --stat
git diff
grep -n "onSaveTheme\|onLoadThemes\|onDeleteTheme" src/core/Provider/types.ts
npx vitest run
node gates/scripts/audit/run_audit.mjs
node gates/scripts/release/check-audit-baseline.mjs --with-tsc
npx tsc --noEmit
```

**O que reprova, além do óbvio:**
- tema de `onLoadThemes` sendo aplicado/listado **sem** passar por `validateDesign` — é a mesma classe de
  furo que [[10-seguranca-e-acessibilidade]] existe para fechar, só que numa fonte nova;
- "Exportar JSON" alterado de qualquer forma não pedida;
- editar/renomear tema salvo implementado "já que estava mexendo ali" — é scope creep explícito contra o
  ADR-010.

# 9. Destino da síntese

**Destino:** `specs/specs/09-temas-e-presets.md` · `specs/specs/06-painel-de-customizacao-e-preview.md`

**Texto pronto para transporte:**

- `09-temas-e-presets.md` §4 (Ciclo de vida) ganha uma sexta fase — **Salvar em runtime** — ao lado de
  Criar/Validar/Aplicar/Persistir/Exportar, com as três portas e o corte de CRUD.
- `06-painel-de-customizacao-e-preview.md` ganha, na seção que documenta `SaveThemeModal`/`ThemeList`, a
  distinção entre as duas ações ("Exportar" para dev, "Salvar" para usuário final) e a proveniência da lista
  de "Meus Temas".

---

# 10. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only. -->

---

# 11. Veredito

<!-- Preenchido pelo REVISOR. Append-only. -->
