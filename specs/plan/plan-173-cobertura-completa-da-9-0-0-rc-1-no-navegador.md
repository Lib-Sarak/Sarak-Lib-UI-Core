---
tipo: "plan"
titulo: "Cobertura completa da 9.0.0-rc.1 no navegador: o que a plan-172 não mediu e o que o hub não exercita"
objetivo: "Fechar a cobertura da verificação da 9.0.0-rc.1: cada seção 9.0.0 de docs/migracoes.md medida, cada tema do catálogo varrido nos dois modos e nas duas orientações, os recursos que o hub não usa medidos num consumidor completo e a causa de cada defeito alto isolada, para que a lista da rc.2 saia inteira de uma vez"
dominio: "Release / Validação em importador"
status: "🟢 Aprovado"
prioridade: "Alta"
tags: ["plan", "release-9-0-0", "validacao", "navegador", "cobertura"]
relacionados: ["[[03-versionamento-e-release]]", "[[05-cromo-e-slots]]", "[[06-painel-de-customizacao-e-preview]]", "[[07-responsividade-e-multidispositivo]]", "[[09-temas-e-presets]]", "[[10-seguranca-e-acessibilidade]]"]
depende_de: "plan-172"
retida_por: ""
destino_sintese: "—"
---

# 1. Objetivo

A `plan-172` validou a rc.1 no hub e achou dois defeitos altos. A cobertura dela, porém, tem lacunas medidas (§2). Esta plan fecha
essas lacunas antes de a correção começar, para que a rc.2 corrija tudo de uma vez em vez de ter uma rc.3 por falta de medida.

O produto é um relatório no mesmo formato da `plan-172`. Ao final, toda linha da matriz de cobertura (§2.2) tem um destes vereditos:
**OK**, **Defeito** ou **Sem efeito na tela**. "Não verificável" só vale com o motivo e o que faltaria para verificar.

# 2. Contexto

## 2.1 O que a plan-172 deixou de fora (relatório em `%TEMP%\sarak-rc1-hub\relatorio.md`)

| Lacuna | Por quê |
|---|---|
| 8 das 28 seções `## 9.0.0` sem medida ou com medida parcial: estilo de gráfico × tipo padrão, opacidade da textura de card, P e G em px, "Compacta" no tom Superfície, sombra "Suave" da tabela, cor das seis paletas antigas, os sete temas resgatados um a um, nome acessível do `SarakSwitch` | fora do roteiro da 172 |
| "Dark mode" e "Light mode" como nome visível | o painel mostra "Claro/Escuro"; não se sabe se é o idioma ou um defeito |
| Só 4 dos 25 temas do catálogo exercitados (Sovereign, Cyberpunk Neon, Industrial Terminal, Neo Brutalism), e nenhuma das 10 personalidades aplicada | o defeito do texto de ajuda **depende do tema**, então os outros 21 podem esconder defeitos. A contagem "58 temas + 10 personalidades" do item 28 do relatório da 172 está errada: o catálogo (`SARAK_THEME_CATALOG`) tem 25 temas |
| Topbar com tons contrastantes só no cromo aplicado e só no tema padrão | a prévia não desenha a barra no topo |
| Sub-abas, seis idiomas, usuário, avatar, idioma e "sair" no cromo, categorias no topo | o hub não declara `children`, configura só `pt-BR`, não tem login e perde as categorias |
| Causa do "Mais" sobreposto e da perda do `keepPalette` e do `savedPalettes` | precisa de um consumidor controlado, e o hub não pode ser alterado |
| Tempos | só com renderização por software e máquina carregada |
| Teclado e leitor de tela | medidos só no drawer |

## 2.2 A matriz que esta plan fecha

Eixos: **seção da migração** × **tema** (os 25 de `SARAK_THEME_CATALOG`, conferidos na tag `v9.0.0-rc.1`, mais as 10 personalidades
sobre o tema padrão) × **modo** (claro, escuro) × **orientação** (lateral, topo) × **tom da barra** (neutral, surface, primary,
secondary, inverse; sólido e degradê quando o tom aceita) × **largura** (390, 820, 1100, 1440). Nem toda combinação vale para toda
seção. O executor monta a matriz no começo do lote 1, a partir da §2.1, e o relatório mostra para cada célula se ela foi
medida ou por que não se aplica.

