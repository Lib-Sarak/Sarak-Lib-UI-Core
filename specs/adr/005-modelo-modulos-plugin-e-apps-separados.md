---
tipo: "adr"
titulo: "Modelo módulos-plugin oficial e a composição apps-separados"
status: "🟢 Aceito"
tags: ["adr", "arquitetura", "modos-de-consumo", "shell", "ui-kit", "cromo"]
relacionados: ["[[001-tres-arquiteturas]]", "[[002-remocao-motor-manifesto]]", "[[003-remocao-backend-proprio]]"]
substitui: ""
substituido_por: ""
---

# 1. Contexto e Problema

**Data da decisão: 2026-07-23 (modelo oficial) · refinada em 2026-07-24 (dois modos) · veredito empírico em 2026-07-25.**

Depois que a tese manifesto-only caiu ([[002-remocao-motor-manifesto]]), a lib ficou sem modelo de consumo declarado. A pergunta imediata era: **como um sistema importador usa esta biblioteca?**

A primeira resposta veio da realidade, não do desenho. O único consumidor real da época, o `Sarak-MyService`, já usava um modelo há muito tempo: **o host registra seus módulos de negócio e a lib resolve navegação e layout** — `registerSarakModule`/`registerLocalComponent` sobre `SarakUIProvider`+`SarakShell`. Esse era o modelo **#1** de [[001-tres-arquiteturas]], que a própria lib marcava internamente como "Shell legado". O mantenedor oficializou o que já funcionava em produção, e o #1 deixou de ser legado.

**Mas a auditoria de um segundo consumidor real, em 2026-07-24, mostrou que um modelo só não bastava.** O ERP Earendel é um monorepo React puro, com apps `web` separados por deploy e um conector que navega entre eles por **redirect de página inteira**, não por rota de SPA. Ele não tem host. Encaixá-lo no modelo #1 exigiria reescrever o conector — ou seja, **mexer na arquitetura do importador para acomodar a biblioteca**, que é exatamente o inverso do que uma biblioteca deve pedir.

Esse consumidor não estava usando a lib de forma errada. Ele representava uma topologia legítima e comum, na qual a lib entra como **caixa de componentes + tokens + Design Engine central**, sem ser dona do layout do aplicativo.

O princípio que o mantenedor fixou durante essa rodada resolveu o impasse: *"o módulo UI deve renderizar um sistema que seja monolito, monolito modular ou microsserviço — somos uma biblioteca genérica de renderização."* Consequência dura e imediata: **nem o cromo nem os componentes podem pressupor um host único.**

# 2. Decisão

**Reconhecer DOIS modos de consumo legítimos, partilhando o mesmo núcleo** — Provider, tokens e Design Engine central são idênticos nos dois; muda apenas quem é dono do layout.

| | **Modo Shell-host** | **Modo ui-kit + central** |
| --- | --- | --- |
| Quem é dono do layout | A lib | O consumidor |
| Composição | `SarakUIProvider` + `SarakShell` + registro de módulos | Os apps do consumidor; a lib entra como kit |
| Navegação | Resolvida pelo Discovery da lib | Do consumidor (redirect, router próprio, o que for) |
| Cromo | `SarakShell` (host — renderiza o módulo ativo) | `SarakAppChrome` (apresentacional — renderiza `children`) |

A API de registro do modo host é `registerSarakModule` e `registerLocalComponent`, em `src/core/Discovery/registry.ts:121` e `:71`.

## As duas consequências diretas da decisão

**1. O cromo passou a ser POR-APP.** Investigou-se primeiro se o `SarakShell` poderia rodar em modo apresentacional; **não pode** — ele renderiza o módulo ativo do Discovery, não `children`. Foi por isso que nasceu `SarakAppChrome` (`src/components/Layout/SarakAppChrome.tsx`), cujo comentário de cabeçalho registra a lacuna exata que ele fecha: os tokens de cromo do Design Engine (`--sarak-topbar-*`, `--sarak-sidebar-*`) **ficavam sem consumidor** num sistema de apps separados, porque o único consumidor era o Shell-host. O sintoma prático era "topbar e sidebar não aparecem". Cada app renderiza o seu cromo, sem registro e sem Discovery.

