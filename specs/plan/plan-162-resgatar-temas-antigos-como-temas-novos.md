---
tipo: "plan"
titulo: "Resgatar os sete temas originais como temas novos e tirar o Synthwave Retro"
objetivo: "Fazer o catálogo embarcado oferecer, como temas novos e o mais próximos possível do original, os sete temas da lib antiga (Sarak Sovereign, Cyberpunk Neon, Industrial Terminal, Nature Breeze, Neo Brutalism, Dot Matrix Elegant e Cyber Retro-Wave 2077), sem mudar nenhum tema atual e sem o Synthwave Retro na lista"
dominio: "Design Engine / Catálogo de temas"
status: "🟢 Aprovado"
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

## Resumo da execução (lote 0) — 2026-11-11

**Resultado:** Concluído (lote 0 é só documento; o lote 1 não começa sem a aprovação do dono, 0.7). Nenhum arquivo de tema, de código ou de teste foi tocado.

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-158-design-gravado-guarda-escolhas-e-aplica-sem-atraso.md
 M specs/plan/plan-162-resgatar-temas-antigos-como-temas-novos.md
```
(Depois, durante a sessão, apareceram `package.json`, `package-lock.json`, `specs/adr/README.md`, `specs/plan/anexos/plan-157-catalogo-de-regras.md`, `specs/adr/026-…` e `src/verify/`: são das execuções em paralelo (plan-157 lote 1 e plan-158 lote 0), não os li nem os toquei.)

**O que foi feito**
- Criei `specs/plan/anexos/plan-162-mapa-de-tokens.md` (332 linhas): 0.1 mapa de tokens (§2 a §3.5, com a matriz de 99 tokens novos por tema), 0.2 paleta por tema (§4), 0.3 contraparte (§5), 0.4 nomes e ids (§6), 0.5 diversidade medida (§7), 0.6 `synthwave-retro` (§8), 0.7 as decisões D1 a D7 para o dono (§9) e o que a plan toca além da §3.1 (§10).
- Medi tudo por script (em diretório de rascunho fora do repositório), sobre o schema vivo e os JSONs do anexo; leitura do `7c4dbaed` por `git show` (só leitura).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `specs/plan/anexos/plan-162-mapa-de-tokens.md` | criado | o anexo do lote 0 |
| `specs/plan/plan-162-resgatar-temas-antigos-como-temas-novos.md` | alterado | este resumo e `status` 🟠 |

**Verificações executadas**
- Comparação `.ts` do `7c4dbaed` × JSON do anexo, chave a chave, nos sete temas → **0 chaves diferentes**; nenhum original tem `contraparte`.
- Classificação de cada chave dos sete JSONs contra `sarakGetAllDesignTokens()` (424 tokens: 339 estéticos, 85 funcionais), `REMOVED_TOKEN_KEYS` e `PALETTE_ROLE_MAP` (92 papéis) → contagens da §2 do anexo (ex.: 99 tokens novos a declarar no Sovereign e no Cyberpunk, 98 no Industrial, Nature e Neo Brutalism, 92 no Dot Matrix e no Retro-Wave).
- `auditTokenContract` sobre cada JSON original → 2 a 6 valores fora do contrato por tema (§3.4 do anexo); sobre a matriz de tokens novos proposta → **0 violações** (duas regras minhas violavam e foram corrigidas antes de gravar).
- `sarakResolvePalette('custom:analogous:…', claro|escuro)` para os sete, comparado ao original → §4.
- `measureTheme` + `evaluateDistanceCriteria` sobre os sete como candidatos contra os 19 atuais → critérios 1 a 7 reprovam, o 8 passa; as 7 combinações `cardTextureType + btnStyleType + headingFont` são inéditas (§7).
- Contagem de temas `neutral/neutral` fora do padrão: 3 hoje (o teto de `themeBars.test.ts`) → o mapa de Personalidades da §6 mantém 3.
- `node gates/scripts/contrato/check-trail-citation.mjs` → `[OK] Nenhuma linha adicionada cita plan…`.
- **Não rodei** `tsc`, suíte, baseline, `verify`: não há código (e a verificação completa é do revisor, §3 item 8 do prompt do executor).

**Critérios de aceite**
- [ ] Mapa de tokens e decisões 0.3 a 0.6 **aprovados pelo dono** antes do lote 1 — pendente: o anexo está pronto, a aprovação é do revisor/dono (0.7).
- [ ] Os demais critérios da §6 são dos lotes 1 a 3 — não começados, por desenho.

**Decisões e suposições**
- A leitura de "o mais próximo possível" fica em aberto em dois temas (D1): Nature Breeze e Neo Brutalism renderizam **escuros** no Novo apesar de o arquivo declarar valores claros (§1 do anexo). Propus nativo claro + escuro = foto; não escolhi por conta própria.
- Usei `analogous` como tipo das paletas `custom:` (com `sec=` e `acc=` o tipo não muda as sementes, medido).
- Para a matriz da §3.5 escolhi um mapa Personalidade que **cabe** nos tetos de `themeBars.test.ts` (corporate, operations, erp, soft, brutalist, executive, glass); o mais intuitivo (technical/editorial) estouraria o teto de 3 `neutral/neutral` (3 → 5).
- `searchPositionSidebar` do Dot Matrix é funcional: não declarar (corrigi uma primeira versão que o remapeava).
- Peso por tema (15 KB) não foi medido: só existe com o arquivo escrito (lote 1).

**Achados fora do escopo (não corrigidos)**
- `verify_diversity.ts`: o modo `--new` aplica critérios de uma campanha de cinco temas distintos (zero ciano/magenta, ≥ 25° do vizinho) que um resgate não pode cumprir; o anexo propõe tratar o resgate fora dele (D5), não alterar o script.
- `topbarShadow` tem como padrão do schema um brilho ciano (`rgba(25,227,240,0.14)`), que vale para todo tema que o omita; no anexo o tema novo o tinge com a própria primária.
- Os JSONs do anexo trazem chaves legadas do painel antigo (`colorPrimary`, `fontHeading`, `radiusTheme`…), só no Sovereign e no Industrial.

**Pendências / riscos**
- Sem a decisão do dono (D1 a D7 do anexo, §9) o lote 1 não pode começar; D1 e D6 mudam o desenho (modo nativo; o nível da release: B = minor, A = 9.0.0).
- A matriz de 99 tokens é **proposta mecânica** derivada do original e do schema; a conferência visual contra as fotos (1.2) só acontece com os temas escritos.

---

## Resumo da execução (lote 1) — 2026-11-11

**Resultado:** Concluído com pendências (1.2, a comparação lado a lado com as fotos, e `npm run build` não foram feitos; motivos abaixo).

**Estado do worktree ao iniciar**
```
(limpo)
```
(Durante a sessão apareceram, vindos de outras execuções e não tocados por mim: `dist/` apagado e recriado em parte, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts`, `src/features/DesignEngine/hooks/useDraftToast.ts`, `src/verify/**`, `specs/00-indice.md`, `specs/adr/026-…`, plan-158.)

**O que foi feito**
- Quatro temas novos em `src/core/Design/presets/themes/`: `sarak-sovereign-classic.ts`, `cyberpunk-neon-classic.ts`, `industrial-terminal-classic.ts`, `cyber-retro-wave-classic.ts` (~295 linhas cada). Gerados por script (fora do repositório) a partir do JSON original, da matriz de tokens do anexo e do schema vivo, e gravados como arquivos TypeScript comuns: valor do original onde o token existe; valor da matriz (§3.5 do anexo) onde o original não tinha; paleta `custom:analogous:<base>,sec=,acc=` com as sementes do original (D2); `contraparte` clara autorada com os 28 tokens de modo que a paleta não calcula. Cada `design` declara todo estético não-paleta (248 ou 249 chaves) e nenhum funcional.
- Registro: id em `index.ts`, linha em `all.ts`, `import()` em `loaders.ts`; `catalog.generated.ts` regenerado por `npm run themes:catalog` (23 temas).
- Testes: `themeSetCoverage.test.ts` (19 → 23), `compose.test.ts` (dois `19` → `23`), `themeBars.test.ts` (4 linhas no mapa da §6 do anexo), `themePalettes.test.ts` (aceita paleta `custom:` válida além do id de preset), `PresetsCatalog.test.tsx` (a busca por nome `/Sarak Sovereign/` passou a casar dois botões; agora `/Sarak Sovereign(?! Classic)/`) e seu snapshot (`-u`, só esse arquivo).
- `docs/migracoes.md`: entrada `## 9.0.0 — temas da lib antiga voltam ao catálogo…`; `npm run guide` regenerou `sarak-ui/` (kitHash, catálogo, cópia das migrações).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/themes/{sarak-sovereign,cyberpunk-neon,industrial-terminal}-classic.ts`, `cyber-retro-wave-classic.ts` | criados | os quatro temas |
| `src/core/Design/presets/themes/index.ts`, `all.ts`, `loaders.ts` | alterados | registro |
| `src/core/Design/presets/themes/catalog.generated.ts` | alterado (gerado) | +4 entradas |
| `src/core/Design/presets/themes/__tests__/{themeSetCoverage,compose,themeBars,themePalettes}.test.ts` | alterados | contagem 23, mapa de barras, paleta `custom:` |
| `src/features/DesignEngine/Canvas/components/__tests__/PresetsCatalog.test.tsx` e `__snapshots__/…snap` | alterados | busca por nome; snapshot com 4 cartões a mais |
| `docs/migracoes.md` | alterado | nota dos quatro temas |
| `sarak-ui/GUIA-FRONTEND.md`, `START-HERE.md`, `VERSION`, `catalog.json`, `docs/migracoes.md` | alterados (gerados) | `npm run guide` |

Nenhum arquivo de tema existente foi tocado (`git status` mostra só os quatro arquivos novos entre os temas).

**Verificações executadas**
- `npx vitest run Design/presets/themes` → 10 arquivos, 113 testes verdes (inclui `themeSetCoverage`, `themeBars`, `themePalettes`, `compose` com o par de contraste de cada tema nos dois modos, `contraparteReferencia`, `themeCatalogParity`).
- `npx vitest run tokenContractParity shippedThemesConsoleClean SarakMenuItem TemaSobDemanda PresetsCatalog themeBootClosure verify_diversity verify_contrast themeCatalog useResolvedThemeId useThemeReadiness chromeWidget` → 12 arquivos; falhou só `PresetsCatalog` (item acima); depois de corrigido, `PresetsCatalog` → 8 de 8.
- `npm run -s theme-completeness:check` → `23 de 23 temas completos; 0 em exceção`.
- `npm run -s themes:diversity` → cromo OK (itens ativos: 4 na lateral e 4 no topo; fundos 3 e 3). Linhas dos novos (modo · família · H · S · fundo L · raio · borda · blur · densidade): sovereign-classic escuro ciano 183/100/5/12/1/12 confortável; cyberpunk-classic escuro verde 144/100/5/0/1/12 confortável; industrial-classic escuro laranja 36/100/5/0/2/0 compacto; retro-wave-classic escuro magenta 300/100/3/0/2/16 confortável.
- `npm run -s boot:measure` → boot 395,3 KB gzip, teto 397,5 KB, `[OK]`; maior tema 5,9 KB gzip (`synthwave-retro`, teto 15 KB): os novos pesam menos que ele.
- `npm run -s audit:baseline -- --with-tsc` → `igual ao baseline de 2026-10-12 — nenhuma regressão` (inclui o `auditor_contraste` e o `tsc`).
- `themes:catalog:check`, `guide:check`, `dev-kit:check`, `catalog:check`, `zero-brand:check`, `barrel:check`, `trail-citation:check` → todos em dia/OK.
- `npm run -s theme-boot:check` → **falha**, mas só pela parte `dist/`: `marcador do tema "<id>" não aparece em nenhum arquivo de dist/`, porque o `dist/` está incompleto (sem `sarak.css`; outra execução o apagou e recria). A parte de `src/` do gate não acusou nada.

**Critérios de aceite** (os do lote 1; os da §6 que dependem dos lotes 2 e 3 ficam abertos)
- [x] Quatro temas novos no catálogo, com os nomes e ids aprovados — evidência: `catalog.generated.ts`, `index.ts`.
- [x] Todas as travas da 09 §6 verdes, sem warn — evidência: `tokenContractParity`, `shippedThemesConsoleClean`, `theme-completeness:check`, `audit:baseline`.
- [x] Nenhum tema existente com valor alterado — evidência: `git status` (nenhum arquivo de tema existente em modificação).
- [x] Contraparte clara de cada um, autorada — evidência: bloco `contraparte` de cada arquivo; `compose.test.ts` mede todo par nos dois modos.
- [x] Peso por tema — evidência: `boot:measure` acima.
- [ ] 1.2, comparação lado a lado com as fotos a 1440×900 — motivo: precisa do `dist/` e do harness de navegador (`themes:showcase`); o `dist/` está incompleto por outra execução. Nenhuma captura foi feita.
- [ ] `theme-boot:check` do `dist/` e `npm run build` — motivo: ver acima; não rodei o build para não disputar o `dist/` com a execução que o recria.

**Decisões e suposições**
- **Base do verde do Cyberpunk: `#00ff64`, não `#00ff41`.** Com `#00ff41` (e com todo verde puro que testei até `#00ff60`) o motor de paleta devolve `cardActionBtnText` sobre `cardActionBtnHoverBg` a 4,47:1 no claro, e `compose.test.ts` reprova; `#00ff64` é a primeira base que passa. O motor não se toca (§3.2). Resultado: H144 contra H145 do `cyberpunk-neon` atual, mais perto que os 10° medidos no lote 0. Registrado na nota de migração.
- **Texto corrido dos temas de texto colorido:** `themeSetCoverage` exige `titleColor` ≠ `textColorMaster`, e a paleta pinta o título com a primária; por isso o texto verde do Cyberpunk virou `#7dffa0` (claro `#0a3d14`) e o âmbar do Industrial `#ffc266` (claro `#4d2e00`), em vez do `#00ff41`/`#ff9900` do original. É a versão mais próxima que a regra aceita.
- **Teste de paleta aceita `custom:`** (`themePalettes.test.ts`): ele exigia id de preset, o que impediria a D2. A checagem agora aceita um `custom:` que `parsePaletteValue` reconheça.
- `#05030a` no fundo do Retro-Wave (nativo) e `#feeefc` na contraparte, como a §4 do anexo; Sovereign sem sobrescrita.
- Valores da contraparte clara: base comum (opacidades e sombras de modo claro, copiada do padrão dos temas atuais) mais ajuste por tema (Industrial sem sombra nem brilho; Cyberpunk e Retro-Wave com halo tingido). Não foi conferida visualmente.
- O `sarak-sovereign-classic` usa as barras da Personalidade `corporate` (D3), não os padrões do schema.
- `industrial-terminal-classic` fica com `bodySize 14px`, `btnStyleType matte`, `surfaceMaterial industrial`, `colorVariation 1` (D7).

**Achados fora do escopo (não corrigidos)**
- O motor de paleta reprova um par de contraste com bases de verde puro no modo claro (`cardActionBtnText` × `cardActionBtnHoverBg`, 4,47:1): vale uma plan própria se o dono quiser a primária `#00ff41` fiel.
- `PresetsCatalog.test.tsx` busca cartão por nome em regex: qualquer tema novo com o nome de outro como prefixo o quebra de novo.
- `topbarShadow` tem padrão ciano no schema (já registrado no lote 0).

**Pendências / riscos**
- 1.2 e o `npm run build` (e com ele `theme-boot:check` no `dist/`) ficam para depois da tarefa A. Até lá, a conferência visual dos quatro temas contra as fotos não existe; o resultado em tela (principalmente a contraparte clara) é a parte menos verificada do lote.
- A matriz de tokens novos é derivada por regra do original; o julgamento visual de cada valor (sombra, blur, raios) só vem com a comparação lado a lado.
- `sarak-ui/` e `docs/` gerados refletem o `src/` deste momento, que tem mudanças de outras execuções em andamento (`src/verify/**`); o `guide:check` pode voltar a acusar quando elas assentarem.

---

## Resumo da execução (correção 1) — 2026-11-12

**Resultado:** passo 1.2 executado; nenhum valor de tema alterado (divergências justificadas abaixo, duas para o dono decidir).

**Capturas:** `C:\tmp\plan162-lote1\<tema>__<dark|light>.png` — 8 arquivos (4 temas × 2 modos), 1440×900, `dist/` atual, cromo lateral. Referências: `C:\tmp\sarak-temas-antigos\<tema>-pagina.png` (só escuro).