## 2.3 Onde medir

- **No hub** (`http://localhost:38000`, informado pelo dono): o que depende do importador real, como a persistência pelo servidor e as
  telas dos módulos.
- **No consumidor completo, a partir da tag:** tudo o que o hub não exercita e a varredura de temas aplicados. É um harness montado em
  `%TEMP%`, a partir do `dist/` da tag `v9.0.0-rc.1`, nunca do worktree. O worktree pode estar em fluxo por causa da correção. O
  harness monta `SarakUIProvider` + `SarakAppChrome` + `SarakCustomizationPanel` com navegação de 3 categorias, um item com `children`,
  uma rota repetida de propósito (num cenário separado), os seis idiomas, usuário com avatar, `onLogout`, e `onSave`/`onLoad` em
  memória com registro de cada chamada. A base é `browser-tests/build-harness.mjs`, que se lê, mas não se altera.

# 3. Escopo

## 3.1 Dentro

- Navegador próprio: Playwright do `node_modules` da lib. Lote 4 com Chromium **visível e com GPU**.
- `git archive v9.0.0-rc.1 dist` (leitura) para extrair o artefato da tag em `%TEMP%\sarak-rc1-completo\`.
- Scripts, harness, capturas e relatório em `%TEMP%\sarak-rc1-completo\`.
- O tema aplicado do hub, só nos passos que dizem "aplica", com cópia antes e restauração no fim, pela regra da `plan-172` §5 lote 2.

## 3.2 Fora

- O código dos dois repositórios, os `node_modules`, `.env`, o Docker e qualquer escrita de Git.
- "Salvar tema" (`POST /api/v1/shell/temas`).
- Consertar. Defeito vai para o relatório, com a causa isolada quando o lote pedir.
- O antivírus. Se o bundle do harness sumir ou o teste esperar 240 s sem resposta, confira `Get-MpThreatDetection` antes de chamar
  aquilo de vermelho. **Nunca** permita a ameaça, crie exclusão ou desligue o Defender. Pare e relate.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Lista do que verificar | `docs/migracoes.md`, as 28 seções `## 9.0.0 — …` | cada uma é uma linha da matriz |
| Spec fixa | `specs/specs/05-cromo-e-slots.md` | anatomia, "Mais", slots, usuário e sair |
| Spec fixa | `specs/specs/06-painel-de-customizacao-e-preview.md` | decisões, idiomas, rascunho, prévia |
| Spec fixa | `specs/specs/07-responsividade-e-multidispositivo.md` | larguras e drawer |
| Spec fixa | `specs/specs/09-temas-e-presets.md` | catálogo, anatomia dos temas, contraste calculado (§4.3.4) |
| Spec fixa | `specs/specs/10-seguranca-e-acessibilidade.md` | teclado, foco, nomes acessíveis |
| Harness de referência | `browser-tests/build-harness.mjs` | como empacotar um consumidor a partir do `dist/` |

O relatório da `plan-172` (`%TEMP%\sarak-rc1-hub\relatorio.md`) e os scripts `l1_*.cjs`/`l2_*.cjs` da mesma pasta são reaproveitáveis.
Copie-os, não os altere.

# 5. Instruções de execução

**Regras para todos os lotes:** as mesmas da `plan-172` §5. Cada item tem veredito, medida com número e captura; o defeito tem dono e
severidade; e o console e a rede são registrados do começo ao fim. O que já foi medido na 172 **não se repete**: cite a linha do
relatório anterior.

## Lote 1 — as 8 seções sem medida e os nomes (hub e harness)

1. Monte a matriz da §2.2 e o harness da §2.3. Confira que o harness carrega o `dist/` da tag: compare o `BUILD_INFO` dele com
   `55ffe93c` ou com o pai do commit, pela ressalva de que o `BUILD_INFO` fica um commit atrás.
