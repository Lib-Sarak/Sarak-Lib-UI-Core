---
tipo: "plan"
titulo: "Validar a 9.0.0-rc.1 no hub-iarendel por interação com a tela"
objetivo: "Entregar ao dono um relatório objetivo, com medida e captura, de cada mudança da 9.0.0-rc.1 vista no hub-iarendel, separando o que está certo do que é defeito da lib e do que é do hub, para decidir entre a 9.0.0 estável e uma rc.2"
dominio: "Release / Validação em importador"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "release-9-0-0", "validacao", "navegador"]
relacionados: ["[[03-versionamento-e-release]]", "[[05-cromo-e-slots]]", "[[06-painel-de-customizacao-e-preview]]", "[[09-temas-e-presets]]"]
depende_de: ""
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

Um relatório que diga, para cada mudança da `9.0.0-rc.1`, se ela aparece certa na tela do hub-iarendel, com o número medido e a captura
que provam. Cada defeito é atribuído à lib ou ao hub. Com isso, o dono decide entre emitir a 9.0.0 estável ou abrir uma rc.2.

# 2. Contexto

- **A rc:** a tag `v9.0.0-rc.1` (`55ffe93c`) saiu em 2026-11-24. As mudanças desde a `v8.0.0` estão em `docs/migracoes.md`, nas seções
  `## 9.0.0 — …`, que são a lista do que verificar.
- **O hub:** o repositório é `C:\Users\Igor\Desktop\Sarak\X - Trabalho\Code\Earendel\hub-iarendel`, e o commit `b29cfca7` o levou à
  rc.1. Ele roda em Docker (`run.cmd`), e o endereço é `http://localhost:<HUB_GATEWAY_PORT>`. O dono informa a porta no prompt. **Não leia
  `.env`.**
- **O formato do design gravado:** o hub passou a gravar e devolver o marcador `format` em `PUT` e `GET /api/v1/shell/tema`. É a mudança de
  maior risco do lado do hub.
- **O hub não tem login** (autenticação de transição). O tema aplicado é **global** no banco: o que você aplicar vale para quem abrir o
  hub.
- **O dono já testou à mão** e achou tudo como esperado. Esta plan é a verificação minuciosa, com medida.
- **Medições anteriores no ERP (v8.0.0, 2026-11-10),** que servem de referência:
  - selecionar uma opção do painel levava cerca de 1 s;
  - a topbar escondia itens sem "Mais";
  - o rascunho era descartado em silêncio ao navegar.

  Os três deviam estar resolvidos na rc.

# 3. Escopo

## 3.1 Dentro (o que pode ser tocado)

- Um navegador **próprio**: Playwright do `node_modules` da lib (`@playwright/test` ou `playwright`), lançado pelo seu script. Não use o
  navegador de outra sessão nem um MCP de navegador compartilhado.
- Scripts, capturas e o relatório numa pasta fora dos dois repositórios: `%TEMP%\sarak-rc1-hub\`.
- O tema aplicado do hub, **só no lote 2**, com cópia antes e restauração no fim (§5, lote 2).

## 3.2 Fora (o que NÃO pode ser tocado)

- O código dos dois repositórios, os `node_modules`, `.env`, o Docker (não suba, não derrube e não reconstrua containers) e o Git.
- `POST /api/v1/shell/temas` (criar tema salvo), ou seja, o botão "Salvar tema". Ele cria registro novo que a restauração não desfaz.
- Consertar o que achar. Defeito vai para o relatório.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Lista do que verificar | `docs/migracoes.md`, seções `## 9.0.0 — …` | cada seção é um item do relatório |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | anatomia da barra, "Mais", contraste do cromo |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | decisões, amostras, idiomas, rascunho |
| Spec fixa | `specs/specs/09-temas-e-presets.md` §4.3.4 | contraste calculado nas barras de tom contrastante |

No hub, leia `packages/ui-kit/src/themePersistence.ts`: é o que ele grava e lê do tema.

# 5. Instruções de execução

**Regras para as duas rodadas:**
- Teste em três tamanhos: 1440×900, 820×1180 e 390×844. Teste em claro e escuro.
- Cada item do relatório leva:
  - o veredito: **OK**, **Defeito** ou **Não verificável**;
  - a medida, com o número;
  - o caminho da captura;
  - para defeito, a quem pertence (**lib** ou **hub**) e a severidade (**alta** quando quebra uso ou leitura, **média** quando é
    visível mas contornável, **baixa** quando é cosmético).
