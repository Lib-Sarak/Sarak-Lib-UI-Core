---
tipo: "plan"
titulo: "Corrigir a prévia de fontes, compactar as paletas e enxugar a barra de ações do painel"
objetivo: "Fazer cada fonte da galeria aparecer com a própria fonte, escolher uma fonte sem efeito colateral, as paletas ocuparem uma linha fina por item e a barra de ações do painel mostrar só Aplicar, Descartar e as mudanças, com o resto num menu"
dominio: "Painel de customização"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "painel", "ux", "paletas", "fontes"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[plan-139-painel-previas-reais]]", "[[anexos/painel-design-prototipo]]"]
depende_de: "plan-142-desempenho-da-troca-de-tema"
retida_por: ""
destino_sintese: "specs/specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Sem mudar a estrutura do painel: cada fonte aparece com a própria fonte, a paleta vira uma linha fina e a barra de ações fica com uma só
ação principal.

# 2. Contexto

Primeira de quatro plans do redesenho do painel, aprovado pelo dono em 2026-10-31 sobre o protótipo
`specs/plan/anexos/painel-design-prototipo.html` (abra no navegador: é a referência visual das quatro). Sequência: 142 (desempenho) → 138 → 139 → 140 → 141.
Esta entrega o que dói hoje e não depende da coluna única.

**Fontes: dois defeitos medidos.**
1. `Canvas/components/TypographyCatalog.tsx:36` lê `preset.design.fontFamily`, mas `TYPOGRAPHY_PRESETS`
   (`src/core/Design/presets/components/typography.ts`) declara `headingFont` e `bodyFont`. O estilo sai vazio e todo cartão herda a
   fonte do tema.
2. Com `options.fonts: 'bundled'` (padrão), `useSarakFonts` carrega só as famílias que o design no ar usa. Mesmo com o campo certo, a
   fonte de um cartão não estaria carregada. A carga é `loadBundledFonts` (`src/core/Provider/fontLoader.ts`).

**Efeito colateral:** cada preset de fonte grava também `monoFont`, `h1Size`, `h1Weight`, `h1LineHeight`, `h1LetterSpacing`, `bodyWeight`
e `bodyLineHeight`. Escolher uma fonte troca a mono e muda o tamanho do H1.

**Paletas:** `Main/components/PaletteGallery.tsx` e `PaletteSwatch.tsx` repetem, em cada item, dois blocos com a palavra Claro/Escuro e
três pontos. O dono achou grande e grosseiro. O seletor de modo da prévia já responde por claro e escuro.

**Ações:** `Main/components/ThemeActionBar.tsx` empilha até sete ações, e isso toma cerca de um quarto da altura da barra.

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/Canvas/components/TypographyCatalog.tsx` e o teste — campo certo, carga das fontes, amostra em português.
- `src/core/Design/presets/components/typography.ts` — o preset grava só `headingFont` e `bodyFont`.
- `src/core/Provider/` — só o que for preciso para o painel pedir a carga de uma família pela origem configurada em `options.fonts`.
- `src/features/DesignEngine/Main/components/PaletteGallery.tsx`, `PaletteSwatch.tsx`, `PaletteSection.tsx` e testes.
- `src/features/DesignEngine/Main/components/ThemeActionBar.tsx` e teste; um componente novo para o menu de mais ações, se necessário.
- `src/core/i18n/` — textos novos, por acréscimo, nos seis idiomas.
- Snapshots que estas mudanças alterarem, e `browser-tests/` que clicam nas ações movidas.

## 3.2 Fora
- A coluna única, os modos e a galeria (plans 139 e 140).
- O cálculo da paleta e os presets de paleta (plan-136).
- Presets novos (plan-141).
- `dist/`, `sarak-ui/`, `sarak-dev/`, `docs/component-catalog.*` e `src/core/Provider/generated/` (gerados).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Anexo | `specs/plan/anexos/painel-design-prototipo.html` | a tela **Cores** (linha da paleta) e o rodapé da coluna são o alvo visual |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §2.3, §2.4, §4 | barra de ações, paletas, rascunho |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §3.6 | textos pelo catálogo, nos seis idiomas |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` §7.3 | cor esperada vem da página |
| Código | `src/core/Provider/hooks/useSarakFonts.ts` · `src/core/Provider/utils/fontSelection.ts` | as três origens de fonte |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · CSS por token |