2. **Estilo de gráfico × tipo padrão:** escolha Suave, Forte e Fina e confira que o tipo padrão do gráfico não muda.
3. **Textura de card:** escolha uma textura, aplique e recarregue. A opacidade precisa estar no `design` gravado e no pixel.
4. **P e G em px:** configure, aplique e confira o `font-size` computado nos dois extremos.
5. **"Compacta" no tom Superfície:** a lateral compacta precisa usar o fundo de superfície, medido no pixel e na variável.
6. **Sombra "Suave" da tabela:** compare o `box-shadow` computado de `SarakTableView` com o valor do token.
7. **Seis paletas antigas mais escuras:** compare a primária e o fundo com os valores da seção da migração.
8. **Sete temas resgatados:** para cada um, anatomia da lateral (cartão, faixa, vidro, inativos), os dois ícones novos desenhados e
   nenhum aviso `[Sarak:Icon]`.
9. **Nome acessível do `SarakSwitch`:** `getByRole('switch', { name })` e a árvore de acessibilidade (CDP `Accessibility.getFullAXTree`).
   O nome é exatamente o rótulo.
10. **"Sidebar", "Topbar", "Dark mode", "Light mode":** em `pt-BR` e em `en`, registre o texto visível. Decida pela seção da migração
    se "Claro/Escuro" em `pt-BR` é o esperado.
11. **Contagem do catálogo de temas:** conte os temas que o painel lista, por id distinto e não por botão, e compare com os 25 de
    `SARAK_THEME_CATALOG` mais os temas salvos pelo importador (o hub tem 1). A origem dos "58 temas" da 172 não foi
    medida. Se o painel listar um id duas vezes, ou um id fora do catálogo e dos salvos, isso é defeito.

## Lote 2 — varredura dos 25 temas e das 10 personalidades (harness, aplicado)

Para cada tema × modo × orientação, nas larguras 1440 e 820:

1. **Contraste do cromo:** menor razão de cada peça (marca, item, item ativo, usuário, idioma, ícones). Texto ≥ 4,5:1 e ícone ≥ 3:1.
2. **Tons contrastantes:** nos temas que aceitam, primary, secondary e inverse, sólido e degradê, nas duas orientações. É a parte que
   a 172 não alcançou no topo.
3. **Layout:** largura do texto de ajuda do painel (o defeito 8 da 172), `scrollWidth` da barra e dos cartões, posição do "Mais".
4. **Console:** todo aviso, principalmente `[Sarak:Icon]`.

Não salve captura de toda célula. Salve só as das células com defeito e uma por tema como amostra. Entregue a tabela em `varredura.csv`,
com uma linha por célula, e no relatório só o resumo e os defeitos.

## Lote 3 — o que o hub não exercita e a causa dos defeitos altos (harness)

1. **Sub-abas:** o item com `children` abre, fecha, marca o ativo e funciona no drawer e no "Mais".
2. **Seis idiomas:** troque pelo cromo. Os "Ajustes principais" do painel ficam com nome, descrição e opções traduzidos, sem texto em
   português fora do ajuste fino, e a escolha persiste por `onSave`.
3. **Usuário, avatar, idioma e sair:** desenho, contraste (já na varredura) e `onLogout` chamado uma vez.
4. **Categorias no topo:** separadores e agrupamento no "Mais".
5. **"Mais" com rota repetida:** o mesmo menu com e sem uma rota duplicada, nas larguras 768 a 1100. Se só o cenário duplicado
   sobrepõe, a causa está isolada. Senão, procure outra causa e relate.
6. **`keepPalette` e `savedPalettes`:** repita no harness a sequência L2-5a e L2-5b da 172, registrando cada `onSave`. Para cada passo,
   registre o rascunho de partida e o que saiu. Aponte em qual chamada a escolha se perde, sem ler o código para "adivinhar": a causa
   tem de aparecer na medida.
