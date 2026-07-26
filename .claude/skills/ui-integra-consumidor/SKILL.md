---
name: ui-integra-consumidor
description: Instala e acopla a base Sarak (@sarak/lib-ui-core) num sistema consumidor React — npm install, peerDependencies, SarakUIProvider, cromo/Shell, temas e o kit de uso `sarak-ui/`. Use quando o usuário pedir para baixar/instalar/importar a biblioteca Sarak UI (ex.: "baixe a biblioteca Sarak-UI <link>, ela será responsável pelo design e pelo tema do sistema"), iniciar a infraestrutura do front-end com a Lib, ou plugar a base num projeto novo. NÃO acione proativamente.
---

# Skill: Integrar Consumidor (Infraestrutura)

Instalação plug-and-play da base Sarak (`@sarak/lib-ui-core`) no projeto cliente e o **handoff**
para quem vai escrever as telas. A instalação é feita pelo **scaffolder oficial**
(`npx @sarak/lib-ui-core init`) — esta skill conduz a entrevista, roda o comando, valida a saída e
entrega o kit de uso. Ela **nunca escreve arquivo de infraestrutura à mão** (foi essa adivinhação de
infra que gerou os relatórios de erro de instalação real que motivaram o scaffolder).

## REGRA Nº 1 — leia o catálogo, nunca assuma

Depois de instalar, existe uma pasta **`node_modules/@sarak/lib-ui-core/sarak-ui/`**: o **kit de uso
do consumidor**. Dentro dela, **`catalog.json`** é a fonte da verdade sobre o que esta versão expõe —
componentes, props, tokens de tema, CSS Variables, nomes de ícone, contrato de responsividade e slots
do cromo, todos **gerados do código-fonte** da versão instalada.

- Antes de usar componente/token/ícone: **confirme no `catalog.json`**.
- **Nunca invente um nome de memória** (do seu treino ou de outra versão). Nome inexistente não
  quebra a tela — ele silenciosamente não faz nada, que é pior de achar.
- Precisa saber "o que a lib tem"? A resposta é o catálogo, nunca uma lista deste arquivo.

O kit também traz **`GUIA-FRONTEND.md`** — o documento único de autoria (4 topologias + todos os
casos). **Ele é a autoridade sobre COMO escrever as telas**; esta skill cuida da INFRAESTRUTURA.

## Modelo de consumo: dois formatos, o mesmo núcleo

O núcleo é sempre o mesmo: **`SarakUIProvider` + tokens públicos `var(--sarak-*)` + Design Engine
central**. O que varia é quem manda na navegação:

**(a) Base como KIT** — você mantém o seu roteador e a sua estrutura; a lib entra como componentes +
cromo apresentacional + central de tema. Serve às 4 topologias (monolito, monorepo, monolito modular,
microsserviço):

```tsx
import { SarakUIProvider, SarakAppChrome, CustomizationPanel } from '@sarak/lib-ui-core';

<SarakUIProvider customThemes={TEMAS} initialTheme={TEMAS[0].id}>
  <SarakAppChrome brand={{ name: 'Meu Sistema' }} navItems={NAV} onNavigate={navegar}>
    <MinhaRota />
  </SarakAppChrome>
</SarakUIProvider>
```

**(b) Base como HOST (módulos-plugin)** — a base assume navegação e roteamento a partir dos módulos
registrados. Só faz sentido quando o sistema é **um** app hospedando vários módulos:

```tsx
import { SarakUIProvider, SarakShell, registerSarakModule, registerLocalComponent } from '@sarak/lib-ui-core';
import { MeuModuloDeNegocio } from './modulos/MeuModulo';

registerLocalComponent('meu-modulo', MeuModuloDeNegocio);
registerSarakModule({ id: 'meu-modulo', label: 'Meu Módulo', icon: 'Box' });

<SarakUIProvider>
  <SarakShell />
</SarakUIProvider>
```

- `registerSarakModule({ id, label, icon, category?, priority? })` registra o módulo — a base gera
  navegação e roteamento sozinha. `registerLocalComponent(id, Component)` liga o React ao `id`
  (alternativa: `component` direto no objeto de registro). Use um guard `safeRegister` contra
  `undefined` — é o que o `init` já gera.
- **Não existe mais motor de renderização por manifesto.** O modelo é 100% React; telas em JSON foram
  removidas (o `SarakManifestRenderer` não existe). Nunca oriente o consumidor a "programar em JSON".