**2. A central alcança todas as telas por duas camadas — e a maior delas não é runtime.** As *definições* de tema viajam como **código compartilhado** (o catálogo de temas mora num pacote que todos os apps importam), então os temas disponíveis e o padrão são idênticos em todo o sistema **por construção**, com zero sincronização. Só a *seleção ativa do usuário* precisa cruzar, e ela vive em `localStorage` — com `persistence.crossTabSync` (`src/core/Provider/types.ts:165`, default ligado) reagindo ao evento `storage` para reaplicar o design validado quando outra aba ou app grava a mesma chave.

**Limite físico registrado, não escondido:** `localStorage` é por **origem**. No deploy único isso funciona; em desenvolvimento, com cada app num servidor de porta própria, são origens diferentes e a troca em runtime não cruza. Servir os próprios apps sob uma origem é ação normal de consumidor — a lib apenas documenta o requisito.

## O veredito empírico

Esta decisão não é teórica. O Teste Real foi **APROVADO pelo dono em 2026-07-25**, depois de quatro rodadas de correção, e foi ele que liberou a remoção do #2.

O que ficou provado no caminho, num sistema de produção real: as quatro paredes do manifesto caem trivialmente em React; o formulário grava de verdade com persistência confirmada fora da UI; a central repinta **cor, fonte, cromo e raio** em todas as telas de todos os apps, sob origem única, sobrevivendo ao reload; e o isolamento do consumidor permaneceu intacto — a lib entrou em **um único `package.json`**, o conector não foi reescrito, cada app continuou rodando standalone, e nenhum módulo passou a depender de outro.

Igualmente importante é **como** as falhas foram tratadas nas rodadas: toda lacuna encontrada foi corrigida **na lib**, nunca contornada no importador. A regra que governou isso — *se o consumidor precisou escrever CSS, fiar token à mão ou montar andaime só para a lib funcionar, é defeito da lib* — foi verificada por grep ao fim de cada rodada, com resultado vazio.

# 3. Consequências

- **Positivas:**
  - **A lib para de impor arquitetura.** Monolito, monolito modular e microsserviço são todos atendidos, porque nada no núcleo pressupõe host único.
  - **Dois consumidores reais, duas topologias opostas, o mesmo núcleo.** A validação cruzada é mais forte do que qualquer desenho no papel.
  - **Os tokens de cromo ganharam consumidor no modo sem host** — uma capacidade que existia e era inalcançável para metade dos consumidores possíveis.
  - **O modelo de propagação de tema é robusto por construção.** A parte que mais importa (quais temas existem, qual é o padrão) é código compartilhado e não depende de sincronização nenhuma; só a seleção do usuário usa estado de runtime.
  - **A decisão é empírica.** Foi validada em produção real antes de ser fixada, e cada rodada de validação apontou defeitos que viraram correção na fonte.

- **Negativas (Trade-offs):**
  - **Dois modos custam mais que um** — em documentação, em teste e em decisão de quem chega. Todo agente e todo consumidor novo precisa escolher, e escolher errado custa retrabalho.
  - **Duas peças de cromo com nomes parecidos e papéis opostos.** `SarakShell` é host; `SarakAppChrome` é apresentacional. A confusão entre eles é previsível e precisa ser combatida na documentação.
  - **No modo apps-separados o cromo re-renderiza a cada troca de módulo**, porque a navegação é reload de página. Foi um custo **aceito explicitamente** pelo dono: é o preço de preservar o isolamento do consumidor e de ser genérico.
  - **A propagação em runtime depende de mesma origem** — limite físico do browser, não da lib, mas que o consumidor precisa conhecer para não ser surpreendido em desenvolvimento.
  - **Uma armadilha de validação nasceu daqui e cobrou caro:** numa rodada, o cromo foi **reprovado no browser do dono** por não colapsar no celular. Não era bug — era **build stale**: a cópia instalada no consumidor era velha, porque a versão do pacote não mudava e o gerenciador não recopiou. O código estava correto. O custo dessa investigação é consequência direta do modelo de distribuição, tratado em [[007-distribuicao-por-git]].

> **Escopo:** este ADR registra a **decisão de composição**. Como usar cada modo na prática é assunto da documentação de arquitetura, não deste registro.
