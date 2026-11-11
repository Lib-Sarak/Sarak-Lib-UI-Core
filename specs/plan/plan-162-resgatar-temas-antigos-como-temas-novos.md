---
tipo: "plan"
titulo: "Resgatar os sete temas originais como temas novos e tirar o Synthwave Retro"
objetivo: "Fazer o catálogo embarcado oferecer, como temas novos e o mais próximos possível do original, os sete temas da lib antiga (Sarak Sovereign, Cyberpunk Neon, Industrial Terminal, Nature Breeze, Neo Brutalism, Dot Matrix Elegant e Cyber Retro-Wave 2077), sem mudar nenhum tema atual e sem o Synthwave Retro na lista"
dominio: "Design Engine / Catálogo de temas"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "temas", "catalogo", "resgate"]
relacionados: ["[[09-temas-e-presets]]", "[[024-paleta-calculada-separada-do-tema]]", "[[022-tema-sob-demanda]]", "[[03-versionamento-e-release]]"]
depende_de: "—"
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md"
---

# 1. Objetivo

O catálogo ganha sete temas que reproduzem, o mais perto possível, os temas da lib antiga (cores, fontes, forma, barra, densidade), com
as diferenças inevitáveis do contrato de token atual nomeadas; nenhum tema que existe hoje muda; e o Synthwave Retro sai da lista.

# 2. Contexto

**Pedido e decisões do dono (2026-11-10).** As versões antigas tinham temas ótimos; o objetivo é resgatá-los "o mais próximo possível",
sabendo que os tokens mudaram e muitos foram criados. **Os sete são temas novos**, mesmo os que têm homônimo na lib: os atuais estão
muito diferentes e **ficam como estão** (opção C, escolhida pelo dono: nome e id novos para o resgatado, o atual intocado). O Synthwave
Retro atual sai. As paletas são outra plan (`plan-163`).