- Registre o console da página do começo ao fim. Todo `error`, `pageerror` e resposta 4xx/5xx vira item.
- O helper injetado some a cada navegação de página inteira. Reinjete-o.

## Lote 1 — só leitura (nada é aplicado)

1. **Boot.** Abra `/` e cada rota da navegação. Para cada uma, registre: erro de console, resposta HTTP com falha e se o primeiro quadro
   pisca outra cor antes do tema (duas capturas, uma em `domcontentloaded` e outra depois de `networkidle`).
2. **Barra lateral.** Confira:
   - a moldura em cartão, a faixa da marca, as sub-abas, o vidro no item ativo e os inativos esmaecidos;
   - recolher e expandir;
   - no tamanho de 390, o drawer: abre, fecha com Esc, prende e devolve o foco.
3. **Topbar.** Com a navegação no topo (pelo ⚙, que é preferência pessoal do navegador e não grava no servidor; limpe-a no fim), confira
   nos três tamanhos:
   - `scrollWidth <= clientWidth` na barra;
   - o "Mais" aparece só quando falta espaço e lista os itens escondidos;
   - o item ativo escondido marca o "Mais".
4. **Contraste do cromo.** Para cada texto visível da barra (marca, item, item ativo, usuário, idioma) e cada ícone (avatar, ⚙, sair),
   calcule a razão de contraste contra o fundo efetivo, seguindo a cadeia de fundos e a mistura de opacidade. Texto precisa de ao menos
   4,5:1, e ícone de ao menos 3:1. Faça com o tema aplicado nos dois modos e, sem aplicar, pela prévia do painel nos tons `primary`,
   `secondary`, `inverse` e com degradê. Liste o menor valor de cada peça.
5. **Componentes nas telas dos módulos.**
   - Gráficos ocupam ao menos 60% da altura do quadro.
   - O hover do `<button>` cru não pinta fundo; ele só se move.
   - O `ghost` e o `SarakTitleCard` ficam em ao menos 4,5:1, no repouso e no hover.
   - Tabelas seguem os cantos e o respiro do tema.
   - Nada vaza do cartão (`scrollWidth` do cartão).
6. **Painel `/design` sem aplicar.** Confira:
   - catálogo em grade única;
   - amostras do componente real em cada decisão;
   - decisão própria das barras (orientação, tom único, presets de estrutura);
   - 78 paletas na galeria;
   - estilos de gráfico Suave, Forte e Fina;
   - nas seis línguas, os "Ajustes principais" com nome, descrição e opções traduzidos e nenhum texto em português sobrando fora do
     ajuste fino;
   - aviso de preferência pessoal por cima do tema (crie a preferência pelo ⚙ e limpe no fim).
7. **Rascunho.** Mude uma opção sem aplicar e tente sair por um link do cromo. O painel precisa perguntar antes. "Ficar" mantém o
   rascunho, e "Descartar" sai.
8. **Tempo.** Meça o tempo entre o clique numa opção e o quadro seguinte estável (CDP `Performance.getMetrics` ou `performance.now` com
   `requestAnimationFrame` duplo). Faça 10 amostras e dê mediana e máximo. A referência da v8.0.0 é cerca de 1 s.
9. Limpe `localStorage` das preferências que você criou e confira que a tela voltou ao estado inicial.

**Resumo do lote 1:** a tabela de itens com veredito, medida, captura e dono, e a lista de erros de console e de rede.

## Lote 2 — aplicar e recarregar (mexe no tema global do hub)

1. **Antes de tudo:** `GET /api/v1/shell/tema`. Guarde a resposta inteira em `%TEMP%\sarak-rc1-hub\tema-original.json` e anote o
   instante.
2. **Formato gravado.** Intercepte o `PUT /api/v1/shell/tema` (sem bloquear) e aplique um tema pelo painel. Confira que o corpo traz
   `format: 2` e que o `design` traz só as escolhas, sem as cores calculadas pela paleta. Recarregue e confira que o `GET` devolve o
   `format`.
3. **Escolhas que persistem.** Aplique, nesta ordem, um tema, uma paleta, o tom `inverse` na lateral, o modo claro e uma cor de papel
   ajustada à mão (por exemplo, o fundo). Recarregue duas vezes. Tudo precisa persistir, **inclusive a cor ajustada à mão**.
