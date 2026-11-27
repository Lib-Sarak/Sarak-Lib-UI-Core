---
tipo: "plan"
titulo: "A troca de modo respeita o tom de barra que o usuário escolheu"
objetivo: "Fazer a troca entre claro e escuro calcular a paleta com o tom de barra escolhido pelo usuário, sem perder o contraste do cromo no tom padrão que a 9.0.0-rc.2 acabou de garantir"
dominio: "Provider / Modo de cor"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "rc2", "regressao", "modo-de-cor", "paleta", "cromo"]
relacionados: ["[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]", "[[026-design-gravado-guarda-so-as-escolhas]]"]
depende_de: ""
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Com a lateral "Invertida" escolhida, trocar para o modo claro mantém a lateral escura, como antes do commit `cd9d5c85`. O cromo
dos 25 temas no tom padrão continua com o contraste que as duas specs de navegador exigem.

# 2. Contexto

- **O defeito:** `src/features/DesignEngine/hooks/__tests__/designGravadoEscolhas.persistenceIntegration.test.tsx` reprova 2 de 7 no
  `HEAD`.
  - **1.3:** com `sidebarTone: 'inverse'` gravado no sarak-sovereign, ao passar para o claro, `sidebarColor` sai `#ddecee`. O
    esperado é `#0d1819`.
  - **1.5:** alternar claro e escuro não muda mais o fundo da lateral.
- **Quando entrou:** o teste passa 7 de 7 em `9c9bd4dd`, `c9325cba` e `d417cd22`, e reprova a partir de `cd9d5c85`.
- **A causa:** `themePaletteInput`, em `src/core/Provider/utils/overlayPreferences.ts`. Ela monta a entrada da paleta só com o que
  o tema declara, mais `colorPalette` e `mode`, e deixa de fora o tom de barra escolhido no design (`sidebarTone`, `topbarTone` e os
  estilos de fundo das barras). A paleta do modo alvo é calculada como se a barra estivesse no tom do tema.
  - Antes, a paleta era calculada sobre o design inteiro. Isso levava o tom escolhido, mas também os padrões do schema, e foi isso
    que causou o D1.
  - O executor da 176 registrou que tentou passar o tom e o removeu, porque nenhum teste do filtro dele precisou. Este teste estava
    fora do filtro.

# 3. Escopo

## 3.1 Dentro
- `src/core/Provider/utils/overlayPreferences.ts`: a entrada da paleta leva, além do que o tema declara, as escolhas de papel de
  cor do design. Use a mesma noção de "escolhido" que o arquivo já usa (`chosenToneKeys`, `chosenModeValueKeys`), e não o design
  inteiro.
- `src/core/Provider/utils/__tests__/overlayPreferences.chromeColors.test.ts`: um caso com tom escolhido.

## 3.2 Fora
- **A `plan-181` e a `plan-182` correm em paralelo, no mesmo worktree.** Fique fora de `src/core/i18n/`, de
  `src/core/Provider/themeTypes.ts`, do painel de temas e do `SarakAppChrome`.
- Cores de tema.
- `color-engine.ts` e `src/core/Design/palette/`: se a causa estiver neles, pare e relate.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.4 | tom escolhido × cor do tema |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §2.4 d | o contraste do cromo no tom padrão |
| ADR | `specs/adr/026-design-gravado-guarda-so-as-escolhas.md` | o que é escolha |
| Skill | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre |

# 5. Instruções de execução

1. **Falha antes:** os 2 casos de `designGravadoEscolhas` já reprovam. Acrescente ao `overlayPreferences.chromeColors.test.ts` um
   caso com `sidebarTone: 'inverse'` escolhido: a troca de modo dá o mesmo `sidebarColor` que `composeThemeDesign` dá com o tom no
   modo alvo. O caso tem de falhar hoje.
2. **Corrija** a entrada da paleta (§3.1).
3. **Verificação do executor:**
   - `npx vitest run` com filtro em `src/core/Provider` e em `src/features/DesignEngine/hooks`. Este segundo filtro inclui os
     consumidores da troca de modo, e foi a ausência dele que deixou a regressão passar;
   - `npm run build`, e depois as duas specs, uma de cada vez: `contraste-do-cromo-tom-padrao` e `contraste-do-cromo-nas-barras`;
   - `npm run verify -- --tier=quick`. As falhas de arquivos da 181 e da 182 não contam; liste-as.
4. **Trava de build:** o `npm run build` e as duas specs de navegador que o seguem rodam com a trava `C:\tmp\sarak-build.lock`, a
   mesma das plans paralelas.
   - Pegue a trava com `node -e "require('fs').writeFileSync('C:/tmp/sarak-build.lock','plan-184',{flag:'wx'})"`. Se o comando
     falhar, outra plan está com ela: espere e tente de novo.
   - Solte com `node -e "require('fs').rmSync('C:/tmp/sarak-build.lock')"` depois da segunda spec, inclusive se algo falhar.
   - Nunca apague a trava de outra plan. Se ela ficar parada mais de 30 minutos sem build rodando, relate.

# 6. Critérios de aceite

