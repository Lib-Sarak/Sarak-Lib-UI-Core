---
tipo: "plan"
titulo: "Aplicar a paleta do tema, permitir a paleta escolhida por cima de qualquer tema e salvar paletas com nome"
objetivo: "Fazer escolher um tema aplicar as cores dele, deixar o usuário pôr uma paleta por cima de qualquer tema (inclusive dos que declaram cor) e salvar uma paleta criada com nome próprio, que aparece na galeria e serve à marca"
dominio: "Design Engine / Paleta e painel"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "paletas", "temas", "painel", "persistencia"]
relacionados: ["[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[024-paleta-calculada-separada-do-tema]]", "[[010-temas-salvos-pelo-usuario]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[017-porta-de-apagar-tema-simetrica-a-de-escrever]]"]
depende_de: "plan-160"
retida_por: ""
destino_sintese: "adr/027 + specs/09-temas-e-presets.md + specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

Escolher um tema mostra as cores dele; o usuário que quiser ver um tema numa paleta específica liga "manter minha paleta" e a paleta
vale por cima de qualquer tema; e uma paleta criada no painel pode ser salva com nome, reaparece na galeria e é escolhível na marca.

# 2. Contexto

**Pedido do dono (2026-11-11):** "cada tema possui uma cor padrão; ao selecionar um tema deveríamos aplicar a cor padrão dele (faz parte
da personalidade de cada tema), porém gostaria de ter uma opção para a paleta sobressair o tema, no caso do usuário querer ver como
fica um tema numa paleta específica. Deve ser possível salvar uma paleta criada, como um tema, inclusive com nome próprio, para usar uma
paleta para a marca."

**O que existe hoje (lido em 2026-11-11):**
- Todo tema tem cor própria, por dois caminhos: 6 dos 19 declaram `colorPalette` (`sarak-sovereign` → `ciano-violeta`,
  `cyberpunk-neon` → `verde-neon`, `industrial-terminal` → `ambar-industrial`, `nebula-space` → `ametista-petroleo`, `neo-brutalism` →
  `cobalto-vivo`, `synthwave-retro` → `rosa-synthwave`); os outros 13 declaram as cores direto. A `plan-162` acrescenta sete temas, todos
  com `colorPalette`.
- A troca de tema compõe e não herda ([[09-temas-e-presets]] §4.3.3): o tema escolhido aplica a cor que declara.
- **Escolher uma paleta no painel já vence a cor do tema:** `usePaletteSelection.ts` grava no rascunho `colorPalette` **e todas as cores
  que ela calcula**, por cima das que o tema declara (conferido pelo dono no uso e no código, 2026-11-11). O que não existe é a paleta
  sobreviver à troca de tema: escolher outro tema compõe as cores dele (09 §4.3.3).
- O painel cria paleta (`Main/components/PaletteCreator.tsx`, valor `custom:<tipo>:<#base>[,sec=…][,acc=…]`), mas não há como guardá-la
  com nome: ela vive só como valor de `colorPalette` no design.
- Temas salvos pelo usuário têm porta própria de escrita e de apagar ([[010-temas-salvos-pelo-usuario]],
  [[011-tema-salvo-por-uma-porta-de-escrita]], [[017-porta-de-apagar-tema-simetrica-a-de-escrever]]; 09 §4.6). Paleta não tem.

**Depende do que se grava.** A `plan-158` (ADR-026) muda o design gravado para guardar só escolhas; `colorPalette` e os tons são os
"condutores" dela. Esta plan parte desse formato, por isso vem depois da 158 — e depois da `plan-160`, que mexe na galeria de paletas
(espiada).

# 3. Escopo

## 3.1 Dentro
- **Lote 0:** `specs/adr/027-<slug>.md` (novo) e a linha dele em `specs/adr/README.md`.
- **Lote 1 (paleta do tema × paleta por cima):** `src/core/Design/presets/themes/compose.ts`, `src/core/Design/palette/resolve.ts` (só a
  regra de quem vence quando a paleta está "por cima"), `src/features/DesignEngine/hooks/useDesignDraft.ts`,
  `src/features/DesignEngine/Main/hooks/usePaletteSelection.ts`, `src/features/DesignEngine/Main/components/PaletteSection.tsx` e
  `PaletteGallery.tsx`; o token novo da escolha "manter minha paleta" nas três fontes de token, se o ADR decidir que é token; testes.
