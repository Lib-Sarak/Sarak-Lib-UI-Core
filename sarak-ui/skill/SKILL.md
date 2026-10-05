---
name: ui-integra-consumidor
description: Instala e acopla a base Sarak (@sarak/lib-ui-core) num sistema consumidor React — npm install, peerDependencies, SarakUIProvider, cromo/Shell, temas e o kit de uso `sarak-ui/`. Use quando o usuário pedir para baixar/instalar/importar a biblioteca Sarak UI (ex.: "baixe a biblioteca Sarak-UI <link>, ela será responsável pelo design e pelo tema do sistema"), iniciar a infraestrutura do front-end com a Lib, ou plugar a base num projeto novo. NÃO acione proativamente.
---

# Skill: Integrar Consumidor (Infraestrutura)

> 🔒 **Esta skill tem contrato INVERTIDO em relação às outras deste repositório — leia antes de
> "adequá-la".**
>
> As demais skills de `.agents/skills/` **apontam** para `specs/` em vez de duplicar conteúdo.
> Esta **não pode**: ela é a **fonte** do kit do consumidor
> (`scripts/consumer-kit/kitFiles.mjs` → `sarak-ui/skill/`) e viaja dentro do pacote. Quem a lê do
> outro lado **não tem `specs/`** — tem só o que veio no `node_modules`. Para ela, ser
> autocontida é o requisito, não o defeito.
>
> Duas consequências práticas:
> - **Os caminhos daqui são do repositório do CONSUMIDOR**, não deste — o **src/main.tsx** dele, o
>   **npm run dev** dele. Um detector de ponteiro morto rodando aqui dentro os acusa, e estaria
>   errado. *(Por isso são citados em negrito: a convenção de `specs/specs/14-artefatos-do-mantenedor.md` §4.2 é que caminho não-verificável nunca vai em crase.)*
> - **Apagá-la derruba o `npm run build`**: o `guide:check` lê esta pasta e um `readdirSync` num
>   caminho ausente lança `ENOENT`.
>
> Ela também deixou de ser procedimento para o agente que trabalha **neste** repositório: quem
> baixa o módulo hoje recebe os artefatos prontos, esta skill inclusive.

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
import { SarakUIProvider, SarakAppChrome, SarakCustomizationPanel } from '@sarak/lib-ui-core';

<SarakUIProvider customThemes={TEMAS} initialTheme={TEMAS[0].id}>
  <SarakAppChrome brand={{ name: 'Meu Sistema' }} navItems={NAV} onNavigate={navegar}>
    <MinhaRota />
  </SarakAppChrome>
</SarakUIProvider>
```

**(b) Base como HOST (módulos-plugin)** — a base assume navegação e roteamento a partir dos módulos
registrados. Só faz sentido quando o sistema é **um** app hospedando vários módulos:

```tsx
import { SarakUIProvider, SarakShell, registerSarakModule, sarakRegisterLocalComponent } from '@sarak/lib-ui-core';
import { MeuModuloDeNegocio } from './modulos/MeuModulo';

sarakRegisterLocalComponent('meu-modulo', MeuModuloDeNegocio);
registerSarakModule({ id: 'meu-modulo', label: 'Meu Módulo', icon: 'Box' });

<SarakUIProvider>
  <SarakShell />
</SarakUIProvider>
```

- `registerSarakModule({ id, label, icon, category?, priority? })` registra o módulo — a base gera
  navegação e roteamento sozinha. `sarakRegisterLocalComponent(id, Component)` liga o React ao `id`
  (alternativa: `component` direto no objeto de registro). Use um guard `safeRegister` contra
  `undefined` — é o que o `init` já gera.
- A biblioteca não converte manifestos JSON em telas; os módulos são componentes React. Nunca oriente o consumidor a "programar em JSON".
- O importador **pode criar o que precisar** — módulo, componente, tela. A única regra é a de tokens,
  logo abaixo.

**Contrato de tokens público (o que torna o código DO IMPORTADOR temável):** um componente próprio só
responde à troca de tema se estilizar por `var(--sarak-*)` — ex.: `background: var(--sarak-card-bg)`,
`color: var(--sarak-title-color)`, `gap: var(--sarak-layout-gap-md)`. Valor cru (`#3b82f6`, `16px`)
funciona hoje e fica **fora da central para sempre**. A lista real de CSS Variables está no
`catalog.json` → `tokens.cssVars`; nome fora dela não existe e não pinta nada.