7. **Cor de fundo à mão:** a mesma sequência de L2-3b. Registre qual variável o `body` lê e por que ela não segue
   `--sarak-bg-base-color`.
8. **Valores não escolhidos no `design` gravado** (defeito 6 da 172): em qual ação cada um entra.
9. **Identidade da empresa na troca de tema:** grave `systemName` e `logoUrl` pelo painel ("Usar minha marca"), recarregue e, numa
   aplicação seguinte, troque só o tema. Faça duas vezes: com o design gravado passado como `config` do `SarakUIProvider` (como o hub faz)
   e sem ele. Registre cada `onSave` e o título da aba. Se o nome some só com `config`, a causa da perda do `keepPalette` e do
   `savedPalettes` (6) é a mesma, e vale para toda chave preservada na troca de tema.
10. **O cromo lê a identidade do design?** Monte `SarakAppChrome` sem a prop `brand`, com `config={{ systemName, logoUrl }}` e, num segundo
    cenário, com o nome gravado pelo painel. `docs/identidade-do-host.md` §2 diz que `config.systemName` alimenta o rótulo do cromo.
    Registre se o nome e o logo aparecem na barra. Se não aparecerem, é defeito da lib: o documento promete, e o cromo só lê `brand`.

## Lote 4 — teclado, leitor de tela e tempo com GPU (hub e harness)

**Antes de começar, peça ao dono a máquina ociosa e espere o ok.** Meça a CPU e conte os processos de navegador, sem imprimir linha
de comando.

1. **Só teclado:** percorra cromo e painel sem mouse: ordem do Tab, foco visível com contraste ≥ 3:1, Esc fecha cada camada, nenhuma
   armadilha de foco fora dos modais.
2. **Nomes acessíveis:** todo controle interativo do cromo e do painel tem nome (árvore de acessibilidade). Liste os sem nome.
3. **Tempo com GPU:** Chromium visível. Faça 10 amostras de clique até o quadro estável no painel, e os quadros ociosos da tela Barras
   (o candidato 9 da 172). Entregue mediana e máximo, com e sem `Emulation.setCPUThrottlingRate` 4.

## Relatório final

Em `%TEMP%\sarak-rc1-completo\relatorio.md`, no formato da `plan-172`:

1. O veredito: a lista da rc.2 fechou ou não, e por quê.
2. A matriz de cobertura, com cada seção e cada eixo, em que se mediu e o resultado.
3. Os defeitos novos da lib, do mais grave ao menos grave, com passo a passo. Para os defeitos altos da 172, a causa isolada.
4. Os defeitos do hub.
5. O que sobrou sem verificação, com o motivo e o que faltaria.

# 6. Critérios de aceite

- [ ] As 28 seções `## 9.0.0` têm veredito com medida, ou "sem efeito na tela". Nenhuma fica "não verificada" sem um motivo que outro
      ambiente também não resolveria.
- [ ] Os 25 temas e as 10 personalidades × 2 modos × 2 orientações estão em `varredura.csv`, com o menor contraste de cada peça.
- [ ] Sub-abas, seis idiomas, usuário, avatar, idioma, sair e categorias medidos no harness.
- [ ] A causa do "Mais" sobreposto, da perda do `keepPalette`, da perda do `savedPalettes` e do fundo à mão que não pinta está
      isolada pela medida, ou o relatório diz até onde a medida chegou.
- [ ] O harness carrega o `dist/` da tag, e a prova está no relatório.
- [ ] O tema do hub terminou igual ao original, provado pelo `GET`.
- [ ] Nenhum arquivo dos dois repositórios mudou por esta execução.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum. A plan é de medição, e o produto dela é o relatório.

- `git status` nos dois repositórios, comparado com a fotografia do início.
- `GET /api/v1/shell/tema` comparado com a cópia do original.
- Contar as linhas de `varredura.csv` contra a matriz declarada.
- Reabrir 4 capturas ao acaso, duas delas de defeito novo.
- Refazer à mão um contraste da varredura e um passo do lote 3.6.