- **Lote 2 (paletas salvas):** o token da lista de paletas no schema (três fontes de token), `src/features/DesignEngine/Main/components/PaletteCreator.tsx`, `PaletteGallery.tsx` (grupo "Minhas
  paletas"), o atalho de marca (`Main/components/BrandShortcut.tsx`, `Main/hooks/useBrandForm.ts`), textos no catálogo de
  `src/core/i18n/`, testes; `docs/persistencia-de-tema.md`, `sarak-ui/GUIA-FRONTEND.md` (autoria) e o artefato de referência do dado
  persistido ([[13-instalacao-e-atualizacao]]).
- Em todo lote: `docs/migracoes.md`, `npm run guide`, `npm run dev-kit`.

## 3.2 Fora
- O catálogo de paletas prontas: `plan-163`. Os temas: `plan-162`.
- O motor de paleta (escala, papéis, contraste) além da regra de precedência do lote 1.
- O formato do design gravado: `plan-158` (esta plan o usa como está).
- Qualquer arquivo de importador. Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/09-temas-e-presets.md` §4.3.3, §4.3.4, §4.4 inteira, §4.6 | composição, paleta calculada e quem vence, persistência e portas, salvar em runtime |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` §2.3, §2.4, §4, §5.1 | o caminho do painel, paletas no painel, rascunho × persistido, exportar × salvar |
| Spec fixa | `specs/13-instalacao-e-atualizacao.md` | o artefato de referência do dado persistido |
| Spec fixa | `specs/10-seguranca-e-acessibilidade.md` §3.6 | textos novos do cromo/painel no catálogo, se forem do usuário final |
| Spec fixa | `arquitetura/04-contrato-de-tokens-e-paridade.md` | token novo nas três fontes, se houver |
| ADR | `adr/024-paleta-calculada-separada-do-tema.md` · `adr/010-temas-salvos-pelo-usuario.md` · `adr/011-tema-salvo-por-uma-porta-de-escrita.md` · `adr/017-porta-de-apagar-tema-simetrica-a-de-escrever.md` · `adr/026-design-gravado-guarda-so-as-escolhas.md` · `adr/README.md` | paleta × tema; o padrão das portas de tema salvo; o formato gravado |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `ui-arquitetura-design` · `ui-novo-componente` (se houver token novo) | escrita, testes, Design Engine, paridade |
| Código | `src/core/Design/presets/themes/compose.ts` · `src/core/Design/palette/resolve.ts` · `src/core/Design/palette/parser.ts` · `src/features/DesignEngine/Main/components/PaletteCreator.tsx` · `src/features/DesignEngine/Main/hooks/usePaletteSelection.ts` · `docs/persistencia-de-tema.md` | ler antes de editar |

# 5. Instruções de execução

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 e status 🟠.**

**Lote 0 — ADR (só documento).** O dono já decidiu (2026-11-11); o ADR-027 registra as decisões com as alternativas e o custo:
0.1. **"Manter minha paleta" é do sistema:** um token do design, escolhido pelo administrador no painel e gravado como escolha. Desligado
(padrão), escolher um tema aplica as cores dele; ligado, a paleta selecionada é aplicada por cima de qualquer tema, em toda troca. Vale
para todo usuário. Alternativas recusadas: preferência do usuário ([[016-preferencias-do-usuario-separadas-do-tema]]) e estado só do
painel.
0.2. **Com o toggle ligado, a paleta vence todas as cores que ela calcula**, inclusive as que o tema declara — o mesmo que escolher a
paleta faz hoje no painel. Sem pergunta ao dono: é o comportamento atual estendido à troca de tema.
0.3. **A paleta salva mora no próprio design do sistema:** uma chave com a lista `{ id, nome, valor }` (o valor é o `colorPalette`
`custom:…`), gravada pelo mesmo `onSave` do design. Recomendação do revisor como "a mais simples", que o dono confirma ao aprovar o ADR: nenhuma porta nova,
nenhuma tabela nova, nenhum código novo no importador. Custo nomeado: uma chave nova no design (servidor que valida a lista de chaves,
como o dos logins, precisa aceitá-la uma vez) e o payload cresce com o número de paletas. Alternativas recusadas: porta nova simétrica à
de tema salvo (código novo em todo importador) e entrada na tabela de temas (paleta misturada com tema, filtro em todo lugar).
0.4. Confira, contra o ADR-026 da `plan-158`, que a paleta escolhida e a lista de paletas são escolhas que o formato gravado preserva,
e que a paleta escolhida por cima de um tema de cor declarada sobrevive a recarregar.
0.5. ADR em `🟡 Proposto`. O revisor leva ao dono; sem aprovação, o lote 1 não começa.

**Lote 1 — paleta do tema × paleta por cima.**
1.1. Teste que fixa o comportamento padrão: para cada tema embarcado, escolher o tema no painel aplica a cor dele (a paleta que declara,
ou as cores que declara), mesmo que antes houvesse outra paleta escolhida.
1.2. Teste que reprova antes: com "manter minha paleta" ligado e uma paleta escolhida, trocar para um tema de cor declarada mostra a
paleta escolhida nos papéis decididos no ADR (0.2); trocar de novo para outro tema mantém a paleta.
1.3. Controle no painel, junto da galeria de paletas, com o estado visível ("a paleta escolhida vale por cima do tema"); desligá-lo
volta às cores do tema atual.

**Lote 2 — paletas salvas.**
2.1. No criador de paleta, "Salvar paleta" com nome; nome repetido pergunta antes de substituir; apagar pede confirmação.
2.2. A galeria mostra um grupo "Minhas paletas" com as salvas, escolhíveis e com espiada como as outras.
2.3. O atalho de marca ("Usar minha marca") oferece as paletas salvas.
2.4. A lista é gravada pelo `Aplicar`, como o resto do design; teste de integração pelo Provider real: salvar, aplicar, recarregar,
apagar.
2.5. Documentação do importador: `docs/persistencia-de-tema.md`, o guia e o artefato de referência; `docs/migracoes.md`.

# 6. Critérios de aceite

- [ ] ADR-027 aprovado pelo dono antes do lote 1.
- [ ] Escolher qualquer tema aplica a cor dele (teste por tema).
- [ ] "Manter minha paleta" faz a paleta valer por cima de qualquer tema, inclusive os de cor declarada (teste que reprovava antes).
- [ ] Paleta salva com nome, listada em "Minhas paletas", escolhível na marca, gravada no design do sistema e apagável.
- [ ] Documentação do importador e `docs/migracoes.md` atualizadas.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1; paridade de token (se houver token novo).

# 7. Como verificar (uso do revisor)

**Gate:** teste — os testes de cada lote; nenhuma regra de gate nova.

- Lote 0: as alternativas do ADR conferidas contra `compose.ts`, `resolve.ts` e as portas de tema salvo.
- Lote 1: o teste 1.2 rodado sobre o código de antes, em cópia fora do repositório, e visto reprovar; `npm run verify -- --tier=full`.
- Lote 2: o teste de integração pela porta; `npm run verify -- --tier=full`; `npm run build` + `cromo-css-real:check` se o painel
  mudar de desenho.

# 8. Destino da síntese

**Destino:** `adr/027 + specs/09-temas-e-presets.md + specs/06-painel-de-customizacao-e-preview.md`

- **`adr/027`:** nasce no lote 0.
- **`09`:** §4.3.4 (quem vence com a paleta por cima) e §4.6 ou seção nova (paleta salva e a porta dela).
- **`06`:** §2.4 (o controle "manter minha paleta", o grupo "Minhas paletas" e o salvar no criador).

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