# 5. Instruções de execução

1. Fotografe o worktree. Capture antes e depois das três telas para a prévia (passo 7).
2. **Preset de fonte.** Grava só `headingFont` e `bodyFont`. Escreva o teste: aplicar um preset não muda `monoFont` nem nenhum token de H1.
3. **Cartão de fonte.** Lê `headingFont` no título e `bodyFont` no corpo. Texto de amostra em português pelo catálogo, com título, frase e
   número (`R$ 12.480,00`). Sem texto em caixa-alta decorativo.
4. **Carga.** Só das famílias cujos cartões entram na área visível (`IntersectionObserver`), não das 42 de uma vez, respeitando a origem:
   `bundled` carrega pelo manifesto; `google` já tem tudo; `none` não carrega, e o cartão mostra a fonte que houver. Teste das três.
5. **Paleta em linha.** Cada item é uma linha: faixa contínua de cores e nome. Selecionado: um check discreto. Sem as palavras Claro e
   Escuro, sem borda por item. Os tipos viram filtros (Todas, Monocromática, Análoga, Complementar, Dividida, Triádica) em vez de seções.
   "Criar a partir de uma cor" fica numa linha acima da lista. Selecionar segue sendo rascunho, e o diálogo de troca não muda.
6. **Barra de ações.** Visíveis: `Aplicar` (única primária), `Descartar` e um menu de mais ações com Salvar tema, Novo tema, Exportar JSON,
   Apagar tema (por último, com tom de perigo) e Desfazer última aplicação, quando houver. O menu segue o padrão de teclado do
   `ThemeAdvancedMenu`. O texto "N alterações" abre uma lista: nome do token, valor aplicado e valor do rascunho. Sem alteração, ele some
   e os dois botões ficam desabilitados.
7. **Prévia para o dono:** `C:\tmp\sarak-previa-138\index.html`, com antes e depois da galeria de fontes, das paletas e da barra de ações,
   no painel real, nos modos claro e escuro.
8. Rode os specs de navegador que tocam o painel: `plan-135-paletas-no-painel`, `plan-122-preview-mode`, `login-theme-application` e
   `painel-segue-o-modo`. Depois: `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts`.
9. `npm run verify -- --tier=quick` uma vez.

# 6. Critérios de aceite

- [ ] Duas fontes diferentes geram `font-family` computada diferente nos cartões — no navegador, com `document.fonts.check` verdadeiro na origem `bundled`.
- [ ] Aplicar um preset de fonte altera só `headingFont` e `bodyFont` — teste.
- [ ] Nada carrega fora da área visível — teste.
- [ ] As 15 paletas cabem em até 15 linhas, sem as palavras Claro e Escuro; os filtros funcionam por teclado — teste.
- [ ] A barra mostra uma primária, `Descartar` e o menu; toda ação de antes continua alcançável — teste.
- [ ] Textos novos nos seis idiomas.
- [ ] Prévia gerada; a aprovação do dono é registrada pelo revisor no veredito.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum novo.

- `npx vitest run src/features/DesignEngine src/core/Design src/core/Provider src/core/i18n` — uma vez.
- `node gates/scripts/release/check-audit-baseline.mjs --with-tsc` — uma vez.
- A prévia aberta; o caminho vai ao dono; o veredito só fecha com a aprovação dele.

# 8. Destino da síntese

**Destino:** `specs/specs/06-painel-de-customizacao-e-preview.md` — §2.3 (a barra de ações, com o menu) e §2.4 (a paleta em linha com
filtros); §6.4 (a amostra de fonte usa a fonte real, carregada sob demanda, e escolher fonte só muda título e corpo).

---

# 9. Resumo da execução

---

# 10. Veredito