**Temas em JSON (sem backend):** um tema é `{ id, name, description, design }`, com `design` = mapa
`tokenId → valor`. Passe via `customThemes`. **Derive de um tema de referência, não monte do zero:**
montar com um punhado de chaves de cor produz o sintoma clássico "troquei o tema e a fonte continuou
igual" (eixos omitidos não mudam). A derivação é **uma chamada**, não uma cópia de campo:

```tsx
import { sarakDeriveThemeFromReference } from '@sarak/lib-ui-core';

const MEU_TEMA = sarakDeriveThemeFromReference('minimalist-airy', {
  id: 'minha-marca', name: 'Minha Marca',
  design: { primaryColor: '#2563eb', accentColor: '#2563eb' },
});
```

Ela devolve o tema **completo** — `design` e `contraparte` — e aplica a sua customização nos dois modos.
Espalhar `{ ...ref.design, … }` perde a contraparte; `{ ...ref, design: { ...ref.design, … } }` a mantém,
mas uma customização de cor de modo não chega ao modo oposto. Três controles, não confunda:

- **`activeThemeId`** — CONTROLADO: sempre vence e reaplica a cada mudança. Use quando o app decide.
- **`initialTheme`** — SEMENTE, não-controlado: só semeia o primeiro carregamento; o usuário troca
  depois sem ser forçado de volta. É a opção segura.
- Nenhum dos dois: cai em `options.theme.defaultTheme` ou no primeiro tema global.

A seleção do tema persiste em `localStorage` sozinha. Para sincronizar no backend **do
consumidor** (opcional): `options.persistence.onSave`/`onLoad` ou `onThemeChange`.

Para fechar o ciclo no backend, guarde o design aplicado e o id do tema juntos. `onSave` recebe
`(design, activeThemeId)`; `onLoad` pode devolver `{ design, activeThemeId }`. O formato antigo,
que devolve apenas o design, continua aceito. `null`/`undefined` em `onLoad` significa que ainda
nada foi salvo. O boot e a hidratação não chamam `onSave`; ao trocar `tenantId`, a biblioteca
carrega o estado daquele tenant sem remontar o Provider. `activeThemeId` passado como prop
controlada continua prevalecendo.

```tsx
<SarakUIProvider
  customThemes={temasSalvos}
  options={{
    persistence: {
      onSave: async (design, activeThemeId) =>
        salvarEstado({ design, activeThemeId }),
      onLoad: async () => buscarEstado(), // { design, activeThemeId? } | null
    },
    theme: {
      onDelete: async (id) => excluirTema(id),
    },
  }}
>
  <App />
</SarakUIProvider>
```

`customThemes` recebe a coleção nomeada carregada pelo consumidor. Para excluir um tema em
runtime, chame `useSarakUI().deleteTheme(id)`; a lib o remove da sessão e chama `options.theme.onDelete`
para o consumidor removê-lo também da fonte persistente.

**Tema × preferência — duas camadas.** O **tema** é do administrador e vale para o sistema inteiro; o painel
(`/design`) o edita — **proteja essa rota**: a lib não autentica ninguém. A **preferência** é de cada usuário
— modo, tamanho da fonte, barra no topo ou na lateral, navegação recolhida, idioma —, aplicada por cima do
tema e **nunca gravada nele**. O administrador escolhe no painel o que a barra oferece; o usuário usa. Ela
persiste por navegador (`localStorage`); para guardar por usuário no seu servidor, use
`options.preferences.onSave`/`onLoad`. Ler e escrever pela aplicação: `useSarakPreferences()`.

**Idioma:** a lib entrega a escolha, não o texto traduzido. Traduza as suas telas lendo **o idioma que
vale**, `useSarakUI().design.language` — nunca a preferência crua, que ignora o que o administrador
ofereceu e habilitou. Para a troca de
tema atravessar apps de **mesma origem**, use a mesma `options.persistence.storageKey` em todos
(`crossTabSync` é `true` por padrão).

