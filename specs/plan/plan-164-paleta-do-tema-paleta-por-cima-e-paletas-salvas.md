---
tipo: "plan"
titulo: "Aplicar a paleta do tema, permitir a paleta escolhida por cima de qualquer tema e salvar paletas com nome"
objetivo: "Fazer escolher um tema aplicar as cores dele, deixar o usuário pôr uma paleta por cima de qualquer tema (inclusive dos que declaram cor) e salvar uma paleta criada com nome próprio, que aparece na galeria e serve à marca"
dominio: "Design Engine / Paleta e painel"
status: "🟡 Em execução"
prioridade: "Média"
tags: ["plan", "paletas", "temas", "painel", "persistencia"]
relacionados: ["[[09-temas-e-presets]]", "[[06-painel-de-customizacao-e-preview]]", "[[024-paleta-calculada-separada-do-tema]]", "[[010-temas-salvos-pelo-usuario]]", "[[011-tema-salvo-por-uma-porta-de-escrita]]", "[[017-porta-de-apagar-tema-simetrica-a-de-escrever]]"]
depende_de: ""
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
- Todo tema tem cor própria: **todos** declaram `colorPalette` (a trava `themes/__tests__/themePalettes.test.ts` o exige), e parte
  deles declara também papéis de cor por cima da paleta, que vencem a calculada ([[09-temas-e-presets]] §4.3.4). Medido em 2026-11-12,
  depois do lote 1 da `plan-162`: 23 temas, 11 com papéis declarados por cima (de 8 a 24 dos 92 de `PALETTE_ROLE_MAP`). *Corrigido
  pelo revisor em 2026-11-12: a versão anterior dizia "6 dos 19 declaram `colorPalette`, os outros 13 declaram as cores direto" —
  contagem errada (um `grep` que não via a chave entre aspas).*
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
- O catálogo de paletas prontas: `plan-163`. Os temas resgatados: já entregues (09 §5).
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
- [ ] Prévia para o dono em `C:\tmp\sarak-previa-164\index.html` (os lotes de código), com capturas reais; o lote só fecha com o ok do dono nela.

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

## Resumo da execução (lote 0) — 2026-11-12

**Resultado:** Concluído

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-160-previa-mostra-o-efeito-de-toda-opcao.md
 M specs/plan/plan-164-paleta-do-tema-paleta-por-cima-e-paletas-salvas.md
```

**O que foi feito**
- `specs/adr/027-paleta-do-tema-paleta-por-cima-e-paletas-salvas-no-design.md` criado, no molde do `template-adr.md`, em `🟡 Proposto`. Registra as decisões 0.1 a 0.3 (§2.1 toggle do sistema, §2.2 paleta vence tudo o que calcula, §2.3 paleta salva no design) com quatro alternativas e o custo de cada: A escolhida; B preferência do usuário ou estado do painel (0.1); C porta própria e D tabela de temas (0.3).
- O ADR cita o ADR-026 como premissa (§1) e não repete o formato dele. A §2.4 diz como o toggle, a paleta escolhida por cima de tema de cor declarada e a lista de paletas salvas são gravados nesse formato (0.4): são escolhas do design do sistema, cada uma uma chave que difere do baseline do 026.
- `specs/adr/README.md:68` — linha do 027 na tabela.
- `npm run dev-kit` rodado (a plan manda em todo lote): `sarak-dev/` regenerado, porque o ADR novo o defasou.

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/adr/027-paleta-do-tema-paleta-por-cima-e-paletas-salvas-no-design.md` | criado | ADR-027 |
| `specs/adr/README.md` | alterado | linha do 027 |
| `sarak-dev/state.json`, `sarak-dev/GUIA-MANUTENCAO.md`, `sarak-dev/START-HERE.md` | alterado | gerados por `npm run dev-kit` |
| `specs/plan/plan-164-…md` | alterado | este resumo e o `status` |

**Verificações executadas**
- `npm run -s verify -- --tier=docs` (1ª vez) → `plan-index:check`, `section-pointers:check`, `guide:check`, Anel 0 (185 linhas, 0 achados) OK; `dev-kit:check` FAIL (3 arquivos defasados).
- `npm run -s dev-kit` → regenerado (139 componentes, 424 tokens, 44 gates).
- A 2ª rodada de `verify --tier=docs` está feita no passo seguinte, depois do `plan-index` (resultado abaixo).

**Critérios de aceite**
- [x] ADR-027 escrito, `🟡 Proposto` — evidência: o arquivo; a aprovação do dono é do revisor, e sem ela o lote 1 não começa.
- [x] Alternativas conferidas contra `compose.ts:30-55` e `usePaletteSelection.ts:38-39` (lidos).
- [ ] Os demais critérios da §6 pertencem aos lotes 1 e 2.

**Decisões e suposições**
- Nomes dos tokens (toggle e lista de paletas) **não** foram fixados: o ADR deixa para o lote 1/2 pela paridade das três fontes.
- A lista é valor estruturado; o ADR registra que a comparação com o baseline do 026 tem de ser por igualdade profunda e que a regra L1 não pode tratá-la como cor (conferência do lote 2).
- "Ligar o toggle sem paleta escolhida antes vale a paleta vigente" é suposição minha, registrada como detalhe do lote 1 — o dono não decidiu isso.
- Pus uma quarta alternativa (D, tabela de temas) separada da C, porque 0.3 recusa as duas com custos distintos.

