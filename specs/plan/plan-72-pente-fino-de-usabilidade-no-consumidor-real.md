---
tipo: "plan"
titulo: "Pente fino de usabilidade no consumidor real, por navegação e interação"
objetivo: "Fechar a campanha com um inventário medido do que ainda falta, colhido navegando e interagindo com o sistema de verdade"
dominio: "Sarak-Lib-UI-Core / Diagnóstico"
status: "🟢 Aprovada"
prioridade: "Alta"
tags: ["plan", "diagnostico", "usabilidade", "navegador", "sem-codigo"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/09-temas-e-presets]]", "[[specs/11-testes-e-cobertura]]", "[[specs/13-instalacao-e-atualizacao]]"]
depende_de: "plan-79-idioma-de-ponta-a-ponta"
retida_por: ""
destino_sintese: "specs/00-backlog.md"
---

# 1. Objetivo

Um inventário **medido** do que ainda separa a biblioteca de "instalar, escolher o tema e estar pronto" —
colhido percorrendo e operando um consumidor real, tela a tela, não lendo código.

A saída desta plan **não é código**: é uma tabela de achados com dono, mais duas listas de melhoria — uma
para a **biblioteca** (funcionalidade) e uma para os **temas** —, que o dono usa para decidir a próxima
campanha e a autoria dos temas.

# 2. Contexto

A campanha inteira nasceu de um veredito do dono comparando dois sistemas na tela: *"o sistema atual
recebeu evoluções funcionais e está muito mais robusto, porém na prática a usabilidade e a experiência
ficaram piores"*. As plans que ela gerou foram todas derivadas de **leitura de código** mais medições
pontuais em navegador.

Isso achou muita coisa e deixou um vão conhecido: **ninguém percorreu o sistema como usuário.** As duas
vezes em que alguém olhou a tela de verdade, o retorno foi imediato e caro — o fundo que não aplicava, os
tokens de cromo sem consumidor, o realce do item ativo que sumiu. Nenhum dos três tinha gate que os
pegasse, e todos apareceram em segundos para quem estava olhando.

Esta plan fecha a campanha do jeito que ela deveria ter começado. A barra configurada pelo administrador
e as preferências do usuário já existem ([[05-cromo-e-slots]] §2.2.2 · [[09-temas-e-presets]] §4.7), e o
passo 3 as exercita.

## 2.0 Onde esta plan entra na ordem — e o que ela entrega à recalibração dos temas

*(Decisão do dono, 2026-09-18.)* A `plan-80` foi partida em duas. A primeira parte já rodou: ela **removeu**
os temas que o dono listou e **pausou**. Esta plan roda agora, **entre** as duas partes — o mesmo agente
executa as duas. A segunda parte da `plan-80` (alterar e reconstruir os temas que o dono listou, e criar os
novos) só começa depois do veredito desta.

Por isso esta plan entrega, além da tabela de achados, um **insumo para a autoria dos temas**: o que a tela
real mostrou que os temas precisam fazer melhor. A lista do dono (quais temas saem, quais mudam, quais são
reconstruídos) e a matriz de capacidade estão no resumo da `plan-80` — é contra elas que o insumo se escreve.

## 2.1 A armadilha que já custou dois ciclos, e que é pré-condição aqui

Duas camadas de cache separam um `dist/` novo do que o navegador executa ([[13-instalacao-e-atualizacao]]
§9.1):

1. a cópia da lib no store do gerenciador de pacotes — uma **cópia**, não um link;
2. o pré-bundle do bundler do consumidor — que reotimiza por lockfile, versão e config, **nunca por
   conteúdo**, e mantém um cache **por app**, não um por repositório.

Já aconteceu duas vezes de o dono medir contra código velho e reportar como defeito da lib. A segunda vez,
metade dos apps tinha cache novo e metade velho — o sintoma foi *"funcionou, mas não em todas as abas"*, e
custou um ciclo inteiro de diagnóstico para virar uma linha de `rm -rf`.

**Por isso o passo 1 da §5 é bloqueante:** enquanto não estiver provado que o navegador executa o código
que se quer medir, **nenhum achado desta plan vale**, e os que forem colhidos antes disso vão para o lixo,
não para a tabela.

# 3. Escopo

## 3.1 Dentro
- Percorrer e operar um consumidor real em navegador, nas telas que ele tiver.
- Exercitar o painel de design: temas, modo claro/escuro, tokens de cromo, atmosfera/fundo.
- Registrar cada achado no formato da §5 item 5.
- Escrever as **sugestões de melhoria da biblioteca** (§5 passo 7), a partir do que se tentou fazer na tela.
- Escrever o **insumo para a recalibração dos temas** (§5 passo 8), a partir do que se viu na tela.
- Escrever o resumo da §9 com a tabela completa e o roteamento de cada linha.

## 3.2 Fora
- **Qualquer alteração de código de produção.** Esta plan não conserta nada; ela nomeia.
- Alterar spec fixa, ADR ou gate.
- Mexer no consumidor — nem código, nem dado persistido ([[00-knowledge]]: conserto que mexe no importador
  é recusado, e limpar dado persistido conta como mexer). Limpar **cache de build** não é dado persistido,
  e é justamente o passo 1.
