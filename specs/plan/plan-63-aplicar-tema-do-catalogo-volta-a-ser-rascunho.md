---
tipo: "plan"
titulo: "Devolver ao rascunho a escolha de tema pelo catálogo"
objetivo: "Escolher um tema no catálogo previsualiza sem alterar nem persistir o sistema, que só muda por confirmação explícita"
dominio: "Sarak-Lib-UI-Core / Design Engine / Painel"
status: "🔴 A executar"
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

---

# 10. Veredito

---

# 11. Síntese