- O importador **pode criar o que precisar** — módulo, componente, tela. A única regra é a de tokens,
  logo abaixo.

**Contrato de tokens público (o que torna o código DO IMPORTADOR temável):** um componente próprio só
responde à troca de tema se estilizar por `var(--sarak-*)` — ex.: `background: var(--sarak-card-bg)`,
`color: var(--sarak-title-color)`, `gap: var(--sarak-layout-gap-md)`. Valor cru (`#3b82f6`, `16px`)
funciona hoje e fica **fora da central para sempre**. A lista real de CSS Variables está no
`catalog.json` → `tokens.cssVars`; nome fora dela não existe e não pinta nada.

**Temas em JSON (sem backend):** um tema é `{ id, name, description, design }`, com `design` = mapa
`tokenId → valor`. Passe via `customThemes`. **Parta de um tema COMPLETO** (`SARAK_REFERENCE_THEMES`)
e troque poucos valores — montar do zero com um punhado de chaves de cor produz o sintoma clássico
"troquei o tema e a fonte continuou igual" (eixos omitidos não mudam). Três controles, não confunda:

- **`activeThemeId`** — CONTROLADO: sempre vence e reaplica a cada mudança. Use quando o app decide.
- **`initialTheme`** — SEMENTE, não-controlado: só semeia o primeiro carregamento; o usuário troca
  depois sem ser forçado de volta. É a opção segura.
- Nenhum dos dois: cai em `options.theme.defaultTheme` ou no primeiro tema global.

A seleção do usuário persiste em `localStorage` sozinha. Para sincronizar no backend **do
consumidor** (opcional): `options.persistence.onSave`/`onLoad` ou `onThemeChange`. Para a troca de
tema atravessar apps de **mesma origem**, use a mesma `options.persistence.storageKey` em todos
(`crossTabSync` é `true` por padrão).

**Validação por construção:** todo tema (arquivo, `localStorage` ou export do painel) é validado no
load contra o schema de tokens. Chave desconhecida ou valor de tipo errado → `console.warn` +
descartado, nunca CSS cru. Se um ajuste "não pegou", o console diz por quê. As chaves válidas estão
no `catalog.json` → `designTokens.ids`.

**Exportar um tema pela UI:** o `CustomizationPanel` (a central) tem **"Exportar" → "Exportar JSON"**,
que baixa o tema **completo** — cole num arquivo do repositório e adicione a `customThemes`. Não
existe "salvar tema no banco": a central não tem servidor, e salvar **é** exportar.

## Quando usar
- Quando o usuário informar que está num repositório que consumirá a `Sarak-Lib-UI-Core` e precisa
  acoplar a base (Provider + Design Engine, com ou sem Shell).
- Quando for necessário plugar autenticação/roteamento do host ou registrar os primeiros módulos.
- APENAS a pedido explícito de instalação/integração. NÃO acione proativamente.

## Golden Path (leia antes de tudo)
- **Projeto novo: instalação MONOLÍTICA** — um único `package.json` na raiz do projeto-alvo. É o que
  o `init` gera.
- **Monorepo é suportado** (topologias 2/3/4 do `GUIA-FRONTEND.md`). Rode o `init` **dentro do
  pacote** que vai hospedar a Sarak, nunca na raiz do workspace.
- ⚠️ **A ressalva é sobre `npm workspaces`, não sobre monorepo:** eles quebram binários locais no
  Windows (achado real). **Workspaces de `pnpm` e `yarn` são suportados** e são a forma normal de
  monorepo — não desaconselhe.
- **Use o gerenciador DO projeto.** Rodar `npm` num workspace pnpm entra em `node_modules/.pnpm/` e
  tenta executar o `prepare` de pacotes de terceiros — **quebra a instalação** (achado real,
  2026-07-26). Confira `packageManager` no `package.json` e o lockfile presente antes de rodar
  qualquer coisa; se houver mais de um lockfile, um deles é resíduo. O `init` e o `check` detectam
  isso sozinhos e geram os comandos do gerenciador certo.
- **Starter padrão:** front **Vite puro** (Provider + Shell + módulo de exemplo), **sem backend
  nenhum** — o tema persiste em `localStorage`. O backend de negócio (se existir) é inteiramente do
  consumidor, em processo separado; a lib **nunca chama rede sozinha**.
- O `init` é **idempotente**: não sobrescreve arquivo existente sem `--force`; reporta o que pulou.

## Workflow