- Julgar se um achado vira plan ou backlog — isso é triagem do revisor, com o dono.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/13-instalacao-e-atualizacao.md` | §9.1 — as duas camadas de cache; é o passo 1 |
| Spec fixa | `specs/05-cromo-e-slots.md` | o contrato do cromo — é contra ele que se mede |
| Spec fixa | `specs/09-temas-e-presets.md` | §2.1 `contraparte`; §4.3 aplicar; §5.1 atmosferas |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | §1 — zero-config é contrato; exigir trabalho do consumidor é bug da lib |
| Spec fixa | `specs/11-testes-e-cobertura.md` | §7 — o que a medição de navegador já cobre, para não repetir |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` | sempre |
| Skill | `ui-arquitetura-design` | julgar usabilidade com critério, não com gosto |
| Skill | `ui-criar-tema` | o que um tema shippado precisa cumprir — é o critério do insumo do passo 8 |
| Sistema | `ZP/Automacao-relatorios/Novo` (`modules/painel-web/web/`) | o sistema de referência da campanha, na lib antiga: é a comparação que ancora as sugestões do passo 7 |
| Plan | `specs/plan/plan-80-recalibracao-do-catalogo-de-temas.md` | a lista do dono (temas que saem, mudam e são reconstruídos) e a matriz de capacidade, no resumo dela |

# 5. Instruções de execução

1. **Provar que o navegador executa o código atual — bloqueante (§2.1).**
   Escolher um **marcador literal** presente no `dist/` da lib e ausente na versão anterior (uma classe ou
   string que a última plan mudou serve; um token que já existia antes **não** serve). Então:
   - derrubar o consumidor;
   - apagar **todos** os caches de pré-bundle do consumidor, não só o do app que se vai olhar;
   - reinstalar/reconstruir a cópia da lib no consumidor;
   - subir, e **baixar o bundle que o navegador de fato requisitou**, procurando o marcador nele.

   Marcador ausente = **parar**. Não seguir para o passo 2 "para adiantar".

2. **Percorrer todas as telas** do consumidor, uma a uma, em desktop. Em cada uma, registrar o que um
   usuário faria e o que acontece: a navegação leva aonde diz, o item ativo corresponde à tela, o conteúdo
   cabe, nada fica sob a barra, nada exige rolagem horizontal.

3. **Operar o painel de design**, e para cada eixo abaixo aplicar de verdade (não só pré-visualizar) e
   voltar às telas do passo 2 para ver o efeito:
   - cada tema shippado — pelo menos um claro e um escuro, mais os de referência;
   - **a alternância claro/escuro em cada um** — a paleta volta inteira ao alternar de ida e de volta, ou
     degrada? Os temas do próprio consumidor contam: é neles que a derivação por espalhamento aparece.
   - cada token de cromo: posição da sidebar, layout da barra, alinhamento do conteúdo, colapso da nav,
     auto-hide, posição da busca, espaçamento das abas, cores de realce;
   - fundo/atmosfera: cada opção que o painel oferece, aplicada e conferida na tela;
   - **a barra configurada pelo administrador**: cada preferência em cada posição (não oferecida, no menu,
     fixa na barra), e o que o usuário final vê em cada caso — nos dois cromos e no drawer do celular;
   - **as preferências como usuário final**: modo (inclusive *sistema*), tamanho da fonte, navegação topo ou
     lateral, recolher e idioma — cada uma aplicada e conferida nas telas do passo 2.

   **Isolamento entre usuários — obrigatório:** com dois perfis de navegador abertos ao mesmo tempo, uma
   preferência escolhida num **não** pode aparecer no outro, e **não** pode alterar o tema salvo no
   servidor. É a garantia central da camada de preferências; se ela falhar, é achado de severidade máxima.

   **Trocar `navigationStyle` e repetir os tokens que dependem da outra orientação.** Token de sidebar
   medido com topbar ativa não tem no que agir — isso não é achado, é medição inválida.

4. **Repetir o passo 2 em celular e tablet**, pela emulação de dispositivo do navegador. A regra de
   degradação ([[05-cromo-e-slots]] §2.3) é: **nada some** — cada elemento tem destino declarado. Conferir
   elemento a elemento, não pela impressão geral.

5. **Registrar cada achado** numa linha, e **só** com estes campos preenchidos:

   | Campo | Regra |
   | --- | --- |
   | O que se fez | a ação, reproduzível por quem não estava lá |
   | O que se esperava | e **de onde vem a expectativa** — spec, token oferecido no painel, ou a regra de zero-config |
   | O que aconteceu | o observado, com o valor medido quando houver |
   | Onde | tela, tema, orientação, dispositivo |
   | Severidade | impede de usar · degrada a experiência · incômodo |

   **Sem "achei feio" sem referência.** Um achado sem expectativa ancorada é gosto, e gosto não entra na
   tabela — vai para uma seção separada de *impressões*, claramente marcada como tal.

6. **Não consertar nada.** Achado é achado. Se algo for trivial de corrigir, isso entra na coluna de
   severidade como observação, não no código.