**Validação por construção:** todo tema (arquivo, `localStorage` ou export do painel) é validado no
load contra o schema de tokens. Chave desconhecida ou valor de tipo errado → `console.warn` +
descartado, nunca CSS cru. Se um ajuste "não pegou", o console diz por quê. As chaves válidas estão
no `catalog.json` → `designTokens.ids`.

**Exportar um tema pela UI:** o `SarakCustomizationPanel` (a central) tem **"Exportar" → "Exportar JSON"**,
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
     os temas e a navegação** — registre-a e entregue-a no handoff (`GUIA-FRONTEND.md` §2).
   - **Porta do dev server** (default 5173).
2. **Instalação de Dependências + scaffolder oficial**
   - **Ação OBRIGATÓRIA antes de qualquer `npm install`: garanta um `package.json` na RAIZ do
     diretório-alvo.** Rode `npm init -y` se não existir (confira com `Test-Path package.json` /
     `ls package.json` antes). **Por quê:** sem `package.json` local, o `npm install github:...` sobe
     a árvore de diretórios e instala **lá**, em silêncio, poluindo um projeto alheio (achado real:
     289 pacotes num projeto não relacionado). Nunca pule, mesmo em diretório aparentemente vazio.
   - **Ação (RECOMENDADO — faixa semver por tag):**
     `npm install "github:Lib-Sarak/Sarak-Lib-UI-Core#semver:^1.0.0"`.
     O npm resolve a faixa contra as **tags** do repositório: a instalação pega a maior versão
     compatível, e depois `npm update @sarak/lib-ui-core` sobe sozinho para a próxima — **sem
     registry e sem mexer no `package.json`**. Só atravessa MAJOR quem editar a faixa à mão.
   - **Ação (SUPORTADO — sem faixa):** `npm install github:Lib-Sarak/Sarak-Lib-UI-Core` continua
     válido e **não é erro**; ele resolve o HEAD do momento e depois precisa do `sarak:update`
     (que fura pin de lockfile e cache) para andar. Quem já instalou assim **não precisa migrar**.
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

**Qual build o navegador está executando:** no DevTools, leia o atributo
`data-sarak-build-info` de um elemento da lib. Ele contém JSON com `libVersion`, `baseCommitShort` e
`builtAt`. Compare esses três campos com `node_modules/@sarak/lib-ui-core/dist/BUILD_INFO.json`.
Se forem iguais, o navegador executa o build instalado; se diferirem, o pré-bundle do bundler ainda
serve um build anterior. Siga o procedimento abaixo para invalidá-lo.

**Ao atualizar, leia as migrações ANTES de investigar quebra de tipo** — mudanças de contrato público
ficam com antes/depois em `sarak-ui/docs/migracoes.md` se você copiou o kit, ou em
`node_modules/@sarak/lib-ui-core/sarak-ui/docs/migracoes.md` no modo apontar.

**Desenvolvimento local (`file:`/`npm link`) — não incorporado ao `init`:** trocar a dependência por
`"@sarak/lib-ui-core": "file:../Sarak-Lib-UI-Core"` propaga mudanças sem reinstalar, na TEORIA.
**Trade-off:** NÃO reproduz o pacote publicado (aponta para o `dist/` local, sem passar pela allowlist
de `files`) — nunca use este modo para validar uma instalação real ou testar atualização.

### ⚠️ Rebuildou a lib e a tela não mudou — três camadas de cache

Há três caches entre o `dist/` reconstruído e a tela. Em consumo por `file:`, resolva cada um na
ordem abaixo; o selo `data-sarak-build-info` mostra o build que a página realmente executa.

**1. Store do gerenciador.** Com `pnpm`, `file:` é cópia para o store: rebuildar a lib não atualiza
a cópia instalada. Rode o comando a partir do pacote importador (o `package.json` que declara a lib):
```bash
pnpm install --force --filter <pacote-importador>
```
`npm` e `yarn` podem manter um link vivo para a fonte. Use `sarak-ui check` para saber se a
dependência instalada está `live`, `fresh` ou `stale`.

