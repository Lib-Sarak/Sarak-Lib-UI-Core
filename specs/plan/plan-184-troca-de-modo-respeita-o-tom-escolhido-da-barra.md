---
tipo: "plan"
titulo: "A troca de modo respeita o tom de barra que o usuário escolheu"
objetivo: "Fazer a troca entre claro e escuro calcular a paleta com o tom de barra escolhido pelo usuário, sem perder o contraste do cromo no tom padrão que a 9.0.0-rc.2 acabou de garantir"
dominio: "Provider / Modo de cor"
status: "🟡 Em execução"
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
- Os arquivos que a `plan-177` e a `plan-180` estão tocando, que correm em paralelo.
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
   - `npm run verify -- --tier=quick`. As falhas de arquivos da 177 e da 180 não contam; liste-as.

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

---

# 10. Veredito