7. **Sugestões de melhoria da biblioteca.** Numa seção própria do resumo, separada da tabela de achados
   (achado é o que **descumpre** o contrato; sugestão é o que **falta** nele). Registre o que um usuário ou
   um desenvolvedor do consumidor tentou fazer e a lib não oferece, ou oferece mal. Cada sugestão com:

   | Campo | Regra |
   | --- | --- |
   | O que se tentou fazer | a tarefa, reproduzível, na tela onde ela aparece |
   | O que falta | o comportamento, componente, token ou opção de painel que não existe hoje |
   | De onde vem a expectativa | o sistema de referência que fazia isso (com a tela), a regra de zero-config, ou um padrão já presente em outra parte da lib |
   | Ganho | o que muda para quem usa — menos passos, menos código no consumidor, algo que hoje é impossível |

   **Sem sugestão por gosto.** Sem uma das três âncoras, ela vai para as impressões.

8. **Insumo para a recalibração dos temas.** Numa seção própria do resumo, separada da tabela de
   achados, registre o que a tela real mostrou sobre os temas — para a segunda parte da `plan-80` usar na
   autoria. Três blocos:
   - **Por tema que o dono mandou alterar ou reconstruir:** o que ele faz mal hoje, na tela (contraste,
     hover, item ativo, modo oposto, densidade, atmosfera, tipografia, cromo), e o que a versão nova
     precisa fazer. Cada ponto com a mesma âncora da tabela: spec, token ou medida, nunca gosto solto.
   - **Capacidade que nenhum tema mostra:** tokens e opções que funcionam na tela (medido no passo 3) e que
     nenhum tema do catálogo explora — é a lista do que os temas novos precisam cobrir.
   - **Armadilhas vistas na tela:** combinações de token que degradam (por exemplo, fundo de hover que some
     sobre a barra, texto que perde contraste no modo oposto, atmosfera que atrapalha a leitura), para a
     autoria evitar.

   **O que o dono achar bonito ou feio não entra aqui**: esta seção é critério, e o veredito visual dele vem
   na `plan-80`, por lote.

9. Fechar o resumo (§9) com a tabela completa, a seção de impressões, as sugestões do passo 7, o insumo
   do passo 8, e a lista do
   que foi **conferido e está correto** — o que passou vale tanto quanto o que falhou, porque é o que
   evita remedir depois.

# 6. Critérios de aceite

- [ ] O passo 1 está no resumo com o marcador nomeado e a prova de que ele estava no bundle servido.
- [ ] Todas as telas percorridas estão listadas, incluindo as que não geraram achado.
- [ ] Todo token de cromo foi exercitado **na orientação em que ele age**.
- [ ] A alternância claro/escuro foi conferida em cada tema testado, ida e volta.
- [ ] Celular e tablet foram percorridos, com a regra de degradação conferida elemento a elemento.
- [ ] Cada achado tem os cinco campos, e a expectativa está ancorada em spec, token ou zero-config.
- [ ] Impressões sem âncora estão numa seção separada e rotulada.
- [ ] **Zero arquivo de produção alterado** — `git status` limpo fora desta plan.
- [ ] A lista do que foi conferido e está correto existe.
- [ ] As sugestões de melhoria da biblioteca existem, cada uma com os quatro campos do passo 7 e uma âncora.
- [ ] O insumo para a recalibração dos temas existe, com os três blocos do passo 8, e cobre cada tema que o
      dono mandou alterar ou reconstruir.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o produto desta plan é um relatório, e o que o valida é a reprodutibilidade.

- `git status` → só esta plan mudou. Qualquer arquivo de produção tocado **reprova**.
- Ler o passo 1 do resumo → o marcador é nomeado e a prova é verificável; se faltar, **reprova sem ler o
  resto**, porque nada abaixo dele vale.
- Escolher **três achados ao acaso** e reproduzi-los pelo campo "o que se fez". Não reproduziu = reprova.
- Conferir a cobertura contra a §6: tela que não aparece na lista é lacuna, não ausência de achado.
- Conferir que nenhum achado da tabela é gosto disfarçado de defeito.

# 8. Destino da síntese

**Destino:** `specs/00-backlog.md`

A tabela de achados **não vira spec fixa** — ela é matéria-prima. Na síntese, o revisor tria cada linha com
o dono ([[00-prompt-revisor]] §4) e a manda para **um** destino: plan nova, backlog, ou descartada com o
motivo escrito. Achado sem destino não sobrevive à síntese.

As **sugestões de melhoria da biblioteca** (passo 7) passam pela mesma triagem da tabela: com o dono, cada
uma vira plan nova, backlog, ou é descartada com o motivo escrito.

O **insumo para a recalibração dos temas** (passo 8) vai para a `plan-80`: o revisor o transporta para o
contexto dela antes de liberar a segunda parte, porque é lá que a autoria acontece.

O que for **confirmado como correto** no passo 9 não vai para lugar nenhum — não é verdade nova, é a
verdade que já estava escrita, agora conferida na tela.

Ao registrar no backlog, vale a regra de sempre: reler os itens que já estão lá e **remover** os que esta
passagem provou resolvidos.

---

# 9. Resumo da execução

## Resumo da execução — 2026-09-18