4. **Sem resto de tema anterior.** Aplique o tema A e depois o tema B, sem ajustes. Compare 10 variáveis de cor da raiz com as do tema B
   aplicado direto a partir do original. Elas precisam ser iguais.
5. **`keepPalette` e paleta salva.** Ligue "Manter minha paleta" e troque o tema: a paleta precisa continuar. Salve uma paleta com nome e
   confira que ela fica no design e aparece na galeria depois de recarregar.
6. **Restauração.** `GET /api/v1/shell/tema` de novo. Se a resposta mudou por algo que você não fez (outra pessoa usando o hub), **pare e
   relate sem restaurar**. Se não, faça `PUT` com o corpo de `tema-original.json`, recarregue e confira que o `GET` é igual ao original.

**Resumo do lote 2:** a tabela de itens no mesmo formato, o corpo do `PUT` observado (sem dado pessoal) e a prova da restauração.

## Relatório final

Num arquivo `%TEMP%\sarak-rc1-hub\relatorio.md` e no resumo da execução:

1. Uma linha de veredito: **pronta para a 9.0.0** ou **precisa de rc.2**, com o motivo.
2. Uma tabela única de todos os itens: área, item, veredito, medida, dono e severidade.
3. Os defeitos da lib, do mais grave ao menos grave, cada um com passo a passo para reproduzir.
4. Os defeitos do hub, em separado.
5. O que não deu para verificar, e por quê.

# 6. Critérios de aceite

- [ ] Todas as seções `## 9.0.0 — …` de `docs/migracoes.md` que têm efeito na tela aparecem no relatório com veredito. As que não têm
      efeito na tela são listadas como tal.
- [ ] Cada veredito OK ou Defeito tem medida ou captura. Nenhum é "parece certo".
- [ ] O tema do hub terminou igual ao original, provado pelo `GET`, ou a parada por mudança de terceiro está relatada.
- [ ] Nenhum arquivo dos dois repositórios mudou (`git status` limpo nos dois, salvo o que já estava sujo ao começar).

# 7. Como verificar (uso do revisor)

**Gate:** nenhum. A plan é de medição, e o produto dela é o relatório.

- `git status` nos dois repositórios: igual ao do início.
- `GET /api/v1/shell/tema` comparado com `tema-original.json`.
- Abrir 3 capturas ao acaso e conferir que mostram o que o item diz.
- Refazer à mão 2 medidas, uma de contraste e uma do "Mais".

# 8. Destino da síntese

**Destino:** `—`. A plan não altera nenhuma verdade documentada. Defeito da lib vira plan nova ou item de backlog. Defeito do hub vai para
o fluxo do hub.

---

# 9. Resumo da execução

