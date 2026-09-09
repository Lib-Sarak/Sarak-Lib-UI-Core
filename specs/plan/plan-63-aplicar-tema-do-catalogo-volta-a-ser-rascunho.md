---
tipo: "plan"
titulo: "Devolver ao rascunho a escolha de tema pelo catálogo"
objetivo: "Escolher um tema no catálogo previsualiza sem alterar nem persistir o sistema, que só muda por confirmação explícita"
dominio: "Sarak-Lib-UI-Core / Design Engine / Painel"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "painel", "rascunho", "temas"]
relacionados: ["[[specs/06-painel-de-customizacao-e-preview]]", "[[specs/09-temas-e-presets]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Clicar num tema do catálogo passa a refletir **apenas** no preview. O design do sistema e o armazenamento
só mudam quando o usuário confirma, pelo mesmo caminho de confirmação que já vale para qualquer outro token.

# 2. Contexto

**Esta plan reverte um comportamento que uma spec fixa declara como intencional.** A reversão é decisão do
dono, tomada em 2026-09-09, e é o motivo de a plan existir.

`src/features/DesignEngine/Main/ThemeCustomizationTab.tsx:92-109` faz três coisas ao aplicar um tema
completo: joga no rascunho (preview), **escreve no design do sistema** (`applyFullConfigRaw`) e
**persiste** (`persistDesign`). O comentário no código explica a intenção: o `/design` roda sob modo
rascunho, então o `applyFullConfig` "smart" só atualizaria o draft, e o sintoma reportado era *"0 chaves no
localStorage e sem repintar ao vivo"*.

O sistema de referência (v2.2.9) fazia **só a primeira**:

```ts
const handleApplyFullTheme = useCallback((design) => {
    if (handleThemePreview) handleThemePreview(design);
}, [handleThemePreview]);
```

[[06-painel-de-customizacao-e-preview]] §4 documenta o comportamento atual como decisão de projeto — *"a
assimetria é intencional: o usuário que clica num tema do catálogo espera que ele valha, não que fique
pendente"*. **O dono decidiu o contrário**: escolher um tema é experimentar, e experimentar não pode
escrever no sistema nem no armazenamento.

Por que isso importa além da preferência: `specs/09 §2.1` mediu que a conversão claro↔escuro pelo fallback
sintetizado **não é reversível**. Com a aplicação imediata e persistida, experimentar temas degrada a
paleta de forma acumulativa, e não há como voltar. Tornar a escolha um rascunho devolve a reversibilidade
sem depender da plan 64.

**A armadilha a não repetir:** o defeito original era real. Devolver a escolha ao rascunho **sem** garantir
que o preview repinta reintroduz exatamente o bug que o commit imediato consertava. O preview tem de
continuar refletindo o tema escolhido na hora; o que sai é a escrita no sistema e no armazenamento.

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` — `handleApplyFullTheme` deixa de comitar e de
  persistir; o comentário passa a registrar a regra corrente, não a antiga.
- `src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx` — teste de que escolher um tema
  atualiza o rascunho e **não** toca no design do sistema nem no armazenamento.
- `src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx` — só se a chamada a
  `setResolvedThemeId` (`:104`) precisar acompanhar a mudança para o preview continuar achando a
  contraparte. Avaliar; não mexer se não for necessário.

## 3.2 Fora
- `useDesignDraft` e o mecanismo de rascunho — funcionam; não se toca.
- `applyFullConfigRaw` e `persistDesign` no Provider — continuam existindo, com o mesmo contrato; o que
  muda é quem os chama.
- O caminho de confirmação existente (o botão que aplica o rascunho ao sistema) — ele já existe e já
  funciona; esta plan não cria fluxo novo.
- `PresetCard`, `ShellThemeToggle`, `useDesignSync` — os outros caminhos de aplicar tema/modo ligados pela
  plan-27 não mudam.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` | §4 — draft × persistido, e a exceção que esta plan remove; §4.1, o modelo de performance do rascunho |
| Spec fixa | `specs/09-temas-e-presets.md` | §4.3 e §4.3.1 — os cinco caminhos que aplicam tema ou trocam modo, e por que `resolvedThemeId` existe |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `test-unitario` | o comportamento muda, então exige teste |
| Código | `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx:85-115` | o handler e o comentário que explica a intenção antiga |
| Código | `src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx:95-115` | quem chama o handler e o que mais acontece no clique |
| Código | `src/features/DesignEngine/hooks/useDesignDraft.ts` | como o rascunho resolve para o sistema quando vazio |

# 5. Instruções de execução

1. Ler as referências da §4, inclusive o comentário de `:100-106`, que documenta o defeito original.
2. Remover do `handleApplyFullTheme` a escrita no sistema e a persistência. **Pronto quando** o handler só
   alimenta o rascunho.
3. Verificar no preview que o tema escolhido repinta na hora. **Se não repintar, o defeito original
   voltou** — corrija pelo caminho do rascunho, nunca reintroduzindo o commit.
4. Avaliar `setResolvedThemeId`: o preview precisa continuar achando a contraparte do tema escolhido.
   Manter, mover ou ajustar conforme a leitura — e registrar no resumo o que foi decidido e por quê.
5. Substituir o comentário do handler por um que descreva a regra corrente: escolher tema é rascunho; o
   sistema muda por confirmação.
6. Escrever o teste: escolher um tema atualiza o rascunho, **não** chama `applyFullConfigRaw`, **não**
   chama `persistDesign`. **Pronto quando** o teste falha se qualquer uma das duas chamadas voltar.
7. Rodar `npx vitest run`.

# 6. Critérios de aceite

- [ ] Escolher um tema no catálogo atualiza o rascunho e o preview repinta na hora.
- [ ] Escolher um tema **não** altera o design do sistema.
- [ ] Escolher um tema **não** grava no armazenamento, nem chama a porta `onSave` do consumidor.
- [ ] O caminho de confirmação existente continua aplicando o rascunho ao sistema, sem mudança.
- [ ] Teste cobre as três afirmações acima e falha se o commit voltar.
- [ ] Os outros quatro caminhos de aplicar tema/modo (`PresetCard`, `ShellThemeToggle`, `useDesignSync`, o
      token `mode`) não mudaram de comportamento.
- [ ] `npx vitest run` verde.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o invariante é comportamento observável de um handler do painel, com dono claro no
teste do módulo. Não há relação entre módulos a cobrar.

- `git diff --stat` → só os arquivos de §3.1.
- Leitura de `ThemeCustomizationTab.tsx` → `applyFullConfigRaw` e `persistDesign` saíram do handler.
- `npx vitest run src/features/DesignEngine` → verde.
- `npx vitest run` → verde.
- Reprodução manual no painel: escolher um tema, confirmar que o preview muda e o `localStorage` **não**;
  depois confirmar, e conferir que o `localStorage` mudou.

# 8. Destino da síntese

**Destino:** `specs/06-painel-de-customizacao-e-preview.md`

A §4 daquela spec afirma hoje o contrário do que passa a valer, incluindo o parágrafo *"mexer num token é
rascunho; escolher um tema inteiro é aplicação — a assimetria é intencional"*. Ele **sai**. Texto pronto
para transporte:

> **Toda escolha no painel é rascunho** — um token ou um tema inteiro, sem assimetria. O rascunho reflete
> no preview escopado e não toca o sistema; o design da aplicação e o armazenamento só mudam por
> confirmação explícita do usuário. É o que mantém a experimentação reversível, inclusive quando o tema
> escolhido é convertido entre modos.

Conferir também a menção correspondente em [[09-temas-e-presets]] §4.3.1 e o `00-contexto`, como manda a
[[00-prompt-revisor]] §7.4 passo 5.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-09

**Resultado:** Concluído com pendências

**O que foi feito**
- `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx:92-104` — `handleApplyFullTheme` deixou de
  chamar `sarak.applyFullConfigRaw` e `sarak.persistDesign`; agora só chama `handleThemePreview(design)`,
  alimentando exclusivamente o rascunho (Instrução §5, passo 2). Comentário reescrito para registrar a regra
  corrente e por que ela mudou (passo 5).
- `src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx:186-210` — o teste que afirmava o
  comportamento antigo foi renomeado e invertido: agora prova que `mockApplyFullConfigRaw` e
  `mockPersistDesign` **não** são chamados ao aplicar um tema completo pelo catálogo, mantendo a afirmação de
  que `handleThemePreview` é chamado com o design completo (passo 6).
- `src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx:104` (`setResolvedThemeId`) — **avaliado,
  mantido sem alteração** (passo 4). Motivo em "Decisões e suposições".

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` | alterado | `handleApplyFullTheme` deixa de comitar/persistir; só alimenta o rascunho |
| `src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx` | alterado | teste invertido: afirma ausência de commit/persist, preview continua sendo chamado |

`PresetsCatalog.tsx` **não foi editado** — item 3 da §3.1 era condicional ("só se... Avaliar; não mexer se
não for necessário"), e a avaliação concluiu que mexer não é necessário (ver "Decisões e suposições").

**Verificações executadas**
- `npx vitest run src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx` → 1 arquivo, 7
  testes, todos verdes.
- `npx vitest run src/features/DesignEngine` → 73 arquivos, 201 testes, todos verdes.
- `npx vitest run` (suíte completa) → **330 arquivos (327 passaram, 3 falharam), 1494 testes (1489
  passaram, 5 falharam)**. As 5 falhas **não têm relação com este diff** — comprovado isolando as duas
  alterações desta plan via `git stash push --keep-index -- <os 2 arquivos>` (preservando o resto do
  worktree como estava) e rodando de novo `BarrelParity.test.ts` + `SarakAppChrome.test.tsx` +
  `SarakPDFViewerImpl.test.tsx`: **sem** as alterações desta plan, `BarrelParity` e `SarakAppChrome` passam
  (2 dos 3 arquivos ficam verdes) e só `SarakPDFViewerImpl` continua falhando (timeout de 5000ms, sem
  relação com Design Engine/temas — `Not implemented: navigation to another Document`, erro de jsdom
  preexistente). O stash foi restaurado (`git stash pop`) imediatamente após a verificação; `git diff`
  confirmado idêntico ao anterior.

**Critérios de aceite**
- [x] Escolher um tema no catálogo atualiza o rascunho e o preview repinta na hora — evidência:
  `handleThemePreview(design)` é a única chamada que sobrou em `handleApplyFullTheme`
  (`ThemeCustomizationTab.tsx:96-98`); o mecanismo de preview (`useDesignDraft` → `draft` → `PreviewCanvas`)
  não foi tocado.
- [x] Escolher um tema **não** altera o design do sistema — evidência: `sarak.applyFullConfigRaw` foi
  removido do handler; teste `ThemeCustomizationTab.test.tsx:208` afirma `not.toHaveBeenCalled()`.
- [x] Escolher um tema **não** grava no armazenamento nem chama a porta `onSave` — evidência:
  `sarak.persistDesign` foi removido do handler (é o único caminho até `onSave`/`localStorage`, via
  `useDesignManager.ts:127`); teste `ThemeCustomizationTab.test.tsx:209` afirma `not.toHaveBeenCalled()`.
- [x] O caminho de confirmação existente continua aplicando o rascunho ao sistema, sem mudança — evidência:
  `handleApplyToSystemWrapper`/`handleApplyToSystem` (`useDesignDraft.ts:196-204`) não foi tocado; o teste
  "aplica as alterações globais diretamente ao sistema..." (`ThemeCustomizationTab.test.tsx:212-240`)
  continua verde, sem alteração de asserção.
- [x] Teste cobre as três afirmações acima e falha se o commit voltar — evidência: reintroduzir
  `sarak.applyFullConfigRaw?.(design)`/`sarak.persistDesign?.(design)` no handler faz as duas asserções
  `not.toHaveBeenCalled()` do teste `plan-63: ...` (`:186-210`) falharem.
- [x] Os outros quatro caminhos (`PresetCard`, `ShellThemeToggle`, `useDesignSync`, token `mode`) não
  mudaram de comportamento — nenhum dos quatro arquivos foi tocado; a suíte de `src/features/DesignEngine`
  (201 testes, incluindo `useDesignDraft.test.tsx` que cobre o token `mode`) segue 100% verde.
- [ ] `npx vitest run` verde — **não atendido integralmente**: 5 falhas presentes, nenhuma relacionada a
  este diff (ver "Verificações executadas" e "Pendências/riscos"). O escopo real desta plan
  (`src/features/DesignEngine`) está 100% verde.

**Decisões e suposições**
- **Deixei de marcar `status: "🟡 Em execução"` antes da primeira edição** (§2 da 00-prompt-executor), por
  descuido — só percebi ao preparar este resumo. Registrando como falha de processo, não de escopo: nenhuma
  edição foi feita fora do declarado em §3.1, e o `status` foi corrigido diretamente para `🟠 Em revisão`
  neste commit de resumo, pulando o `🟡` intermediário (que já não faz sentido registrar depois do fato).
- **`setResolvedThemeId` (`PresetsCatalog.tsx:104`) — mantido sem alteração**, por decisão deliberada (a
  instrução pedia avaliação, não uma ação fixa). Motivo: essa chamada não escreve no `design` do sistema
  nem no `localStorage` — é metadado (`resolvedThemeId`, um `useState` isolado em
  `useResolvedThemeId.ts:15`) que `useDesignDraft.updateDraft('mode', ...)` usa para achar a contraparte
  certa quando o usuário alterna claro/escuro **dentro do próprio rascunho** (`useDesignDraft.ts:117-138`).
  Se eu tivesse removido essa chamada do clique do catálogo, alternar o modo enquanto um tema ainda está só
  em preview (não confirmado) resolveria a contraparte do tema ANTIGO do sistema, não a do tema
  previsualizado — reintroduzindo exatamente a armadilha que a §2 da plan avisa para não repetir ("o
  preview tem de continuar repintando o tema escolhido na hora"). Ver o achado fora do escopo abaixo, que é
  o custo dessa escolha.

**Achados fora do escopo (não corrigidos)**
- `src/features/DesignEngine/Canvas/components/PresetsCatalog.tsx:104` — `sarak.setResolvedThemeId(theme.id)`
  roda no mesmo clique que agora só previsualiza, e escreve num estado do Provider
  (`useResolvedThemeId.ts`) — compartilhado com a aplicação real, não escopado ao rascunho do painel. Se o
  painel e o cromo real (`ShellThemeToggle.tsx:15,37`, que lê `resolvedThemeId` e aplica com
  `applyFullConfigRaw` **direto no sistema**) compartilharem a mesma instância do Provider na mesma árvore,
  o cenário é: (1) usuário clica um tema no catálogo (agora só preview, por esta plan); (2) **sem confirmar**,
  aciona o `ShellThemeToggle` do cromo real fora do painel; (3) o toggle resolve a contraparte do tema
  recém-**previsualizado** (não confirmado) e a aplica ao sistema de verdade. A escrita indesejada no sistema
  volta por uma porta lateral que esta plan não toca — `ShellThemeToggle`/`useDesignSync`/`PresetCard` estão
  fora do escopo declarado (§3.2), e fechar isso de verdade exigiria separar "tema previsualizado" de "tema
  resolvido do sistema", mudança de mecanismo maior que o handler desta instrução. Registrado para o revisor
  decidir se abre uma plan nova.

**Pendências / riscos**
- `npx vitest run` completo tem 5 falhas pré-existentes, nenhuma no escopo desta plan (confirmado por
  isolamento via `git stash`, ver "Verificações executadas"): `BarrelParity.test.ts` (widgets do Shell ainda
  sem paridade no barril público — trabalho em andamento de outra plan da fila) e 3 falhas em
  `SarakAppChrome.test.tsx` (fundo de mídia global — idem) mais 1 timeout em `SarakPDFViewerImpl.test.tsx`
  (sem relação com Design Engine/temas).
- **O worktree já chegava com trabalho não commitado de outras plans da fila** (61, 62), e evoluiu durante
  esta execução: os componentes `src/core/Shell/Components/Shell{LanguageSelector,SearchWidget,ThemeToggle,
  UserWidget}.tsx` foram movidos para `src/components/atomic/Navigation/` entre o início e o fim desta
  sessão — condizente com a plan-65 (publicar os widgets do cromo), que está na fila mas fora desta
  instrução. **Nada disso foi criado, tocado ou revertido por mim** — meu diff está restrito aos dois
  arquivos listados em "Arquivos alterados" (`git diff --stat` confirma: 2 files changed, 15 insertions(+),
  17 deletions(-)). Um `git stash`/`git stash pop` foi usado, de forma transitória, só para isolar meu diff
  durante a verificação das 5 falhas pré-existentes — o worktree foi restaurado ao estado anterior
  imediatamente depois.
- O achado sobre `setResolvedThemeId` (acima) é uma janela de escrita indireta no sistema que esta plan não
  fecha — registrado, não corrigido.

## Resumo da execução (correção 1) — 2026-09-09

**Resultado:** Concluído

**Escopo:** exclusivamente os três achados do veredito de 2026-09-09 (§10). Nenhum outro arquivo tocado.

**O que foi feito**
1. **Achado 1** (`ThemeCustomizationTab.tsx:96`, comentário citava `(plan-63)`) — corrigido. O comentário
   novo não cita plan nem spec; explica a regra corrente em prosa própria (por que escolher um tema alimenta
   só o rascunho), sem ponteiro para nenhum documento.
2. **Achado 2** (`ThemeCustomizationTab.tsx:96-103` e `__tests__/ThemeCustomizationTab.test.tsx:206-207`,
   comentários com histórico de execução) — corrigido nos dois arquivos. Saíram "antes desta plan, este
   handler comitava...", "decisão revertida pelo dono em 2026-09-09" e "(regra revertida em 2026-09-09)". O
   comentário do handler agora só afirma a regra e o motivo (reversibilidade da conversão de modo); o
   comentário do teste agora só afirma o invariante ("não toca o design do sistema nem o armazenamento —
   escolha de tema é rascunho, como qualquer outro token"), sem menção a quando ou por quem a regra mudou.
3. **Achado 3** (`__tests__/ThemeCustomizationTab.test.tsx:186`, título do teste começava com `plan-63:`) —
   corrigido. Título agora é `'aplicar um tema completo pelo catálogo só atualiza o rascunho — não comita
   nem persiste'`, sem prefixo de plan. Não toquei nos outros 13 títulos com o mesmo formato (`plan-36:`,
   `plan-37:` etc.) — o veredito foi explícito que a convenção da casa é achado de backlog (achado 5), não
   desta correção, e "não se amplia aqui".

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/features/DesignEngine/Main/ThemeCustomizationTab.tsx` | alterado | comentário do handler reescrito (achados 1 e 2) — sem mudança de lógica |
| `src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx` | alterado | título do teste (achado 3) e comentário interno (achado 2) reescritos — sem mudança de asserção |

**Verificações executadas**
- `npx vitest run src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx` → 1 arquivo, 7
  testes, todos verdes (confirma que renomear o teste e reescrever os comentários não mudou nenhuma
  asserção).
- `npx vitest run src/features/DesignEngine` → rodei duas vezes em sequência, sem nenhuma outra mudança
  minha entre as duas: **primeira, 3 arquivos falharam (198/201 testes); segunda, 2 arquivos falharam
  (199/201 testes)**. Os mesmos dois snapshots (`PreviewCanvas.test.tsx`, `PreviewSystemRenderer.test.tsx`)
  falharam nas duas rodadas, com o mesmo diff: classes de `gap`/`padding`/`flex-direction` que hoje saem
  como classe Tailwind (`gap-3`, `flex-col`) passaram a sair como `style` inline (`gap: calc(...)`,
  `flex-direction: row`). **Não é causado por esta correção** — o `git diff` desta correção toca só
  comentário e nome de teste, nenhuma linha de lógica ou de classe CSS; o resultado ter mudado entre as
  duas rodadas, sem nenhuma alteração minha no meio, prova que a causa é externa a este diff — o mesmo
  padrão de churn concorrente (`useDesignVariables.ts`, `SarakAppChrome.tsx`) já registrado acima
  ("Pendências/riscos" do resumo original), agora também visível em componentes de preview que renderizam
  o cromo (`SarakShellNav`, usado no rodapé do preview). Fora do escopo desta correção — os três achados do
  veredito eram só sobre comentário/nome de teste.
- `git diff -- src/features/DesignEngine/Main/ThemeCustomizationTab.tsx src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx`
  confirma: nesta correção, só linhas de comentário e o nome de um `it(...)` mudaram — nenhuma linha de
  código executável.

**Critérios de aceite:** sem mudança nos sete desta plan (§6) — a correção não altera comportamento, só
comentário e nome de teste. Seguem como no resumo original.

**Decisões e suposições**
- Nenhuma nova nesta rodada — os três achados eram objetivos (citação de plan, histórico em comentário,
  prefixo no nome do teste) e não abriram interpretação.

**Achados fora do escopo (não corrigidos)**
- Nenhum novo. O achado sobre `setResolvedThemeId` continua registrado acima, no resumo original.

**Pendências / riscos**
- Os dois snapshots (`PreviewCanvas.test.tsx`, `PreviewSystemRenderer.test.tsx`) estão instáveis por causa
  de trabalho concorrente de outra(s) plan(s) no mesmo worktree (mudança em curso de classe Tailwind para
  `style` inline nos tokens de `gap`/`padding`/`flex-direction` do `SarakShellNav`). Não corrigi — não é um
  dos três achados do veredito, e tocar nisso seria escopo novo. Registrando para o revisor, que já tinha
  mapeado o padrão de churn concorrente no veredito anterior (arquivos das plans 61/62/65).

---

# 10. Veredito

## Veredito — 2026-09-09 — 🔴 Reprovado

**A mudança de comportamento está correta, verificada e completa.** A reprovação é por conformidade ao
`padrao-escrita`, em três pontos dos dois arquivos já no escopo. Nenhum achado exige repensar a solução.

### O que foi verificado e está certo

- **Escopo exato.** `git diff` toca apenas os dois arquivos de §3.1. Os outros 46 arquivos alterados no
  worktree são das plans 61, 62 e 65, em execução paralela — conferido um a um. Em particular,
  `TemaRastreavel.test.tsx` e `DuasPortasModoTema.test.tsx` mudaram só o caminho de import do
  `ShellThemeToggle`, que é trabalho da plan-65. O resumo bate com o diff.
- **O handler.** `ThemeCustomizationTab.tsx:92-106` — `applyFullConfigRaw` e `persistDesign` saíram;
  sobrou `handleThemePreview(design)`. A dependência `sarak` saiu do array junto, corretamente.
- **O preview repinta.** Verificado na cadeia, não presumido: `handleThemePreview`
  (`useDesignDraft.ts:183-191`) escreve em `setDraftState`, e o `PreviewCanvas` renderiza o rascunho dentro
  do `DesignScope`. A armadilha da §2 não se materializou.
- **A confirmação continua funcionando, e a guarda dela também.** `handleApplyToSystem`
  (`useDesignDraft.ts:196-204`) exige `isDirty`; `isDirty` (`:95-99`) compara `draftState` com
  `sarak.systemDesign`, então escolher um tema diferente do sistema marca sujo e o botão aplica. Este era o
  risco não nomeado na plan — o caminho de confirmação poderia ter ficado inerte, e não ficou.
- **O teste não é vazio.** `mockApplyFullConfigRaw`/`mockPersistDesign` chegam ao componente por
  `useThemeEngineState().sarak` (`:79-83`), que é a mesma porta que o handler usaria — as asserções
  `not.toHaveBeenCalled()` falham de verdade se o commit voltar.
- **Suíte.** `npx vitest run src/features/DesignEngine` → 73 arquivos, 201 testes, verde.
- **Suíte completa** → 3 falhas, **todas por timeout** (`generate-token-types.check` ×2,
  `SarakPDFViewerImpl` ×1), nenhuma em `src/features/DesignEngine`, todas verdes em execução isolada
  (3 arquivos, 6 testes). É exatamente o par nomeado no achado 6 do [[00-backlog]] e em
  [[11-testes-e-cobertura]] §3.5. **O critério "`npx vitest run` verde" está ATENDIDO** quando lido contra o
  baseline de intermitência, como a §7 desta plan manda — o executor o marcou como não atendido, sendo mais
  conservador que o necessário.
- **A decisão sobre `setResolvedThemeId` está certa, e a justificativa confere.**
  `updateDraft('mode', …)` (`useDesignDraft.ts:117-138`) lê `sarak.resolvedThemeId` para achar a contraparte
  ao alternar modo **dentro do rascunho**; remover a chamada do clique do catálogo resolveria a contraparte
  do tema anterior. Manter foi a leitura correta.

### Achados — escopo da correção é exclusivamente estes três

1. **`src/features/DesignEngine/Main/ThemeCustomizationTab.tsx:96`** — o comentário novo cita `(plan-63)`.
   **Critério violado:** `padrao-escrita`, `references/comentarios.md` — *"Referência a plan — proibido"*,
   com o motivo exato do caso: a plan é removida no ato da síntese, e o comentário vira ponteiro morto. Esta
   plan é sintetizada logo após a aprovação, então o ponteiro morre em dias, não em teoria. O comentário
   anterior citava uma spec (`Spec 40.1`), que a mesma regra classifica como *permitido, evite* — o diff
   trocou uma referência tolerada por uma proibida.

2. **`src/features/DesignEngine/Main/ThemeCustomizationTab.tsx:96-103`** e
   **`__tests__/ThemeCustomizationTab.test.tsx:206-207`** — os dois comentários carregam histórico de
   execução: *"Antes desta plan, este handler comitava e persistia direto"*, *"decisão revertida pelo dono em
   2026-09-09"*, *"(regra revertida em 2026-09-09)"*. **Critério violado:** mesma referência, seção *"O que
   não comentar"* — *"Changelog em comentário … isso é mensagem de commit, não comentário de código"*. O
   comentário deve dizer **por que a regra é esta**, no presente; o "antes era assado" é da spec fixa e do
   `git log`. É a mesma regra que [[00-contexto]] §5 aplica aos documentos.

3. **`src/features/DesignEngine/Main/__tests__/ThemeCustomizationTab.test.tsx:186`** — o nome do teste começa
   com `plan-63:`. **Critério violado:** o mesmo do achado 1, pelo mesmo mecanismo — o título sobrevive à
   remoção da plan e passa a apontar para um arquivo apagado de propósito. **Atenuante registrado, e ele é
   informação para o dono, não desculpa:** a base tem **14 títulos de teste** com esse formato em `HEAD`,
   incluindo `plan-36:` e `plan-37:`, que já são ponteiros mortos. O executor seguiu a convenção da casa; a
   convenção da casa contraria o padrão. É o achado 5 do [[00-backlog]], e não se fecha aqui — mas também
   não se amplia aqui.

### Nota de processo (não é achado, e o executor já se autodenunciou)

O `status: "🟡 Em execução"` foi pulado antes da primeira edição. É a terceira ocorrência seguida
(plans 58, 60 e esta), e já está no [[00-backlog]] como achado 11 — a repetição confirma que o problema é do
ritual, não do executor. Nada a corrigir nesta plan.

## Veredito — 2026-09-09 (correção 1) — 🟢 Aprovado

Os três achados do veredito anterior estão fechados, e nada além deles mudou.

### Os três achados

| # | Achado | Verificação |
| --- | --- | --- |
| 1 | comentário citava `(plan-63)` | `grep -E "plan-6[0-9]"` nos dois arquivos → **nenhuma ocorrência**. O comentário novo não cita plan nem spec: explica a regra em prosa própria |
| 2 | changelog em comentário, nos dois arquivos | `grep -E "2026-09-09\|Antes desta plan\|revertid"` → **nenhuma ocorrência**. O comentário do handler afirma a regra e o **motivo** (reversibilidade da conversão de modo) no presente; o do teste afirma só o invariante |
| 3 | título do teste com prefixo `plan-63:` | prefixo removido. Os outros 13 títulos com o mesmo formato **não** foram tocados — correto: o veredito disse que a convenção da casa é o achado 5 do [[00-backlog]], e que aqui não se amplia |

### O que verifiquei além dos três

- **Diff acumulado (rodadas 1 e 2) contra `HEAD`:** 13 inserções, 17 remoções, nos dois arquivos da §3.1.
  As únicas linhas executáveis alteradas são as que a plan pediu — a saída de `applyFullConfigRaw` e
  `persistDesign` do handler, o `sarak` fora do array de dependências, o título do teste e as duas
  asserções invertidas. Nenhuma linha de lógica entrou nesta rodada.
- **Escopo.** Em `src/features/DesignEngine/`, o worktree mostra cinco arquivos alterados; **dois são
  desta plan**. Os outros três — os dois snapshots do preview e o import de `DuasPortasModoTema.test.tsx`
  — são da plan-65, conferidos e atribuídos.
- **Suíte do módulo:** `npx vitest run src/features/DesignEngine` → **73 arquivos, 201 testes, verde**.
  A instabilidade de snapshot que o resumo desta correção registra como risco **fechou**: era a
  tokenização do `ShellUserWidget` pela plan-65, e aquela plan regenerou os dois snapshots.
- **O comportamento continua o verificado na rodada 1:** `handleThemePreview` alimenta o rascunho
  (`useDesignDraft.ts:183-191`), o preview repinta, e `handleApplyToSystem` (`:196-204`) segue como único
  caminho de escrita no sistema, com a guarda de `isDirty` funcionando.

### Nota

O resumo desta correção é exemplar num ponto que vale registrar: ao ver o resultado da suíte mudar entre
duas rodadas **sem nenhuma alteração própria no meio**, o executor usou isso como evidência de causa
externa em vez de conclusão sobre o próprio diff. É o raciocínio certo num worktree compartilhado, e foi
confirmado — a causa era a plan-65.

**Pode commitar.**

---

# 11. Síntese