1. **Entrevista de Instalação (HITL) — ANTES de rodar qualquer comando**
   - **PRIMEIRA PERGUNTA — Modo de renderização:** *"O sistema é NOVO (a base nasce dona da página —
     Modo App) ou vai renderizar SOBRE um frontend que JÁ EXISTE (Modo Embarcado — uma ilha React)?"*
     - **Modo App:** o `init` monta o projeto inteiro. É o default (`options` sem `mode`).
     - **Modo Embarcado:** suportado, mas o `init` **não** monta a ilha dentro de um host existente —
       ele só garante os artefatos comuns. A montagem é manual (Etapa 4). Registre a escolha.
     - **Se Embarcado, pergunte também:** *"A adoção começa por quais rotas/regiões?"* — a migração é
       incremental (1 módulo → mais módulos → Shell completo → opcionalmente Modo App).
   - **SEGUNDA PERGUNTA — Topologia:** *"O projeto é um app único (monolito), vários apps num
     repositório (monorepo), apps compostos num deploy único (monolito modular) ou serviços com
     deploys independentes (microsserviço)?"* A resposta não muda o `init`, mas **decide onde moram
     os temas e a navegação** — registre-a e entregue-a no handoff (§2 do `GUIA-FRONTEND.md`).
   - **Porta do dev server** (default 5173).
2. **Instalação de Dependências + scaffolder oficial**
   - **Ação OBRIGATÓRIA antes de qualquer `npm install`: garanta um `package.json` na RAIZ do
     diretório-alvo.** Rode `npm init -y` se não existir (confira com `Test-Path package.json` /
     `ls package.json` antes). **Por quê:** sem `package.json` local, o `npm install github:...` sobe
     a árvore de diretórios e instala **lá**, em silêncio, poluindo um projeto alheio (achado real:
     289 pacotes num projeto não relacionado). Nunca pule, mesmo em diretório aparentemente vazio.
   - **Ação:** `npm install @sarak/lib-ui-core` (github: `npm install github:Lib-Sarak/Sarak-Lib-UI-Core`).
   - **Ação:** rode o scaffolder com as respostas da Etapa 1, via flags (não repita a entrevista):
     ```bash
     npx sarak-ui init --mode app --frontend-port 5173
     # sem link simbólico do bin, equivalente:
     node node_modules/@sarak/lib-ui-core/bin/sarak-ui.mjs init --mode app --frontend-port 5173
     ```
     Flags: `--mode` (`app`|`embedded`), `--frontend-port`, `--force`, `--yes`, `--help`/`-h`.
     **Você (agente) roda sem TTY** — sempre passe `--yes` OU todas as flags; sem isso o `init` falha
     alto com `exit 1` e mensagem instrutiva.
   - **O que o `init` garante sozinho** (não repita à mão):
     - **TODAS as peerDependencies gravadas** no `package.json` (nunca confie no auto-install do
       npm 7+, que instala em `node_modules` mas não registra — irreproduzível em `npm ci`).
     - `typescript` travado em `^5`; `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`
       e `src/modules/ExampleModule.tsx`.
     - os scripts `sarak:update` / `sarak:check`.
     - **o kit `sarak-ui/` copiado para a raiz do projeto.**
   - **Ação:** `npm install` (o `init` só escreve `package.json`; quem baixa é o npm).
3. **Validação**
   - Nesta ordem: `npm run build` verde (`tsc --noEmit && vite build`); `npm run dev` sobe o front; a
     tela inicial renderiza tematizada; a central de design está acessível.
   - Falhou por dependência ausente? Confira se a Etapa 2 rodou `npm install` **depois** do `init`.