**Resultado:** concluído — lotes 1 e 2 executados nesta ordem; o dono viu o resumo do lote 1 e deu o ok antes do lote 2. **Veredito: precisa de rc.2** (motivos na seção abaixo). Relatório completo, com a tabela única de 85 linhas (43 do lote 1, 13 do lote 2, 1 item extra e 28 seções de `docs/migracoes.md`), em `%TEMP%\sarak-rc1-hub\relatorio.md`; capturas em `…\cap\`; scripts `l1_*.cjs` e `l2_*.cjs` na mesma pasta.

**Estado do worktree ao iniciar:** lib: ` M specs/00-indice.md` e `?? specs/plan/plan-172-…md` (o `git status` da sessão). Hub (registrado a pedido do dono, em `hub-git-status-inicio.txt`): branch `dev/igor`, HEAD `e65a78f7`, 43 arquivos modificados e 15 não rastreados, de outra sessão em andamento; não toquei neles.

**O que foi feito:**
- Lote 1 (somente leitura): boot das 7 rotas em 3 tamanhos e 2 esquemas, lateral, drawer, topbar e "Mais", contraste (cromo aplicado e prévia), componentes dos módulos, painel (temas, decisões, paletas, Barras, aviso pessoal, rascunho) e tempo de resposta (mediana 548 ms, máx. 669).
- Lote 2: `GET` do original guardado; 14 aplicações pelo painel e 3 `PUT` da restauração; passos 2 a 6 do plano, mais uma repetição do `keepPalette` no mesmo rascunho para separar defeito de fluxo; restauração com prova.
- Item extra pedido pelo dono: contagem das células `[data-sarak-nav-cell]` e busca de aviso de `key` duplicada (sem alterar o hub): ver E-1 no relatório.

**Arquivos alterados:** só esta plan (status e este resumo). Nenhum código dos dois repositórios, nenhum `.env` lido, "Salvar tema" nunca acionado (nenhum `POST /api/v1/shell/temas` observado; havia uma trava no navegador que o abortaria). Tudo o mais fica em `%TEMP%\sarak-rc1-hub\`.

**Verificações executadas:**
- Boot: 0 erro de console, 0 `pageerror`, 0 resposta ≥400, 0 `requestfailed` em todas as rodadas; sem piscar no primeiro quadro.
- Passo 2: `PUT {"design":{},"activeThemeId":"cyberpunk-neon","format":2}`, `GET` devolve `format: 2` depois de recarregar.
- Passo 3: tema, paleta, tom `inverse`, modo claro e fundo `#f3eadb`, com 2 recargas: tudo persiste no `GET`, no painel e nas variáveis; a cor do fundo, porém, não pinta (defeito).
- Passo 4: A→B contra B direto: 10 variáveis iguais, 0 diferenças nas 545 variáveis de cor da raiz.
- Passo 5: ver defeitos 1 e 2; paleta salva persiste e aparece na galeria.
- Passo 6: `GET` antes igual ao do meu último `PUT` (sem terceiro); `PUT {"design":{},"activeThemeId":"sarak-sovereign","format":2}`; `GET` final com `design`, `activeThemeId` e `format` iguais ao original (só o `updatedAt` mudou: 2026-11-25T03:41:16.971+00:00 contra 2026-11-24T23:36:54.966+00:00); pixel (5,5) igual ao do boot (10,20,21).

**Veredito e defeitos da lib (do mais grave ao menos grave; passo a passo no relatório):**
1. (alta) "Manter minha paleta" não vale depois de uma troca de tema feita em outra aplicação: o `PUT` do tema sai `design: {}` e a paleta some. Funciona só no mesmo rascunho.
2. (alta) Trocar o tema apaga `savedPalettes` (paleta salva com nome some do design).
3. (alta) O "Mais" sobrepõe o último item visível nas rotas de 8 itens (95–109 px, entre 768 e 1100 px); com 7 itens a folga é de 10 px.
4. (média) A cor de fundo à mão persiste (`bgBaseColor`), mas o `body` segue `rgb(234,247,241)`.
5. (média) Prévia clara com degradê: texto ativo a 3,43:1 e 3,61:1 (promessa 4,5:1).
6. (média) O `design` gravado traz valores não escolhidos (`layout: "glass"` alternando, `mode: "dark"`, `sidebarActiveColor` calculado).
7. (média) Diálogo "Trocar de paleta?" diz "Você ajustou 3 cores à mão" (21 em outro tema) sem ajuste nenhum.
8. (média) Texto "Passe o mouse numa opção…" numa coluna de 19 px a 1440 px, com o tema Cyberpunk Neon.
9. (média, a confirmar) Tela Barras: quadros ociosos de 165 ms contra 17 ms (pode ser renderização por software).
10. (baixa) Drawer sem `role`/`aria-modal`/`aria-label` e sem foco preso; `nav.scrollWidth` 977 > 920; aviso de ícone `Gauge`; títulos de card a 4,35:1 no escuro.

**Defeitos do hub:** (1) item "Design" duplicado (8 itens em `/` e `/design`, 7 nas outras), provável causa do "Mais" sobreposto; (2) `modules/shell/web/src/App.tsx:57` monta os itens sem `category`, e `/` perde as categorias; (3) "Limpar filtros" 58% coberto pelo `select` em `/proposals` a 390 px; (4) rota `/proposals/` com barra final após "Descartar e sair" (dono indefinido).

**Item extra (E-1), "Mais" × item "Design" duplicado:** 8 células em `/` e `/design` (duas com `key` `/design`), 7 nas demais; o aviso de `key` duplicada não aparece, mas o bundle é de produção, então a ausência não prova nada. O "Mais" só sobrepõe nas rotas de 8 células, nas 3 larguras medidas. Correlação confirmada; causa exata **não isolada** (exigiria um teste na lib com a mesma lista com e sem rota repetida; o hub não foi alterado). O código no disco do hub soma um só "Design"; a imagem servida pode divergir (não verificado).

