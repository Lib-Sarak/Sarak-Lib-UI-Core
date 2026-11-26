---
tipo: "plan"
titulo: "Higiene interna de código e de testes"
objetivo: "Fechar dez pendências internas que não mudam a tela: seletor por nome de classe, selo de dispositivo, disputa de textura, leituras e classes mortas, recorte de teste incompleto, nomes de teste com rastro de plan, teste que não protege o que diz, função com dez parâmetros e o config inteiro como host com a opção ligada"
dominio: "Manutenção"
status: "🔴 A executar"
prioridade: "Baixa"
tags: ["plan", "higiene", "testes", "refactor"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[11-testes-e-cobertura]]", "[[09-temas-e-presets]]"]
depende_de: ""
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

As dez pendências da tabela deixam de existir. A tela não muda, e cada item fica com um teste ou uma medida que o prova.

# 2. Contexto

Promovidos do backlog em 2026-11-25. Cada lote é independente e pequeno. Faça um por vez e registre cada um no resumo.

| Id | Pendência |
|---|---|
| H16 | `src/features/DesignEngine/Canvas/hooks/useInspector.ts:19` agrupa por `'.card, [class*="card"], [class*="panel"]'`. Uma utilitária com `card` ou `panel` no nome vira "componente" no inspetor. Trocar pelo marcador de componente (`data-*` ou a classe exata) |
| H19 | `DynamicTokenControl.tsx` (Command Center, usado por `Panels/HyperGranularityTab.tsx`) não recebe `previewDevice` e não mostra o selo de dispositivo. A spec 06 §3 diz que todo controle com `isResponsive` mostra; hoje só `TokenControl.tsx` cumpre |
| H41 | Em `src/styles/_atmosphere.css`, com mais de um `data-sx-card-texture-type` no caminho, vence a regra declarada por último, e não a do ancestral mais próximo. A prévia aninhada do painel expõe isso com o `micro-dots` do tema padrão |
| H49 | `src/styles/_base.css:67` lê `--sarak-global-bg-image`, que não chega ao `style` inline quando a imagem é `data:image/…;base64`. A arte só aparece pelo `SarakBackgroundRenderer`. Remover a leitura morta ou fazer a variável chegar, conforme a medida |
| H50 | `.texture-aurora-classic` e `aurora-classic-drift` (`src/styles/_atmosphere.css`, perto da linha 487) não são aplicados por nenhuma opção e têm o `rotate(360deg)` que estourava o `scrollWidth`. Apagar |
| H52 | O recorte `contraste-cyberpunk-claro` (`browser-tests/fixtures/harness-entry.tsx`, perto da linha 287) não declara `textColorMuted`. Herda o escuro do padrão, e o botão secundário (1,09:1) não pode ser medido. Declarar |
| H58 | 16 arquivos `browser-tests/plan-*.spec.ts` e configs, e a variável `SARAK_PLAN124_CHROMIUM_PATH` (`cromo-css-real.spec.ts`, `residuo-da-reauditoria.spec.ts`, `seletor-da-barra-legivel.spec.ts`, `plan-124-isolated.config.ts`). Renomear pelo que cada caso prova, unificar em `SARAK_CHROMIUM_EXECUTABLE_PATH` e apagar o config isolado se a bateria única o cobrir |
| H60 | `browser-tests/troca-de-tema.spec.ts` passa mesmo com `useEffect` de volta em `src/features/DesignEngine/hooks/useDesignDraftSync.ts`. Falta o caso que proteja a fusão dos commits da prévia e da raiz |
| H79 | `useDesignSync` (`src/core/Provider/hooks/useDesignSync.ts:28`) recebe 10 parâmetros posicionais, e o teto é 4. Trocar por um objeto de opções e tirar a entrada do baseline |
| H95 | Com `options.persistence.configIsSavedDesign` ligado, `useDesignSync` (`:79` e `:95`, com `activeThemeId` controlado) e `useThemeSeed` (`src/core/Provider/hooks/useThemeSeed.ts:151-156`) ainda compõem o `config` inteiro como host. Usar a mesma porta do `getHostConfig` do `SarakUIProvider`. Fazer junto com o H79, porque é o mesmo arquivo |

# 3. Escopo

## 3.1 Dentro
Os arquivos citados na tabela, os testes deles e, no H58, os arquivos renomeados e quem os referencia (`package.json`, configs do
Playwright).

## 3.2 Fora
- Qualquer mudança visível. Se um item mudar a tela, pare e relate.
- Os arquivos que as plans 176, 177 e 178 estiverem tocando. Faça esses itens depois que elas forem commitadas.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` §3 | o selo de dispositivo (H19) |
| Spec fixa | `specs/specs/11-testes-e-cobertura.md` | nomes e bateria de navegador (H58, H60) |
| Spec fixa | `specs/specs/01-gates-e-baseline.md` | o baseline do auditor (H79) |
| Doc | `docs/persistencia-de-tema.md` §6 | a opção `configIsSavedDesign` (H95) |
| Skill | `padrao-escrita` + `padrao-typescript` · `test-unitario` | sempre |
| Código | `src/core/Provider/SarakUIProvider.tsx` (`getHostConfig`) | a porta que o H95 reusa |

# 5. Instruções de execução

1. **Um lote por id, na ordem da tabela.** Em cada um: o teste ou a medida que falha antes, a correção e a passagem depois.
2. **H58:** confira com `grep` que nenhuma referência ao nome antigo sobra.
3. **H79 e H95 juntos:** objeto de opções, porta do host, e um teste com `activeThemeId` controlado e a opção ligada, em que a troca de
   tema pela prop não traz o resto do tema anterior.
4. **Verificação do executor (uma vez, no fim):**
   - `npx vitest run` com filtro nos testes tocados;
   - `npm run verify -- --tier=quick`;
   - **só no H52 e no H60:** `npm run build` e as specs de navegador tocadas, rodadas sozinhas.

# 6. Critérios de aceite

- [ ] Os 10 ids têm, no resumo, o antes e o depois.
- [ ] Nenhuma referência a `plan-NNN` sobra em nome de arquivo de `browser-tests/` nem em variável de ambiente.
- [ ] `useDesignSync` sai do baseline do auditor.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor não repete os comandos do executor. Ele confere:
- o diff;
- **mutação, em cópia:**
  - devolva o `useEffect` em `useDesignDraftSync` → o caso novo do H60 reprova;
  - devolva a composição do `config` como host com a opção ligada → o teste do H95 reprova.

# 8. Destino da síntese

**Destino:** `—`. Higiene interna; nenhuma verdade documentada muda.

---

# 9. Resumo da execução

---

# 10. Veredito