4. **Montagem da Ilha (SÓ no Modo Embarcado — o `init` não automatiza)**
   - **CSS escopado:** importe UMA vez, no entry point do host:
     ```ts
     import '@sarak/lib-ui-core/dist/sarak-scoped.css';
     ```
     É o mesmo stylesheet com preflight/utilities confinados ao seletor `.sarak-scope`. **Nunca**
     importe `dist/sarak.css` num consumidor embarcado: é o reset global que repinta o host.
   - **Marcação anti-flash (recomendada):** `data-sarak-ui-mode="embedded"` no `<html>` do host. A
     injeção automática de CSS roda na IMPORTAÇÃO do módulo, antes de qualquer Provider montar; com a
     marcação ela nem acontece. Sem ela o Provider ainda remove o CSS global ao montar (e avisa em
     dev), mas pode haver um flash do host re-estilizado.
   - **Provider + módulos:** monte a ilha no ponto certo do front existente, com
     `options={{ mode: 'embedded' }}`. O Provider renderiza um `<div class="sarak-scope">` que ancora
     o CSS e recebe os tokens.
   - **Múltiplas ilhas:** N módulos sob **1** Provider embarcado. **N Providers na mesma página está
     FORA do suporte** — disputariam a mesma classe de escopo e o mesmo stylesheet.
   - **O que muda vs. Modo App (esperado, não é bug):** título/favicon continuam do host; as fontes do
     Google não são injetadas (opt-in: `embedded: { injectGlobalFonts: true }`); overlays de página
     inteira (ruído, mídia de fundo global) não são renderizados — cobririam a página do host. Nesse
     modo, para arte/animação use os **slots do cromo**.
   - **Verificação antes de declarar pronto:** (1) o front existente está visualmente IDÊNTICO;
     (2) o título da aba não mudou; (3) dentro da ilha os componentes Sarak estão estilizados;
     (4) um toast/modal renderiza estilizado. Se (3) falhar, quase sempre é o CSS escopado faltando
     ou o `dist/sarak.css` importado por engano.
5. **Handoff (Ponto de Transição) — entregue o kit**
   - Confirme que existe **`sarak-ui/`** na raiz do projeto (o `init` copia; senão, copie de
     `node_modules/@sarak/lib-ui-core/sarak-ui/`).
   - Execute os **3 movimentos** do `sarak-ui/START-HERE.md`: guia → `specs/sarak-ui-guia-frontend.md`;
     skill → `.claude/skills/ui-integra-consumidor/` **e** `.agents/skills/ui-integra-consumidor/`;
     kit → raiz. São **cópias**, não recortes.
   - Informe que a integração arquitetural terminou e que **o próximo passo é escrever os módulos de
     negócio como React comum**, seguindo o `GUIA-FRONTEND.md` (§0 primeiro: a árvore de decisão e a
     regra de fallback universal) e consultando o `catalog.json` para tudo que for lista.

## Como atualizar a biblioteca

A `@sarak/lib-ui-core` é instalada por **URL git**, não por registry — e a `version` do `package.json`
fica parada por muitos commits (o módulo ainda está em desenvolvimento; tags/semver fora de escopo por
decisão do mantenedor). Consequência **não intuitiva**:

- **Um `npm install` comum NÃO atualiza a lib — e é o comportamento ESPERADO do npm.** O
  `package-lock.json` grava o commit git resolvido na primeira instalação (`resolved: "...#<sha>"`).
  Como a `version` não muda, o npm considera o lock satisfeito e nunca volta à rede. Achado real: um
  consumidor ficou preso 4 commits atrás por semanas sem ninguém perceber.
- **"Sempre na versão mais atual" só existe como atualização SOB COMANDO.** Automático de verdade
  exigiria registry + faixa semver.

```bash
npm run sarak:update
```

O script é gerado **conforme o gerenciador do projeto** (Spec 51). No npm faz, nesta ordem:
`npm uninstall` (tira o pin do lockfile) → `npm cache clean --force` (invalida o cache git, que
também serviria o commit velho) → `npm install <mesmo spec git>` → **`sarak-ui refresh`**
(re-sincroniza o `sarak-ui/` e as cópias movidas). No pnpm/yarn é `remove` + `add` + `refresh`
(medido: ambos re-resolvem o HEAD remoto sem precisar limpar cache). A última etapa é o que impede a
lib nova conviver com instruções velhas.

```bash
npm run sarak:check          # veredito sob demanda
npx sarak-ui check --notify  # modo AVISO: só fala se houver atualização; sai sempre com 0
```

O `check` funciona em **monorepo** (procura o lockfile subindo a árvore) e em **dependência local**
(`file:`/`link:`). Neste último não existe commit remoto para comparar: ele compara a assinatura de
build instalada com a do repositório em disco e diz se um rebuild da lib ainda não chegou ao
consumidor. Isso é o `check` — e é normal, não erro.

**O AVISO (`--notify`)** é o que o `init` liga como `predev`: em dia não imprime nada; havendo versão
nova, imprime as duas versões e **o comando do seu gerenciador**. Nunca derruba o `dev` (exit 0
sempre, silêncio se estiver offline). Se o projeto não veio do `init`, ou já tinha um `predev`,
encadeie à mão **no pacote que roda o `dev`** — que num monorepo raramente é o pacote que declara a
dependência.