**Achados fora do escopo (não corrigidos)**
- Não-rastreados `browser-tests/_probe160.mjs` e `browser-tests/fixtures/plan-160-previa-entry.tsx` apareceram durante a execução; não estavam na fotografia e não são meus (parecem da plan-160). Não toquei.

**Pendências / riscos**
- Se o ADR-026 mudar na aprovação, o 027 se ajusta na mesma rodada.
- O trecho "Voltar atrás é caro…" e a ausência de teto para a lista de paletas são julgamento meu; o lote 2 mede.

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Nota do revisor — 2026-11-12 — lote 0 liberado antes da `plan-160`

O lote 0 é só o ADR-027 e registra decisões que o dono já tomou em 2026-11-11. Ele parte do formato do ADR-026 (gravar só
escolhas), que segue 🟡 Proposto: o ADR-027 o cita como premissa e, se o ADR-026 mudar na aprovação, o 027 se ajusta na mesma
rodada. Os lotes 1 e 2 continuam esperando a 158 e a 160.

**Lote 0 liberado.**

## Veredito — 2026-11-12 — lote 0 — 🟢 Aprovado; o lote 1 espera a aprovação do ADR-026 e do ADR-027 pelo dono

**Conferido por mim:** `specs/adr/027-paleta-do-tema-paleta-por-cima-e-paletas-salvas-no-design.md` inteiro e a linha em
`specs/adr/README.md`.
- As decisões 0.1 a 0.3 estão registradas como o dono as tomou, com quatro alternativas e o custo de cada uma.
- O ADR-026 é citado como premissa, sem repetir o formato dele.
- A §2.4 diz como o toggle e a lista são gravados no formato do 026 e o que o lote 2 confere: a igualdade profunda da lista e a
  regra L1, que não pode tocá-la.
- "Atalho de marca" existe no painel (`ThemeDecisionList.test.tsx:21`).

Um erro de fato, nascido na minha §1 desta plan e copiado no ADR: "6 dos 19 declaram `colorPalette`, os outros 13 declaram as
cores direto". Medi pelo `SARAK_ALL_THEMES` real: os 23 temas declaram `colorPalette`, e a trava `themePalettes.test.ts` já o
exigia; 11 deles declaram também de 8 a 24 papéis de cor por cima. Corrigi a §1 desta plan e o §1 do ADR. Nenhuma decisão
muda.

**Para o lote 1:** como todo tema declara paleta, "ligar o toggle sem paleta escolhida antes vale a paleta vigente" (ADR,
Consequências) sempre tem valor. Mas, nos 11 temas com papéis declarados por cima, a troca de tema com o toggle ligado leva
só a paleta, não esses papéis: a cor na tela antes da troca não é exatamente a que segue. O lote 1 trata e testa esse caso, e
o painel o diz quando acontece.

`npm run -s verify -- --tier=docs` verde depois das correções.

**Status da plan: 🟡 Em execução** (lotes 1 e 2 esperam o ADR-026, o ADR-027, a `plan-158` e a `plan-160`).

## Nota do revisor — 2026-11-12 — prévia HTML para o dono aprovar

A pedido do dono, como nas campanhas anteriores: ao fim de os lotes de código, o executor gera `C:\tmp\sarak-previa-164\index.html`
com capturas reais do `dist/` ou do código-fonte (como as prévias da 136 a 149), mostrando um tema de cor declarada com e sem "Manter minha paleta", trocando de tema; salvar, escolher e recarregar uma paleta salva. O resumo do lote dá o caminho.
O revisor confere a prévia antes do veredito, e o lote só fecha com o ok do dono nela (critério acrescentado à §6). A projeção da
campanha inteira, feita à mão, está em `C:\tmp\sarak-previa-campanha-9\index.html`: é referência de intenção, não de pixel.

## Nota do revisor — 2026-11-16 — as plans citadas foram sintetizadas

As `plan-158`, `plan-160`, `plan-163` e `plan-165` foram sintetizadas e removidas. Toda citação a elas nesta plan passa a valer
pela spec fixa:
- `plan-158` → [[09-temas-e-presets]] §4.3.3 e §4.4.1–4.4.2 (o que se grava), [[06-painel-de-customizacao-e-preview]] §4 e §4.1 (sair com rascunho, desempenho) e o ADR-026.
- `plan-160` → [[06-painel-de-customizacao-e-preview]] §2.4, §6.2–6.6 (a prévia, a espiada, as telas por grupo).
- `plan-163` → [[09-temas-e-presets]] §4.3.4 e §5 (paletas, régua de deslocamento, contraste).
- `plan-165` → [[05-cromo-e-slots]] §2.1.4, §2.2 e §2.4 (anatomia da barra lateral) e [[09-temas-e-presets]] §4.3.4 (faixas da marca).

O código delas está no `HEAD`. Ao executar, leia a spec fixa, e não a plan. `depende_de` fica vazio: nada mais bloqueia esta
plan por dependência de outra plan.