**Resultado:** Concluído com pendências (o browser da sessão fechou por hibernação da máquina no meio da
exploração — nada foi perdido do que já estava medido e registrado, mas a lista de telas/eixos exercitados
para de crescer no ponto em que isso aconteceu; ver Pendências).

## Passo 1 — prova bloqueante

**Marcador escolhido:** a string literal `"corresponde a nenhum tema conhecido"` — texto do
`console.warn` novo em `src/core/Provider/hooks/useDesignSync.ts:57` (fix desta mesma sessão, plan-80,
ausente em qualquer `dist/` anterior a ela).

**Procedimento:**
1. Consumidor derrubado (nenhum processo de dev estava no ar antes desta execução).
2. Apagados os 4 caches de pré-bundle do Vite (`modules/{contracts,hub,projects,proposals}/node_modules/.vite`)
   — provado vazio com `find` logo depois.
3. `pnpm install --force --filter @erp/ui-kit` — reinstala a cópia `file:` da lib.
4. Subido `npm run dev` (gateway + os 4 apps) — gateway relatou `http://localhost:38000` (não a porta 3000
   que o dono citou; ver Pendências).

**Prova de que o navegador executou o código atual:** com a app do hub aberta num browser real e o painel de
Design mergulhado (mount do `CustomizationPanel`, que importa `GLOBAL_THEMES`), o cache fresco do Vite
(`modules/hub/node_modules/.vite/deps/chunk-RRLMKDIZ.js`) contém o marcador — confirmado por `grep` no
arquivo em disco **e** por `performance.getEntriesByType('resource')`, executado dentro da própria página,
que lista esse exato chunk (`.../chunk-RRLMKDIZ.js?v=463d01a4`) entre os recursos que o navegador de fato
buscou. Confirmação cruzada: o hash do chunk lazy `CustomizationPanelImpl-C5MX4KL6...` carregado bate,
byte a byte no nome, com o hash do build mais recente desta máquina (`dist/CustomizationPanelImpl-C5MX4KL6.js`).
**Marcador presente e comprovadamente servido — passo 1 satisfeito, achados abaixo valem.**

## Telas percorridas

| Tela | App | Estado observado |
| --- | --- | --- |
| Início (`/`) | hub-web | Dashboard "Visão geral" com 3 contadores (Contratos/Projetos/Propostas) |
| Propostas (`/proposals/`) | proposals-web | Grid de cards com dados reais (10+ propostas) |
| Projetos (`/projects/`) | projects-web | Tela quase vazia — só título e uma linha de texto; não achado, é estado do módulo (pouco conteúdo hoje) |
| Contratos (`/contracts/`) | contracts-web | Lista de 2 contratos com badge de status |
| Design (`/design`, via nav — direto por URL quebra, ver Impressões) | hub-web | `CustomizationPanel` completo: catálogo de temas, categorias de token, busca |

Não percorridas nesta passagem (browser fechou antes): fluxos internos de Propostas/Projetos/Contratos além
da lista (detalhe de item, criação), e os 11 temas do catálogo um a um em live (só `neo-brutalism`, o tema
nativo da sessão, foi exercitado a fundo).

## Tabela de achados

| # | O que se fez | O que se esperava | O que aconteceu | Onde | Severidade |
| --- | --- | --- | --- | --- | --- |
| 1 | Abrir a tela Propostas com o tema `neo-brutalism` (nativo, dark) ativo e observar os badges de versão/status ("v1", "rascunho") nos cards | Badge legível — é o próprio papel do componente (`SarakBadge`) e o mínimo de R31 (contraste AA) | Texto branco a 47% de opacidade (`rgba(255,255,255,0.467)`) sobre fundo **sólido branco** (`rgb(255,255,255)`) — contraste ~1:1, badge ilegível. Raiz: `SarakBadge.tsx:71` (`variant="muted"`, `soft` default) usa `bg-[var(--theme-border)]` como PREENCHIMENTO — mas `--theme-border` é `cardBorderColor` (`schema/colors.ts:140-146`), cujo próprio contrato diz "borda sutil, baixa opacidade, sem criar contraste forte". `neo-brutalism` define `cardBorderColor:"#ffffff"` (sólido, de propósito — estética brutalista) e `textColorMuted:'#ffffff77'` — a combinação colide. `auditor_contraste` não cobre esse par (não está em `PAIRS`) | Tela Propostas, tema `neo-brutalism` nativo (dark), `SarakBadge variant="muted"` (default) | Degrada a experiência — a informação (versão, status "rascunho") desaparece visualmente, mas a tela continua operável |

## Impressões (sem âncora — registradas, não são achado)

- **Navegar para os módulos de fora do hub (Propostas/Projetos/Contratos) perde os itens de navegação dos
  módulos irmãos** — a topbar mostra só "Início" e "Design". Lido o código do consumidor
  (`packages/ui-kit/src/nav.tsx:20-27`): é **intencional e documentado** — `ERP_NAV_ITEMS` é um fallback
  mínimo até a chamada a `GET /api/v1/hub/modulos` responder com a lista completa; cada app standalone
  aparentemente não passa esse `navItems` completo. **Claramente do lado do consumidor** (a lib só desenha o
  que recebe), não é achado da lib.
