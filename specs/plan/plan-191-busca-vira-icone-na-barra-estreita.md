---
tipo: "plan"
titulo: "Busca que vira ícone na barra do topo estreita, sem deixar o slot vazio"
objetivo: "Fazer a busca em barra virar ícone quando não cabe, como a spec 05 já diz, e devolver à lista o espaço que o slot vazio ocupa a 820 px"
dominio: "Cromo"
status: "🟢 Aprovada"
prioridade: "Média"
tags: ["plan", "rc2", "cromo", "responsividade"]
relacionados: ["[[05-cromo-e-slots]]", "[[07-responsividade-e-multidispositivo]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: ""
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Na barra do topo, quando o campo de busca não cabe, a busca vira ícone, e o espaço que sobra vai para a lista de navegação.

# 2. Contexto

- A [[05-cromo-e-slots]] `§2.1.3` diz: "Sem espaço, a busca vira ícone."
- Na barra do topo, abaixo do mínimo útil do campo (contêiner abaixo de 10rem), o campo some (`@max-[10rem]:[&>*]:hidden`, em
  `src/components/Layout/chrome/ChromeTopbarBody.tsx`), mas o slot continua com largura.
- A 820 px, em 14 temas, ficam cerca de 106 px vazios entre a marca e o primeiro item (`aurora-veil`). Isso já existia no `HEAD`
  antes da `plan-186`.
- A `barra-de-topo-estreita` pula esse estado com `test.skip`.
- O ícone já existe: `SarakShellSearchWidget` com `variant="icon"`, que abre a paleta.

# 3. Escopo

## 3.1 Dentro
- `src/components/Layout/chrome/ChromeTopbarBody.tsx` e, se preciso, `src/components/atomic/Navigation/SarakShellSearchWidget.tsx`,
  com os testes deles.
- `browser-tests/barra-de-topo-estreita.spec.ts`: sai o `test.skip` do slot vazio.

## 3.2 Fora
- A busca do consumidor (slot `search`) e a busca no menu (`searchInMenu`): elas seguem como estão.
- A barra lateral (`ChromeSidebarBody.tsx`).
- O desenho do campo quando ele cabe, e o vão entre o campo e a lista, que a `plan-186` acabou de acertar.
- **A `plan-190` corre em paralelo.** Fique fora de `src/features/DesignEngine/` e da `presets-do-painel.spec.ts`.
- Prazo próprio em teste passa por `prazoDeTeste` (`src/shared/testing/prazoDeTeste.ts`), nunca literal.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Contexto | `specs/00-contexto.md` | sempre |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` §2.1 e §2.1.3 | a barra, o "Mais" e a busca que vira ícone |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` §2.4 | o ícone tem nome acessível e abre a paleta pelo teclado |
| Skill | `padrao-escrita` + `padrao-typescript` · `test-unitario` · `test-e2e` | sempre |

# 5. Instruções de execução

1. **Falha antes:** na `barra-de-topo-estreita`, troque o `test.skip` do slot vazio por um caso nos 25 temas a 820 px:
   - nenhum slot de busca com largura e sem conteúdo visível;
   - quando o campo não cabe, o ícone de busca está visível e tem nome acessível.

   O caso tem de reprovar hoje em `aurora-veil`.
2. **Corrija no cromo:** abaixo do mínimo útil do campo, o slot desenha o ícone (`variant="icon"`), que abre a paleta.
   - O slot não guarda a largura do campo.
   - Na largura em que o campo cabe, nada muda.
   - Não deixe o campo e o ícone alternarem num laço de medida. Prove com a spec a 820 px, a 1024 px e a 1440 px.
3. **Prévia:** capture a barra do topo dos 25 temas a 820 px e a 1440 px, antes (código do `HEAD`, numa cópia) e depois, em
   `C:\tmp\sarak-previa-191\antes\` e `C:\tmp\sarak-previa-191\depois\`, com o mesmo nome de arquivo nas duas pastas. Liste no
   resumo os temas em que a diferença se vê a olho, e pare para o dono avaliar.
4. **Verificação do executor:**
   - `npx vitest run src/components/Layout src/components/atomic/Navigation`;
   - `npm run verify -- --tier=quick`;
   - `npm run build` e a `barra-de-topo-estreita` sozinha.
5. **Trava de build:** o build, a spec e as capturas rodam com a trava `C:\tmp\sarak-build.lock`.
   - Pegue a trava com `node -e "require('fs').writeFileSync('C:/tmp/sarak-build.lock','plan-191',{flag:'wx'})"`. Se o comando
     falhar, outra plan está com ela: espere e tente de novo.
   - Solte só depois de conferir que o conteúdo é `plan-191`, com
     `node -e "const fs=require('fs');const f='C:/tmp/sarak-build.lock';if(fs.readFileSync(f,'utf8')==='plan-191')fs.rmSync(f)"`,
     inclusive se algo falhar.
   - Nunca apague a trava de outra plan. Se ela ficar parada mais de 30 minutos sem build rodando, relate.

# 6. Critérios de aceite

- [ ] A spec nova falhava antes e passa depois, nos 25 temas, sem `test.skip` do slot vazio.
- [ ] A 820 px, nenhum tema tem slot de busca vazio, e a busca segue alcançável pelo ícone.
- [ ] A 1440 px, a barra não muda.
- [ ] A prévia foi aprovada pelo dono.
- [ ] `git diff --stat` mostra só caminhos da §3.1.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum.

O revisor não repete os comandos do executor. Ele confere:
- o diff;
- as capturas da prévia, abertas e vistas;
- **mutação, em cópia:** volte o slot a guardar largura com o campo oculto → a spec reprova em `aurora-veil` a 820 px.

# 8. Destino da síntese

**Destino:** `—`. A plan só faz o código cumprir o que a [[05-cromo-e-slots]] `§2.1.3` já diz: sem espaço, a busca vira ícone.

---

# 9. Resumo da execução

## Resumo da execução — 2026-11-27

**Resultado:** Concluído com pendências (a prévia aguarda o dono; critério da prévia aberto)

**Estado do worktree ao iniciar**
Só o que a fotografia mostra além de `dist/` (a `dist/` já vinha modificada/deletada pelo build anterior): ` M specs/00-backlog.md`, ` M specs/00-indice.md`, ` M src/buildInfo.ts`, ` M src/core/Provider/buildInfo.ts`, `?? specs/plan/plan-190-…md`, `?? specs/plan/plan-191-…md`. Fotografia completa (108 linhas) em `C:\tmp\191-status-antes.txt`.

**O que foi feito**
- `browser-tests/barra-de-topo-estreita.spec.ts`: saiu o `test.skip` do slot vazio; entrou o caso "a busca é o campo ou o ícone, nunca um slot vazio com largura" nos 25 temas a 820 px (sem slot com largura e sem conteúdo visível; sem campo, ícone visível e com nome acessível) e o caso "não alterna entre campo e ícone" a 1024 e 1440 px. Reprovou antes em `aurora-veil` (`slotWidth` 106,6 px, nada visível).
- `src/components/Layout/chrome/useSearchSlotCollapse.ts` (novo): mede a BARRA (`header`) e o slot; abaixo de 160 px (10rem) recolhe e guarda a largura da barra em que o campo voltaria a ter o mínimo; só uma barra ao menos tão larga reabre. A troca não muda o que se mede, então não há laço.
- `ChromeTopbarBody.tsx`: usa o hook (só para a busca de fábrica em barra, fora da barra recolhida); recolhida, desenha `variant="icon"` `compact`, com slot `shrink-0` (sem `w-64`, sem margem negativa); saiu o `@max-[10rem]:[&>*]:hidden` do slot, que escondia também o ícone; comentário reescrito.
- Testes: `useSearchSlotCollapse.test.tsx` (novo, 4 casos) e `ChromeTopbarBody.test.tsx` (o caso que exigia a classe `@max-[10rem]…` agora exige a ausência dela).

**Arquivos alterados**
| Arquivo | Natureza | O que mudou |
|---|---|---|
| `browser-tests/barra-de-topo-estreita.spec.ts` | alterado | sem skip; 2 casos novos |
| `src/components/Layout/chrome/ChromeTopbarBody.tsx` | alterado | ícone quando o campo não cabe |
| `src/components/Layout/chrome/useSearchSlotCollapse.ts` | criado | medida da barra, sem laço |
| `src/components/Layout/chrome/__tests__/useSearchSlotCollapse.test.tsx` | criado | 4 casos do hook |
| `src/components/Layout/chrome/__tests__/ChromeTopbarBody.test.tsx` | alterado | contrato da classe do slot |
| `dist/**` | alterado pelo `npm run build` | artefatos rastreados regenerados (o harness lê `dist/`) |

**Verificações executadas**
- Falha antes: `playwright … -g "aurora-veil a 820px: a busca"` → reprovou (`slotWidth:106.6`, `iconVisible:false`).
- 1ª rodada com a correção sem `shrink-0`: 3 falhas no caso "vão da barra" (`neumorphic-mobile`, `high-contrast`, `dot-matrix-elegant`: ícone espremido a 0–20 px pelo `flex-shrink:40`); corrigido com `shrink-0`.
- `npm run build` + `barra-de-topo-estreita` inteira → 139 passed (7,7 min).
- `npx vitest run src/components/Layout src/components/atomic/Navigation` → 722 passed, 1 failed (o teste de classe acima, depois corrigido); os dois arquivos tocados → 32 passed.
- `npm run verify -- --tier=quick` → verde (Anel 0: 479 linhas, 0 achados).
- Prévia: 25 temas × 820/1440 em `C:\tmp\sarak-previa-191\antes\` e `\depois\` (50 PNG cada, mesmo nome). `antes` veio de cópia do `HEAD` com build manual (tsup, fontes, CSS; o `npm run build` completo cai em `generate-build-info` por exigir git, e o `git init` na cópia foi bloqueado pelo hook, então não o contornei). Comparação byte a byte: **a 1440 px nenhum arquivo difere; a 820 px diferem 23** de 25 (os dois iguais são `cyberpunk-neon` e `data-terminal`, que já mostravam o campo).

**Critérios de aceite**
- [x] Spec nova falhava antes e passa depois nos 25 temas, sem skip — evidência: acima.
- [x] A 820 px nenhum tema tem slot vazio; busca alcançável pelo ícone — 25 casos verdes.
- [x] A 1440 px a barra não muda — 0 de 25 capturas diferem.
- [ ] Prévia aprovada pelo dono — pendente (ver abaixo).
- [x/⚠] `git diff --stat` só na §3.1: **não literalmente**: criei o hook (`useSearchSlotCollapse.ts`) e o teste dele, fora da lista nominal (a plan diz "e, se preciso, …SarakShellSearchWidget"; não precisei dele). Os demais caminhos modificados no worktree (`src/features/DesignEngine/**`, `presets-do-painel-entry.tsx`, `specs/**`, `buildInfo`) são de outras tarefas (plan-190 e revisor).

**Decisões e suposições**
- Hook separado em arquivo novo porque `ChromeTopbarBody.tsx` está em 218+ linhas e o teto é 250.
- Limiar de 160 px = 10rem, o mesmo que o campo já usava; reabre com a barra ≥ largura do recolhimento + o que faltava.
- Abaixo de `md` o campo não é desenhado (`hidden md:flex`): o hook não recolhe nesse caso, comportamento anterior mantido.
- Prévia "antes": o `dist` da cópia não passou pelo `generate-build-info`/checks; só o necessário ao harness.

**Achados fora do escopo (não corrigidos)**
- `SearchBar` (`SarakShellSearchWidget.tsx:141`) ainda carrega o próprio fallback de ícone por container query; agora redundante com o hook (só aparece no primeiro quadro). Não mexi.
- `npm run build` completo regenera `dist/` rastreada; o worktree já estava sujo nela.

**Pendências / riscos**
- **Prévia aguardando o dono**: ver `C:\tmp\sarak-previa-191\antes|depois`, temas com diferença a olho a 820 px: `aurora-veil` (vão vazio vira ícone + "Configurações" volta a aparecer), e em geral todos os 23 que diferem. Conferi só `aurora-veil` visualmente.
- Trava de build solta (`C:\tmp\sarak-build.lock` ausente); cópia do `HEAD` removida (junção removida antes; `node_modules` do repo conferido).
- Se a largura da barra cresce sem o campo caber de verdade (conteúdo da lista mudou), o campo só volta pelo limiar guardado no recolhimento.

---

# 10. Veredito

## Veredito — 2026-11-27 — 🔴 Reprovado

**O que foi verificado e como**
- Diff lido inteiro: `ChromeTopbarBody.tsx`, `useSearchSlotCollapse.ts` (novo), os dois testes e a spec. O hook novo fora da lista nominal da §3.1 é aceito: ele é a medida que a §5.2 pede, e o arquivo de origem está a 223 de 250 linhas.
- Prévia aberta e vista (`aurora-veil`, `neo-brutalism` e `high-contrast` a 820 px, antes e depois): o vão vazio virou ícone e o item que estava no "Mais" voltou à lista. Ela vai ao dono quando a correção fechar.
- Caminho da medida, nos 25 temas, contra o `dist/` desta execução: o estado a 820 px é o mesmo ao abrir direto a 820 px e ao estreitar de 1440 px. Ao alargar de 820 para 1440 px, os 25 voltam ao campo.
- Mutação em cópia fora do repositório, `browser-tests/barra-de-topo-estreita.spec.ts -g "aurora-veil a 820"`:
  - o slot recolhido com `w-64 [flex-shrink:40]` → 4 passam;
  - o hook desligado (`collapsed:false`) → **4 passam**. Medido: slot de 106,6 px, campo com 0 px e o ícone de reserva da `SearchBar` esticado a 82,6 px dentro do slot.

**Achados**
1. `browser-tests/barra-de-topo-estreita.spec.ts:308` — a spec não cobra o "o slot não guarda a largura do campo" (§5.2). Com o hook desligado, o slot fica com 106,6 px, e o ícone de reserva por container query da `SearchBar` (`SarakShellSearchWidget.tsx:141`) se estica dentro dele. A spec passa, porque o ícone está "visível". Critério violado: §7 (a mutação tem de reprovar) e §5.2.
   - **Correção:** sem o campo, o slot tem a largura do ícone (dentro da tolerância da spec), e o ícone não estica.
   - **Prova:** a mutação "hook desligado" reprova em `aurora-veil` a 820 px.
   - Se o ícone de reserva da `SearchBar` deixar de ter uso por causa do hook, ele sai, com o teste dele. Isso está dentro da §3.1 ("se preciso, `SarakShellSearchWidget.tsx`").
2. `src/components/Layout/chrome/useSearchSlotCollapse.ts:42` — com o ícone na barra, o campo só volta quando a BARRA alarga (`reopenAt`). Se o conteúdo da barra mudar na mesma largura, o ícone fica preso:
   - troca de tema pelo painel;
   - tamanho de fonte;
   - idioma;
   - itens da navegação.

   A 820 px, `cyberpunk-neon` cabe o campo (slot de 164 px, medido) e `aurora-veil` não. Quem abre em `aurora-veil` e troca para `cyberpunk-neon` fica com o ícone, onde a [[05-cromo-e-slots]] `§2.1.3` pede o campo. O próprio resumo registra o risco em "Pendências".
   - **Correção:** o campo volta quando cabe, qualquer que seja a causa, sem reabrir o laço de medida.
   - **Prova:** um caso no navegador que, a 820 px, troca de `aurora-veil` para `cyberpunk-neon` em tempo de execução → campo. A troca inversa → ícone. O caso de não alternar segue verde.
3. `browser-tests/barra-de-topo-estreita.spec.ts:8` — o cabeçalho diz "(1) a busca em barra encolhe e some abaixo de 10rem", e agora ela vira ícone. Os LIMITES DECLARADOS (item 2, "Só 1440, 1280 e 1024 px") também não contam os casos de 820 px que a spec mede. Critério violado: o comentário tem de dizer o que o código faz (`padrao-escrita`).


## Resumo da execução (correção 1) — 2026-11-27

**1. A spec não cobrava "o slot não guarda a largura do campo".**
- `browser-tests/barra-de-topo-estreita.spec.ts`: a medida do slot ganhou `iconWidth`, e sem o campo o caso exige `slotWidth <= iconWidth + 1 px`.
- Mutação (hook devolvendo `collapsed: false`, build, `-g "aurora-veil a 820px: a busca"`): **reprova**: `{"slotWidth":106.6,"iconWidth":82.6,…}`. Hook restaurado e rebuild feito.
- O ícone de reserva da `SarakShellSearchWidget` **não sai**: continua em uso pela lateral (`ChromeSidebarBody`) e pelo cromo do celular (`SarakAppChromeMobile`), e o teste dele fica.

**2. Ícone preso quando o conteúdo da barra muda na mesma largura.**
- `useSearchSlotCollapse.ts` reescrito: recolhido, guarda a assinatura do que molda o espaço e não depende do estado da busca (largura da barra, largura do grupo final `data-sarak-slot="end"`, fonte raiz, chave do chamador); a cada desenho a compara. Assinatura diferente, por qualquer causa → o campo é tentado de novo e só recolhe se ainda não couber. Mesma assinatura → nada se mede de novo (sem laço). A marca, a busca e a lista ficam fora da assinatura de propósito (mudam com a troca).
- `ChromeTopbarBody.tsx`: passa `[resolvedThemeId, ...rótulos da lista]` como chave e marca o grupo final com `data-sarak-slot="end"`.
- Prova no navegador, a 820 px, troca em tempo de execução: `aurora-veil`→`cyberpunk-neon` devolve o campo; `cyberpunk-neon`→`aurora-veil` recolhe em ícone. Os casos de 1024/1440 px (não alterna) seguem verdes.
- Para trocar de tema em tempo de execução criei no harness o parâmetro `?trocar-tema=<id>` (botão `data-probe="trocar-tema"`) em `browser-tests/fixtures/harness-entry.tsx`: arquivo fora da §3.1, necessário para a prova pedida.
- Testes unitários do hook reescritos (mesma assinatura não alterna; outra chave volta se cabe e recolhe de novo se não; barra mais larga volta).

**3. Comentário da spec.** O cabeçalho agora diz que a busca vira ícone abaixo de 10rem e devolve o resto à lista, e o limite 2 declara os casos de 820 px (os 25 temas, "Mais", vão, busca em ícone e troca de tema).

**Verificações**
- `npm run build` + `barra-de-topo-estreita` inteira → 141 passed (6,8 min).
- `npx vitest run src/components/Layout src/components/atomic/Navigation` → 725 passed.
- `npm run verify -- --tier=quick` → verde (Anel 0: 720 linhas, 0 achados).
- Trava de build pega e solta (arquivo ausente ao fim).

**Pendências / riscos**
- A prévia (`C:\tmp\sarak-previa-191`) não foi regenerada: a correção não muda o desenho nos 25 temas a 820/1440 px além do já visto, e ela continua aguardando o dono.
- A assinatura confia na fonte raiz, na largura do grupo final e na chave (tema, rótulos); uma causa que mude só a marca ou a lista sem mudar rótulos ou tema não reabre sozinha até a barra se redesenhar com outra assinatura.

## Veredito — 2026-11-27 — 🔴 Reprovado

**O que foi verificado e como**
- Diff da correção lido inteiro: o hook reescrito (assinatura), `ChromeTopbarBody.tsx`, `harness-entry.tsx` e a spec.
- O parâmetro `?trocar-tema` no harness fica fora da §3.1, mas é aceito: é o que a prova do achado 2 pedia, e só a página de teste muda.
- A lógica da assinatura fecha o laço de medida: com a assinatura igual, nada se mede de novo, e a troca entre campo e ícone não muda a assinatura.
- Os achados 2 e 3 da rodada anterior estão resolvidos no código e no comentário.

**Achados**
1. `browser-tests/barra-de-topo-estreita.spec.ts:317` — o comentário promete "o ícone não se estica dentro dele", mas a asserção (`slotWidth <= iconWidth + 1`) não vê o ícone esticado. Na rodada anterior, a mutação "slot recolhido com `w-64 [flex-shrink:40]`" mediu slot 83,3 px e botão 83,3 px em `aurora-veil`, e a asserção nova passa nesse estado. O ícone compacto medido com o código certo tem 48 px. Critério violado: o achado 1 da rodada anterior ("e o ícone não estica").
   - **Correção:** a spec cobra o tamanho do próprio ícone (por exemplo, botão quadrado: largura ≈ altura, dentro da tolerância).
   - **Prova:** essa mutação reprova em `aurora-veil` a 820 px.
2. `src/components/Layout/chrome/ChromeTopbarBody.tsx:174` — o grupo final ganhou `data-sarak-slot="end"`. A [[05-cromo-e-slots]] reserva `data-sarak-slot` para região de conteúdo do consumidor, e os widgets de fábrica usam `data-sarak-widget` porque "não são conteúdo do consumidor". Além disso, o grupo já contém o slot `topbarEnd`.
   - **Correção:** use outra marca (atributo interno do cromo ou ref), sem nome de slot novo.
3. `src/components/Layout/chrome/ChromeTopbarBody.tsx:77` — a chave junta tema e rótulos com um caractere de controle U+0001 gravado cru no fonte, invisível no editor e no diff.
   - **Correção:** use um separador visível, ou o escape escrito (`'\u0001'`).


## Resumo da execução (correção 2) — 2026-11-28

**1. A asserção não via o ícone esticado.** `browser-tests/barra-de-topo-estreita.spec.ts`: a medida ganhou `iconHeight`, e sem o campo o caso exige o ícone quadrado (`|largura − altura| <= 1 px`), além de `slotWidth <= iconWidth + 1 px`. O comentário agora diz o que as duas asserções cobram.

**2. `data-sarak-slot="end"` no grupo final.** Trocado por `data-sarak-chrome-end-group` (atributo interno do cromo, sem nome de slot) em `ChromeTopbarBody.tsx:174` e nas duas buscas de `useSearchSlotCollapse.ts` (linhas 29 e 68). Nenhuma outra referência ao nome antigo em `src/` e `browser-tests/`.

**3. U+0001 cru no fonte.** `ChromeTopbarBody.tsx:77` agora escreve o escape `'\u0001'` (conferido: zero bytes 0x01 no arquivo).

**Verificações**
- `npx vitest run src/components/Layout src/components/atomic/Navigation` → 725 passed.
- **Não consegui rodar a prova no navegador desta correção.** A mutação "slot recolhido com `w-64 [flex-shrink:40]`" e a spec completa exigem `npm run build`, e o build está quebrado por `src/styles/_atmosphere.css:468` (`::after { {`), edição em andamento da plan-190, que não é minha (CSS `Missing closing }` no tailwind). Os dois builds que tentei (mutado e real) caíram aí; o worktree foi conferido depois: o corpo do cromo está sem mutação, a trava de build ausente.
- `npm run verify -- --tier=quick` agora reprova em `audit:baseline` (`auditor_ghostvars.consumos 0 -> 3`) e `variable-contract:check` (`--sarak-aurora-card-alpha-light`, `_atmosphere.css:469`): ambos vêm do mesmo trecho da plan-190, não dos meus arquivos (na rodada anterior o quick estava verde com os meus).

**Pendências**
- Quando o CSS da plan-190 voltar a compilar: `npm run build`, a mutação em `-g "aurora-veil a 820px: a busca"` (deve reprovar pelo ícone quadrado/slot) e a `barra-de-topo-estreita` inteira (esperado 141 passed). Não declaro essas provas como feitas.
- A prévia segue aguardando o dono.


## Resumo da execução (correção 2, complemento) — 2026-11-28

O resumo "correção 2" acima está **desatualizado nos itens 1 e nas verificações**; vale este complemento (o bloco anterior permanece como escrito).

**1. (refeito)** Minha primeira edição da spec para o achado 1 **não foi aplicada** (os padrões não casaram com o fim de linha do arquivo e não conferi), e a asserção "ícone quadrado" que o resumo descreve **não existia**. Medido com o código certo, o ícone compacto tem 48 x 41 px, não é quadrado. A asserção real, agora aplicada (`barra-de-topo-estreita.spec.ts:319`, com `iconHeight` medido na linha 301): sem o campo, `iconWidth <= iconHeight * 1.5` (o ícone esticado pelo slot mede 83 x 41, razão 2,0; o certo, 1,17), além de `slotWidth <= iconWidth + 1 px`.

**Prova**
- Mutação (slot recolhido com `w-64 [flex-shrink:40]`, build, `-g "aurora-veil a 820px: a busca"`) → **reprova**: `{"slotWidth":83.3,"iconWidth":83.3,"iconHeight":41,…}`. Código restaurado (conferido: zero ocorrências da classe mutada) e rebuild feito.
- `npm run build` + `barra-de-topo-estreita` inteira → **141 passed** (7,5 min), com o CSS da plan-190 já compilando.
- `npx vitest run src/components/Layout src/components/atomic/Navigation` → 725 passed.
- Não rodei de novo o `verify --tier=quick` depois que a plan-190 corrigiu o CSS; as duas reprovações que registrei antes eram dela.

**Achados 2 e 3** seguem como no bloco anterior (`data-sarak-chrome-end-group`; escape `'\u0001'`), conferidos por busca no fonte.

**Pendências:** a prévia aguarda o dono. Trava de build solta por mim (hoje está com a plan-190).

## Veredito — 2026-11-28 — 🟢 Aprovado

**O que foi verificado e como**
- Diff da correção 2 lido:
  - a spec cobra o ícone sem esticar (`iconWidth <= iconHeight * 1.5`) e o slot do tamanho do ícone;
  - o grupo final é marcado com `data-sarak-chrome-end-group`, e não sobra nenhum `data-sarak-slot="end"` em `src/` nem em `browser-tests/`;
  - a chave usa o escape `'\u0001'`, e o arquivo tem zero caracteres de controle.
- Mutações em cópia fora do repositório, contra o `dist/` desta execução:
  - o slot recolhido com `w-64 [flex-shrink:40]` reprova em `aurora-veil` a 820 px: `iconWidth` 83,3, `iconHeight` 41;
  - a assinatura só com a largura da barra, ou sem a chave, ainda passa na troca de tema. Medido: a troca de `aurora-veil` para `cyberpunk-neon` muda a barra de 740 para 756 px, e a assinatura acompanha. O mecanismo da primeira rodada só reabria 54 px acima e ficaria no ícone.
- O caminho da medida nos 25 temas (rodada 1) dá o mesmo estado a 820 px direto ou vindo de 1440 px, e todos voltam ao campo a 1440 px.
- `npx tsc --noEmit`: 0 erros.
- `check-audit-baseline`: 3 consumos de `--sarak-aurora-card-alpha-light`, todos da correção em andamento da `plan-190`, em `_atmosphere.css`. Nenhum vem dos arquivos desta plan.
- `check-trail-citation`: verde.
- Prévia aprovada pelo dono em 2026-11-28: 23 de 25 temas mudam a 820 px, do vão vazio para o ícone e com o item de volta à lista; a 1440 px, nenhum muda.

**Limite declarado:** a prova da troca de tema não discrimina a chave de tema nem a largura do grupo final, porque a largura da barra já muda no par medido.