**Por que NÃO usar `dist/BUILD_INFO.json` para "estou atualizado?":** o arquivo existe, mas **não
pode** conter o commit que o publica — o `dist/` é commitado DEPOIS de gerado, e gravar dentro dele o
próprio hash é auto-referência impossível. Por isso o campo se chama `baseCommit` (sempre um passo
atrás). Use `BUILD_INFO` só para `builtAt`/`libVersion`; para "estou atualizado?", `sarak:check`.

**Ao atualizar, leia `docs/migracoes.md` ANTES de investigar quebra de tipo** — mudanças de contrato
público ficam lá com antes/depois.

**Desenvolvimento local (`file:`/`npm link`) — não incorporado ao `init`:** trocar a dependência por
`"@sarak/lib-ui-core": "file:../Sarak-Lib-UI-Core"` propaga mudanças sem reinstalar. **Trade-off:**
NÃO reproduz o pacote publicado (aponta para o `dist/` local, sem passar pela allowlist de `files`) —
nunca use este modo para validar uma instalação real ou testar atualização. Com `file:`, o npm
**copia** o pacote para o store: depois de rebuildar a lib, reinstale para o consumidor ver.

**Tamanho do bundle — o que resolve e o que NÃO resolve (medido):** quando o `dist/` do consumidor
parecer grande, **não** mexa em `manualChunks` — ele não reduz um byte, só decide em qual arquivo
cada byte cai, e uma regra ampla demais **funde de volta** os chunks lazy que a lib já divide.
- **Acesso dinâmico a barril de ícone é o vilão clássico.** `Icons[nomeEmRuntime]` impede
  tree-shaking e segura a biblioteca inteira (valeu 789 KB no chunk de boot da lib; com o mapa curado
  caiu para 56 KB). **No SEU código, use `<SarakIcon name="..." />`** com um nome do catálogo.
- **Peso de verdade fica atrás de `React.lazy` + `import()`.** É o que mantém gráfico/PDF/editor fora
  do boot. Componente pesado seu: faça o mesmo.
- **`export * from '@sarak/lib-ui-core'` no seu barril NÃO custa nada.** Medido byte a byte: saída
  idêntica a reexportar só o que se usa. A "porta única" de um monorepo é de graça.

## Regras (SRP - Responsabilidade Única)
- **NÃO escreva arquivo de infraestrutura à mão** (`vite.config.ts`, deps/scripts do `package.json`) —
  é o que o `init` existe para eliminar. A única saída manual permitida é a Etapa 4 (ilha embarcada).
- **NÃO ensine a montar telas nesta skill.** Autoria de tela é o `GUIA-FRONTEND.md` do kit. Aqui é
  infraestrutura, registro e atualização.
- **NÃO responda "o que a lib tem" de memória.** Sempre `catalog.json`.
- **A identidade da página é do CONSUMIDOR.** `<title>`, favicon e marca vivem no projeto dele e a lib
  não os sobrescreve por padrão. Se ele quiser que a lib gerencie, é opt-in
  (`options.branding.initial.tabName` ou `config.systemName`). **Se a marca da biblioteca aparecer no
  produto do consumidor, é defeito da lib — reporte, não contorne.** Detalhes em
  `docs/identidade-do-host.md`.
- **Defeito da lib se corrige NA LIB.** Nunca oriente um patch no projeto do consumidor para contornar
  comportamento quebrado da base.

## Referências
**Artefatos do pacote (`node_modules/@sarak/lib-ui-core/`):**
- `sarak-ui/` — **o kit de uso**: START-HERE, `GUIA-FRONTEND.md`, `catalog.json`, `templates/`, `VERSION`.
- `bin/sarak-ui.mjs` (`npx sarak-ui init`) — o scaffolder oficial; Node puro, idempotente.
- `docs/component-catalog.md` / `.json` — catálogo gerado, com o TIPO completo de cada prop.
- `docs/migracoes.md` — breaking changes do contrato público, com antes/depois.
- `docs/identidade-do-host.md` — título da aba, favicon e marca são sempre do importador.
- `docs/extensibilidade-de-layout.md` — os 2 níveis de imagem/animação: fundo global por tema e slots do cromo.
- `docs/temas-cromo-e-multidispositivo.md` — temas completos, cromo e contrato de responsividade.

**Fluxo:** esta skill conduz a entrevista e roda o `init`; o handoff é o `GUIA-FRONTEND.md`.

**Ambiente (lição de instalação real):** portas ocupadas por processos node antigos fazem você testar
código velho — libere-as antes de subir o dev.