**Critérios de aceite:**
- [~] Seções `## 9.0.0` de `docs/migracoes.md` com veredito: as 28 aparecem; 8 sem verificação ou com verificação parcial, todas listadas e justificadas.
- [x] Cada OK ou Defeito tem medida ou captura.
- [x] Tema do hub terminou igual ao original, provado pelo `GET` (ressalva do `updatedAt`).
- [~] Nenhum arquivo dos dois repositórios mudou: não usei git no fim por instrução; vale a fotografia do início e a conferência do revisor. A outra sessão do hub segue editando, então o `git status` do hub final não será igual ao do início por causa dela.

**Decisões e suposições:**
- "Cor de papel" = "Cor de Fundo Base" (o fundo, como o plano sugere).
- No diálogo "Trocar de paleta?" escolhi "Descartar ajustes" nos passos 3 e 5a, para a paleta entrar limpa; nos demais, "Manter".
- Para o passo 4, o original foi restaurado por `PUT` duas vezes antes de aplicar B direto e A→B; cada restauração foi precedida de `GET` e comparação do `updatedAt`.
- Um aviso do lote 1 (`bodySize` "18px" fora do domínio) vem do meu valor de teste, não é defeito.
- O hub engasgou uma vez por cerca de 15 s (um `fetch` falhou, depois voltou); acrescentei repetição ao `GET` do script e retomei sem perda de estado.

**Achados fora do escopo:** as "Pendências" do plano (defeitos da lib e do hub acima) viram plan ou backlog; nada foi corrigido aqui.

**Pendências:** as 8 seções sem verificação ou só parciais (seção 5 do relatório); o teste de causa do "Mais"; tempos em máquina com GPU; os defeitos acima para a rc.2.

---

# 10. Veredito

## Veredito — 2026-11-25 — 🟢 Aprovado

A plan é de medição, e o produto dela é o relatório (`%TEMP%\sarak-rc1-hub\relatorio.md`): 85 linhas, cada uma com veredito,
medida e dono. Conferido pelo revisor:

- **Tema restaurado:** `GET /api/v1/shell/tema` em `localhost:38000` devolve `design: {}`, `activeThemeId: "sarak-sovereign"` e
  `format: 2`, iguais a `tema-original.json`. Só o `updatedAt` mudou (`2026-11-25T03:41:16.971`), que um `PUT` não desfaz.
- **Repositórios:**
  - lib: `git status` mostra só esta plan e o índice;
  - hub: HEAD `e65a78f7`, igual ao da fotografia `hub-git-status-inicio.txt`. As 56 linhas sujas são da outra sessão (escopo de
    organização), e nenhuma é de `packages/ui-kit` nem de `modules/*/web`.
- **Capturas abertas ao acaso, 4 de 4 batem com o item:**
  - `more-overlap-1000-design.png`: o "Mais" sobre "Financeiro";
  - `hint-d.png`: o texto de ajuda numa coluna de uma palavra por linha;
  - `prev-Claro_Sidebar_Prim_ria_Gradiente.png`: a prévia clara com degradê;
  - `l2-s5c.png`: Cores em "Âmbar industrial" depois de aplicar só o tema, com a Esmeralda e o "manter" perdidos. A mesma captura
    mostra o "Design" duplicado na lateral.
- **Código, confronto estático:**
  - O "Mais" usa `key={item.route}` (`src/components/atomic/Navigation/SarakShellNav.tsx:118`), coerente com a hipótese de rota
    duplicada.
  - `composeThemeDesign` preserva `keepPalette` e `savedPalettes` (`THEME_PRESERVED_KEYS`), mas o `PUT` observado sai
    `design: {}`. A perda está no caminho entre o rascunho aberto de novo e a extração das escolhas, e a localização exata fica
    para a plan de correção.
- **Critérios de aceite:**
  - critério 1: as 28 seções aparecem, e as 8 parciais estão justificadas na §5 do relatório;
  - critério 2: cada OK e cada Defeito tem medida;
  - critério 3: tema restaurado;
  - critério 4: verificado pelo revisor, como a própria §7 previa.

**Destino dos achados** (nenhum fica solto):
- **Defeitos da lib:** vão para uma plan de correção da rc.2, se o dono decidir pela rc.2. Senão, vão para o backlog.
- **Defeitos do hub:** vão para o fluxo do hub:
  - "Design" duplicado;
  - itens sem `category`;
  - "Limpar filtros" coberto.