**Como foram feitas:** a vitrine (`themes:showcase`) fixa 960 px de altura e captura a página inteira, então usei um script de fora do repositório com o mesmo harness (`showcase-entry.tsx`), a 1440×900. O harness quebra no Markdown (`node:process` vazio, `process.cwd is not a function`) em **qualquer** tema, inclusive `synthwave-retro`; no meu script remendei só o bundle temporário. Nada no repositório mudou.

**Composição:** não é idêntica à das fotos. As fotos mostram a tela "Sessões TCE-SP" do sistema antigo; a cena da vitrine tem cromo + título + texto + botões + campos + cartões. Compara-se tema, cor, fonte, cromo e cartão, não posição.

**Conferido nos 8 estados (sem divergência):** fonte de título e de corpo (Outfit/Inter, Space Mono-família do Cyberpunk e do Industrial, Orbitron/Chakra Petch — bate com os JSONs; a foto do Retro-Wave usou fonte de reserva); cor de marca (ciano, verde, âmbar, magenta); fundo escuro de cada um; cartão com a textura e o recorte do original (chanfro no Cyberpunk/Retro-Wave, listras no Industrial); botão e campo legíveis; a contraparte clara de cada tema é legível, sem texto perdido nem botão ilegível.

**Divergências (todas vêm do contrato atual, nenhuma é valor errado):**
1. **Barra lateral clara no escuro (Sovereign e Cyberpunk, `sidebarTone: 'inverse'`).** A foto tem barra escura. O tom vem da Personalidade mapeada na D3 (`corporate` e `operations`), e o `themeBars.test` exige o tom igual ao da Personalidade. Justificada pela D3; **fica para o dono**: se quiser a barra escura da foto, o caminho é outra Personalidade no mapa (ou `neutral`), não um ajuste de valor solto.
2. **Barra lateral colorida no Industrial (`secondary`, marrom) e no Retro-Wave (`surface`, verde-azulado escuro).** A foto tem barra quase preta. Mesma causa (D3, `erp` e `glass`); mesma decisão do dono.
3. **Título na cor primária, não branco (Sovereign, Cyberpunk, Retro-Wave).** O original tem `titleColor` e `textColorMaster` iguais (`#ffffff`); a `themeSetCoverage` exige título diferente do texto e a D2 deixa o título para a paleta calcular. Justificada pela D2 e pela trava; não declarei `titleColor` à mão porque ele entraria nas sobrescritas que a contraparte precisa espelhar.
4. **Texto verde/âmbar mais claro** (Cyberpunk `#7dffa0`, Industrial `#ffc266`): já aceito no veredito do lote 1 (D7).
5. **Retro-Wave claro: listras da textura fortes sobre a legenda muted** (`2 registros encontrados`). Legível e dentro do contraste medido (`verify_contrast`), mas é o ponto mais frágil das 8 telas; é a textura do original numa base clara.

**Verificação:**
- `npx vitest run src/core/Design/presets/themes PresetsCatalog` → 11 arquivos, 121 testes verdes.
- `npm run -s audit:baseline -- --with-tsc` → igual ao baseline, nenhuma regressão.
- `npm run guide`: não rodei; nenhum valor foi ajustado.

**Fora do escopo (achado):** o harness de navegador não renderiza o Markdown (`process.cwd`), o que derruba a cena `telas` do `themes:showcase` em todos os temas. Sem correção aqui.

## Resumo da execução (correção 2) — 2026-11-12

**Resultado:** os 4 temas foram ajustados por valor, sem tocar o motor nem tema existente. A captura escura reproduz a foto em fundo, barras, título, texto, cor de marca, borda e forma do cartão. Restam as divergências listadas abaixo.

**Capturas:** `C:\tmp\plan162-lote1\<tema>__<dark|light>.png` (8, 1440×900, `dist/` rebuildado com o `npm run build` completo) e, por tema, foto | escura | clara em `C:\tmp\plan162-lote1\lado-a-lado\<tema>.png`. O navegador do harness não estava em uso por outra execução (conferi os processos antes).

**O que mudou (por tema, só valores do tema; a foto venceu o JSON nos casos do anexo C de `plan-162-mapa-de-tokens.md`):**
- **Todos:** `sidebarColor` e `topbarColor` declarados (vencem o tom, §4.3.4; a Personalidade da D3 e o `themeBars.test` ficam); fundo declarado (`colorBgBody`, `colorBgLayer1/2`, `bgBaseColor`); título (`titleColor`, `cardTitleColor`, `topbarTitleColor`) distinto de `textColorMaster`; borda e fundo do cartão; contraparte espelha os valores que a paleta já calculava no claro.
- **Sovereign, Cyberpunk, Retro-Wave:** `bgGradientMode: 'none'` (foto de fundo chapado; era o gradiente azul-petróleo/verde/roxo).
- **Cyberpunk, Retro-Wave, Industrial:** `cardGeometricCut: 0` e raio 12 (Industrial 8); Industrial `cardTextureType: 'none'`.
- `themes:catalog` regenerado; snapshot do `PresetsCatalog` atualizado (só a miniatura do Sovereign Classic mudou: fundo e barra pretos).

**Divergências restantes (token responsável · justificativa):**
- **Todos — preenchimento do cartão:** na captura ele é cinza (~`#1c1c1c`), na foto é quase o fundo. Os `cardBackgroundColor` declarados não chegam até a tela; o preenchimento vem de outro token (`surfaceMaterial`/`cardSurfaceOpacity` ou da sobreposição do cartão da vitrine). **Causa não isolada**; não afeta borda nem forma, que não eram itens com sobra; fica para o revisor decidir se vira correção 3.
- **Sovereign — barra:** a captura tem o campo de busca e o rodapé em cinza-escuro, a foto os tem sem preenchimento (`searchBg`/rodapé da barra, calculados pela paleta); logotipo "Vitrine" no lugar do "Sarak OS" é do harness.
- **Cyberpunk — grade do fundo:** a grade existe (`texture: 'grid'`), mais fraca que a da foto (`textureOpacity: 0.1` já igual ao JSON; a foto tem a linha mais viva). Botões são os do original (`btnStyleType: 'cyberpunk'`, contorno verde).
- **Cyberpunk e Industrial — barra:** logotipo embaixo e item ativo em bloco claro (`sidebarLogoPlacement` e `sidebarActiveItemStyle` da Personalidade D3), a foto tem logotipo no topo e marcador fino.
- **Retro-Wave — fonte de título:** Orbitron (JSON) contra Arial em negrito na foto, que não carregou a fonte; não alterei (fonte não estava na lista).
- **Retro-Wave — brilho do título** (`textGlowIntensity: 0`): a foto tem brilho magenta; no tema ele está desligado.
- **Industrial — textura do fundo** (`texture: 'grid'`, `textureOpacity`): a foto não mostra a grade; mantida pelo JSON.
- **Composição:** a cena da vitrine não é a tela "Sessões TCE-SP" (cromo, título, texto, botões, campos, cartões em vez de abas e tabela).
- **Claro:** sem referência; legível nos 4, o Retro-Wave claro mantém as listras fortes sobre a legenda muted.

**Travas da 09 §6:** nenhuma recusou valor. `theme-completeness:check` 23/23; `themeSetCoverage` e `themeBars` verdes (título ≠ texto em todos).

**Verificação:**
- `npx vitest run src/core/Design/presets/themes PresetsCatalog` → 11 arquivos, 121 testes verdes.
- `npm run -s audit:baseline -- --with-tsc` → igual ao baseline.
- `npm run build` completo verde (guide:check, theme-boot:check, public-types incluídos); `boot:measure` 397,5 KB, maior tema 5,9 KB; `themes:diversity` OK.
- `npm run guide` rodado no fim; `guide:check` em dia (kitHash `f30040f4f632`).

**Efeito colateral:** o `npm run build` regrava o `dist/`, que o git rastreia e já estava modificado; não toquei em mais nada.

## Resumo da execução (correção 3) — 2026-11-12

**Resultado:** achados 5 e 6 tratados só por valor nos 4 arquivos `*-classic`; nenhuma trava recusou, motor e temas existentes intactos.

**Achado 5 (preenchimento do cartão):** a causa era o gradiente branco do material (`_card-materials.css`, `surfaceIntensity × 0.18 + glassOpacity × 0.4` no `frosted`; veio e bisel no `industrial`). No escuro de cada tema: `surfaceIntensity: 0.05` e `glassOpacity: 0` (a contraparte clara não mudou). O material de cada tema ficou o mesmo; o realce branco é que sumiu. Medido na captura escura (4 pontos por cartão), contra a cor declarada:

| Tema | Cor declarada | Medido na captura | Diferença |
|---|---|---|---|
| Sovereign | `#050505` | `#080808` | ~1 % |
| Cyberpunk | `rgba(0,255,100,.02)` sobre o fundo (~`#050e08`) | `#0a160e` | ~3 % |
| Industrial | `#080808` | `#090909` | ~1 % |
| Retro-Wave | `rgba(10,5,20,.8)` sobre o fundo (~`#09050f`) | `#090611` | ~1 % |

Todos abaixo de 4 % de luminosidade.

**Achado 6:**
- **Retro-Wave, brilho do título:** `textGlowIntensity` estava em 0,8 no escuro (o resumo da correção 2 errou ao dizer "desligado"); subi ao teto, 1. Na captura o título é claro com halo magenta, como na foto; a foto tem o halo um pouco mais largo (limite do token, não há valor acima de 1). O claro segue em 0.
- **Industrial, grade de fundo:** `texture: 'none'` (era `grid`, só no design; é token não dependente de modo).
- **Cyberpunk, grade:** **sem mudança de valor.** Medi a grade da foto (verde de 2 a 21) e a da captura (5 a 23) no mesmo recorte, e a captura mostra a grade com a mesma ou maior força (`textureOpacity: 0.1`, igual ao JSON). Aumentar a deixaria mais forte que a foto; a conclusão "mais fraca" da correção 2 veio da miniatura reduzida.

**Capturas:** as 8 refeitas em `C:\tmp\plan162-lote1\<tema>__<dark|light>.png` e as 4 imagens `C:\tmp\plan162-lote1\lado-a-lado\<tema>.png`, a 1440×900, com `npm run build` completo antes.

**Verificação:**
- `npx vitest run src/core/Design/presets/themes PresetsCatalog` → 11 arquivos, 121 testes verdes (snapshot do `PresetsCatalog` não mudou desta vez).
- `npm run -s audit:baseline -- --with-tsc` → igual ao baseline.
- `npm run build` verde; `themes:diversity` OK; `boot:measure` dentro do teto (maior tema 5,9 KB).
- `npm run guide` rodado no fim; `guide:check` em dia.

**Divergências que seguem (da correção 2, sem mudança):** campo de busca e rodapé da barra do Sovereign com preenchimento, logotipo embaixo e item ativo em bloco no Cyberpunk/Industrial (Personalidade D3), Orbitron contra a fonte de reserva da foto no Retro-Wave, e a composição da cena da vitrine.

## Resumo da execução (correção do achado 7) — 2026-11-12

**Resultado:** o `presetsReadable.test.ts` passa nos 4 temas e o `npm run verify` completo (nível `full`) está verde. Só valores dos 3 arquivos `*-classic` (Sovereign, Cyberpunk, Industrial); sem motor, sem teste afrouxado, sem baseline alterado. A barra escura da foto no modo nativo ficou como estava; nenhuma trava recusou valor.

**Causa:** na correção 1 declarei `sidebarColor` escuro no escuro (foto) e, na contraparte, o valor que a paleta calculava para o tom `inverse`, que no claro é uma barra **escura**. Os sete presets `sidebar-*` recompõem a paleta e planejam o par `textColorMaster` (escuro no claro) sobre `sidebarColor`; sobre uma barra escura ele reprova. O Retro-Wave passa porque o `sidebarColor` claro dele já era claro.

**Correção (só no claro e nos papéis de texto da barra):**
- `sidebarColor` da contraparte clara passou a ser claro (`#ddeced`, `#deeedf`, `#f1e7dd`, a camada 1 de cada tema).
- Ao mexer nisso vi, abrindo a captura clara, um efeito que o teste não pega: o tom `inverse` calcula texto, ícone, marca e rodapé para uma barra escura, então sobre a barra clara o logotipo e o ícone ficavam claro sobre claro (e, no escuro, o logotipo escuro sobre preto, já desde a correção 1). Declarei, nos dois modos, os nove papéis da barra com os valores que a paleta dá ao tom `neutral` (`sidebarItemTextColor`, `sidebarItemHoverTextColor`, `sidebarIconColor`, `sidebarCategoryColor`, `sidebarBrandColor`, `sidebarBrandBackground`, `sidebarHoverColor`, `sidebarActiveColor`, `sidebarFooterBackground`). No Industrial o escuro já estava legível (tom `secondary`), então ali o escuro repete o valor calculado e só o claro muda. O `sidebarTone` da Personalidade (D3) e o `themeBars.test` não mudaram.
- Cores dos valores: calculadas pela própria paleta (`composeThemeDesign` com `sidebarTone: 'neutral'`), nenhuma à mão.

**Capturas:** as 8 refeitas (`C:\tmp\plan162-lote1\<tema>__<dark|light>.png`) e as 4 imagens `lado-a-lado\`. Nas três claras a barra é clara, com texto, ícone e logotipo legíveis; as escuras seguem pretas como a foto, agora com o logotipo e o ícone visíveis. As divergências já aceitas seguem (busca e rodapé do Sovereign, logotipo e item ativo da D3, fonte do Retro-Wave, composição).

**Verificação:**
- `npx vitest run src/core/Design/presets PresetsCatalog` → 16 arquivos, 314 testes verdes.
- `theme-completeness:check` 23/23; `themes:catalog` regenerado; `npm run guide` rodado, `guide:check` em dia.
- `npm run build` completo verde.
- `npm run verify` completo (saída em `C:\tmp\plan162-lote1\verify.log`): `nível "full" verde`, exit 0.
- `npm run -s audit:baseline -- --with-tsc` → igual ao baseline.

# 10. Veredito

<!-- Preenchido pelo REVISOR. Append-only: um bloco por rodada, com o que foi verificado e como. -->

## Veredito — 2026-11-11 — lote 0 — 🟢 Aprovado; o lote 1 espera as decisões D1 a D7 do dono

**Conferido por mim:** só documento (`specs/plan/anexos/plan-162-mapa-de-tokens.md` e esta plan); nenhum tema tocado. Três afirmações
que sustentam as decisões, medidas: `themeBars.test.ts:45` limita a 3 os temas `neutral/neutral` (D3); `themeSetCoverage.test.ts:58`
fixa `SARAK_ALL_THEMES.length` em 19 (§10 do anexo); e `git show 7c4dbaed:` de `nature-breeze.ts` e `neo-brutalism.ts` declara
`bgBaseColor` claro (`#f4fbf7`, `#f0f0f0`) e texto escuro com `mode: "dark"` e `colorBgBody: "#050505"` (D1, §1 do anexo). O anexo
responde 0.1 a 0.6 com medida e separa o que é decisão do dono (§9). Corrigi um id na tabela da §7 do anexo
(`dot-matrix-elegant-classic` → `dot-matrix-elegant`, o id da plan e do D4).

**Status da plan: 🟡 Em execução** (lote 1 aguardando D1 a D7).

## Nota do revisor — 2026-11-11 — decisões do dono sobre o lote 0 (§9 do anexo)

- **D1:** Nature Breeze e Neo Brutalism Classic com modo nativo **claro** (a intenção do arquivo) e a contraparte escura reproduzindo a
  foto.
- **D2:** paleta calculada nos sete, com as sobrescritas da §4 do anexo.
- **D3:** o mapa tema → Personalidade da §6 do anexo.
- **D4:** os nomes e ids da §2 desta plan.
- **D5:** o resgate fica fora dos critérios de `--new`; mede-se por `themes:diversity` e `themeSetCoverage`, e o lote 1 registra a
  tabela da §7 do anexo com os números finais.
- **D6: opção A** — o `synthwave-retro` é removido; quem o tiver gravado cai no tema padrão com o aviso da 09 §4.3. Consequência
  aceita pelo dono: o tipo público perde um literal e **a próxima versão é `9.0.0`**; o lote 3 escreve a nota `## 9.0.0` em
  `docs/migracoes.md`, com o que o importador com o id gravado vê.
- **D7:** o original se ajusta ao padrão atual, como a §3.4 do anexo propõe (Industrial `14px`; `btnStyleType` pelos nomes atuais; o
  botão primário do Dot Matrix dourado).