**2. Pré-bundle do bundler.** O Vite guarda dependências em `node_modules/.vite/deps/` e calcula
`?v=` a partir do lockfile, da configuração e dos caminhos das dependências — não do conteúdo. Um
rebuild de uma dependência local mantém esses valores; o pré-bundle pode continuar antigo.

**3. Cache HTTP do navegador.** O Vite serve o pré-bundle com `cache-control: max-age=31536000, immutable`.
Se o `?v=` não mudar, uma aba normal pode reutilizar o arquivo antigo por um ano. Uma
aba anônima começa sem esse cache e recebe a resposta atual; compare as duas depois de atualizar.

**Confira o selo em uma instância da lib e compare com o arquivo instalado:**
`node_modules/@sarak/lib-ui-core/dist/BUILD_INFO.json`. Se `data-sarak-build-info` divergir do
arquivo, a página ainda executa um pré-bundle ou uma resposta HTTP antiga. `sarak-ui check`
compara a instalação local; `BUILD_INFO.json` descreve o pacote instalado; o atributo mostra o
runtime da página.

O aviso `[sarak:check:cache]`, quando aparece, aponta referência antiga no pré-bundle Vite padrão.
Sua ausência não prova que o navegador descartou uma resposta HTTP `immutable`; confira o selo e compare
com uma aba anônima.

**Procedimento para `file:`, na ordem** (a ordem errada já produziu tela branca com
`504 Outdated Optimize Dep`):

1. Pare o servidor de desenvolvimento que executa o bundler.
2. Rode `sarak-ui check` no pacote que declara a lib. Se estiver `stale` e usar `pnpm`, rode
   `pnpm install --force --filter <pacote-importador>` para atualizar o store.
3. Apague `node_modules/.vite` no projeto que executa o Vite:
   ```bash
   rm -rf node_modules/.vite
   ```
   No PowerShell: `Remove-Item -Recurse -Force node_modules/.vite`.
4. Prove que a pasta sumiu: `Test-Path node_modules/.vite` deve responder `False` no PowerShell;
   em bash, `[ ! -d node_modules/.vite ]` deve retornar sucesso. Diferencie pasta ausente de arquivo
   em uso.
5. Suba o servidor Vite e leia `data-sarak-build-info` no DOM. Compare seu JSON com o
   `BUILD_INFO.json` instalado. Se a aba anônima mostrar o build novo e a normal não, limpe o cache
   HTTP da aba normal ou desabilite-o nas ferramentas do navegador.

Pular a prova da deleção pode manter a tela idêntica. Silêncio de `sarak-ui check` sobre cache não
confirma que todas as camadas estão atualizadas; o sinal automático cobre Vite com `.vite` padrão.

**Cada sinal responde a uma pergunta:**

| Pergunta | Quem responde |
|---|---|
| "A dependência local foi instalada?" | `sarak-ui check` |
| "Qual artefato está instalado?" | `dist/BUILD_INFO.json` |
| "Qual build a página executa?" | o atributo `data-sarak-build-info` |
| "A aba normal reteve uma resposta HTTP?" | compare com uma aba anônima após refazer o pré-bundle |

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
- `sarak-ui/` — **o kit de uso**: START-HERE, `GUIA-FRONTEND.md`, `catalog.json`, `docs/migracoes.md`, `templates/`, `VERSION`.
- `bin/sarak-ui.mjs` (`npx sarak-ui init`) — o scaffolder oficial; Node puro, idempotente.
- `docs/component-catalog.md` / `.json` — catálogo gerado, com o TIPO completo de cada prop.
- `docs/identidade-do-host.md` — título da aba, favicon e marca são sempre do importador.
- `docs/extensibilidade-de-layout.md` — os 2 níveis de imagem/animação: fundo global por tema e slots do cromo.
- `docs/temas-cromo-e-multidispositivo.md` — temas completos, cromo e contrato de responsividade.

**Fluxo:** esta skill conduz a entrevista e roda o `init`; o handoff é o `GUIA-FRONTEND.md`.

**Ambiente (lição de instalação real):** portas ocupadas por processos node antigos fazem você testar
código velho — libere-as antes de subir o dev.