# 8. Destino da síntese

**Destino:** `—`. A plan não altera nenhuma verdade documentada. Os defeitos da lib entram na plan de correção da rc.2, e os do hub vão
para o fluxo do hub.

---

# 9. Resumo da execução

**Resultado:** concluído com **uma ressalva: o 4.3 (tempo com GPU) ficou "sem verificação"**, com a CPU medida como motivo. Relatório final, nas 5 seções da plan-172 mais anexos, em `%TEMP%\sarak-rc1-completo\relatorio.md` (versão anterior à finalização: `relatorio-parcial-antes-da-final.md`). **Veredito: a lista da rc.2 não fechou e ficou maior.**

**Ordem de execução:** lotes 1, 2 e 3 (o dono viu o resumo e deu o ok), com 3.5/3.6 refeitos como o hub monta e 3.9/3.10 acrescentados; o lote 4 foi dividido pelo dono: 4.1 e 4.2 com a máquina como estava (CPU média 53%, de 4 a 100%), e o 4.3 depois do aviso do dono.

**Estado do worktree ao iniciar:** lib com ` M specs/00-indice.md` e `?? plan-172`, `?? plan-173` (fotografia do início desta execução); as demais modificações e arquivos novos que o `git status` mostra no fim são de outras plans em andamento (174, 175, `useEffectiveBrand`, `persistenceTypes`…), não minhas. Hub: `git status` vazio ao final.

**Arquivos alterados:** só esta plan (status e este resumo). Nenhum código dos dois repositórios, nenhum `.env` lido, nenhum "Salvar tema", nenhum `PUT`/`POST` ao hub (só `GET`, carregamento de página e `Tab`). Git: só `git archive` e `git tag -l` (leitura). Tudo o mais fica em `%TEMP%\sarak-rc1-completo\` (harness a partir do `dist/` da tag `v9.0.0-rc.1`, servidores 47831/47832 já parados, `varredura.csv` com 880 linhas, `cap/` com 50 capturas, JSONs `l4_*`).

**Verificações executadas:**
- `GET /api/v1/shell/tema` do hub **idêntico** a `tema-original.json` (`design:{}`, `activeThemeId:"sarak-sovereign"`, `updatedAt` 2026-11-25T03:41:16.971+00:00), conferido de novo ao final.
- `git status` do hub vazio; o da lib tem só o que a fotografia do início e as outras plans explicam.
- 0 processos do harness e 0 Chromium do Playwright restantes; o Docker Desktop não foi tocado.
- **Porta do 4.3:** 5 amostras de CPU a 2 s = 27, 56, 31, 30, 44% (média 37,6%, acima de 30%). Processos: 27 `chrome`, 14 `msedge`, 1 `Duplicati`. Delta em 5 s (% de 16 núcleos): `Duplicati.GUI.TrayIcon` 6,4, `Code` 4,3, `com.docker.backend` 4,2. Não esperei nem repeti.

**Defeitos da lib (por gravidade; detalhe na §3 do relatório):** altos D0 (design gravado como `config` apaga paleta/`keepPalette`/`savedPalettes` na troca de tema, causa isolada), D1 (contraste do cromo: 15 de 50 pares), D2 (436 chaves gravadas), **D17 (foco de teclado invisível ou abaixo de 3:1: 400 sem mudança e 951 abaixo de 3:1 em 1.928 paradas do painel)**; médios D3 a D8, D11, D21 (gaveta prende o Tab, sem `role=dialog`), D18 (miniaturas do painel focáveis), D19 (114 controles do painel sem nome), D16, D20 (idioma sem Esc); baixos D14, D12, D13, D15, D9.

**Defeitos do hub:** menu com "Design" duplicado; "Mais" fora do lugar só no hub; 14 paradas sem anel de foco; 3 temas salvos (o plano dizia 1); hub fora do ar por ~1h40 sem relação comigo.

**Critérios de aceite:**
- [x] 28 seções `## 9.0.0` com veredito (Anexos B1–B3 e §2).
- [x] 25 temas e 10 personalidades em `varredura.csv`; personalidades parciais (4 de 10 com sobrescrita explícita, §5).
- [x] Sub-abas, seis idiomas, usuário, avatar, idioma, sair e categorias medidos no harness.
- [~] Causas: D0 e D5 isoladas; o "Mais" sobreposto **não reproduz** fora do hub e a causa fica sem isolar (§5 diz até onde a medida chegou).
- [x] Harness carrega o `dist/` da tag (prova no Anexo A).
- [x] Tema do hub igual ao original, provado pelo `GET`.
- [x] Nenhum arquivo dos dois repositórios mudou por esta execução.