- Navegar direto pela URL para `/design` (fora de um clique dentro do app) devolve
  *"Error occurred while trying to proxy: localhost:38000/design"* — parece roteamento/proxy do gateway
  (SPA sem fallback de histórico para esse caminho), não algo que a lib controla.
- No tablet (900px), com `navigationStyle` forçado para `sidebar` no painel, o cromo comprime corretamente
  para topbar (confirma a regra "tablet sempre topbar compacta", `specs/07` §5), mas um item ("Contratos")
  apareceu só com ícone, sem rótulo, entre os itens rotulados — pode ser overflow por espaço, não aprofundado
  nesta passagem (o browser fechou logo depois).
- A "Visão geral" mostrou "Indisponível: fetch failed" para os contadores de Projetos e Propostas — o
  `package.json` raiz só declara `dev:hub-api` entre os quatro módulos; Projetos/Propostas/Contratos não têm
  script de API própria no `dev` orquestrado, então a chamada não tinha para onde ir **nesta sessão**. Não é
  sintoma de lib.
- A tela "Visão geral" do hub (`Contratos`/`Projetos`/`Propostas`) é HTML/CSS cru do consumidor
  (`<section class="card-resumo">`, sem nenhum token/classe Sarak) — os cartões renderizam como um contorno
  branco fino com o número pequeno no canto, sem preenchimento. Não é achado da lib (não usa a lib), mas é
  exatamente o tipo de tela que `SarakStats` (que aceita `data` direto, ao contrário de `SarakTable`/
  `SarakCardGrid`) já resolveria pronto — ver sugestão abaixo.

## Sugestões de melhoria da biblioteca (passo 7)

| Campo | Conteúdo |
| --- | --- |
| O que se tentou fazer | Usar `SarakTable`/`SarakCardGrid` com dado já carregado no cliente (ex.: resposta de uma chamada feita alhures, cache, ou um mock determinístico) — cenário comum em qualquer consumidor real, e foi exatamente a necessidade que a vitrine de temas desta campanha (`plan-80`) bateu ao montar sua amostra de conteúdo offline |
| O que falta | `SarakTable` **desestrutura** a prop `data` (`data: initialData`) e nunca a usa — `useSarakTableData` sempre busca por `endpoint`, ignorando o dado já disponível (`src/components/atomic/Templates/SarakTable.tsx:46`, `hooks/useSarakTableData.ts`). `SarakCardGrid` nem declara a prop: só aceita `endpoint`. Duas APIs públicas com uma prop morta ou ausente para o caso mais básico de "eu já tenho o dado" |
| De onde vem a expectativa | Um padrão já presente em OUTRA parte da própria lib: `SarakStats` aceita `data?: TData` e funciona sem rede (`SarakStats.tsx:16,29`) — os três componentes da mesma família de "template com dado" deviam ter a mesma superfície |
| Ganho | Consumidor não precisa simular um `endpoint`/mock de rede só para renderizar uma tabela ou grid de cards com dado que já tem em mãos (SSR, cache, WebSocket, resultado de outra chamada) — menos código de infraestrutura fake no lado do consumidor, e as três primitivas de template passam a ter contrato consistente entre si |

## Insumo para a recalibração dos temas (passo 8)

**Por tema que o dono mandou alterar ou reconstruir — o que a tela mostrou:**

