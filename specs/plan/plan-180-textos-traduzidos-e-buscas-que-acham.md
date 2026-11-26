---
tipo: "plan"
titulo: "Textos da lib traduzidos, plural certo e buscas que acham o que o usuário procura"
objetivo: "Fazer todo texto visível da lib sair do catálogo nos seis idiomas com singular e plural, fazer a busca da barra achar sub-abas e a busca do painel abrir o token geral para frases vagas"
dominio: "Idiomas / Busca"
status: "🟡 Em execução"
prioridade: "Média"
tags: ["plan", "i18n", "busca", "painel", "cromo"]
relacionados: ["[[06-painel-de-customizacao-e-preview]]", "[[05-cromo-e-slots]]", "[[12-kit-do-consumidor]]"]
depende_de: ""
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

- Com o painel em inglês ou alemão, nenhum texto da lib aparece em português.
- "Aprovar 1 selecionado" sai no singular.
- A busca da barra acha sub-abas.
- Frases vagas na busca do painel abrem o ajuste geral, e não o de um componente específico.

# 2. Contexto

Quatro achados do backlog, promovidos em 2026-11-25:

| Id | Achado |
|---|---|
| B94 | **Textos em português fora do catálogo:** `ThemeAdvancedMenu.tsx` ("Avançado", "Telas avançadas", "Voltar ao modo normal"); o padrão `actionLabel = 'Executar'` do `SarakActionCard` público (`src/components/atomic/Cards/SarakActionCard.tsx:31`), que chega ao importador; o `title` de `LiveDraftPreviewFrame.tsx:69` ("Modo de Inspeção…"); as amostras da prévia ("Meu sistema", telas e cards); as descrições dos 25 temas na galeria; as abas "Curados" e "Por Estilo"; "Opacidade"; o título "Personalizar o tema" (`CustomizationPanelImpl.tsx:19`); o selo e o aviso de dispositivo de `TokenControl.tsx` |
| B67 | **Plural:** "Aprovar {count} selecionados" e "Rejeitar {count} selecionados" (`src/core/i18n/catalogEntries.system.ts:144,148`) não têm forma singular. O catálogo não tem plural |
| B80 | **Busca da barra:** `getSarakSearchItems` (`src/components/Layout/chrome/navItem.ts:78`) não desce em `children`, e sub-abas não são achadas |
| B62 | **Busca do painel:** frases vagas abrem o específico. `quero bordas mais grossas` → `chartThickness`; `cor do título da página` → `textColorMaster`; `velocidade das animações` → `chatAnimationSpeed`; `deixar os cantos mais retos` → `tableBorderRadius`; `como deixo o site escuro` → `shadowColorMode`. Falta dar peso ao token geral no casamento parcial (`src/features/DesignEngine/utils/token-search.ts`, `Panels/hooks/useSovereignSearch.ts`) |

# 3. Escopo

## 3.1 Dentro
- `src/core/i18n/`: as chaves novas nos seis idiomas e uma forma de plural no catálogo (singular e plural por chave, escolhida por
  `count`), usada pelos dois rótulos do B67 e por toda chave com `{count}` ou `{total}` que hoje erra o singular.
- Os arquivos do B94, trocando o literal pela chave.
- `src/components/Layout/chrome/navItem.ts`: `getSarakSearchItems` inclui os filhos, com a categoria do pai.
- `src/features/DesignEngine/utils/token-search.ts` e `useSovereignSearch.ts`: o peso do token geral.
- Testes de unidade.

## 3.2 Fora
- Os arquivos de componente que as plans 176, 177 e 178 tocam, salvo a troca de um literal por chave. Se a troca colidir com uma
  delas em andamento, deixe o arquivo para o fim e registre.
- Textos de exemplo do importador e o kit `sarak-ui/`, que é derivado.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | textos e busca do painel |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | a busca da barra |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `test-unitario` | caso que falha antes |
| Código | `src/core/i18n/catalog.ts` · `catalog.types.ts` | a forma do catálogo |
| Código | `src/features/DesignEngine/Main/components/__tests__/decisionTextsEmIngles.test.tsx` | molde do teste "nada em português no inglês" |

# 5. Instruções de execução

1. **B94.** Estenda o teste molde a cada superfície da tabela: com o painel em `en` e `de`, nenhum dos literais aparece. O teste
   falha antes da correção. Depois troque os literais por chaves.
2. **B67.** Plural no catálogo e teste dos dois rótulos com `count` igual a 1 e a 2, em pt e en. Varra as chaves com `{count}` ou
   `{total}` e aplique o plural onde o singular erra.
3. **B80.** Teste: um item com `children` → a busca devolve o pai e os filhos, e cada filho leva a categoria do pai.
4. **B62.** Teste com as 5 frases da tabela, esperando o token geral de cada uma, decidido pelo grupo do painel a que a frase se
   refere. Ajuste o peso até as 5 passarem sem quebrar os testes de busca que já existem.
5. **Verificação do executor:**
   - `npx vitest run src/core/i18n src/features/DesignEngine src/components/Layout/chrome`;
   - `npm run verify -- --tier=quick`.

   Sem suíte completa e sem bateria de navegador.

# 6. Critérios de aceite

- [ ] Os quatro testes falhavam antes e passam depois; o resumo traz as duas saídas.
- [ ] Nenhum literal da tabela B94 sobra no código (`grep` no resumo).
- [ ] As chaves novas existem nos seis idiomas.
- [ ] Os testes de busca que já existiam continuam passando.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor não repete os comandos do executor. Ele confere:
- o `grep` dos literais;
- **mutação, em cópia:**
  - volte um literal do B94 → o teste de idioma reprova;
  - retire a descida em `children` → o teste do B80 reprova.

# 8. Destino da síntese

**Destino:** `—`. Corrige o código para cumprir o que o catálogo de idiomas e a busca já prometem.

---

# 9. Resumo da execução

---

# 10. Veredito