**Onde estão os originais.** O sistema "Novo" (`C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\ZP\Automacao-relatorios\Novo\`, no ar em
`127.0.0.1:5280/mx-customization`) usa a lib no commit **`7c4dbaed`** (2026-06-10, anterior à `v1.0.0`;
`modules/painel-web/package.json:23`). Os arquivos dos temas desse commit estão no Git deste repositório:
`git show 7c4dbaed:src/core/Design/presets/themes/<id>.ts`. O revisor tirou do painel antigo (aba de modelos) o `design` de cada um,
como o Novo o aplica, e fotografou cada tema aplicado no Novo, a 1440×900:

- JSON aplicado (fonte de verdade do valor): `specs/plan/anexos/plan-162-temas-antigos/<id-antigo>.json`.
- Fotos (referência visual, fora do repositório pelo peso): `C:\tmp\sarak-temas-antigos\antigo-<id-antigo>.png` (tela Design Engine) e
  `antigo-<id-antigo>-pagina.png` (página "Sessões TCE-SP").

| Tema original | Id antigo | Homônimo hoje | Nome e id propostos (o lote 0 confirma com o dono) | Primária | Navegação |
|---|---|---|---|---|---|
| Sarak Sovereign | `sarak-sovereign` | sim (tema do boot) | Sarak Sovereign Classic · `sarak-sovereign-classic` | `#00f2ff` | sidebar |
| Cyberpunk Neon | `cyberpunk-neon` | sim | Cyberpunk Neon Classic · `cyberpunk-neon-classic` | `#00ff41` | sidebar |
| Industrial Terminal | `industrial-terminal` | sim | Industrial Terminal Classic · `industrial-terminal-classic` | `#ff9900` | sidebar |
| Nature Breeze | `nature-breeze` | não | Nature Breeze · `nature-breeze` | `#2e7d32` | sidebar |
| Neo Brutalism | `neo-brutalism` | sim | Neo Brutalism Classic · `neo-brutalism-classic` | `#ff0000` | topbar |
| Dot Matrix Elegant | `dot-matrix-elegant` | não | Dot Matrix Elegant · `dot-matrix-elegant` | `#d4af37` | sidebar |
| Cyber Retro-Wave 2077 | `cyber-retro-wave` | sim | Cyber Retro-Wave 2077 Classic · `cyber-retro-wave-classic` | `#ff00ff` | sidebar |

**O que mudou desde então e pesa no resgate:** os temas atuais têm contraparte clara autorada (09 §2.1), cor por paleta calculada
(09 §4.3.4, ADR-024), tom de barra declarado e ligado a uma Personalidade (`themeBars.test.ts`), todo token estético declarado e
nenhum funcional (09 §5.3), contraste auditado (09 §6.5), diversidade medida (09 §5.2), teto de peso por tema e boot só com o padrão
(09 §4.3.2). Os originais são só escuros; **a contraparte clara de cada um é desenho novo**, sem original para comparar. Como os sete
entram como temas novos, carregados sob demanda, o boot e o tema padrão (`sarak-sovereign` atual) não mudam.

**Synthwave Retro.** O id `synthwave-retro` pode estar gravado em importador. O gate `minor-no-removal` não vê remoção de tema (só
nomes exportados e ícones), mas tirar o id muda o comportamento de quem o tem gravado (09 §4.3.2: id inexistente → aviso e tema
padrão). A paleta `rosa-synthwave` é outra coisa e fica para a `plan-163`.

**Diversidade.** Sete temas a mais, alguns perto de um tema atual (o resgatado e o homônimo); a trava de diversidade (09 §5.2) mede
distância entre temas e pode reprovar par muito próximo. O lote 0 mede antes de escrever.

# 3. Escopo

## 3.1 Dentro
- **Lote 0:** o anexo `specs/plan/anexos/plan-162-mapa-de-tokens.md` (novo). Leitura do commit `7c4dbaed` e dos JSONs.
- **Lotes 1 e 2:** sete arquivos novos em `src/core/Design/presets/themes/`; `all.ts`, `index.ts`, `loaders.ts` (registro dos novos);
  `catalog.generated.ts` (só pelo gerador `npm run themes:catalog`); o mapa tema → Personalidade de `themeBars.test.ts` e os testes de
  tema que listam ids; `docs/migracoes.md`.
- **Lote 3:** a saída do `synthwave-retro` da lista (`all.ts`, `index.ts`, `loaders.ts`, o arquivo do tema, os testes) e o tratamento
  do id gravado decidido no lote 0.
- Os gerados (`npm run themes:catalog`, `npm run guide`, `npm run dev-kit`).

## 3.2 Fora
- **Todo tema que existe hoje, inclusive os homônimos e o `sarak-sovereign` do boot:** nenhum valor muda.
- As paletas (`palette/presets.ts` e os nomes de paleta): `plan-163`.
- O motor de paleta (`resolve.ts`, `scale.ts`, `seeds.ts`, `role-map.ts`): o resgate usa o motor como é.
- Schema e tokens: nenhum token novo. Valor antigo de token que não existe mais vai para o mapa do lote 0, não volta ao schema.
- `compose.ts` e a persistência: `plan-158`. Presets de card gerados dos temas: `plan-161` (o lote 3 dela roda depois desta).
- Qualquer arquivo do Novo, do ERP ou dos logins.
- Versão e tag.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Spec fixa | `specs/09-temas-e-presets.md` §2, §2.1, §4.1, §4.3.2, §4.3.4, §4.4.4, §5 inteira, §6 inteira, §7 | contrato do tema, contraparte, derivação, boot, paleta, o que o tema declara, catálogo, travas, como passar sem warn |
| Spec fixa | `specs/03-versionamento-e-release.md` | o que é quebra e o nível da release |
| Spec fixa | `specs/00-regras-e-invariantes.md` | R6 e R17 |
| ADR | `adr/024-paleta-calculada-separada-do-tema.md` · `adr/022-tema-sob-demanda.md` | paleta × tema; tema sob demanda e boot |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| **Skill** | `ui-criar-tema` · `padrao-escrita` + `padrao-typescript` · `test-unitario` | criar tema que passa nas travas; escrita; testes |
| Código | `git show 7c4dbaed:src/core/Design/presets/themes/` (os sete arquivos) · `src/core/Design/presets/themes/` · `docs/migracoes.md` (histórico de token renomeado e removido) | os originais, o estado atual e o histórico de nomes |
| Anexo | `specs/plan/anexos/plan-162-temas-antigos/` (sete JSONs) · fotos em `C:\tmp\sarak-temas-antigos\` | o valor e a aparência de referência |
| Sistema (leitura e teste) | o Novo, lib antiga: http://127.0.0.1:5280/mx-customization | comparar ao vivo; o dono autoriza navegar e aplicar. O botão "Aplicar tema" do painel antigo entra em laço ("Maximum update depth exceeded"): aplique gravando o JSON em `localStorage['sarak-ui-design-v9.0']` e recarregando, e **restaure o valor original no fim** |

# 5. Instruções de execução

**Um lote por vez; cada lote termina com resumo num bloco novo da §9 e status 🟠.**

**Lote 0 — mapa e decisões (só documento).**
0.1. Para cada um dos sete temas, o anexo `plan-162-mapa-de-tokens.md` traz: cada token do original → o token atual que o recebe
(igual, renomeado, ou sem destino), e cada token atual que o original não tinha → o valor proposto e por quê. Use o histórico de
`docs/migracoes.md` para os renomeados.
0.2. Para cada tema: a cor original vira paleta calculada (`colorPalette` com as sementes do original) ou cor declarada? Escolha o que
deixa a tela mais perto da foto, e diga o custo (a paleta acompanha tom e modo; a cor declarada não).
0.3. A contraparte clara de cada tema: proposta de desenho, em uma frase por tema.
0.4. Nomes e ids: confirme a tabela da §2 (nenhum id colide com tema, tema salvo de importador conhecido ou id reservado), ou proponha
outra forma de distinguir do homônimo.
0.5. Diversidade: meça, com a trava da 09 §5.2, a distância de cada resgatado para o homônimo atual e para os outros; par que reprova
vai ao dono com a medida.
0.6. **`synthwave-retro`:** compare (A) remover o id, com quem o tem gravado caindo no tema padrão com aviso; (B) tirar da lista e
manter o id como apelido do tema mais próximo, sem aviso; (C) outra. Diga o efeito no nível da próxima versão (03).
0.7. Para o dono aprovar antes do lote 1: o anexo e as propostas 0.3 a 0.6. O revisor leva; sem aprovação, o lote 1 não começa.

**Lote 1 — Sarak Sovereign Classic, Cyberpunk Neon Classic, Industrial Terminal Classic e Cyber Retro-Wave 2077 Classic.**
1.1. Escreva cada tema a partir do original, pelo mapa aprovado, como arquivo novo. Todas as travas da 09 §6 verdes, sem warn (09 §7).
1.2. Compare com a referência: para cada tema, no harness de navegador da lib, a mesma composição das fotos (cromo + uma página com
título, texto e cartão), a 1440×900, registrada lado a lado com a foto. Diferença que não vem do contrato atual é defeito do lote.
1.3. Boot e peso: `theme-boot:check` e `boot:measure` verdes (os novos fora do boot); cole os números de peso por tema.

**Lote 2 — Nature Breeze, Dot Matrix Elegant e Neo Brutalism Classic.**
2.1. Mesmo procedimento do lote 1.
2.2. Diversidade (09 §5.2) verde com os sete a mais.

**Lote 3 — Synthwave Retro.**
3.1. Aplique a opção aprovada no 0.6. Teste: um design gravado com `activeThemeId: 'synthwave-retro'` carrega como a opção decidiu.
3.2. `docs/migracoes.md`: o que o importador com o tema gravado vê.

# 6. Critérios de aceite

- [ ] Mapa de tokens dos sete temas e as decisões 0.3 a 0.6 aprovados pelo dono antes do lote 1.
- [ ] Os sete no catálogo como temas novos, com os nomes e ids aprovados, cada um comparado lado a lado com a foto e com as diferenças
  nomeadas.
- [ ] Nenhum tema existente com valor alterado (`git diff` dos arquivos de tema atuais vazio, salvo o `synthwave-retro`).
- [ ] Contraparte clara de cada um, autorada.
- [ ] Travas da 09 §6 verdes sem warn; diversidade, peso por tema, boot e contraste verdes, com os números.
- [ ] `synthwave-retro` fora da lista, com o id gravado tratado como decidido e testado.
- [ ] `docs/migracoes.md` com os temas novos e o que saiu.
- [ ] Suíte completa verde; `tsc` 0; baseline sem regressão; Anel 1; `npm run build`.

# 7. Como verificar (uso do revisor)

**Gate:** teste — as travas de tema que já existem (09 §6) e o teste do id `synthwave-retro` gravado; nenhuma regra de gate nova.

- Lote 0: confiro três linhas do mapa contra `git show 7c4dbaed:...` e o JSON do anexo.
- Lotes 1 e 2: `git diff --stat` (nenhum tema atual tocado); abro as comparações lado a lado e, para dois temas escolhidos por mim,
  aplico o original no Novo (pelo `localStorage`, restaurando depois) e comparo com o resgatado; `npm run verify -- --tier=themes`,
  depois `--tier=full`.
- Lote 3: o teste do id gravado lido e rodado.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md`

- §5: os números derivados do catálogo (quantos temas, quais), os temas resgatados e a regra do id que sai da lista (a opção do 0.6).
- O anexo de mapa e os JSONs saem com a plan; as fotos em `C:\tmp\` são descartáveis.

---

# 9. Resumo da execução

<!-- Preenchido pelo EXECUTOR. Append-only: cada rodada acrescenta um bloco novo; nada é removido. -->

---

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->