- `neo-brutalism` (melhorar): `cardBorderColor` sólido branco (`#ffffff`, de propósito — é a estética
  brutalista) colide com `textColorMuted` (`#ffffff77`) em qualquer componente que use fundo=border +
  texto=muted — hoje isso é exatamente o `SarakBadge variant="muted"` (achado #1 acima). Ao reconstruir/
  melhorar: ou `textColorMuted` deixa de ser um branco translúcido (perde a colisão), ou o tema evita depender
  desse par — mas o padrão "borda sólida e opaca" da estética brutalista é, por natureza, um risco alto para
  qualquer token que reutilize `cardBorderColor` como preenchimento. Vale medir os outros pares que dependem
  de `cardBorderColor` antes de fechar o tema novo.
- Os outros 10 temas do catálogo (inclusive `cyberpunk-neon`/`synthwave-retro`/`data-terminal`, marcados
  "recriar") **não foram exercitados ao vivo nesta passagem** — o browser fechou antes. Ver Pendências.

**Capacidade que nenhum tema shippado mostra hoje** (cruzando com a matriz de capacidade já medida no
resumo da `plan-80`, sem retranscrever):
- `sidebarPosition: floating` — **testado ao vivo nesta sessão e funciona bem** (margem de 16px, raio de
  12px, sombra — exatamente o que `specs/09` promete); nenhum dos 11 temas do catálogo atual o usa por
  padrão. Um tema novo poderia exercitar essa opção para prová-la ao dono.
- `sidebarPosition: right` — schema oferece, nenhum tema shippado usa; não testado ao vivo nesta sessão.
- `btnStyleType: cyberpunk` — única opção do enum de 6 que nenhum tema shippado usa.
- A grande maioria das 41 texturas de `texture`/`cardTextureType` — só 6 aparecem no catálogo atual.

**Armadilhas vistas na tela:**
- **A combinação "fundo = `cardBorderColor` + texto = `textColorMuted`" é uma armadilha estrutural**, não
  específica de um tema: `SarakBadge`'s variant `muted` (o default do componente) usa exatamente esse par, e
  `cardBorderColor` é documentado como token de BORDA (baixa opacidade esperada) — um tema que o define sólido
  para um efeito estético legítimo (bordas fortes, brutalismo, contornos duros) quebra esse badge em silêncio,
  porque `auditor_contraste` não audita esse par. **Para qualquer tema novo/recriado**: se `cardBorderColor`
  for opaco ou próximo disso, teste manualmente o `SarakBadge` no modo `muted` antes de aprovar.

## O que foi conferido e está correto

- Alternância claro/escuro pelo toggle do cromo: aplica de fato (não só preview), sincroniza entre módulos
  diferentes via `localStorage`/crossTabSync (testado hub → proposals), e os badges de status ficam legíveis
  no modo claro (o fallback sintetizado do tema sem contraparte produz valores distintos e utilizáveis).
- `sidebarPosition: floating` — margem, raio e sombra aplicados corretamente (checado via
  `getComputedStyle`, não só visual).
- `navigationStyle` trocado para `sidebar` em runtime — cromo migra corretamente, e a regra "tablet sempre
  topbar compacta" (specs/07 §5) prevalece mesmo com o token pedindo sidebar (confirmado em 900px).
- `isAutoHideEnabled`: nav nasce oculta, o sensor fixo (`w-4 h-full` no sidebar, `w-full h-4` no topbar
  compacto) revela ao "hover" (disparado via `mouseover` sintético) nas duas orientações — bate com
  `useChromeAutoHide` e a nota de `specs/05` §2.4.
- Barra de preferências do administrador: posição `off`/`menu`/`pinned` testada para `fontSize` — o ⚙ só
  nasce quando pelo menos uma preferência está `menu` (testado: nasceu ao setar `fontSize=menu`), e o item
  "Modo Claro"/"Recolher navegação" (`pinned`) aparece tanto fixo na barra quanto dentro do ⚙, como a spec
  promete.
- Preferência de usuário — tamanho da fonte: os três tamanhos (P/M/G) aplicam de fato
  (`data-sx-body-size`: 12px/14px/16px confirmados via `getComputedStyle`).
- Textura/atmosfera global (`texture: scanlines`): aplica corretamente via `[data-sx-texture="scanlines"]::before`
  — confirmado que o atributo é escrito e a regra CSS casa; o efeito é sutil (bandas pretas a 25% sobre um
  fundo quase preto) e por isso pode PARECER ausente a um olhar rápido — não é bug, é baixo contraste
  esperado para essa combinação tema+textura.
- Drawer mobile (375px): abre com nav + "Modo Claro" + "Tamanho da fonte" diretamente, sem ⚙ separado —
  bate com specs/05 §2.3 ("celular: tudo vai para o drawer, sem ⚙").
- O catálogo de temas do painel ao vivo mostra exatamente os 11 temas que sobraram da remoção da `plan-80`
  (`Sarak Sovereign`, `Cyberpunk Neon`, `Industrial Terminal`, `Neo Brutalism`, `Synthwave Retro`,
  `Nebula Space`, `Kinetic Flow`, `Cyber Retro-Wave 2077`, e mais — rolagem confirmou o total), nenhum dos 12
  removidos aparece — confirmação ao vivo, no consumidor real, de que a remoção chegou até a tela.

## Pendências / riscos

- **O browser da sessão fechou por hibernação da máquina no meio da exploração** — passos 2-4 não foram
  esgotados: faltou percorrer os 11 temas um a um (só `neo-brutalism` foi testado a fundo), testar
  `sidebarPosition: right`, os tokens de cor de realce (`sidebarActiveColor`/`topbarHoverColor`/etc.) em
  troca real, e o fluxo interno de Propostas/Projetos/Contratos além da lista.
- **"Isolamento entre usuários" (§5 passo 3, severidade máxima se falhar) NÃO foi testado empiricamente** —
  a ferramenta de browser desta sessão é uma única instância/perfil; testar dois perfis simultâneos exigiria
  duas sessões de browser isoladas, que não abri. O que sustento é leitura de código (ADR-016,
  `overlayPreferences.ts`): preferência e tema vivem em chaves de `localStorage` distintas, e a preferência
  nunca é gravada como tema — arquitetura correta, mas **não é a mesma coisa que provar na tela**, que é
  exatamente o método que esta plan exige. Registrado como lacuna, não como "conferido e correto".
  **Atualização (bloco "continuação — 2026-09-18" abaixo): esta lacuna foi fechada — teste empírico com dois
  perfis de browser genuinamente separados, feito.**
- **Porta do gateway:** o dono mencionou porta 3000; o `.env` deste checkout não define `GATEWAY_PORT`, e o
  gateway subiu em `38000` (`modules/hub/config/runtime.json:5`). Uso `38000` porque é o que respondeu; se o
  dono normalmente usa outra configuração (`.env` local diferente, outro checkout), vale confirmar.
- O ERP fica com customizações de sessão aplicadas no tema `neo-brutalism` local (`sidebarPosition: floating`,
  `navigationStyle: sidebar`, `isAutoHideEnabled: true`, `texture: scanlines`, preferência de fonte
  `menu`) — não revertido (não fazia parte do pedido, e são mudanças de `localStorage`, não de código). O
  dono pode reaplicar o preset "Neo Brutalism" no painel para voltar aos valores de fábrica.
- O dev stack do ERP (`npm run dev`, gateway 38000 + 4 apps) **segue rodando em background** desta sessão
  (task `bk9jln00a`) — não derrubado, para o dono poder continuar olhando sem precisar subir de novo.
- Comparação com o sistema de referência antigo (`ZP/Automacao-relatorios/Novo`) ficou rasa: só a leitura de
  `Painel.tsx` (usa `SarakAnalyticalPage`, wrapper fino) — não cheguei a rodá-lo lado a lado. Se o dono quiser
  uma comparação mais rica, é trabalho para retomar.

## Resumo da execução (continuação) — 2026-09-18

**Resultado:** Concluído com pendências (a pedido do dono: sem percorrer os 11 temas individualmente — o
foco desta rodada foi o teste de isolamento pendente e a usabilidade da própria aba Design).

### Isolamento entre usuários — fechado, com prova empírica real

Browser reaberto (a sessão anterior havia fechado por hibernação da máquina). Teste com **dois perfis de
browser genuinamente separados** (Chromium com `userDataDir` distintos — não duas abas do mesmo perfil, que
compartilhariam `localStorage` por construção):

1. **Perfil A** (o mesmo da exploração anterior): `localStorage` tinha `sarak-ui-preferences-v1` vazio
   (`{}`) e `sarak-ui-design-v9.0` com `mode:"dark"`. Cliquei o alternador de tema (grava PREFERÊNCIA, não
   tema — `ShellThemeToggle.tsx:28`). Depois do clique: `sarak-ui-preferences-v1` = `{"colorMode":"light"}`,
   e `sarak-ui-design-v9.0.mode` **continuou `"dark"`, byte a byte** — a preferência não escreveu no tema.
2. **Perfil B** (novo, `userDataDir` isolado, nunca visitou o app antes): `sarak-ui-preferences-v1` = `{}`
   (a preferência do Perfil A **não chegou aqui** — isolamento confirmado) e `data-sx-mode` = `"dark"` (o
   modo efetivo do Perfil B é o do TEMA, não o `light` que o Perfil A escolheu).
3. **Achado colateral, e é uma CONFIRMAÇÃO, não um bug:** o Perfil B carregou com `isAutoHideEnabled:true`,
   `navigationStyle:"sidebar"` — exatamente as customizações que eu tinha **aplicado como TEMA** (via
   "Aplicar Alterações Globais") na sessão anterior. Ou seja: tema (`sarak-ui-design-v9.0`) É compartilhado
   entre perfis — porque o ERP tem uma porta real de sincronização do lado do consumidor para o dado de
   tema (não investiguei o mecanismo exato, mas o efeito bate com o contrato: "tema é do administrador e do
   sistema inteiro", specs/09 §4.7) — e preferência (`sarak-ui-preferences-v1`) NÃO é. **As duas metades do
   requisito do passo 3 ficam provadas ao mesmo tempo, no sistema real:** uma preferência de um usuário não
   aparece no outro, e não altera o tema que os dois compartilham.

### Usabilidade da aba Design — como é mudar um tema pela tela (foco pedido pelo dono)

Testei o fluxo real de edição — não a aparência resultante de um tema, mas a EXPERIÊNCIA de operar o
painel. Três achados concretos, reproduzidos mais de uma vez:

**1) O preview ao vivo é uma maquete separada, não a tela real onde o usuário está.** Ao digitar uma nova
`primaryColor` (`#00FF00` sobre um tema base vermelho), a maquete à direita ("Design Intelligence Catalog" —
um mock de dashboard dentro do próprio painel) e alguns badges do PRÓPRIO painel (ex.: "V13.9 - AUDIT
ACTIVE") mudam de cor **imediatamente**, mas a barra de navegação REAL — a mesma sidebar onde o usuário está
clicando, à esquerda da tela — **continua com a cor antiga até o clique em "Aplicar Alterações Globais"**.
Confirmado nos dois estados (antes/depois do clique, screenshot de cada um). **Por que isso importa para a
fluidez:** o usuário precisa traduzir mentalmente uma maquete abstrata para o que vai acontecer na PRÓPRIA
tela — e problemas reais de contraste/aplicação (como o achado #1 desta plan, o badge ilegível) só aparecem
DEPOIS de aplicar, não durante a experimentação. Um preview que reaproveitasse o cromo real (ou ao menos um
recorte fiel dele) apareceria o problema no instante em que o token muda, antes do compromisso.

**2) A primeira busca por token, logo após abrir o painel, não registra a digitação.** Reproduzido com dois
métodos independentes (setar `.value` via JS e digitação simulada de verdade, tecla a tecla, via
`puppeteer_fill`): a primeira tentativa de busca por "borderRadius" logo após abrir a aba Design deixa o
campo **vazio** (nem o texto aparece); a segunda tentativa, idêntica, funciona e mostra os resultados. Sugere
um efeito de inicialização do painel (provavelmente um reset de estado de busca no primeiro render) que
descarta o primeiro evento de digitação. Para quem não sabe disso, a sensação é "a busca não funciona".

**3) Não há desfazer/reverter visível depois de "Aplicar".** Procurei por qualquer controle de
desfazer/reverter/reset (`grep` nos textos de todos os botões do painel) — nenhum encontrado. Depois de
"Aplicar Alterações Globais", a única forma de voltar ao valor anterior é lembrar dele e reescrevê-lo à mão,
ou reaplicar o preset do tema inteiro (que descarta QUALQUER outra customização feita antes, não só a
indesejada). Experimentar um valor arriscado no painel não tem rede de segurança.

### Sugestões de melhoria da biblioteca — usabilidade prática do painel (acrescenta ao passo 7)

| # | O que se tentou fazer | O que falta | De onde vem a expectativa | Ganho |
| --- | --- | --- | --- | --- |
| 2 | Ver o efeito de um token (cor, raio, textura) na PRÓPRIA tela onde o usuário está, enquanto ajusta o valor | O preview ao vivo só atualiza uma maquete separada dentro do painel — o cromo real (a barra que envolve a própria tela do usuário) só reflete a mudança depois de "Aplicar" | Um padrão de "edição direta" (o que se vê é o que se aplica) é o que qualquer editor visual moderno de tema/CSS oferece; a lib já TEM o cromo real montado na página — é questão de o painel escrever no MESMO design em runtime, não só na maquete | Erros de contraste/aplicação (como o achado #1 desta plan) apareceriam durante a edição, não depois de commitado; menos ida e volta entre "Aplicar" e "conferir" |
| 3 | Buscar um token pelo nome assim que a aba Design abre | A primeira tentativa de busca (comprovada com dois métodos) não registra a digitação; só a segunda funciona | Comportamento básico esperado de qualquer campo de busca — a expectativa vem do próprio campo, que existe e funciona na segunda tentativa | Elimina a sensação de "busca quebrada" logo na primeira interação de quem acabou de abrir o painel |
| 4 | Corrigir um valor aplicado por engano, sem perder as outras customizações já feitas | Não existe desfazer/reverter/histórico — só reaplicar o preset inteiro do tema (que apaga tudo, não só o erro) | Zero-config/zero-gambiarra (specs/07 §1) aplicado à edição: o usuário não devia precisar decorar o valor antigo para "consertar" um erro no painel | Experimentar tokens deixa de ser arriscado — abre espaço para o usuário (ou o dono, ao autorar os temas da `plan-80`) explorar variações sem medo de perder trabalho |

## O que foi conferido e está correto (acrescenta)

- Isolamento preferência × tema: **provado com dois perfis de browser reais**, nas duas direções (preferência
  não vaza para o outro perfil; preferência não escreve na chave de tema compartilhada).
- Painel de Design: navegação por categorias em acordeão + busca (quando registra a digitação) chega ao
  token certo em poucos cliques; a separação entre "rascunho" (edição) e "Aplicar" (commit) em si é um
  padrão seguro — o problema não é a existência do gate de aplicar, é o preview não usar o cromo real
  enquanto o rascunho existe.

---

# 10. Veredito

## Veredito — 2026-09-18 — 🟢 Aprovado

**Verificado pelo revisor:**
- **Passo 1 (bloqueante):** o marcador `"corresponde a nenhum tema conhecido"` existe em
  `src/core/Provider/hooks/useDesignSync.ts:57` e no `dist/` atual, e **não** existia no `dist/` do commit
  anterior (`279d33f`: 0 ocorrências). A prova de que o navegador o baixou (recurso listado pela própria
  página) é verificável e nomeada.
- **Escopo:** zero arquivo de produção alterado; só esta plan mudou no worktree.
- **Achados conferidos no código**, não pela narrativa:
  - o fundo do badge `muted` usa o token de borda (`SarakBadge.tsx:71`), e é o único caso em `src/components/`;
  - `SarakTable` desestrutura `data` e nunca o usa (`SarakTable.tsx:46`, única ocorrência); `SarakCardGrid`
    só aceita `endpoint`;
  - o painel só reverte token de rascunho (`useDesignDraft.ts:175`), sem desfazer depois de aplicar.
- **Isolamento entre usuários** provado com dois perfis de navegador reais, nas duas direções.
- **Cobertura:** só um tema foi exercitado ao vivo, **por decisão do dono**, e a lacuna está declarada; a
  vitrine da `plan-80` passa a cobrir os outros.

**Um limite que não reprova:** a comparação com o sistema de referência ficou rasa (leitura de um arquivo),
e está declarada nas pendências.

**Destino, combinado com o dono:** os achados e as sugestões de biblioteca viraram a `plan-81`; o insumo de
temas foi transportado para a `plan-80` (emenda §3.4); a prévia na tela real, que o texto antigo da
[[06-painel-de-customizacao-e-preview]] §4 desaconselhava por um motivo que a camada de preferências tornou
falso, entrou na `plan-81` por decisão do dono.

---

# 11. Síntese