- [ ] `designGravadoEscolhas.persistenceIntegration.test.tsx` passa 7 de 7.
- [ ] O caso novo falhava antes e passa depois.
- [ ] `overlayPreferences.chromeColors.test.ts` continua com 100 de 100, mais o caso novo.
- [ ] As duas specs de navegador passam sem reprovação.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor não repete os comandos do executor. Ele confere:
- o diff;
- **mutação, em cópia:** a entrada da paleta sem o tom escolhido reprova o `designGravadoEscolhas`. Com o design inteiro de volta
  como entrada, reprova o `chromeColors`.

# 8. Destino da síntese

**Destino:** `—`. Corrige o código para cumprir o que a [[09-temas-e-presets]] e a [[10-seguranca-e-acessibilidade]] já dizem.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-26

**Resultado:** Concluído

**Estado do worktree ao iniciar**
Só `dist/` (rebuild), `src/buildInfo.ts` e `src/core/Provider/buildInfo.ts` modificados; o restante do `git status` (specs de 177/180/181/182) apareceu durante a execução e não é meu.

**O que foi feito**
- `src/core/Provider/utils/overlayPreferences.ts`: `themePaletteInput` passa a levar `sidebarTone`/`topbarTone` e `*BackgroundStyle` das barras cujo papel foi escolhido (nova `chosenBarChoices`, baseada em `chosenToneKeys` + `TONE_DRIVEN_KEYS`), não o design inteiro.
- `overlayPreferences.chromeColors.test.ts`: caso novo com `sidebarTone: 'inverse'` escolhido; falhava antes (`#ddecee` ≠ `#0d1819`) e passa depois.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Provider/utils/overlayPreferences.ts` | alterado | entrada da paleta leva o tom escolhido |
| `src/core/Provider/utils/__tests__/overlayPreferences.chromeColors.test.ts` | alterado | caso de tom escolhido |

**Verificações executadas**
- `npx vitest run src/core/Provider src/features/DesignEngine/hooks` → 98 arquivos, 906 testes, todos passam (inclui `designGravadoEscolhas` 7/7).
- `chromeColors` → 101/101 (100 + 1 novo).
- `npm run build` → exit 0; specs `contraste-do-cromo-tom-padrao` (2 passed) e `contraste-do-cromo-nas-barras` (1 passed).
- `npx tsc --noEmit` → 0 erros (os 2 do meu teste foram corrigidos).
- `npm run verify -- --tier=quick` (antes da correção de tipos) → falhas: `tsc` e `audit:baseline --with-tsc` (os 2 erros do meu teste, já corrigidos; não reexecutei o quick) e `section-pointers:check` em `specs/00-indice.md:84,89` (arquivo do revisor/outra plan).

**Critérios de aceite**
- [x] designGravadoEscolhas 7/7 · [x] caso novo falhava/passa · [x] chromeColors 101/101 · [x] duas specs de navegador passam · [x] diff só nos caminhos da §3.1 (mais `buildInfo` do build, já modificados antes)

**Decisões e suposições**
- "Barra escolhida" = alguma chave de `TONE_DRIVEN_KEYS[bar]` em `chosenToneKeys`; o estilo de fundo segue o tom.

**Achados fora do escopo (não corrigidos)**
- `specs/00-indice.md:84,89` — ponteiros de seção mortos (§5.1, §7, §3.6).

**Pendências / riscos**
- `audit:baseline --with-tsc` não foi reexecutado após a correção de tipos.


---

# 10. Veredito

## Veredito — 2026-11-26 — 🟢 Aprovada

**Diff:** só `overlayPreferences.ts` e `overlayPreferences.chromeColors.test.ts`. A entrada da paleta ganha `chosenBarChoices`: o tom
e o estilo de fundo só das barras que `chosenToneKeys` dá como escolhidas, e não o design inteiro. O `theme as never` repete o que a
linha 116 do mesmo arquivo já fazia.

**Mutações, numa cópia do `HEAD` com os dois arquivos da plan:**
- entrada sem `chosenBarChoices`: reprovam o caso novo e os casos 1.3 e 1.5 do `designGravadoEscolhas`;
- design inteiro como entrada: 31 de 108 reprovam, no `chromeColors`;
- sem mutação: 108 de 108.

**Conferência do revisor:**
- `tsc --noEmit`: 0 erros.
- `audit:baseline`: o `cleancode` foi de 0 a 1. O arquivo apontado é `SarakAppChromeMobile.tsx`, da 181, que está em execução, e não
  é desta plan.
- vitest em `src/core/Provider`, `src/features/DesignEngine`, `src/components/Layout` e `src/components/atomic/Navigation`: 2660
  passam e 3 falham.
  - Dois são testes novos da 181 (`readOnly`).
  - O terceiro é o `configIsSavedDesign`, que estoura os 5 s do caso com a máquina carregada pelas plans paralelas. Ele cai também
    no `HEAD` sem esta plan e, com ela, passou 3 de 3 em quatro rodadas. Foi para o backlog.
- O `section-pointers:check` que o executor apontou em `00-indice.md` vinha da nota de síntese do revisor e foi corrigido.

**Ressalva:** o `quick` não foi rodado de novo depois da correção de tipos. O `tsc` e o `audit:baseline` acima cobrem o que ele
acusou.
