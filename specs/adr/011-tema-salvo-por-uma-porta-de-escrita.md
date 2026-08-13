---
tipo: "adr"
titulo: "Tema salvo em runtime por UMA porta de escrita — a leitura já é `customThemes`"
status: "🟢 Aceito"
tags: ["adr", "persistencia", "temas", "design-engine", "painel", "contrato"]
relacionados: ["[[010-temas-salvos-pelo-usuario]]", "[[003-remocao-backend-proprio]]", "[[009-persistencia-tenant-aware]]", "[[09-temas-e-presets]]"]
substitui: "[[010-temas-salvos-pelo-usuario]]"
substituido_por: ""
---

# 1. Contexto e Problema

**Data da decisão: 2026-08-12.**

O [[010-temas-salvos-pelo-usuario]] decidiu **o quê**: o usuário final passa a salvar temas criados no
painel, sem depender de deploy. Esse objetivo continua valendo por inteiro, e este ADR não o reabre.

O que se descobriu ao preparar a execução foi que **o recorte técnico do 010 não é implementável como
escrito**, e que ele é maior do que precisa ser. Três medições, todas de 2026-08-12:

**1. O tipo que o 010 manda reaproveitar não aceita tema de runtime.** O 010 §2 fixa
`onSaveTheme?: (theme: ThemePreset) => …` e afirma *"reaproveita o tipo `ThemePreset` já existente… nenhum
tipo novo é criado"*. Mas `ThemePreset.id` é `ThemePresetId`
(`src/core/Design/presets/themes/index.ts:46-49`), uma **união fechada** dos ids que a lib embarca. Um tema
criado pelo usuário tem id livre e não compila ali. O 010 confundiu **formato** com **tipo**: a
[[09-temas-e-presets]] §2.1 item 4 diz que o mesmo *formato* serve para os dois lados — e serve; o que não
serve é o mesmo *tipo TypeScript*.

**2. A porta de leitura que o 010 cria já existe.** `onLoadThemes` devolveria a lista de temas salvos. Mas a
lista de temas do Provider é `allThemes = [...GLOBAL_THEMES, ...customThemes]`
(`src/core/Provider/SarakUIProvider.tsx:118-120`), e `customThemes` é a prop pela qual o consumidor **já**
injeta temas de fora. Duas portas alimentando a mesma lista é a duplicação de fonte que a **R6** existe para
impedir.

**3. O tipo de entrada dessa lista já é aberto.** `customThemes` é `unknown[]` e `allThemes` é
`ThemeEntry[]`, cujo `id` é `string` puro (`src/core/Provider/types.ts:34-38,229`). O painel lê essa lista
por *cast* (`Main/TemplatesTab.tsx:22`, `Canvas/components/PresetsCatalog.tsx:46`). Ou seja: **a máquina já
aceita tema de id livre hoje** — falta só o caminho de escrita.

E o dono fixou o recorte de produto, que é mais estreito do que o do 010:

> *"A lib sempre terá os temas internos, e o importador irá salvar somente o tema aplicado e os novos temas
> criados. O correto é que o importador escolha onde quer armazenar, seja em JSON ou tabela."*

# 2. Decisão

**As três portas do 010 §2 são substituídas por uma.** O resto do 010 — o objetivo, a coexistência com
"Exportar JSON", o corte sem editar/renomear, a validação de fronteira, a degradação sem porta configurada —
**continua vigente**.

| O que o 010 decidiu | O que passa a valer |
| --- | --- |
| `onSaveTheme?: (theme: ThemePreset) => …` | **`options.theme.onSave?: (theme: ThemeEntry) => Promise<void> \| void`** |
| `onLoadThemes?: () => ThemePreset[]` | **não existe.** A leitura é a prop `customThemes`, que já cumpre esse papel |
| `onDeleteTheme?: (themeId: string) => …` | **não existe.** A lista pertence ao importador; a lib nunca remove o que não guardou |
| "reaproveita `ThemePreset`; nenhum tipo novo" | **reaproveita `ThemeEntry`**, que já vive em `core/`. Nenhum tipo novo — mas ele ganha **`name?: string`**, porque um tema salvo precisa de rótulo na lista |
| portas em `options.persistence` | portas em **`options.theme`**, junto do que já é assunto de tema. ⛔ Nunca um bloco `options.themes` (plural) ao lado do `theme` singular |

**A divisão de responsabilidade, explícita:** a lib **sempre** embarca os temas internos e nunca pede que
alguém os guarde. O importador guarda **duas** coisas — o **tema aplicado** (que já é
[[009-persistencia-tenant-aware]], via `persistence.onSave`/`onLoad`) e os **temas novos** que o usuário
criar (esta decisão). Onde ele guarda — arquivo JSON, tabela, `localStorage`, o que for — **a lib não
pergunta e não sabe**.

**O ciclo completo fica com uma metade fora da lib:** o painel salva → `options.theme.onSave` entrega o JSON
→ o importador guarda → no próximo boot ele devolve em `customThemes`. Dentro da sessão, o Provider mantém o
tema salvo em estado próprio e o funde em `allThemes`, para que ele apareça na hora.

**Sem `options.theme.onSave` configurado, o botão "Salvar" não aparece** — mantendo a regra do 010. Um
"Salvar" que evapora no reload é pior que não ter Salvar.

# 3. Consequências

- **Positivas:**
  - **Um callback novo no contrato público, não três.** O 010 previa três; dois deles eram atalhos para o
    que uma prop já fazia.
  - **Nenhum tipo novo.** `ThemeEntry` já existe, já está em `core/`, já é o que o Provider consome — e a
    R1 (gate pleno) fica intacta, o que não aconteceria tipando a porta com o `ThemeExportPayload` que vive
    em `features/`.
  - **Aditivo, MINOR.** Nada muda para quem não configurar a porta. `ThemePresetId` continua fechado,
    descrevendo só os temas embarcados — a checagem que pega id de tema inventado em tempo de compilação
    permanece de pé onde faz sentido.
  - **Nenhuma chamada assíncrona nova na lista de temas** — o trade-off que o 010 aceitou (estado de
    carregamento/erro em `onLoadThemes`) deixa de existir, porque a leitura é síncrona via prop.

- **Negativas (Trade-offs):**
  - **O ida-e-volta é do importador.** A lib não lembra de nada: quem guarda tem de devolver em
    `customThemes` na montagem seguinte. É o preço de não ter backend — e é o mesmo preço que o
    [[003-remocao-backend-proprio]] já cobra para o resto.
  - **`customThemes` acumula dois papéis** — temas escritos em código pelo dev e temas criados por usuário
    final. Para a lib são a mesma coisa; para quem lê o código do consumidor, é uma distinção que só existe
    na cabeça de quem escreveu. Aceito conscientemente: é mais barato que uma segunda lista.
  - **Sem porta de apagar**, remover um tema salvo é trabalho do importador, na fonte dele. A lib não
    oferece o gesto.
  - **O ciclo completo não é testável só aqui.** "Salvar → recarregar → o tema ainda está lá" atravessa
    código que não mora neste repositório; a suíte prova a metade de cá e precisa dizer isso em voz alta.

> **Escopo:** este ADR corrige o recorte técnico do [[010-temas-salvos-pelo-usuario]] e nada além. O objetivo,
> o corte de CRUD e a validação de fronteira daquele ADR continuam valendo — leia-o junto com este. A
> implementação é a `plan-38-salvar-tema-em-runtime`.