**Decisões e suposições:** o foco foi medido por pixel (foco × desfoco), não pelo anel desenhado; "sem verificação" do 4.3 aplicado literalmente à regra do dono (média ≥ 30%).

**Achados fora do escopo:** nada foi corrigido; os defeitos viram a plan de correção da rc.2 (D0 já tem a plan-175).

**Pendências:** 4.3 (CPU média < 30% e Chromium visível com GPU); causa do "Mais" no hub; notificações e menu de usuário; `nav.scrollWidth` (172 #11); personalidades 6 de 10 sem sobrescrita explícita.

---

# 10. Veredito

## Veredito — 2026-11-25 — 🟢 Aprovado

**A plan entregou o que prometia.** O relatório tem as 5 seções no formato da 172, e o veredito da cobertura está medido: a lista da
rc.2 não fechou e ficou maior (D0 a D21).

**O que o revisor conferiu (§7):**
- **Git:**
  - no hub, `git status` vazio. O HEAD foi de `e65a78f7` para `7ef6827c`, mas por commit de outra sessão: o executor só leu o hub;
  - na lib, o worktree só tem o que as plans 172, 174 e 175 explicam.
- **Tema do hub:** igual ao original no `GET` feito antes do lote 4, e igual de novo na conferência final do executor. Na hora deste
  veredito, a API do hub responde `EXTERNAL_DEPENDENCY` (fora do ar, como no Anexo A), então não deu para repetir o `GET` agora.
- **`varredura.csv`:**
  - 880 linhas, 0 com erro;
  - 25 temas × 2 modos × 2 orientações dão 100 combinações, todas presentes;
  - 10 personalidades × 2 × 2 dão 40, todas presentes;
  - nenhuma linha está sem o menor contraste.
- **Harness:** o `tag/dist/index.js` tem hash idêntico ao `git show v9.0.0-rc.1:dist/index.js`.
- **Capturas reabertas** (blueprint-protocol claro, Compacta, textura clara, gaveta com sub-aba): todas mostram o que o relatório diz.
- **Contraste refeito à mão** por pixel em `cap/chk-blueprint-protocol-light-lateral.png`: o texto do item dá 2,02:1, igual ao
  `txt_item` do CSV (2,02).
  - O ícone, por pixel, dá 1,36:1, contra 2,02 no CSV. A varredura lê a cor calculada e não vê a opacidade do ícone, então o D1 é
    **pior** do que a varredura diz. Fica como nota para a plan de correção do D1.
- **Passo da 3.6:** reproduzido de forma independente pelos casos de integração da `plan-175`. Sem a opção, a troca de tema com o
  `config` grava sem `keepPalette` nem `savedPalettes`, a mesma perda de A5 em `l3_f.json`.
- **D17 e D19 batem com o código.**
  - `src/features/DesignEngine/components/controls/HelpTooltip.tsx:10-16`: o botão "?" não tem nome acessível (só o ícone).
  - O mesmo botão usa `focus:outline-none` sem um anel que substitua o contorno.

**4.3 sem verificação:** aceito. É o desfecho combinado com o dono para a CPU de 30% ou mais, e a medição está registrada (média de
37,6%). O tempo com GPU fica como item da campanha de correção da rc.2.

**Destino:** `—`. Os defeitos da lib viram as plans de correção da rc.2, e os do hub vão para o fluxo do hub.