**Lote 1 liberado.**

## Veredito — 2026-11-12 — lote 1 — 🔵 Em correção (1 achado)

**Conferido por mim:**
- `git status`: nenhum arquivo de tema existente alterado; só os 4 temas novos e os registros.
- `npx vitest run src/core/Design/presets/themes PresetsCatalog` → 11 arquivos, 121 testes verdes.
- A relaxação de `themePalettes.test.ts` não afrouxa o que já valia: o `custom:` é aceito só se `parsePaletteValue` o reconhece,
  e o preset continua exigido para o resto.
- `npm run build` **completo**, rodado por mim depois da tarefa direta do `DraftToast`: termina com exit 0, `theme-boot:check`
  verde e os 4 `*-classic` no `dist/`. O bloqueio relatado era o `dist/` incompleto, não os temas.
- As duas mudanças de cor ficam aceitas pela D7 ("ajuste para manter o padrão atual") e vão ao dono no relatório do revisor:
  - a base do Cyberpunk passa a `#00ff64`, porque o `#00ff41` reprova o contraste no claro;
  - o texto corrido do Cyberpunk e do Industrial deixa de ser a primária pura.

1. **Passo 1.2 não feito** — a comparação lado a lado com as fotos a 1440×900, critério do lote 1 (§4, passo 1.2). Sem ela, não há
   evidência de que os temas reproduzem as referências, e a contraparte clara não foi vista em tela. O motivo dado (o `dist/`
   incompleto) não existe mais. Correção: executar o 1.2 com o `dist/` atual, para os 4 temas, nos dois modos, e anexar as capturas
   (ou o caminho delas em `C:\tmp`) ao resumo da correção 1. Divergência visível vira ajuste de valor no tema, sem tocar o motor.
   Pronto quando as 8 capturas estiverem conferidas, cada divergência anotada (corrigida ou justificada) e o vitest dos temas
   seguir verde.

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-12 — correção 1 (lote 1) — 🔴 Reprovado (achados 2 a 4)

**Conferido por mim:** abri as capturas escuras do Sovereign, do Cyberpunk e do Industrial ao lado das fotos
(`C:\tmp\plan162-lote1\*__dark.png` × `C:\tmp\sarak-temas-antigos\*-pagina.png`) e li as cores dos JSONs originais do anexo.
O vitest dos temas segue verde. O passo 1.2 foi executado, mas a conclusão dele não confere com as imagens.

2. **"Sem divergência" que diverge.** O resumo dá como conferidos cartão, fundo e cor; nas imagens:

   | Tema | Foto | Captura |
   |---|---|---|
   | Sovereign | fundo quase preto (`#0a0a0c`) | gradiente azul-petróleo |
   | Sovereign | título branco | título ciano |
   | Sovereign | botão secundário escuro neutro | botão secundário roxo |
   | Cyberpunk | fundo preto com grade verde | gradiente verde, sem grade |
   | Cyberpunk | cartão de canto arredondado | cartão chanfrado |
   | Cyberpunk | título branco | título verde |
   | Industrial | cartão liso | cartão listrado |
   | Industrial | título e texto creme | título laranja e texto âmbar |

   O título laranja do Industrial nem entrou na lista de divergências. O Retro-Wave não foi conferido por mim e vale o mesmo
   critério.

   Critério: §4, passo 1.2 ("divergência visível vira ajuste de valor no tema") e o achado 1 deste veredito.

3. **Divergência de valor classificada como contrato.** Os itens 1 a 3 do resumo têm saída por valor, sem decisão do dono e sem
   tocar o motor:
   - **Barra lateral:** cor de barra declarada pelo tema vence o tom ([[09-temas-e-presets]] §4.3.4). Declarar o
     `sidebarColor` e o `topbarColor` da foto mantém a Personalidade da D3 e o `themeBars.test`.
   - **Título:** declarar o `titleColor` da foto e um texto corrido claro distinto dele (ex.: quase branco) satisfaz o
     `themeSetCoverage` (título ≠ texto). A contraparte espelha o que for declarado, como a §4 do anexo já faz.
   - **Fundo, secundário, grade e cartão:** achar o token que tinge (cálculo da paleta, atmosfera, gradiente, material ou
     recorte do cartão) e declarar o valor da foto.

   Se uma trava da 09 §6 recusar um desses valores, reporte a trava e o valor. Não a contorne.

4. **Referência quando o JSON e a foto discordam.** O `industrial-terminal.json` declara título e texto `#ff9900`, mas a foto
   mostra creme. Vale a **foto** para o modo nativo: é o que o sistema antigo pintava, e é o que a D1 já tomou como referência.
   Registre no anexo, por tema, cada caso em que a foto venceu o JSON.

**Correção:**
- ajustar os 4 temas até a captura escura reproduzir a foto em: fundo, barra lateral, título, texto, cor de marca,
  botões, borda e forma do cartão;
- refazer as 8 capturas e montar, por tema, **uma imagem lado a lado** (foto | captura escura | captura clara) em
  `C:\tmp\plan162-lote1\lado-a-lado\`.

Pronto quando:
- a lista de divergências restantes, por tema, cita cada uma com o token responsável e a justificativa;
- o vitest de `src/core/Design/presets/themes` e `PresetsCatalog` está verde;
- o `audit:baseline -- --with-tsc` está igual ao baseline;
- `npm run guide` foi rodado se algum valor mudou.

**Fora do escopo, encaminhado:** a cena `telas` do `themes:showcase` quebra no Markdown (`process.cwd`) em qualquer tema. Isso
foi relatado pelo executor, não medido por mim; vai ao backlog (#75).

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-12 — correção 2 (lote 1) — 🔴 Reprovado (achados 5 e 6); a forma geral está aceita

**Conferido por mim:** as 4 imagens de `C:\tmp\plan162-lote1\lado-a-lado\`. A captura escura agora reproduz a foto em fundo
chapado, barras pretas, título claro, cor de marca, botões e forma do cartão (sem chanfro, sem listras). Os achados 2 a 4 estão
resolvidos. Aceitas como justificadas:
- o logotipo embaixo e o item ativo em bloco (Personalidade da D3, decisão do dono);
- a fonte do Retro-Wave (a foto não carregou a Orbitron);
- a busca e o rodapé da barra do Sovereign;
- a composição da vitrine;
- o modo claro sem referência.

5. **Preenchimento do cartão cinza nos 4 temas — a causa está isolada, e é valor do tema.** Na foto o cartão é quase o fundo; na
   captura é cinza. O material de superfície pinta um gradiente branco por cima da cor do cartão
   (`src/styles/_card-materials.css:32-36`, `frosted`: `surfaceIntensity × 0,18 + glassOpacity × 0,4`; com 0,5 e 0,5 dá cerca de
   29% de branco).
   - Sovereign, Cyberpunk e Retro-Wave usam `frosted`.
   - O Industrial usa `industrial`, que acrescenta veio e bisel, e o JSON dele pedia `solid` (`:40-44`).

   Correção: em cada tema, `surfaceMaterial`, `surfaceIntensity` e `glassOpacity` que deixem o cartão como na foto (ex.:
   `organic`, ou intensidade baixa). Pronto quando o preenchimento na captura fica a menos de ~4% de luminosidade do fundo do
   cartão declarado.

6. **Duas sobras sem justificativa, contra a regra "a foto vence o JSON" (achado 4):**
   - o Retro-Wave tem `textGlowIntensity: 0`, e a foto tem brilho magenta marcante no título;
   - o Industrial mantém `texture: 'grid'` "pelo JSON", e a foto não mostra grade.

   A grade do Cyberpunk "mais fraca que a da foto" entra no mesmo critério: subir a `textureOpacity` até a linha ficar visível
   como na foto, se nenhuma trava recusar.

Correção curta: só valores nos 4 arquivos de tema, as mesmas 8 capturas e as 4 imagens lado a lado refeitas, vitest dos temas
verde, `audit:baseline -- --with-tsc` igual e `npm run guide` no fim.

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-12 — correção 3 (lote 1) — 🟢 Aprovado; o lote 2 segue

**Conferido por mim:**
- `git status`: nenhum tema existente alterado; os 4 `*-classic` só em valor (`surfaceIntensity: 0.05` e `glassOpacity: 0` no escuro dos quatro; `textGlowIntensity: 1` no escuro do Retro-Wave; `texture: 'none'` no Industrial; `textureOpacity: 0.1` do Cyberpunk mantido).
- As 4 imagens de `C:\tmp\plan162-lote1\lado-a-lado\`, abertas por mim: cartão escuro quase igual ao fundo nos 4 (sem o realce cinza); título do Retro-Wave com halo magenta; Industrial sem grade; grade do Cyberpunk visível na captura escura.
- `npx vitest run src/core/Design/presets/themes PresetsCatalog` → 11 arquivos, 121 testes verdes.
- `npm run -s audit:baseline -- --with-tsc` → igual ao baseline; `guide:check` e `plan-index:check` em dia.
- Achado 6 (Cyberpunk): aceito sem mudança de valor. A captura mostra a grade com força comparável à da foto, e o executor registrou a medida; subir a `textureOpacity` a deixaria mais forte que a referência.

Divergências que seguem, já aceitas nos vereditos anteriores: barra do Sovereign (busca e rodapé), logotipo e item ativo (D3), fonte do Retro-Wave, composição da vitrine, modo claro sem referência.

**Lote 1: aprovado.** Status da plan: 🟡 Em execução (lotes seguintes pendentes).

## Veredito — 2026-11-12 — lote 1 — 🔴 Reprovado depois da aprovação da correção 3 (achado 7)

O veredito 🟢 acima rodou só `themes` e `PresetsCatalog`. O `npm run verify` completo (nível `full`, rodado por mim depois) falha em um arquivo.

7. **`src/core/Design/presets/components/__tests__/presetsReadable.test.ts:58`** falha em 3 dos 4 temas novos: `sarak-sovereign-classic`,
   `cyberpunk-neon-classic` e `industrial-terminal-classic` (o `cyber-retro-wave-classic` passa). Todos os pares quebrados estão no **modo
   claro**, nos sete presets `sidebar-*` (`airy`, `clean`, `compact`, `floating`, `outlined`, `solid`, `textured`): `textColorMaster`,
   `textColorSecondary`, `textColorMuted`, sobre `sidebarColor>colorBgBody`, `sidebarHoverColor>…` e o `mix` de `statusErrorColor`. O
   preset recompõe a paleta com `sidebarColor` próprio e o texto da barra escura da contraparte clara fica ilegível sobre ele. A causa
   é valor da contraparte clara desses três temas (a barra escura declarada na correção 1). Critério violado: 09 §6, presets de
   componente legíveis sobre todo tema embarcado, nos dois modos. Os 121 testes de `themes` não o cobrem.

   Correção: ajustar a contraparte clara (ou o `sidebarTone`/`sidebarColor`) dos três temas, só por valor, para o teste passar sem
   afrouxá-lo nem alterar o baseline. Se isso desfizer a barra escura da foto, **reporte a trava e o valor** em vez de contornar.
   Pronto quando `npx vitest run src/core/Design/presets/components` passar; refazer as capturas claras dos três temas; e rodar
   `npm run verify` inteiro (é o único comando que acusa isto), redirecionando a saída para arquivo.

**Status da plan: 🔵 Em correção.**

## Veredito — 2026-11-12 — correção do achado 7 (lote 1) — 🟢 Aprovado; o lote 2 segue

**Conferido por mim:**
- Escopo: nos temas, só `sarak-sovereign-classic`, `cyberpunk-neon-classic` e `industrial-terminal-classic` mudaram depois do achado 7; Retro-Wave, motor e testes de tema intactos (o teste não foi afrouxado).
- Valores: `sidebarColor` da contraparte clara passou a claro (`#ddeced`, `#deeedf`, `#f1e7dd`); os papéis de texto, ícone e logotipo da barra declarados nos dois modos com os valores que a paleta calcula. `sidebarTone` (D3) inalterado.
- Capturas: as imagens lado a lado do Sovereign e do Industrial, abertas por mim — barra clara legível no claro, barra preta da foto mantida no escuro. As do Cyberpunk e do Retro-Wave não reabri nesta rodada.
- `npm run verify` completo, rodado por mim com a saída em arquivo: `tsc` ok, `vitest run` ok (1359 s), `audit:baseline --with-tsc` ok, todos os gates ok, `nível "full" verde`, exit 0. O `presetsReadable.test.ts` passa nos 4 temas.

**Lote 1: aprovado.** Status da plan: 🟡 Em execução (lotes seguintes pendentes).

## Nota do revisor — 2026-11-12 — lote 1 fechado (commit `5c0151a6`); o que o lote 2 aproveita

O lote 1 custou quatro rodadas. Os mesmos três tropeços valem para o lote 2:

- **Preenchimento do cartão.** O material `frosted` e o `industrial` pintam um gradiente branco por cima da cor do cartão
  (`src/styles/_card-materials.css`). Declarar a cor do cartão da foto não basta: ajuste `surfaceIntensity` e `glassOpacity` até a
  captura ficar a menos de ~4% de luminosidade da cor declarada.
- **Barra lateral no claro.** Os sete presets `sidebar-*` recompõem a paleta e medem `textColorMaster` sobre o `sidebarColor`; o teste
  `src/core/Design/presets/components/__tests__/presetsReadable.test.ts` falha se a contraparte clara tiver barra escura com texto
  escuro. O tom `inverse` calcula texto, ícone e logotipo para barra escura: com barra clara, declare os papéis da barra
  (`sidebarItemTextColor`, `sidebarIconColor`, `sidebarBrandColor` e os demais) com os valores do tom `neutral`.
- **Foto contra JSON.** Quando discordam, vale a foto para o modo nativo (registre o caso no anexo, por tema).

Rode, além do vitest de `themes` e de `PresetsCatalog`, `npx vitest run src/core/Design/presets/components`: só ele acusa o segundo
ponto. A verificação completa (`npm run verify`) é do revisor; se rodá-la, redirecione a saída para arquivo.

## Resumo da execução (lote 2) — 2026-11-12

**Resultado:** Concluído. Três temas novos (Nature Breeze, Neo Brutalism Classic, Dot Matrix Elegant); nenhum tema existente tocado. Pendência de limpeza: `git clean` do `dist/` foi bloqueado por hook (ver abaixo).

**Estado do worktree ao iniciar**
```
 M specs/00-indice.md
 M specs/plan/plan-160-previa-mostra-o-efeito-de-toda-opcao.md
 M specs/plan/plan-164-paleta-do-tema-paleta-por-cima-e-paletas-salvas.md
```
(Durante a sessão apareceram, de outra execução e não tocados por mim: `browser-tests/plan-160-previa-*`, `specs/adr/027-…`, `specs/adr/README.md`.)

**O que foi feito**
- Três arquivos novos em `src/core/Design/presets/themes/`: `nature-breeze.ts`, `neo-brutalism-classic.ts`, `dot-matrix-elegant.ts`, gerados por script fora do repositório a partir do JSON original, da matriz da §3.5 do anexo e das decisões D1 a D7. Paleta `custom:analogous:` com as sementes do original (D2); Personalidades `soft`, `brutalist`, `executive` (D3).
- Nature Breeze e Neo Brutalism Classic são **nativos claros** (D1); a contraparte escura reproduz a foto. Dot Matrix é nativo escuro, com contraparte clara (marfim/dourado-escuro da paleta).
- Registro: `index.ts`, `all.ts`, `loaders.ts`; `catalog.generated.ts` por `npm run themes:catalog` (26 temas). Testes: `themeSetCoverage` (23→26), `compose` (23→26), `themeBars` (3 linhas no mapa), snapshot do `PresetsCatalog` (`-u`, só esse arquivo).
- Anexo D em `plan-162-mapa-de-tokens.md`: cada caso em que a foto venceu o JSON.
- `npm run guide` rodado no fim (kit em dia).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/themes/{nature-breeze,neo-brutalism-classic,dot-matrix-elegant}.ts` | criados | os três temas |
| `themes/{index,all,loaders}.ts`, `catalog.generated.ts` | alterados | registro |
| `themes/__tests__/{themeSetCoverage,compose,themeBars}.test.ts` | alterados | contagem 26, mapa de Personalidades |
| `PresetsCatalog.test.tsx.snap` | alterado | 3 cartões a mais |
| `specs/plan/anexos/plan-162-mapa-de-tokens.md` | alterado | Anexo D |
| `sarak-ui/*` | alterados (gerados) | `npm run guide` |
| `sarak-dev/{GUIA-MANUTENCAO,START-HERE}.md`, `state.json` | alterados (gerados) | efeito colateral do `guide`: passou a listar a ADR 027 de outra execução |

**Verificações executadas**
- `npx vitest run src/core/Design/presets/themes src/core/Design/presets/components PresetsCatalog` → 16 arquivos, 323 testes verdes.
- `npm run -s audit:baseline -- --with-tsc` → igual ao baseline.
- `npm run build` → exit 0 (duas vezes: antes e depois do ajuste de valores do Dot Matrix); `theme-boot:check` e `guide:check` dentro dele.
- `npm run -s boot:measure` → teto relativo 397,9 KB, maior tema 5,9 KB (teto 15 KB), OK. `npm run -s themes:diversity` → cromo OK (4 estilos de item ativo na lateral e no topo; 3 fundos). `theme-completeness:check` → 26 de 26.
- Navegador: aguardei a execução da plan-160 (Playwright) terminar; só abri o meu quando não havia nenhum `chrome-headless` ativo. Capturas 1440×900, nos dois modos, em `C:\tmp\plan162-lote2\<tema>__<light|dark>.png`; imagens foto | nativo | contraparte em `C:\tmp\plan162-lote2\lado-a-lado\<tema>.png`.
- Cartão (medido no pixel, escuro): Nature `#090909` contra `#050505` declarado; Neo `#070707` contra `#050505`; Dot `#0c0c0c` contra ≈`#0a0a0a`. Todos abaixo de 4 %. Neo claro `#ffffff` = declarado. Nature claro: o cartão é a paleta (não declarado).

**Critérios de aceite**
- [x] Três temas no catálogo, nomes e ids aprovados — `index.ts`, `catalog.generated.ts`.
- [x] Contraparte autorada em cada um — bloco `contraparte`; `presetsReadable` e `compose` medem os dois modos.
- [x] Travas da 09 §6, diversidade, boot, peso — saídas acima.
- [x] Nenhum tema existente alterado — `git status`.
- [x] Lado a lado com a foto e diferenças nomeadas — abaixo.
- [ ] `git clean -fdq -- dist` — bloqueado pelo hook (`clean.force`); `git restore` de `dist/`, `src/buildInfo.ts`, `src/core/Provider/buildInfo.ts` foi feito, mas sobraram 24 arquivos novos e não rastreados em `dist/` (chunks hash-named e os três `nature-breeze-*`, `neo-brutalism-classic-*`, `dot-matrix-elegant-*`). O dono precisa rodar `git clean -fdq -- dist`.

**Decisões e suposições**
- **Barras declaradas com tom neutro.** O `presetsReadable` reprovou barra de tom `primary` (Neo, claro) e `secondary` (Dot Matrix, topo claro) com texto escuro. Declarei cor e papéis da barra com os valores do tom `neutral` nos dois modos (o `themePalettes` exige o mesmo conjunto de papéis nos dois modos). O tom da Personalidade (D3) não mudou.
- **Nature Breeze declara 12 cores no claro** que só repetem o valor que a paleta calcula, porque a trava de paleta exige o mesmo conjunto nos dois modos.
- **Neo Brutalism Classic claro:** texto `#0a0a0a` e título `#000000` (a trava exige título ≠ texto); o anexo pedia `#000000` no texto.
- **Neo escuro:** borda `#3a3a3a` com 4 px (espessura é token sem modo) e sombra dura vermelha, como a §5 do anexo; a foto tem fio cinza de 1 px com canto 12.
- `texture: 'none'` (Nature) e `bgGradientMode: 'none'` (os três): a foto mostra fundo chapado.

**Divergências contra a foto (token · justificativa)**
- Nature escuro: sidebar sem painel arredondado de vidro (`sidebarBlur`/forma vêm da Personalidade `soft`); logotipo "Vitrine" e fonte do corpo do harness.
- Neo escuro: cartão com borda de 4 px e sombra vermelha, a foto tem 1 px sem sombra (identidade do tema, ver acima); a navegação no topo da foto é funcional (a vitrine usa a lateral); `textureOpacity`: grade mais visível no claro (0,25, sem referência).
- Dot Matrix: foto tem a barra lateral sem preenchimento, o tema a pinta `#050505` com o item ativo em pílula dourada (Personalidade `executive`, D3).
- Composição: a cena da vitrine não é a tela "Sessões TCE-SP".
- Claro de Nature e Dot Matrix e escuro de Neo/Nature: sem referência além da foto escura; legíveis.

**Achados fora do escopo (não corrigidos)**
- `themes:showcase`/harness: o `process.cwd` do Markdown continua quebrando a cena `telas` (já no backlog #75); no meu script remendei só o bundle temporário.
- O `npm run guide` regenera `sarak-dev/` e passa a refletir arquivos de outras execuções (ADR 027).

**Pendências / riscos**
- `git clean` do `dist/` (acima).
- `npm run verify` completo não foi rodado (é do revisor).

## Veredito — 2026-11-12 — lote 2 — 🔴 Reprovado (achados 8 e 9; curtos)

**Conferido por mim:**
- As 3 imagens de `C:\tmp\plan162-lote2\lado-a-lado\` ao lado das fotos.
- `npx vitest run src/core/Design/presets/themes src/core/Design/presets/components PresetsCatalog` → 16 arquivos, 323 testes verdes.
- `git status`: nenhum tema existente tocado.
- Nature Breeze (contraparte escura) e Dot Matrix (nativo escuro) reproduzem a foto em fundo, barra, título, texto, marca e
  cartão. A medida do preenchimento do cartão no pixel (<4%) foi registrada.
- Aceitas como justificadas: as barras declaradas com valores do tom `neutral` (trava `presetsReadable`); o título ≠ texto do
  Neo claro; a barra pintada do Dot Matrix e a forma da barra do Nature (Personalidade da D3); a composição da vitrine.

8. **Neo Brutalism Classic, contraparte escura, não reproduz a foto (D1).** A foto tem cartão com fio cinza fino, canto
   arredondado e **sem sombra**. A captura tem borda de 4 px e sombra dura vermelha `8px 8px 0px #ff0000` (`contraparte`).

   O executor seguiu a §5 do anexo (`plan-162-mapa-de-tokens.md:250`, "borda grossa e vermelho vivo; a sombra dura passa a ser
   na cor da primária"). Essa frase, aprovada por mim no lote 0, contradiz a foto: o erro é do anexo, e eu o corrijo neste
   veredito.

   O que dá por valor: a sombra está na `contraparte`, então varia por modo, e no escuro ela sai (`cardShadow` sem sombra, como a
   foto). A espessura (`cardBorderWidth`) não tem modo, e os 4 px do nativo claro (a identidade brutalista) ficam nos dois; no
   escuro, a cor da borda se aproxima do fio da foto. Esse resto é limite do contrato e vai nomeado como divergência.

9. **Dot Matrix: a malha de pontos do fundo está fraca no nativo.** O `design` (escuro, nativo) tem `textureOpacity: 0.08`, e a
   contraparte clara tem `0.15`. O JSON pede 0,15, e a foto mostra a malha visível no escuro. Os valores parecem trocados de
   modo. Correção: o nativo segue a foto e o JSON; a contraparte, o que for legível no claro.

Pronto quando a captura e a imagem lado a lado dos dois temas forem refeitas e o vitest acima seguir verde.

**Pendência do dono, não do executor:** o hook bloqueou o `git clean`, e sobraram 24 arquivos não rastreados em `dist/`. Rodar
`git clean -fdq -- dist` antes do commit.

**Status da plan: 🔵 Em correção.**

## Resumo da execução (correção do lote 2) — 2026-11-12

**Resultado:** Concluído

**Estado do worktree ao iniciar**
Os mesmos arquivos do fim do lote 2 (temas novos, registros, anexo, guia), mais `browser-tests/plan-160-*`, `specs/adr/027-…` e `specs/plan/plan-160-…`/`plan-164-…` de outras execuções; 24 arquivos não rastreados em `dist/` (do lote 2). Nenhum chrome-headless em execução ao abrir o navegador.

**O que foi feito**
- **Achado 8** — `neo-brutalism-classic.ts` (`contraparte`): `cardShadow` de `8px 8px 0px #ff0000` para `'none'`; `cardBorderColor`, `sidebarBorderColor` e `topbarBorderColor` de `#3a3a3a` para `#343434`, o fio medido na foto (pixel `#343434` na borda do cartão). A espessura (`cardBorderWidth: 4`) não muda: não tem modo. Comentário do cabeçalho e `description` ajustados (já não citam sombra vermelha).
- **Achado 9** — `dot-matrix-elegant.ts`: `textureOpacity` do `design` (escuro, nativo) de 0,08 para 0,15 (foto e JSON); da `contraparte` (clara) de 0,15 para 0,08, que na captura fica legível sem pesar sobre o marfim. Comentário do cabeçalho ajustado.
- `catalog.generated.ts` regenerado (`npm run themes:catalog`, 26 temas); snapshot do `PresetsCatalog` atualizado com `-u` (as linhas do Neo escuro mudaram de borda e sombra).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/themes/neo-brutalism-classic.ts` | alterado | contraparte: sem sombra, fio `#343434` |
| `src/core/Design/presets/themes/dot-matrix-elegant.ts` | alterado | `textureOpacity` 0,15 no nativo escuro, 0,08 na contraparte clara |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetsCatalog.test.tsx.snap` | alterado | snapshot do Neo escuro |
| `sarak-ui/*` (via `npm run guide`) | alterado | kit regenerado; `sarak-dev/` não foi tocado desta vez |

**Verificações executadas**
- `npx vitest run src/core/Design/presets/themes src/core/Design/presets/components PresetsCatalog` → 322 de 323 verdes; a falha foi o snapshot do `PresetsCatalog` (esperada, valores do Neo escuro). Depois do `-u`, `PresetsCatalog` → 8 de 8 verdes; as outras 15 suítes (themes e components) já tinham passado na mesma execução.
- `npm run guide` → kit gerado, 143 componentes, 424 tokens.
- Capturas refeitas a 1440×900 nos dois modos de `neo-brutalism-classic` e `dot-matrix-elegant` em `C:\tmp\plan162-lote2\`; imagens foto | nativo | contraparte refeitas em `C:\tmp\plan162-lote2\lado-a-lado\` (os dois temas; a de Nature Breeze ficou como estava). Lidas: Neo escuro sem sombra, com fio cinza; Dot Matrix escuro com a malha visível; Dot Matrix claro legível.
- Build não rodado.

**Critérios de aceite**
- [x] Achado 8 — `neo-brutalism-classic.ts` contraparte, captura `neo-brutalism-classic__dark.png`.
- [x] Achado 9 — `dot-matrix-elegant.ts` `design` 0,15 / `contraparte` 0,08, capturas dos dois modos.
- [x] Capturas e lado a lado refeitos dos dois temas.
- [x] vitest de themes, components e PresetsCatalog verde; `npm run guide` rodado no fim.

**Decisões e suposições**
- **Captura sem build:** o harness lê `dist/index.js` por padrão, que estaria defasado e eu não podia rebuildar. Usei `buildHarness(…, { useSourceLibrary: true })` só no meu script de captura (fora do repositório), que lê o código-fonte atual.
- **Fio nas barras:** também troquei a borda da lateral e do topo escuros do Neo para `#343434`, para ficarem no mesmo fio do cartão da foto; o pedido citava só o cartão.
- **0,08 na contraparte clara do Dot Matrix:** valor escolhido pela captura, não medido contra referência (a foto não tem claro).
- **`cardShadow: 'none'` não zera a sombra:** o snapshot mostra que o cartão recebe `0 4px 10px -2px color-mix(var(--color-theme-body) 50%, transparent)`; sobre o fundo escuro, na cor do próprio fundo, a captura não mostra sombra visível. O Dot Matrix já se comportava assim.

**Divergências restantes contra a foto (nomeada)**
- **Neo escuro:** espessura da borda do cartão, 4 px contra o fio de 1 px da foto. `cardBorderWidth` não tem modo e os 4 px são a identidade do nativo claro. Limite do contrato.

**Achados fora do escopo (não corrigidos)**
- O Anexo D de `plan-162-mapa-de-tokens.md` (linhas 367-368) segue dizendo `cardBorderColor` `#3a3a3a` e `cardShadow` `8px 8px 0 #ff0000` no Neo escuro; agora são `#343434` e sem sombra. É spec e não foi tocado.

**Pendências / riscos**
- Os 24 arquivos não rastreados em `dist/` do lote 2 continuam lá (`git clean -fdq -- dist` é do dono); nenhum arquivo novo em `dist/` foi gerado agora.

## Veredito — 2026-11-12 — correção do lote 2 — 🟢 Aprovado; o lote 3 segue

**Conferido por mim:**
- Valores nos dois arquivos:
  - Neo, `contraparte`: `cardShadow: 'none'`; borda do cartão, da lateral e do topo `#343434`.
  - Dot Matrix: `textureOpacity` 0,15 no `design` (escuro) e 0,08 na `contraparte` (clara).
- As imagens refeitas em `C:\tmp\plan162-lote2\lado-a-lado\`:
  - Neo escuro sem sombra vermelha, com fio cinza.
  - Dot Matrix escuro com a malha visível, como na foto; o claro legível.
- Não repeti o vitest: o executor rodou o filtro pedido, e o snapshot só mudou nas linhas do Neo escuro.

**Aceitos:**
- O fio também na lateral e no topo do Neo escuro, coerente com a foto.
- A espessura de 4 px como divergência nomeada (token sem modo).
- `cardShadow: 'none'` com a sombra residual composta pelos tokens de deslocamento, invisível na cor do fundo e igual ao
  Dot Matrix.

**Corrigido por mim:** o Anexo D de `plan-162-mapa-de-tokens.md`, que o executor apontou como fora do escopo. As linhas do Neo
escuro (borda e sombra) e a do `textureOpacity` do Dot Matrix agora dizem o valor final.

**Lote 3 liberado.**

## Resumo da execução (lote 3) — 2026-11-12

**Resultado:** Concluído com pendências. O `synthwave-retro` saiu (opção A, D6) e a verificação do §6 foi rodada; duas coisas ficam abertas: o `cromo-css-real:check` segue vermelho em um spec (`troca-de-tema`, 2 casos, teto de transições), e o teste do id gravado cobre só a porta `activeThemeId` (o Provider não cumpre o contrato da 09 §4.3 nas outras duas portas nem na contagem de avisos; ver *Achados*).

**Estado do worktree ao iniciar**
```
(limpo)
```
(Durante a sessão apareceram, vindos de outra execução e não tocados por mim: `browser-tests/build-harness.mjs`, `browser-tests/harness-package-imports.mjs`, `scripts/__tests__/harness-package-imports.test.mjs`, `docs/component-catalog.{json,md}`, `gates/scripts/contrato/{helpers/token-release-notes-core.ts,__tests__/check-token-release-notes.test.ts}`, `specs/00-backlog.md`, `src/core/Provider/{manifest.ts,__tests__/manifest.test.ts}`, `src/features/DesignEngine/Main/{TemplatesTab.tsx,__tests__/TemplatesTab.test.tsx}` e uma entrada `## 9.0.0 — SARAK_DESIGN_MANIFEST.vars…` em `docs/migracoes.md`. Uma suíte do vitest dessa outra execução rodava no início; esperei ela terminar antes da suíte completa e do build.)

**O que foi feito**
- Remoção do tema: apaguei `src/core/Design/presets/themes/synthwave-retro.ts` (370 linhas); tirei o id de `index.ts`, o `import` e a linha de `all.ts`, e o loader de `loaders.ts`; `npm run themes:catalog` regenerou `catalog.generated.ts` (25 temas, 0 citações do id).
- Testes ajustados: `themeBars.test.ts` (linha do mapa de Personalidades), `themeSetCoverage.test.ts` e `compose.test.ts` (26 → 25), `themePalettes.test.ts` (`rosa-synthwave` entra em `GALLERY_ONLY_PRESETS`: a paleta só era usada pelo tema removido e ficou só na galeria; a paleta em si não mudou), snapshot do `PresetsCatalog` (`-u`; saíram só as linhas do cartão do tema).
- `TemaSobDemanda.test.tsx`: o caso "falha do `import()` libera a porta" passou a usar o loader de `blueprint-protocol` (id que nenhum outro caso do arquivo carrega); o caso continua lá.
- Teste novo 3.1: `src/core/Provider/__tests__/TemaRemovidoGravado.test.tsx` (3 casos): o id some de `SARAK_ALL_THEMES`, de `isSarakThemePresetId` e dos loaders; com `activeThemeId="synthwave-retro"` e `config.mode` `light` ou `dark`, a tela pinta o `primaryColor` do tema padrão **naquele modo** (`composeThemeForMode`) e há `console.warn` que nomeia o id; nenhum erro cita o id.
- Specs de navegador: `barra-de-topo-estreita.spec.ts` e `seletor-da-barra-legivel.spec.ts` trocaram `synthwave-retro` por `cyber-retro-wave-classic` (o tema mais próximo, 33° em H). Passaram os dois.
- `docs/migracoes.md`: a entrada `## 9.0.0` dos temas (que listava 4) foi reescrita para os 7 temas e para a saída do `synthwave-retro`, com o título ancorado em "9.0.0", tabela antes/depois e o que o importador com o id gravado vê (medido, três portas; ver *Decisões*).
- Citações restantes, tiradas porque o pedido era "nenhuma fora de migracoes, specs e histórico": `docs/persistencia-de-tema.md:61` (o exemplo de `data:image/svg+xml` agora cita só o `organic-clay`, 626 caracteres), `.agents/skills/ui-criar-tema/references/liberdade-e-restricao.md:57` (`synthwave-retro` → `cyber-retro-wave`; `.claude/skills` é o mesmo arquivo por symlink) e a linha do `synthwave-retro` na tabela de arquétipos de `sarak-ui/GUIA-FRONTEND.md` (texto à mão; o gerador só regrava o apêndice).
- Specs de navegador que **não citam** o id mas quebravam com os 25 temas (apareceram no `cromo-css-real:check`): `login-theme-application.spec.ts:55` (`/Sarak Sovereign/` casava 2 cartões → `/Sarak Sovereign(?! Classic)/`), `troca-de-tema.spec.ts:38` (`/Cyberpunk Neon/` → `/Cyberpunk Neon(?! Classic)/`) e `plan-145-personalidades.spec.ts:134` (`toHaveLength(19)` → `25`).
- `npm run guide` rodado no fim (kitHash `5b1d67d1f919`; 143 componentes, 424 tokens); `guide:check`, `dev-kit:check` e `themes:catalog:check` em dia.
- Prévia para o dono: `C:\tmp\sarak-previa-162\index.html` ganhou a seção "Lote 3: catálogo final (25 temas)": um cartão por tema, com os dois modos (amostras de fundo, texto e cor de marca do `SARAK_THEME_CATALOG`), os 7 resgatados marcados como novos. Não é captura da tela inteira; as capturas dos sete estão nas seções dos lotes 1 e 2, que não toquei.

**Arquivos alterados** (só os desta execução; os de outra execução estão na fotografia acima)
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `src/core/Design/presets/themes/synthwave-retro.ts` | removido | o tema |
| `themes/{index,all,loaders}.ts`, `themes/catalog.generated.ts` | alterados | sem o id, o import, o loader e a entrada (25 temas) |
| `themes/__tests__/{themeBars,themeSetCoverage,compose,themePalettes}.test.ts` | alterados | mapa, contagem 25, `rosa-synthwave` só da galeria |
| `src/core/Provider/__tests__/TemaSobDemanda.test.tsx` | alterado | loader que falha: `blueprint-protocol` |
| `src/core/Provider/__tests__/TemaRemovidoGravado.test.tsx` | criado | teste 3.1 |
| `src/features/DesignEngine/Canvas/components/__tests__/__snapshots__/PresetsCatalog.test.tsx.snap` | alterado | −265 linhas (cartão do tema removido) |
| `browser-tests/{barra-de-topo-estreita,seletor-da-barra-legivel,login-theme-application,troca-de-tema,plan-145-personalidades}.spec.ts` | alterados | id trocado; regex dos cartões; contagem 25 |
| `docs/migracoes.md` | alterado | nota `## 9.0.0` dos temas e da saída |
| `docs/persistencia-de-tema.md`, `.agents/skills/ui-criar-tema/references/liberdade-e-restricao.md` | alterados | citação do id tirada |
| `sarak-ui/{GUIA-FRONTEND.md,START-HERE.md,VERSION,catalog.json,docs/migracoes.md}` | alterados (gerados + 1 linha à mão) | `npm run guide` e a linha do arquétipo |
| `docs/component-catalog.md` | alterado (gerado) | 1 linha, efeito do `build`/`guide` |

**Verificações executadas**
- `npx vitest run` (suíte completa, antes do ajuste de tipo abaixo) → **731 arquivos, 5823 testes, exit 0**.
- `npx tsc --noEmit`: 1 erro, só no meu teste novo (`TS2367`: o literal `'synthwave-retro'` não existe mais no tipo, o que prova a mudança do tipo público); corrigi com `as string` e `npm run -s audit:baseline -- --with-tsc` → `igual ao baseline de 2026-10-12 — nenhuma regressão` (tsc 0). Reexecutei só `TemaRemovidoGravado.test.tsx` → 3 de 3.
- `npm run verify -- --tier=quick` (Anel 1: `tsc`, baseline, gates, Anel 0 simulado com 385 linhas e 0 achados) → `nível "quick" verde`, exit 0.
- `npm run build` → exit 0 (incluindo `guide:check`, `theme-boot:check`, consumidor de peers opcionais). `dist/` sem citação do id. `boot:measure`: teto relativo 397,6 KB gzip, maior tema `organic-clay` 5,7 KB (teto 15 KB), `[OK]`; `theme-boot:check` → só o tema padrão no fecho estático.
- Antes do build e do navegador conferi que nenhuma outra execução usava `dist/` nem navegador automatizado (0 processos de playwright, headless, tsup ou vitest).
- `npm run cromo-css-real:check` (roda o build de novo e o Playwright inteiro): **595 passaram, 5 falharam** (48,3 min): `login-theme-application`, `plan-145-personalidades` (as duas por consequência dos 25 temas; corrigidas acima), `plan-160-previa-mostra-a-opcao` (`Componentes`, "inputs/Relevo pressionado = 0,000%") e `troca-de-tema` (2 casos). Reexecução dos quatro arquivos juntos: `login-theme-application` e `plan-145` passam; `troca-de-tema` falha igual; `plan-160` falhou em outra decisão (`Forma`, 16 opções em 0%), **diferente da primeira vez**. `plan-160` sozinho com `--workers=1` → **7 de 7, exit 0**: a falha é de carga, não do tema. `barra-de-topo-estreita` e `seletor-da-barra-legivel` (os que citavam o id) passaram na corrida completa.
- `troca-de-tema` isolado (`--workers=1`): 2 falhas **determinísticas**, "transições iniciadas na troca" **209 > 174** (`TRANSITION_RUNS_BUDGET`, `troca-de-tema.spec.ts:43`). O teto foi medido em 2026-11-01 com a galeria de **19 temas** (139 a 145 transições, +20%). Hipótese, não medida: cada cartão novo da decisão Tema acrescenta transições (25 cartões hoje). O teste já falhava antes da minha mudança, no clique (regex), então o estouro só aparece agora; no `HEAD` (26 temas) ele deve estourar também (não medido). Não mexi no teto.
- `guide:check`, `dev-kit:check`, `themes:catalog:check` → em dia.
- `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` feito. **Sobraram 24 arquivos não rastreados em `dist/`** (chunks com hash novo): `CustomizationPanelImpl-ZPHINVX2.js`, `SarakChartEngine-JE26A5HT.js`, `SarakChatEngine-DF2XA65N.js`, `SarakDashboardGridImpl-EW35CVN6.js`, `SarakDataGridImpl-OJVC2CYD.js`, `SarakDataTableImpl-W5HV4JMV.js`, `SarakFlowEngine-2CQSDQ3Y.js`, `SarakKanbanImpl-6AS4S7WT.js`, `SarakMapImpl-OLY6W774.js`, `SarakMarkdownRendererImpl-UUPODUP2.js`, `SarakPDFViewerImpl-XIHPPUA4.js`, `SarakQRCodeImpl-52YG5DIG.js`, `chunk-{4CAQH46C,J3WUDF4S,LCALPFCD,LVHPKBNH,MPEAJQAZ,QAXN4T4Z,RTUHCRLL,VBUY3MO2,WJ4J2FQ6}.js`, `dot-matrix-elegant-Z7VF4RG7.js`, `nature-breeze-776YNTDP.js`, `neo-brutalism-classic-LFG7LVL4.js`. Não rodei `git clean` (o hook o bloqueou no lote 2): `git clean -fdq -- dist` é do dono.
- `grep` de `synthwave-retro` (sem `node_modules`, `.git`, `dist`, `coverage`, `showcase-output`): sobram só `docs/migracoes.md` (e a cópia gerada `sarak-ui/docs/migracoes.md`), `specs/**` e o meu teste novo (que existe para provar o id removido).

**Critérios de aceite** (§6 da plan)
- [x] `synthwave-retro` fora da lista — `index.ts`, `all.ts`, `loaders.ts`, `catalog.generated.ts` (25 temas), `dist/` sem o id.
- [~] Id gravado tratado como decidido e testado — só a porta `activeThemeId` (`TemaRemovidoGravado.test.tsx`); cache local e `onLoad` **não** seguem o contrato (ver *Achados*), e o aviso **único** não vale: são 3 avisos.
- [x] `docs/migracoes.md` com os temas novos e o que saiu — entrada `## 9.0.0` reescrita.
- [x] Nenhum tema existente com valor alterado — `git status`: nenhum arquivo de tema modificado além do removido e dos registros.
- [x] Suíte completa verde — 731/731 arquivos, 5823 testes.
- [x] `tsc` 0 e baseline sem regressão — `audit:baseline --with-tsc`.
- [x] Anel 1 — `verify --tier=quick` verde.
- [x] `npm run build` — exit 0; `boot:measure` e `theme-boot:check` verdes.
- [ ] `cromo-css-real:check` — **vermelho**: `troca-de-tema` (209 > 174, 2 casos). `plan-160` passa isolado.
- [x] Diversidade, peso por tema, boot, contraste — dentro do `verify quick` e do `build`; peso por tema acima.

**Decisões e suposições**
- **"Outro mecanismo"** (`TemaSobDemanda`): li como "outro tema cujo loader falha"; não achei outro mecanismo de falha de carga além do mapa de loaders. Se queria outra coisa, é uma linha.
- **"Os 26"** (prévia): o catálogo tem **25**: 19 existentes − 1 (`synthwave-retro`) + 7 resgatados. O anexo (§10) já dizia "cai para 25". A prévia diz 25 e explica a conta.
- **Teste 3.1 mais fraco que o pedido:** pedia "um único `console.warn`". O Provider emite **3** para `activeThemeId` removido (dois de `useThemeSeed.ts`, um de `useDesignSync.ts:73`), então o teste afirma que **existe** aviso que nomeia o id, não a contagem, e declara o limite no cabeçalho do arquivo. Alterar o Provider é decisão do revisor (a persistência é da `plan-158`).
- **A nota de migração descreve o que medi**, não o que a 09 §4.3 promete: por `activeThemeId` cai no tema padrão com aviso; pelo cache local ou pelo `onLoad` o design gravado continua aplicado (cor `#e54a8f` do Synthwave), sem aviso, e `resolvedThemeId` fica com o id removido.
- **`rosa-synthwave` mantida** (paletas são da `plan-163`) e registrada como só da galeria no teste de paletas, em vez de afrouxar a regra ("todo preset é usado por um tema").
- Regex dos cartões nos specs e `19 → 25`: mudança mínima, no padrão que o `PresetsCatalog.test.tsx` já usava; não relaxei nenhuma medida.
- A prévia usa amostras do catálogo leve, não capturas: não rodei o `themes:showcase` (a cena `telas` quebra no Markdown, backlog #75) e o catálogo é a fonte que o seletor usa.
- Erro meu, desfeito: dei um `git rm --cached` no arquivo do tema (escreve no índice) e o desfiz na hora com `git restore --staged`; o índice voltou ao que era, e o arquivo está apagado só no worktree.

**Achados fora do escopo (não corrigidos)**
- `src/core/Provider/hooks/useThemeSeed.ts:59-62` e `useDesignSync.ts:73`: id de tema removido pela prop `activeThemeId` emite 3 `console.warn` (a 09 §4.3 diz "um"); a semente avisa a cada recálculo (o `defaultTheme` já deduplica com `warnedDefaultThemeIdsRef`, o id pedido não).
- `useThemeSeed.ts:75` (`if (!explicitThemeId && cachedThemeId) return cachedThemeId`) devolve o id do cache sem passar por `isUnknownRequestedTheme`, e `useDesignRemoteLoader.ts:99-100` grava `resolvedThemeId` do `onLoad` sem validar: id removido vindo do cache local ou do `onLoad` não cai no tema padrão e não avisa, contra a 09 §4.3 ("venha ele de `activeThemeId`, de `initialTheme` ou da persistência do próprio consumidor"). O anexo §8 dizia "comportamento já testado": os testes existentes usam `.some` e só a porta `initialTheme`.
- `browser-tests/troca-de-tema.spec.ts:41-43`: tetos medidos com 19 temas; com 25 a medida é 209. Remedir (as 8 trocas, +20%) ou reduzir o custo por cartão é decisão do revisor.
- `plan-160-previa-mostra-a-opcao.spec.ts:338`: falha sob carga (4 workers), passa com `--workers=1`; falhou em decisões diferentes em duas corridas. O relatório de "opção sem efeito" não distingue carga de ausência de efeito.
- `sarak-ui/GUIA-FRONTEND.md` tem tabela de arquétipos escrita à mão (fora do gerador): tema removido ou novo a deixa velha sem aviso de gate.

**Pendências / riscos**
- `cromo-css-real:check` vermelho (acima); o revisor decide o teto de transições.
- `git clean -fdq -- dist` (24 arquivos) é do dono.
- A suíte completa rodou antes do ajuste de tipo `as string` no teste novo; reexecutei só esse arquivo e o baseline, não a suíte inteira de novo.
- A suíte e o build rodaram sobre um worktree com mudanças de outra execução (manifest, `TemplatesTab`, harness); um vermelho futuro nelas não é deste lote.
- 9.0.0 (MAJOR) é o nível pela remoção do literal; a versão e a tag não foram tocadas.

## Veredito — 2026-11-12 — lote 3 — 🔵 Em correção (achados 10 e 11)

**Conferido por mim:**
- O id saiu de `index.ts`, `all.ts`, `loaders.ts` e do catálogo gerado.
- As citações tiradas de `docs/persistencia-de-tema.md`, da skill `ui-criar-tema` e da tabela de arquétipos do guia.
- O teste novo `TemaRemovidoGravado.test.tsx`, lido.
- O contrato da 09 §4.3 contra `useThemeSeed.ts:74-75`, `useDesignRemoteLoader.ts:97-99` e `useDesignSync.ts:73`.
- O teto em `troca-de-tema.spec.ts:41-43`.

Não repeti a suíte nem o build.

**Aceitos:**
- `rosa-synthwave` registrada como paleta só da galeria; paletas são da `plan-163`.
- O loader de `blueprint-protocol` no caso de falha de `TemaSobDemanda`.
- As regex `(?! Classic)` e a contagem 25 nos specs.
- O `as string` no teste novo.
- A prévia com amostras do catálogo em vez de capturas.
- O `git rm --cached` desfeito na hora.

**Achado 10 — o id gravado não cai no tema padrão pelas portas de quem tem o tema gravado.**

O D6 (opção A) promete que quem tem o tema gravado cai no tema padrão, com aviso. A 09 §4.3 diz o mesmo para as três origens:
"venha ele de `activeThemeId`, de `initialTheme` ou da persistência do próprio consumidor … emite **um** `console.warn`".

O executor mediu o contrário, e o código confirma:
- Pelo **cache local**, o `useThemeSeed.ts:75` devolve o id do cache sem passar por `isUnknownRequestedTheme`.
- Pelo **`onLoad`**, o `useDesignRemoteLoader.ts:99` grava o id sem validar.
- Nos dois casos o Synthwave continua na tela, sem aviso, e `resolvedThemeId` fica com um id que não existe.
- Pela prop, saem 3 avisos, não 1.

O teste novo cobre só a porta da prop, e a nota de migração descreve o defeito como comportamento.

O escopo da plan já inclui "o tratamento do id gravado decidido no lote 0" (§3.1). A §3.2 tira "a persistência" no sentido do
formato gravado (ADR-026, `plan-158`), não a validação do id. Por isso a correção é deste lote; o adendo da §3.1 vem abaixo.

O comportamento pedido é o mesmo que a prop já tem, nas três portas:
- **Id e tela:** o tema padrão no modo pedido, com `resolvedThemeId = 'sarak-sovereign'`. O design gravado sobre o tema removido
  é descartado, como na porta da prop (`useDesignSync.ts:72-85`).
- **Avisos:** **um** `console.warn` por id na vida do Provider, como o `warnedDefaultThemeIdsRef` já faz.
- **Gravação:** nenhum `onSave` na hidratação. Em `'hybrid'`, a chave companheira do cache recebe o id padrão (é a escrita de
  volta que a §4.4.2 já permite), para a próxima carga não repetir a troca.

**Achado 11 — `cromo-css-real:check` vermelho: o teto de transições foi medido com 19 cartões e a tela tem 25.**

O spec estava quebrado desde o lote 1: a regex casava dois cartões. Os lotes 1 e 2 puseram os cartões novos, então o estouro
(209 > 174) é desta plan.

Não aceito subir o teto sem saber de onde vêm as transições. Ou o mecanismo da marca deixa os cartões de fora (custo que cresce a
cada tema novo, e aí o defeito é da marca), ou a conta é por cartão (aí o teto deve depender do número de temas, não ser um
número fixo).

**Fora desta plan (registrados):**
- O `plan-160-previa-mostra-a-opcao.spec.ts`, que falha sob carga e passa com `--workers=1`: nota na `plan-160`, entra no lote 2
  dela.
- A tabela de arquétipos escrita à mão no `GUIA-FRONTEND.md`, fora de gate: backlog #77.

**Adendo à §3.1 (lote 3, correção):**
- `src/core/Provider/hooks/useThemeSeed.ts`, `useDesignRemoteLoader.ts` e `useDesignSync.ts`: só a validação do id gravado e o
  aviso único.
- `browser-tests/troca-de-tema.spec.ts`: o teto, depois da medida.

**Status da plan: 🔵 Em correção.**

## Resumo da execução (correção do lote 3, achados 10 e 11) — 2026-11-12

**Resultado:** Concluído com pendências. Achado 10 corrigido nas três portas e provado por mutação. Achado 11: **parei e trago a medida** (não é nenhum dos dois casos que o prompt previa com certeza); o teto não foi tocado e o `cromo-css-real:check` segue vermelho só nesse spec.

**Estado do worktree ao iniciar**
Mesma árvore do fim do lote 3 (temas, registros, docs, `sarak-ui/`, specs de navegador) mais, de outras execuções e não tocados por mim: `browser-tests/build-harness.mjs`, `browser-tests/harness-package-imports.mjs`, `scripts/__tests__/harness-package-imports.test.mjs`, `docs/component-catalog.{json,md}`, `gates/scripts/contrato/**`, `specs/00-backlog.md`, `specs/plan/plan-160-…`, `src/core/Provider/{manifest.ts,__tests__/manifest.test.ts}`, `src/features/DesignEngine/Main/{TemplatesTab.tsx,__tests__/TemplatesTab.test.tsx}`; e 24 arquivos não rastreados em `dist/`.

**O que foi feito (achado 10)**
- `useThemeSeed.ts`: nova interface `ThemeIdGuard` (`isUnknownTheme`, `isSavedThemeRemoved`, `warnUnknownThemeOnce`) e `themeIdGuard` devolvido pelo hook. O aviso passou a sair de um só ponto, com `Set` por instância (como `warnedDefaultThemeIdsRef`), um por id, somando as três portas; mensagem única: `tema "<id>" não existe (removido do catálogo ou nunca existiu) — usando o tema padrão "sarak-sovereign" no modo pedido.` O id do cache local passa pela mesma validação do id pedido (`resolveSeedThemeId`): desconhecido → `SARAK_DEFAULT_THEME_ID` e aviso. `getSeedConfig(modeHint?)` trata o cache removido como queda para o padrão (`fellBack`); sem `config.mode`, o modo é o do design gravado que foi descartado (`modeHint`), senão escuro.
- `useDesignManager.ts`: lê `themeIdGuard`; no estado inicial, com o id do cache removido, descarta o design do `localStorage` (`getSeedConfig(parsed?.mode)`); passa o guarda a `useDesignSync` e `useDesignRemoteLoader`.
- `useDesignSync.ts`: `composeDefaultThemeDesign` (o tema padrão no modo do design no ar, extraído do ramo que já existia) é exportado e usado pela prop e pelo `onLoad`; o aviso da prop passa pelo guarda; a re-hidratação do `localStorage` não reaplica o design quando o id do cache foi removido.
- `useDesignRemoteLoader.ts`: o id do `onLoad` é validado antes de `setResolvedThemeId`; desconhecido (e sem `activeThemeId` controlado) → `resolvedThemeId = 'sarak-sovereign'`, design = `composeDefaultThemeDesign` (o gravado é descartado), `console.warn` único e nenhum `onSave`; em `'hybrid'` o refresh do cache grava o design e a chave companheira com o id padrão. Guarda opcional na prop (o teste do hook monta props sem ele).
- `TemaRemovidoGravado.test.tsx` (9 casos), sem o "limite declarado": prop (claro e escuro); cache local `'local'` e `'hybrid'` (com `onLoad` que devolve `null`); cache local sem `config.mode` (modo do design descartado); `onLoad` `'remote'` e `'hybrid'` (`{ design, activeThemeId }` com a cor do Synthwave); e um caso de contraprova: id de `customThemes` devolvido pelo `onLoad` não é descartado nem avisado. Nos casos de cache e `onLoad`: primária do padrão no modo pedido, `resolvedThemeId = 'sarak-sovereign'`, exatamente 1 aviso com o id, 0 chamadas de `onSave`; em `'hybrid'` do `onLoad`, a chave `::active-theme-id` vira `sarak-sovereign` e o cache não guarda mais a cor do Synthwave.
- Testes existentes que usavam ids fictícios como se fossem temas conhecidos (`TenantPersistence`: `cache-theme`, `server-theme`; `useDesignManager`: `tema-salvo`, `tema-a`, `tema-b`) passaram a declará-los em `customThemes`/`allThemes`; `useDesignSync.test.ts` passa um guarda e confere que ele é acionado uma vez com o id (o aviso saiu do hook).
- `docs/migracoes.md`: reescrevi só o item "Quem tem o id gravado" da nota "sete temas…" (a nota `SARAK_DESIGN_MANIFEST.vars` não foi tocada); `npm run guide` regenerou a cópia em `sarak-ui/docs/migracoes.md`.

**Mutação (achado 10)** — `TemaRemovidoGravado.test.tsx`, validação desligada em cada porta, uma de cada vez:
- cache sem validação (`useThemeSeed` devolve o id do cache sempre) → **3 vermelhos** (os 3 do cache local);
- `onLoad` sem validação (`if (false && guard …)`) → **2 vermelhos** (`remote` e `hybrid` do `onLoad`);
- aviso sem o dedupe → **5 vermelhos** (prop ×2, cache ×3: a prop e o cache somam 2 avisos);
- semente sem validação (`isUnknownRequestedTheme` sempre `false`) → **5 vermelhos** (cache e `onLoad`), **a prop segue verde** porque o `useDesignSync` aplica o padrão sozinho; semente **e** `useDesignSync` desligados → prop ×2 vermelhos também (7 vermelhos). A porta da prop tem duas camadas redundantes; só desligar as duas a torna vermelha.
Arquivos restaurados do backup e conferidos com `diff`.

**Achado 11 — a medida (CDP no harness do spec, 25 cartões, modo app e a troca Sovereign → Cyberpunk Neon)**
- Total 219 `transitionrun` numa troca (o spec conta 209, a diferença é a janela de espera): **207 dentro de cartões da decisão Tema, 12 fora**; 25 cartões, de 3 a 16 por cartão.
- Por propriedade, dentro dos cartões: **`scrollbar-color` 189** (≈7,6 por cartão), `transform` 10, o resto 1 cada. Fora dos cartões: `scrollbar-color` também (12, em `h3`).
- Só 8 das 219 começam com a marca (`data-sarak-theme-switching`) ligada; **211 começam depois que ela sai**: 2 no quadro em que a marca sai, **175 no quadro seguinte** e 24 ~115 ms depois.
- São transições reais de 150 ms (`getAnimations()`) em elementos com `transition: all` (a `div` do rótulo de cada cartão, as `div.overflow-hidden` do corpo, o `button` do cartão); os `svg`/`path` só herdam o valor animado. O valor de `scrollbar-color` é herdado do `:root` (`color-mix` de `--text-main`; `_base.css:135`).
- No tempo, para um elemento do cartão: com a marca ligada o `scrollbar-color` já é o novo e `transition-property` é `none`; ao sair a marca, **4 dos 61 elementos do cartão** `golden-hour` passam a mostrar um valor **intermediário** (`oklab(0.964 …)`, mesmo alfa 0,2/0,05) e voltam ao novo em ~110 ms, ou seja, a transição parte do valor **antigo** para o novo depois da marca. O `--text-main` do `:root` já era o novo desde antes. **Não isolei por que o valor "antigo" ainda existe para esses elementos na saída da marca.**
- Conta: 207/25 ≈ 8,3 transições por cartão e ~12 de base. Os tetos de 2026-11-01 (139 a 145 com 19 cartões) ficam em ≈7,6 por cartão, o que bate com ≈7,6 de `scrollbar-color` por cartão hoje.
- **Por isso parei:** (a) o custo cresce com os cartões e a marca deveria cobri-los, mas não consegui mostrar que o defeito é a marca (a causa do valor antigo na saída da marca não está isolada e mexer na marca é arriscado); (b) "transição legítima por cartão" também não: ninguém quer animar a cor da barra de rolagem na troca de tema. Não alterei o teto nem a marca. Se o dono decidir pela via (b), a conta medida é **base ≈ 12, por cartão ≈ 8,3, ×1,2**: `1,2 × (12 + 8,3 × temas)` ≈ 263 para os 25 temas de hoje; o spec lê o número de temas de `SARAK_ALL_THEMES`.
- Isolado (`--workers=1`) o spec falha igual, nos 2 casos, 209 > 174.

**Verificações executadas**
- `npx vitest run src/core/Provider src/core/Design/presets src/features/DesignEngine` → **227 arquivos, 1752 testes, exit 0** (a primeira rodada acusou 4 testes que usavam ids fictícios e o do `useDesignSync`; ajustados acima).
- `npx tsc --noEmit` → 0 (houve 2 erros no meu teste novo, `TS7006`, corrigidos); `npm run -s audit:baseline -- --with-tsc` → `igual ao baseline de 2026-10-12`.
- `npm run verify -- --tier=quick` → `nível "quick" verde`, exit 0 (a primeira rodada acusou `guide:check` por causa da cópia de `migracoes.md`; rodei `npm run guide`, kitHash `5b1d67d1f919`, e passou).
- `npm run cromo-css-real:check` (roda o build; antes não havia processo de navegador, playwright, vitest ou tsup de outra execução) → **598 passaram, 2 falharam**: `troca-de-tema.spec.ts:167` nos modos app e embarcado ("transições iniciadas na troca" 209 > 174). `plan-160-previa-mostra-a-opcao` **passou** nesta corrida (47,5 min). Os specs da 09 §4.3 pela UI (`login-theme-application`, `plan-145-personalidades`, `barra-de-topo-estreita`, `seletor-da-barra-legivel`) passam.
- `npm run guide` → em dia; `guide:check` → em dia. `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` feito; sobraram **24 arquivos não rastreados em `dist/`**: `CustomizationPanelImpl-QN7B4GPY.js`, `SarakChartEngine-EF36AEXB.js`, `SarakChatEngine-VUM5QY6U.js`, `SarakDashboardGridImpl-GBTD6NNQ.js`, `SarakDataGridImpl-72OZYYKZ.js`, `SarakDataTableImpl-6GQ334G7.js`, `SarakFlowEngine-TGRM6RLG.js`, `SarakKanbanImpl-Y5C4MZDS.js`, `SarakMapImpl-2FYCHNG5.js`, `SarakMarkdownRendererImpl-IF5YVELU.js`, `SarakPDFViewerImpl-YF3GIN4K.js`, `SarakQRCodeImpl-FPEIGEMV.js`, `chunk-{4COKZ3VT,4HGMGICL,B3DRXD2F,J7JG6FIH,LGB25HQL,Q45IH6TY,QC44ZA3A,SPU3NVTO,UPNUNFZP}.js`, `dot-matrix-elegant-Z7VF4RG7.js`, `nature-breeze-776YNTDP.js`, `neo-brutalism-classic-LFG7LVL4.js`. `git clean -fdq -- dist` é do dono.

**Critérios de aceite**
- [x] Cache local valida o id e cai no padrão no modo pedido — `useThemeSeed.ts` (`resolveSeedThemeId`), caso `'local'`/`'hybrid'` e sem `config.mode`.
- [x] `onLoad` valida antes de `setResolvedThemeId`; padrão + `resolvedThemeId = 'sarak-sovereign'`, sem `onSave`, chave companheira em `'hybrid'` — `useDesignRemoteLoader.ts`, casos do `onLoad`.
- [x] Um aviso por id na vida do Provider, somando as portas — `warnUnknownThemeOnce`; mutação sem dedupe: 5 vermelhos.
- [x] Casos pedidos e mutação por porta — `TemaRemovidoGravado.test.tsx` e a seção *Mutação*.
- [x] Nota de migração reescrita — `docs/migracoes.md`.
- [ ] Achado 11 resolvido — **não**: medida trazida, decisão do revisor (acima).

**Decisões e suposições**
- A prop `activeThemeId` **não** teve o `resolvedThemeId` trocado: `useResolvedThemeId.ts` (`if (activeThemeId) setResolvedThemeId(activeThemeId)`) continua devolvendo o id removido nessa porta, e esse arquivo não está no adendo da §3.1. O prompt dá o mesmo resultado da prop como referência para o design e para o aviso, e eles valem; o `resolvedThemeId` da prop não.
- Um id vindo do `onLoad`/cache que é de um tema do consumidor só é "conhecido" se estiver em `customThemes`/`allThemes` **no momento da validação**; ver risco abaixo.
- `themeIdGuard` opcional no `useDesignRemoteLoader` (o teste do hook monta props sem ele); sem guarda, não valida.
- O aviso deixou de citar o modo e passou a citar só o id (a mensagem era diferente em cada porta).
- Mensagem do aviso de `options.theme.defaultTheme` inexistente: não mexi (outro `Set`, outro texto).

**Achados fora do escopo (não corrigidos)**
- `useResolvedThemeId.ts:18`: na porta da prop, `resolvedThemeId` fica com o id removido (acima).
- Causa de `scrollbar-color` começar a transicionar depois que a marca sai, em ≈8 elementos por cartão da decisão Tema (acima): a marca ou o cálculo do valor herdado merecem investigação própria.
- `useDesignManager.ts` está em 234 linhas, perto do teto de 250.

**Pendências / riscos**
- **Risco de regressão real:** um consumidor cujo `customThemes` chega **depois** do `onLoad` (carregado por rede, por exemplo) passa a ter o id do tema próprio tratado como removido no instante da validação: cai no padrão, avisa e, em `'hybrid'`, grava o id padrão no cache. Antes o id passava sem checagem. Só validar contra o catálogo embarcado, ou adiar a decisão até `customThemes` estabilizar, evitaria isso; fica para o revisor.
- `cromo-css-real:check` vermelho só no `troca-de-tema` (2 casos).
- `git clean -fdq -- dist` (24 arquivos) é do dono.
- A suíte completa (`npx vitest run`) não foi repetida nesta rodada (só o filtro pedido); a última completa foi a do lote 3, antes das mudanças em `Provider/hooks`.

## Veredito — 2026-11-12 — correção do lote 3 — 🔴 Reprovado (achados 12 e 13; o achado 10 está aceito na forma)

**Conferido por mim:**
- O resumo e a mutação por porta: cache 3, `onLoad` 2, dedupe 5 vermelhos.
- A regra da marca (`_motion.css:50-79`, `themeSwitchMark.ts`) e `useResolvedThemeId.ts`.

Não repeti o vitest filtrado nem o `cromo-css-real:check`.

**Aceitos no achado 10:**
- O guarda único (`warnUnknownThemeOnce`), a queda para o padrão pelo cache e pelo `onLoad`, e o modo do design descartado
  quando não há `config.mode`.
- O caso de contraprova com `customThemes`.
- Os testes que declaram os ids fictícios.
- O aviso que cita só o id.

**Achado 12 — validar o id gravado contra a lista do instante descarta o tema do próprio importador que chega depois.**

O executor nomeou o risco, e ele é real. O importador que carrega `customThemes` pela rede recebe o `onLoad`, ou lê o cache,
antes da lista. O id do tema dele é tratado como removido:
- o design gravado é descartado;
- sai um aviso falso;
- em `'hybrid'`, o cache passa a guardar o id padrão.

É perda de dado causada pela lib, e o importador não tem como evitar.

**Decisão do revisor:** pela persistência (cache e `onLoad`), a queda para o padrão vale **só para id que a lib removeu**. A lista
desses ids é nova, interna e só cresce: `SARAK_REMOVED_THEME_IDS`, hoje `['synthwave-retro']`, no registro de temas.
- **Id que a lib removeu:** tudo como está (padrão, um aviso, cache com o id padrão, nenhum `onSave`).
- **Outro id desconhecido vindo da persistência:** o design gravado continua aplicado, sem aviso e sem reescrever o cache, como
  antes desta correção. Ele pode ser tema do importador ainda em carga.
- **A prop e o `initialTheme`:** seguem como estão. A queda para o padrão com aviso já era o comportamento delas.

Na síntese, a 09 §4.3 passa a dizer isso: o id da persistência cai no padrão quando a lib o removeu.

O D6 do dono (quem tem `synthwave-retro` gravado cai no padrão, com aviso) continua cumprido.

**`resolvedThemeId` na porta da prop.** O executor também apontou que `useResolvedThemeId.ts:18` devolve o id removido. A 09 §4.3
diz que `resolvedThemeId` é o tema **efetivamente no ar**, e na tela está o padrão. Ele passa a ser o padrão enquanto o id da
prop for desconhecido, e volta ao id quando o tema ficar conhecido (`allThemes` muda).

**Achado 13 — as transições do teste de troca de tema são defeito da marca, não custo por cartão.**

A medida do executor fecha a pergunta do achado 11:
- 211 das 219 transições **começam depois que a marca sai**, e 175 delas no quadro seguinte.
- São `scrollbar-color` de 150 ms, partindo do valor antigo, em elementos com `transition: all` dentro dos cartões da galeria.
- Ninguém quer animar a cor da barra de rolagem na troca de tema. Logo, não é "transição legítima" (via b), e o teto não sobe.
- A marca existe para que nenhuma transição comece por causa da troca (`_motion.css:52-63`). Uma mudança de estilo da troca
  que só chega aos cartões depois que a marca sai é o defeito que ela deveria impedir.

**O que fazer:**
- Ache o que muda o estilo desses elementos no quadro seguinte à saída da marca. Use a origem da invalidação no trace do CDP
  (`StyleRecalcInvalidationTracking`) ou o commit do React que acontece nesse quadro. Hipóteses a medir: um commit da galeria
  posterior ao da raiz (o cartão ativo muda de estado), ou uma variável do escopo do cartão escrita depois.
- Conserte na lib: ou a mudança entra **sob** a marca, ou a marca dura até o último commit da troca. Não remova
  `transition: all` dos cartões como conserto: isso esconderia o mesmo defeito em qualquer outro elemento.
- O teto fica em 174. Se a medida depois do conserto ficar muito abaixo dele, registre o número no comentário e não aperte o
  teto nesta plan.

**Adendo à §3.1 (correção 2 do lote 3):**
- `src/core/Design/presets/themes/registry.ts` (`SARAK_REMOVED_THEME_IDS`, interno, fora do barril) e
  `src/core/Provider/hooks/useResolvedThemeId.ts`.
- Os arquivos da marca: `src/core/Provider/utils/themeSwitchMark.ts`, o `DesignInjector`, `src/styles/_motion.css`, e o
  componente que o trace apontar.

**Status da plan: 🔵 Em correção.**

## Resumo da execução (correção 2 do lote 3, achados 12 e 13) — 2026-11-12

**Resultado:** Concluído com pendências. Achado 12 corrigido e provado por mutação. Achado 13: **parei e trago a medida**: a causa não se isola com segurança e nenhum conserto na marca reduziu a contagem; o teto continua em 174 e o `troca-de-tema` segue vermelho (209).

**Estado do worktree ao iniciar**
Mesma árvore do fim da correção anterior (temas, registros, docs, `sarak-ui/`, `Provider/hooks`, specs de navegador) mais, de outras execuções e não tocados por mim: `browser-tests/build-harness.mjs`, `browser-tests/harness-package-imports.mjs`, `scripts/__tests__/harness-package-imports.test.mjs`, `docs/component-catalog.{json,md}`, `gates/scripts/contrato/**`, `specs/00-backlog.md`, `specs/plan/plan-160-…`, `src/core/Provider/{manifest.ts,__tests__/manifest.test.ts}`, `src/features/DesignEngine/Main/{TemplatesTab.tsx,__tests__/TemplatesTab.test.tsx}`; 24 arquivos não rastreados em `dist/`.

**O que foi feito (achado 12)**
- `src/core/Design/presets/themes/registry.ts`: `SARAK_REMOVED_THEME_IDS` (`['synthwave-retro']`) e `isSarakRemovedThemeId`; interno (o barril só exporta `sarakLoadThemePreset`, `sarakPreloadThemes`, `sarakLoadAllThemePresets` desse módulo; `barrel:check` verde).
- `useThemeSeed.ts`: `isRemovedTheme` (id da lista **e** fora de `allThemes`, para o importador que declarou um tema com esse id continuar dono dele). O cache local e `isSavedThemeRemoved` usam só ele; outro id desconhecido vindo do cache local passa como antes (design gravado aplicado, sem aviso, cache intocado). O guarda ganhou `isRemovedTheme` e mantém `isUnknownTheme` (prop, `initialTheme` e `useResolvedThemeId`).
- `useDesignRemoteLoader.ts`: o `onLoad` usa `guard.isRemovedTheme`; só id da lista cai no padrão. Outro id desconhecido: o par design + id é aplicado como antes, sem aviso.
- `useResolvedThemeId.ts`: terceiro parâmetro `isUnknownTheme`; com `activeThemeId` desconhecido, `resolvedThemeId = 'sarak-sovereign'`; volta ao id quando o tema fica conhecido. Só a **transição** conhecido/desconhecido reexecuta o efeito (um booleano na dependência, não a função), para um `customThemes` novo a cada render não sobrescrever o id que o painel anunciou. `useDesignManager.ts` passa `themeIdGuard.isUnknownTheme` (uma linha, 234 linhas).
- Testes: `registry.test.ts` (nenhum id removido está em `SARAK_THEME_PRESET_IDS`; `isSarakRemovedThemeId`); `useResolvedThemeId.test.ts` (2 casos: desconhecido → padrão → id → padrão de novo; reavaliar sem transição não reaplica o id); `TemaRemovidoGravado.test.tsx` (13 casos): os 9 do `synthwave-retro` como estavam, mais 4 do importador: cache local com id de `customThemes` que chega **depois** (mantém design e id, 0 avisos, cache com o id gravado, igual depois que a lista chega); `onLoad` `'hybrid'` idem (a chave `::active-theme-id` guarda o id do importador, não o padrão); id desconhecido que nunca chega, pelo `onLoad` e pelo cache local (design aplicado, 0 avisos, cache intocado). `useDesignSync.test.ts`: o guarda de teste ganhou `isRemovedTheme`.
- `docs/migracoes.md`: item "Quem tem o id gravado" ajustado para "id que a lib removeu" e novo item "O tema do importador não é tocado" (persistência: id desconhecido que não é da lista mantém o design e o id; prop e `initialTheme`: padrão com aviso, `resolvedThemeId` padrão enquanto desconhecido). A nota `SARAK_DESIGN_MANIFEST.vars` não foi tocada. `npm run guide` regenerou a cópia em `sarak-ui/docs/migracoes.md`.

**Mutação (achado 12)** — `isRemovedTheme` trocado pela validação anterior (`Boolean(id) && !allThemes?.some(…)`, ou seja, sem a checagem da lista) em `useThemeSeed.ts`:
- `TemaRemovidoGravado.test.tsx` → **4 vermelhos**: "pelo cache local: mantém o design e o id gravados…", "pelo onLoad ('hybrid')…", "id desconhecido que nunca chega, vindo do onLoad…" e "…vindo do cache local…". Os 9 casos do `synthwave-retro` seguem verdes (a lista cobre o id removido). Arquivo restaurado do backup (`diff` sem diferença).

**Achado 13 — medida (harness do `troca-de-tema.spec.ts`, 25 cartões, troca Sovereign → Cyberpunk Neon, modo app, Chromium headless)**
Nenhum arquivo da marca foi alterado (`git status` de `themeSwitchMark.ts`, `DesignInjector.tsx`, `_motion.css`, `_base.css`: sem diferença). Conclusões e correções ao que o resumo anterior disse:
1. **"Começam depois que a marca sai" era artefato da medida.** O evento `transitionrun` é entregue com atraso (quadros de 100 a 300 ms): para as transições de `scrollbar-color`, `animation.startTime` = 5278 ms, com a marca da raiz ligada em 5103 e desligada em 5397 (marca desligada num `requestAnimationFrame` desse mesmo quadro). O evento só chegou em ~5714.
2. **A transição é uma transição de um valor para ele mesmo.** `keyframes` lidos com `getAnimations()`: `from`, `to` e o valor computado do momento são idênticos: `oklab(0.964161 -0.0204228 0.0131615 / 0.2) oklab(0.964161 -0.0204228 0.0131615 / 0.05)`, com `--text-main` já `#e9f8ea` no elemento e na raiz. Ou seja, **nenhuma cor muda de forma visível**; o `scrollbar-color` herdado do `.custom-scrollbar-sidebar` (`_base.css:135`, `color-mix(in srgb, var(--text-main) 20%, transparent)`) é recalculado com outra representação (`color(srgb …)` durante a marca, `oklab(…)` na transição) e o Chrome inicia uma transição de 150 ms entre as duas.
3. **Quem anima:** só elementos com `transition: all` que herdam esse `scrollbar-color`: a rolagem do painel (`div.flex-1.min-h-0.overflow-y-auto … custom-scrollbar…`, dentro de `.sarak-panel-column`) é o declarante; abaixo dele, ≈8 por cartão (a `div` do rótulo, as `div.overflow-hidden`, o `button`), 189 de 219 (≈7,6 por cartão), mais 12 em `h3` fora dos cartões, mais `transform` ×7 a 10 do hover/foco do clique. Com a regra da marca ligada à mão (`data-sarak-theme-switching="true"` na raiz, sem troca), **os 1480 elementos dos cartões ficam com `transition-property: none`**: a regra cobre todos.
4. **O repro mínimo não reproduz.** Uma página com `:root[data-m] * { transition: none !important }`, elementos `transition: all 150ms` e o mesmo `scrollbar-color` herdado (srgb, oklab, `var()` direto e `rgb(from …)`), mudando `--text-main` sob a marca e tirando a marca: **0 transições** nas quatro variantes. A causa depende de algo do app que não isolei.
5. **O que não resolve (medido, mesmo harness):**
   - segurar a marca por 30 quadros em vez de 2 → 236 transições (total) e `scrollbar-color` ainda 189: **não muda nada**, a marca não é curta;
   - desligar as animações CSS antes da troca → 465 (`scrollbar-color` 408);
   - `scrollbar-color` do `.custom-scrollbar-sidebar` em `color-mix(in oklab, …)` → 387 (330); em `var(--text-main)` direto → 492 (433).
   Os números oscilam de uma corrida para outra (189, 189, 408, 330, 433 de `scrollbar-color`), então só vale a ordem de grandeza e a direção: nenhum conserto de representação ajudou.
6. **Outro fato do trace do CDP** (`invalidationTracking`, 208 MB, truncado depois do clique): na troca, o escopo da prévia ao vivo (`.sarak-design-scope.sarak-scope-re … sarak-scope-rl`) é remontado **8 vezes, uma a cada ~105 ms**, cada uma com a marca própria e ~529 variáveis escritas (`Inline CSS style declaration was mutated`), e na última janela 3044 mutações de estilo inline em `div.sarak-card` da prévia. Não liga isso às transições dos cartões, mas é custo da troca e vale uma investigação própria.
- **Por isso parei** (instrução: "se a causa não for isolável com segurança, pare e traga a medida"): o defeito, como o veredito o descreveu (mudança de estilo que chega depois da marca), não é o que a medida mostra (valor idêntico, início dentro da marca). Não mexi na marca, no `_motion.css`, no `_base.css`, nos `transition: all` dos cartões nem no teto (174).
- **Antes e depois:** `troca-de-tema.spec.ts` isolado (`--workers=1`), nos dois modos: **209 transições antes e 209 depois**, teto 174; os recálculos de estilo e os recálculos da tela inteira ficam dentro dos tetos.

**Verificações executadas**
- `npx vitest run` (**suíte completa**) → **731 arquivos, 5843 testes, exit 0**.
- `npx tsc --noEmit` limpo; `npm run -s audit:baseline -- --with-tsc` → `igual ao baseline de 2026-10-12`.
- `npm run verify -- --tier=quick` → verde, exit 0. `useDesignManager.ts` em 234 linhas.
- `npm run guide` → em dia (kitHash `5b1d67d1f919`); `guide:check` → em dia.
- `npm run build` → exit 0; `troca-de-tema.spec.ts` isolado → 2 de 4 passaram, 2 falharam (209 > 174).
- `npm run cromo-css-real:check` completo (roda o build) → **598 passaram, 2 falharam** (41,2 min): só `troca-de-tema.spec.ts:167` (modo app e embarcado, 209 > 174, o mesmo número do isolado). `plan-160-previa-mostra-a-opcao`, `login-theme-application`, `plan-145-personalidades`, `barra-de-topo-estreita` e `seletor-da-barra-legivel` passaram.
- `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` feito; sobraram **24 arquivos não rastreados em `dist/`** (chunks com hash do build; `git clean -fdq -- dist` é do dono): CustomizationPanelImpl-HIHC4QJ2.js SarakChartEngine-6WEMZYFY.js SarakChatEngine-JG3TSDTC.js SarakDashboardGridImpl-LWHKTF7I.js SarakDataGridImpl-YJJ4NLDZ.js SarakDataTableImpl-SNDETGBH.js SarakFlowEngine-UCUEP3X7.js SarakKanbanImpl-NKU5L4OE.js SarakMapImpl-AEWL3FJ7.js SarakMarkdownRendererImpl-YWEVY2VQ.js SarakPDFViewerImpl-KGE5BF45.js SarakQRCodeImpl-HAMRHNQ5.js chunk-4PZHQAN7.js chunk-7SJ7YTTC.js chunk-EA3654L6.js chunk-EZE44MEY.js chunk-U6ODXSHJ.js chunk-WWKBRHAO.js chunk-X4VQZ55E.js chunk-YOJWTFR5.js chunk-ZEU5K3X3.js dot-matrix-elegant-Z7VF4RG7.js nature-breeze-776YNTDP.js neo-brutalism-classic-LFG7LVL4.js
- Antes do navegador e do build conferi que nenhuma outra execução usava `dist/`, navegador, playwright, vitest ou tsup.

**Critérios de aceite**
- [x] `SARAK_REMOVED_THEME_IDS` interno e o teste "nenhum id da lista está em `SARAK_THEME_PRESET_IDS`" — `registry.ts`, `registry.test.ts`.
- [x] Persistência: só id da lista cai no padrão (design descartado, 1 aviso, cache com id padrão em `'hybrid'`, 0 `onSave`); outro id desconhecido: design aplicado, 0 avisos, cache intocado — `TemaRemovidoGravado.test.tsx`.
- [x] Tema do importador que chega depois mantém design e id, 0 avisos — 2 casos.
- [x] `useResolvedThemeId`: padrão enquanto desconhecido, volta ao id quando fica conhecido — `useResolvedThemeId.test.ts`.
- [x] Mutação com a checagem da lista desligada — 4 vermelhos.
- [x] `docs/migracoes.md` ajustado.
- [ ] Achado 13 — **não**: medida trazida; teto em 174; `troca-de-tema` vermelho.

**Decisões e suposições**
- `isRemovedTheme` exige também "fora de `allThemes`": um importador que declarou ele mesmo um tema com o id `synthwave-retro` (por exemplo, uma cópia do tema antigo) continua dono dele.
- Na persistência, `isUnknownTheme` deixou de ser usado; ele continua no guarda porque a prop e o `useResolvedThemeId` precisam dele.
- Segurar a marca ou trocar a representação do `scrollbar-color` foram experimentos descartados por não reduzirem a contagem; nenhum ficou no código (`git diff` dos arquivos da marca vazio).

**Achados fora do escopo (não corrigidos)**
- O escopo da prévia remonta 8 vezes por troca, ~105 ms entre elas, com ~529 variáveis cada (acima).
- `scrollbar-color` herdado gera 150 ms de transição idêntica por elemento: sem efeito visual, mas conta no teto de transições; a causa no app não está isolada (o repro mínimo não reproduz).
- Os scripts de medição estão fora do repositório (`scratchpad`): `measure-transitions.mjs`, `measure-decl.mjs`, `trace-inval.mjs`, `repro-min.mjs`.

**Pendências / riscos**
- O `troca-de-tema.spec.ts` (2 casos) segue vermelho em 209 > 174; o revisor decide entre mandar investigar a causa (o repro mínimo sugere algo do app) ou ajustar o teto com a conta por cartão da medida anterior.
- Quem declara `customThemes` com um id que também esteja em `SARAK_REMOVED_THEME_IDS` continua dono dele; isso foi uma decisão minha (acima).
- `git clean -fdq -- dist` (arquivos novos do build) é do dono.

## Veredito — 2026-11-12 — correção 2 do lote 3 — 🔵 Em correção (achado 12 aceito; achado 13 vira correção da medida, achado 14)

**Conferido por mim:**
- O `git diff` de `registry.ts`, `useThemeSeed.ts`, `useDesignRemoteLoader.ts`, `useDesignSync.ts`, `useResolvedThemeId.ts` e
  `useDesignManager.ts`.
- O teto e o contador em `troca-de-tema.spec.ts:40-43` e `:207-210`.

Não repeti o vitest, o build nem o `cromo-css-real:check`.

**Aceito no achado 12:**
- `SARAK_REMOVED_THEME_IDS` interno.
- `isRemovedTheme` nas três portas da persistência: cache na semente, `useDesignSync.ts:108` e `onLoad`.
- `isUnknownTheme` só na prop, no `initialTheme` e em `useResolvedThemeId`.
- O booleano de transição na dependência do efeito.
- A mutação com 4 vermelhos.
- Aceito também a decisão do executor: quem declara em `customThemes` um id da lista continua dono dele. A síntese registra isso
  na 09 §4.3.

**Achado 13 — a medida mudou o diagnóstico, e aceito a mudança.**

O executor provou três coisas:
- as transições começam **dentro** da marca;
- o valor inicial e o final são o mesmo (só a representação da cor muda: `color(srgb …)` → `oklab(…)`);
- segurar a marca 30 quadros não muda nada.

Então isso não é a troca animando algo visível, e a marca não está curta. O defeito que o teto existe para pegar, uma transição que
o usuário veria na troca, não aparece nessa medida. O que ela conta a mais é ruído do Chrome: ≈7,6 por cartão de galeria, e a
galeria cresceu com os temas resgatados.

**Achado 14 — o teto de transições conta transição sem efeito; o contador passa a contar só a que muda o valor.**

**Decisão do revisor:**
1. Em `troca-de-tema.spec.ts`, cada `transitionrun` contado lê a animação do elemento para a propriedade
   (`getAnimations()` → `CSSTransition` com `transitionProperty` igual, `effect.getKeyframes()`). Se o primeiro e o último
   quadro-chave da propriedade forem a mesma string, a transição é **sem efeito**: não entra em `__transitionRuns` e vai para um
   contador próprio. O teto `TRANSITION_RUNS_BUDGET` continua **174** e vale só para as transições com efeito.
2. A anotação `medido` passa a dizer as duas contagens e as propriedades das transições sem efeito (por exemplo
   `scrollbar-color ×189`).
3. O comentário do teto (`:42`) registra a regra, a data e a medida de hoje com o novo contador.
4. **Prova de que o filtro não esconde transição real:** numa cópia, desligue a marca. Por exemplo, tire a regra
   `transition: none !important` de `_motion.css` só no build da cópia, ou não grave `data-sarak-theme-switching`. A contagem
   **com efeito** precisa passar muito do teto: a medida antiga sem a marca era perto de 1.900. Restaure e registre os dois
   números no resumo.
5. O caso de modo embarcado segue o mesmo contador.
6. Não mexer na marca, no `_motion.css`, no `_base.css` nem nos `transition: all` dos cartões.

**Por que não é afrouxar o teto:** a pergunta do teste é "a troca de tema anima algo?". Uma transição de um valor para ele mesmo
não anima nada. Toda transição com valor diferente continua contando, contra o mesmo 174 de antes. O custo dessas transições
sem efeito e a causa no app (o repro mínimo não reproduz) vão para o backlog (item 78).

**O escopo da prévia remontado 8 vezes por troca** (≈105 ms entre uma e outra, ≈529 variáveis cada) é custo de aplicação.
Ele entra no lote 2 da `plan-158` ("aplicar sem atraso"), cujo escopo já tem o `DesignScope`. Deixei uma nota lá. Não entra
nesta plan.

**Adendo à §3.1 (correção 3 do lote 3):** só `browser-tests/troca-de-tema.spec.ts`.

**Verificação da correção:**
- `troca-de-tema.spec.ts` isolado (`--workers=1`), nos dois modos, verde com o build atual.
- A mutação do item 4.
- Não precisa de suíte do vitest nem de `cromo-css-real:check` completo. A mudança é só neste spec, e o resto do navegador já
  passou nesta árvore (598 de 600).

**Status da plan: 🔵 Em correção.**

## Resumo da execução (correção 3 do lote 3, achado 14) — 2026-11-12

**Resultado:** Concluído. Só `browser-tests/troca-de-tema.spec.ts` foi alterado. O teto continua 174 e passa a valer para as transições com efeito; `troca-de-tema.spec.ts` isolado (`--workers=1`) passa nos dois modos com o build atual, e a mutação sem a marca estoura o teto por uma ordem de grandeza.

**Estado do worktree ao iniciar**
Mesma árvore do fim da correção anterior (temas, registros, docs, `sarak-ui/`, `Provider/hooks`, specs de navegador), mais, de outras execuções e não tocados por mim: `browser-tests/build-harness.mjs`, `browser-tests/harness-package-imports.mjs`, `scripts/__tests__/harness-package-imports.test.mjs`, `docs/component-catalog.{json,md}`, `gates/scripts/contrato/**`, `specs/00-backlog.md`, `specs/plan/plan-160-…`, `src/core/Provider/{manifest.ts,__tests__/manifest.test.ts}`, `src/features/DesignEngine/Main/{TemplatesTab.tsx,__tests__/TemplatesTab.test.tsx}`; 24 arquivos não rastreados em `dist/`.

**O que foi feito**
- `troca-de-tema.spec.ts`: `watchTransitions(page)` instala um `transitionrun` no documento (sem tocar o fixture) que lê, no próprio evento, `getAnimations()` → `CSSTransition` da propriedade → `effect.getKeyframes()`, e compara o primeiro e o último quadro-chave: igual = sem efeito (lista `__noEffectTransitions`), diferente = com efeito (`__effectiveTransitions`). O `__transitionRuns` do fixture continua existindo e só serve ao caso do hover.
- **A animação nem sempre existe quando o evento chega.** O `transitionrun` é entregue com atraso (quadros de 100 a 300 ms) e a transição de 150 ms já acabou: lidas ≈ 50 de 200 nas transições de `scrollbar-color`. Então `classifyUnreadable`: a transição sem animação para ler **conta como com efeito**, salvo se a propriedade dela teve pelo menos 10 leituras e todas de um valor para ele mesmo; aí entra como sem efeito, **anotada como "inferida"**. Basta uma leitura com efeito na propriedade para as não lidas dela voltarem a contar. (A primeira versão contava toda não lida: oscilou 146, 156 e 185, e uma execução passou do teto; por isso a inferência.)
- Cada caso do orçamento conta `efetivas lidas + não lidas não inferidas` contra `TRANSITION_RUNS_BUDGET` (174, intacto). A anotação `medido` diz, por caso: as com efeito (lidas + contadas por cautela, por propriedade), as sem efeito (lidas + inferidas, por propriedade) e os recálculos de estilo. O caso embarcado usa o mesmo código (os dois modos rodam o mesmo teste).
- Comentários: cabeçalho (item 3 da lista e limite 3) e o comentário do teto registram a regra, a data (2026-11-12), a medida de hoje e a medida sem marca.
- Nenhum arquivo da marca, `_motion.css`, `_base.css`, nem `transition: all` dos cartões foi tocado (`git status` de `src/core/Provider/utils`, `src/styles`, `src/core/Provider/components`: vazio).

**Mutação (marca desligada numa cópia)**
Cópia da árvore em `C:\tmp\sarak-mut-troca` (sem `node_modules`/`.git`, `node_modules` por junção), com `markThemeSwitching` devolvendo `() => undefined` antes de gravar o atributo, e o spec da cópia sem as asserções da marca e com espera fixa de 8 s (sem a marca, o spec falharia antes na espera pelo atributo). O spec e o build (CSS de `dist/`) são os finais.
- **Com a marca:** **8** transições com efeito (App e Embarcado), 201 sem efeito.
- **Sem a marca:** **946** (App: 919 lidas + 27 contadas) e **1.041** (Embarcado: 1.016 lidas + 25 contadas) com efeito, ambas > 174; `scrollbar-color` aparece aqui com valores diferentes (×178 e ×242 com efeito), então a inferência fica desligada para ele: o filtro não esconde transição real. Uma execução anterior, com a versão do contador que ainda não inferia, deu 1.330 e 1.047.
- Cópia removida (junção primeiro; o `Remove-Item` falhou uma vez por o shell estar dentro do diretório e passou na segunda); `node_modules` do repositório intacto (375 entradas).

**Verificações executadas**
- `npx tsc --noEmit` → limpo.
- `npm run build` (build atual) e `npx playwright test … browser-tests/troca-de-tema.spec.ts --workers=1`:
  - versão final: 4 de 4 passaram, 3 rodadas seguidas mais uma final (8 execuções do caso do orçamento): sempre **8 com efeito** e **201 sem efeito** (`scrollbar-color`, 48 a 63 lidas e o resto inferido), 21 a 26 recálculos de estilo (teto 32), 1 recálculo da tela inteira;
  - total de 209 transições, o mesmo número que o contador antigo dava e que o teto não aceitava.
- Antes do navegador e do build conferi que nenhum outro processo usava navegador, playwright, vitest ou tsup.
- Sem vitest, `cromo-css-real:check` completo, baseline ou `quick`: o veredito os dispensou (mudança só neste spec).
- `git restore -- dist src/buildInfo.ts src/core/Provider/buildInfo.ts` feito. Sobraram **24 arquivos não rastreados em `dist/`**: `CustomizationPanelImpl-J5ZPDZUD.js`, `SarakChartEngine-7VQ2XPDI.js`, `SarakChatEngine-CNZHUQKZ.js`, `SarakDashboardGridImpl-32MAR2H2.js`, `SarakDataGridImpl-HVEJT5PR.js`, `SarakDataTableImpl-5LYJTRSU.js`, `SarakFlowEngine-CLG3GADF.js`, `SarakKanbanImpl-PPB7QDSM.js`, `SarakMapImpl-ISOPVAPP.js`, `SarakMarkdownRendererImpl-SMSPUQFU.js`, `SarakPDFViewerImpl-I4CO6N45.js`, `SarakQRCodeImpl-VFVXJYJS.js`, `chunk-{77NSUKJ3,KHPSE3RN,LBHA7EJX,NI5TEQ3C,QF5PQI3R,SIAD2OZK,T4HZH5QI,T6ALZJRT,ZTQKCNB3}.js`, `dot-matrix-elegant-Z7VF4RG7.js`, `nature-breeze-776YNTDP.js`, `neo-brutalism-classic-LFG7LVL4.js`. `git clean -fdq -- dist` é do dono.

**Critérios de aceite**
- [x] Só as transições que mudam o valor contam no teto; as de um valor para ele mesmo vão para contagem à parte e são anotadas — `troca-de-tema.spec.ts` (`watchTransitions`, `classifyUnreadable`, anotação `medido`).
- [x] Teto em 174 — `TRANSITION_RUNS_BUDGET`.
- [x] Mutação com a marca desligada, os dois números — 8 com a marca; 946 (App) e 1.041 (Embarcado) sem ela.
- [x] `troca-de-tema.spec.ts` isolado, `--workers=1`, nos dois modos, build atual — 4 de 4, repetido 4 vezes.
- [x] Marca, `_motion.css`, `_base.css` e `transition: all` dos cartões intactos.

**Decisões e suposições**
- **Inferência por propriedade** (≥ 10 leituras, todas sem efeito): a primeira versão, que só contava o que lia, oscilou perto do teto e não servia. Ela é uma suposição declarada no comentário do spec e na anotação ("inferidas"); a mutação prova que ela se desliga quando a propriedade tem leitura com efeito. Se o revisor preferir leitura exata, o caminho é capturar a animação mais cedo, e isso pede instrumentar a lib ou o fixture (fora do escopo).
- **Fixture intacto:** o contador novo mora no spec; o `__transitionRuns` do fixture segue só para o caso do hover.
- **Margem:** com o filtro, a medida de hoje (8) fica bem abaixo do teto (174), mas o teto não foi apertado, como o veredito mandou.
- **Mutação com o spec adaptado na cópia:** só as asserções da marca e a espera foram trocadas na cópia; o contador, a classificação e o teto são os do spec final.

**Achados fora do escopo (não corrigidos)**
- Só ≈ 25% das transições de `scrollbar-color` ainda têm animação quando o `transitionrun` chega; o resto não é lido. Isso depende do atraso dos quadros da troca (a prévia remontada 8 vezes, registrada na plan-158).
- O custo das 201 transições sem efeito e a causa no app (o repro mínimo não reproduz) seguem no backlog (item 78).

**Pendências / riscos**
- `git clean -fdq -- dist` (24 arquivos) é do dono.
- Se um dia uma propriedade nova tiver mais de 10 leituras sem efeito e transições reais sem leitura na mesma troca, a inferência as esconderia; a mutação cobre o caso da marca desligada, não esse. Para esse cenário a anotação lista as inferidas por propriedade.

## Veredito — 2026-11-12 — correção 3 do lote 3 — 🟢 Aprovado; a plan fecha

**Conferido por mim:**
- O `git diff` de `browser-tests/troca-de-tema.spec.ts`, que é o único arquivo da correção.
- `git status`: nenhum arquivo da marca, de `_motion.css` ou de `_base.css` mudou.
- A verificação do lote 3 que a §7 dá ao revisor. Rodei `TemaRemovidoGravado.test.tsx` e `useResolvedThemeId.test.ts`:
  19 de 19 verdes.

Não repeti o spec de navegador nem a mutação.

**Aceito:**
- A leitura no próprio `transitionrun` (`getAnimations()` → `CSSTransition` → `getKeyframes()`).
- A transição que não dá para ler conta no teto, por cautela.
- A inferência por propriedade: pelo menos 10 leituras, todas sem efeito, e nenhuma com efeito. É uma suposição declarada no
  limite 3 do cabeçalho e na anotação ("inferidas").
- A mutação com a marca desligada fecha a pergunta do veredito. Sem a marca, o teste conta 946 (App) e 1.041 (Embarcado)
  transições com efeito. O `scrollbar-color` aparece com efeito nessa medida, o que desliga a inferência para ele.
- O teto continua 174 e a medida de hoje é 8, sem aperto.
- `THEME_CARD = /Cyberpunk Neon(?! Classic)/` é necessário: o Cyberpunk Neon Classic do lote 1 casava com o mesmo nome.

O risco que o executor declarou fica registrado no comentário do spec. É o caso de uma propriedade nova com só leituras sem efeito
e transições reais não lidas na mesma troca. Não pede item novo de backlog: o item 78 já cobre a causa do atraso.

**Lote 3: aprovado. A plan está completa (lotes 0 a 3).**

**Depois do commit (revisor):**
- Síntese em `specs/specs/09-temas-e-presets.md`:
  - §5: o catálogo com os 7 resgatados, sem o Synthwave Retro;
  - §4.3: na persistência, só o id que a lib removeu (`SARAK_REMOVED_THEME_IDS`) cai no padrão, salvo se o importador declara o
    id em `customThemes`; outro id desconhecido mantém o design gravado; a prop e o `initialTheme` caem no padrão com aviso;
    `resolvedThemeId` é o padrão enquanto o id da prop for desconhecido.
- Expurgo da plan, do anexo e dos JSONs.

**Status da plan: 🟢 Aprovado.**
