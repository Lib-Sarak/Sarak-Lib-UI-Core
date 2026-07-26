---
name: ui-integra-consumidor
description: Instala e acopla a base Sarak (@sarak/lib-ui-core) num sistema consumidor React — npm install, peerDependencies, SarakUIProvider+SarakShell, registro de módulos de negócio (módulos-plugin). Use quando o usuário pedir para baixar/instalar/importar a biblioteca Sarak UI (ex.: "baixe a biblioteca Sarak-UI <link>, ela será responsável pelo Shell e tema do sistema"), iniciar a infraestrutura do front-end com a Lib, ou plugar a base num projeto novo. NÃO acione proativamente.
---

# Skill: Integrar Consumidor (Infraestrutura)

Skill responsável pela instalação plug-and-play da base Sarak (Sarak-Lib-UI-Core) no projeto
cliente. **Desde a Spec 21, a instalação é feita pelo scaffolder oficial** (`npx @sarak/lib-ui-core init`)
— esta skill conduz a entrevista, roda o comando, valida a saída e faz o handoff. Ela **nunca escreve
arquivo de infraestrutura à mão** (isso é o que causava a adivinhação de infra que gerou os 2
relatórios de erro de instalação real que motivaram a Spec 21).

## Modelo de consumo: módulos-plugin (Spec 43/45)

O modelo OFICIAL de consumo da `@sarak/lib-ui-core` é por **módulos-plugin** — o mesmo padrão que o
`Sarak-MyService` usa em produção (o único consumidor real da lib). A lib é uma **BASE de front com
Shell + Design Engine central**; o importador **registra seus módulos de negócio** (componentes React
comuns) na base — nada de manifesto/JSON para montar a interface:

```tsx
import { SarakUIProvider, SarakShell, registerSarakModule, registerLocalComponent } from '@sarak/lib-ui-core';
import { MeuModuloDeNegocio } from './modulos/MeuModulo';

registerLocalComponent('meu-modulo', MeuModuloDeNegocio);
registerSarakModule({ id: 'meu-modulo', label: 'Meu Módulo', icon: 'Box' });

function App() {
  return (
    <SarakUIProvider>
      <SarakShell />
    </SarakUIProvider>
  );
}
```

- `registerSarakModule({ id, label, icon, category?, priority? })` registra o módulo — a base gera a navegação (Sidebar/Topbar/Dock, conforme o tema) e o roteamento automaticamente, sem rota declarada à mão.
- `registerLocalComponent(id, Component)` liga um componente React ao `id` do módulo (alternativa: passar `component` direto no objeto de `registerSarakModule`). Use o padrão `safeRegister`/`registerSarakModuleSafe` do `Sarak-MyService` (`src/main.tsx`) para blindar contra `undefined`/estrutura inválida — é exatamente o que o `init` já gera em `src/main.tsx` (Etapa 2).
- `SarakShell`, sob `SarakUIProvider`, é quem renderiza a navegação e o módulo ativo — o modelo de consumo é 100% React (módulos-plugin); o antigo motor de renderização por manifesto (`SarakManifestRenderer`) foi removido (Spec 46).
- O importador **pode criar o que precisar** — não há obrigação de "programar em JSON" nem de importar só componentes atômicos prontos.

**Contrato de tokens público (escape hatch — para o módulo/componente do IMPORTADOR responder à central):** um componente próprio só é tematizado quando a central troca de tema se ele usar os tokens públicos `var(--sarak-*)` em vez de valor hardcoded — ex.: `background: var(--sarak-card-bg)`, `color: var(--sarak-title-color)`, `gap: var(--sarak-layout-gap-md)`. Marcação com cor/espaçamento cru (`#3b82f6`, `16px`) nunca responde a uma troca de tema — é a mesma regra "Zero Hardcode" que os átomos da própria lib seguem (`specs/specs/03-padrao-e-taxonomia-biblioteca-atomica.md`). A lista completa das CSS Variables `--sarak-*` reais (as únicas que a central efetivamente emite) está em `docs/component-catalog.md`, seção "CSS Variables públicas" — nomes fora dela não existem e não pintam nada.

**Temas em JSON (Spec 44 — o Design Engine é a central de layout, sem backend próprio):** o dev cria temas próprios como objetos `{ id, name, design: {...} }` (mesmo formato dos temas embutidos, `ThemePreset`) e passa via `customThemes` ao `SarakUIProvider`. Três props controlam qual tema está ativo — não confundir:
- **`activeThemeId`** — CONTROLADO: sempre que setado, é a verdade absoluta e reaplica a cada mudança de valor. Uso típico: o próprio app decide o tema (ex.: por tenant/config), sem depender de escolha do usuário final.
- **`initialTheme`** — SEMENTE, não-controlado: só semeia o estado no primeiro carregamento, nunca reaplica sozinho. É a opção mais segura para "quero só começar neste tema" — o usuário final pode trocar depois (via `CustomizationPanel`) sem o Provider forçar de volta.
- Sem nenhum dos dois: cai no `options.theme.defaultTheme` (um dos temas embutidos) ou no primeiro tema global.

A seleção do usuário final (qual tema está ativo agora) persiste sozinha em `localStorage` — nenhum backend necessário. Para sincronizar no backend PRÓPRIO do consumidor (opcional), use `options.persistence.onSave`/`onLoad` (payload completo) ou o callback `onThemeChange` (notificado a cada commit do design). Branding (nome do sistema, logo) segue o mesmo padrão: `options.branding.initial`/`options.branding.onChange` — não existe mais `options.endpoints.branding` (era um fetch para um servidor da própria lib; removido).

⚠️ **Se for usar `activeThemeId`:** prefira uma referência ESTÁVEL de `customThemes` (constante de módulo ou `useMemo`) — não é mais estritamente necessário (o loop de render infinito achado na Spec 43 §5.1 foi corrigido na Spec 44, com um guard em `useDesignSync` que não depende mais da estabilidade da referência), mas seguir estável evita reaplicações de tema redundantes a cada render.

**Validação/segurança (Spec 44 §2.3):** todo tema — venha de `customThemes`, `localStorage` ou de um JSON de arquivo — é validado no load contra o schema de tokens (`SarakDesignTokens`, gerado em `src/core/Provider/generated/design-token-ids.ts` a partir da SSOT `MASTER_DESIGN_MAP`): só chaves conhecidas, valor com o TIPO certo por token (cor precisa parecer cor; enum precisa estar na lista de opções; número é clampado nos limites do token). Chave/valor fora do contrato → `console.warn` + descartado, nunca vira CSS/HTML cru. Isso torna qualquer fonte de tema (arquivo do dev, localStorage, export do CustomizationPanel) segura por construção — a segurança está no tipo-check, não em onde o tema está guardado. Consulte `src/core/Provider/generated/design-token-ids.ts` (o arquivo gerado, sempre em dia) para a lista completa de chaves e tipos válidos.

**Exportar um tema pela UI:** o `CustomizationPanel` (módulo nativo `mx-customization`, sempre registrado pela base) tem um botão **"Exportar" → "Exportar JSON"** que baixa o tema ajustado no formato acima — cole o conteúdo baixado num arquivo do seu repositório e adicione ao array `customThemes`. Não existe mais "salvar tema no banco": a central não tem servidor, e "salvar" É exportar.

## Quando usar
- Quando o usuário informar que está num repositório que consumirá a `Sarak-Lib-UI-Core` e precisa acoplar a base (Shell + Design Engine) na raiz do projeto.
- Quando for necessário registrar os primeiros módulos de negócio ou plugar autenticação/roteamento do host.
- Use APENAS quando o usuário solicitar explicitamente a instalação/integração inicial. NÃO acione proativamente.

## Golden Path (leia antes de tudo)
- **A instalação é MONOLÍTICA:** um único `package.json` na raiz do projeto do consumidor. **NÃO use
  NPM Workspaces** — eles quebram binários locais no Windows (achado real de instalação que motivou a
  Spec 21). Se o consumidor já é um monorepo com workspaces, rode o `init` dentro do pacote específico
  que vai hospedar a Sarak — nunca na raiz do monorepo.
- **Starter padrão (Spec 45):** um front **Vite puro** (`SarakUIProvider`+`SarakShell`+um módulo de
  exemplo já registrado), **sem backend nenhum** — o Design Engine persiste tema em `localStorage`
  (Spec 44). Não há mais escolha de stack/servidor/storage no `init`: o backend de negócio (se
  existir) é inteiramente do consumidor, numa porta/processo separado, e a Sarak não sabe da sua
  existência (a lib nunca chama rede sozinha — Spec 08 §6, Regra 5).
- O `init` é **idempotente**: nunca sobrescreve arquivo existente sem `--force`; reporta o que pulou.

## Workflow

1. **Entrevista de Instalação (HITL) — faça estas perguntas ANTES de rodar qualquer comando**
   - **PRIMEIRA PERGUNTA — Modo de renderização:** *"O módulo vai renderizar um sistema NOVO (a base nasce dona da página — Modo App) ou vai renderizar SOBRE um frontend que JÁ EXISTE (Modo Embarcado — uma ilha React dentro do front atual)?"*
     - **Modo App:** o `init` (Etapa 2) monta o projeto inteiro (front puro, sem backend). É o default: `options` sem `mode`.
     - **Modo Embarcado:** suportado (Spec 24), mas o `init` **não** sabe montar a ilha dentro de um host que já existe — ele só garante os artefatos comuns (`main.tsx`, módulo de exemplo, skills). A montagem em si é manual (Etapa 4 abaixo). Registre a escolha do usuário: ela muda as Etapas 2, 3 e 4.
     - **Se Embarcado, pergunte também:** *"A adoção começa por quais rotas/regiões do front atual?"* — a migração é incremental: 1 módulo → mais módulos → Shell completo → (opcional) virar Modo App. Registre o alvo inicial.
   - **Porta do dev server** (default 5173).
2. **Instalação de Dependências + scaffolder oficial**
   - **Ação OBRIGATÓRIA antes de qualquer `npm install`: garanta um `package.json` na RAIZ do diretório-alvo.** Rode `npm init -y` se ele não existir (confira com `Test-Path package.json` / `ls package.json` primeiro). **Por quê:** sem `package.json` local, `npm install github:...` sobe a árvore de diretórios até achar um `package.json` ancestral e instala LÁ — silenciosamente, sem erro nem aviso, poluindo um projeto alheio (achado real de um teste de instalação: instalou 289 pacotes no `package.json` de um projeto não relacionado do usuário). Nunca pule este passo, mesmo em diretório aparentemente vazio.
   - **Ação:** `npm install @sarak/lib-ui-core` (github install: `npm install github:Lib-Sarak/Sarak-Lib-UI-Core`) — SÓ depois de confirmar o `package.json` do passo anterior.
   - **Ação:** rode o scaffolder com as respostas da Etapa 1, via flags (não repita a entrevista por prompt interativo — passe tudo resolvido):
     ```bash
     npx sarak-ui init --mode app --frontend-port 5173
     # antes de publicado no registro/sem link simbólico do bin, equivalente:
     node node_modules/@sarak/lib-ui-core/bin/sarak-ui.mjs init --mode app --frontend-port 5173
     ```
     Flags: `--mode` (`app`|`embedded`), `--frontend-port`, `--force` (sobrescreve arquivo existente), `--yes` (aceita todos os defaults do starter padrão sem perguntar nada — útil só quando a Etapa 1 já foi 100% default), `--help`/`-h` (lista todas as flags com defaults e exemplos, sai com `exit 0`). **Você (agente) roda num terminal sem TTY** — sempre passe `--yes` OU todas as flags (`--mode`/`--frontend-port`); sem isso o `init` falha alto com `exit 1` e mensagem instrutiva (nunca mais um `exit 0` mudo sem escrever nada).
   - **O que o `init` garante sozinho** (Spec 21/45 — não repita nenhum destes passos à mão):
     - **TODAS as peerDependencies gravadas** no `package.json` do consumidor (nunca confie no auto-install do npm 7+, que instala em `node_modules` mas não registra — irreproduzível em `npm ci`).
     - `typescript` travado em `^5`.
     - `vite.config.ts` (sem proxy — não há backend), `tsconfig.json`, `index.html`, `src/main.tsx` (`SarakUIProvider`+`SarakShell`+um módulo de exemplo registrado via `registerSarakModule`/`registerLocalComponent`, no padrão `Sarak-MyService`) e `src/modules/ExampleModule.tsx` (componente React de exemplo — apague e crie os seus).
   - **Ação:** `npm install` (o `init` só escreve `package.json`; quem baixa os pacotes é o npm).
3. **Validação**
   - Confira, nesta ordem: `npm run build` verde (`tsc --noEmit && vite build`); `npm run dev` sobe o front; a tela inicial renderiza o módulo de exemplo dentro do `SarakShell`, tematizado; o Design Engine está acessível (módulo nativo "Design Engine"/`mx-customization`, sempre registrado pela base).
   - Se `npm run build`/`npm run dev` falhar por dependência ausente, confira se a Etapa 2 rodou `npm install` DEPOIS do `init` (o scaffolder só grava `package.json`, não baixa pacote nenhum).
4. **Montagem da Ilha (SÓ no Modo Embarcado — o `init` não automatiza isto)**
   - **Ação (CSS escopado):** importe a variante escopada UMA vez, no entry point do host:
     ```ts
     import '@sarak/lib-ui-core/dist/sarak-scoped.css';
     ```
     Ela é idêntica ao stylesheet normal, porém com preflight e utilities confinados ao seletor `.sarak-scope`. **Nunca** importe `dist/sarak.css` num consumidor embarcado: é justamente o reset global que repinta os `h1`/`button`/`input` do host.
   - **Ação (marcação anti-flash, recomendada):** adicione `data-sarak-ui-mode="embedded"` no `<html>` do host (`index.html`, `app/layout.tsx`, template do servidor):
     ```html
     <html data-sarak-ui-mode="embedded">
     ```
     A injeção automática de CSS roda na IMPORTAÇÃO do módulo, antes de qualquer Provider montar. Com a marcação, ela nem acontece. Sem ela o Provider ainda remove o CSS global ao montar (e avisa no console em dev), mas pode haver um flash do host re-estilizado no meio do caminho.
   - **Ação (Provider + módulos):** monte a ilha no ponto do front existente onde ela deve aparecer — registre os módulos que a ilha vai expor e monte `SarakUIProvider`+`SarakShell` (ou, para uma ilha de UM módulo só, sem chrome de navegação, monte o componente do módulo direto sob o Provider):
     ```tsx
     import { SarakUIProvider, SarakShell, registerSarakModule, registerLocalComponent } from '@sarak/lib-ui-core';
     import { MeuModulo } from './modules/MeuModulo';

     registerLocalComponent('meu-modulo', MeuModulo);
     registerSarakModule({ id: 'meu-modulo', label: 'Meu Módulo', icon: 'Box' });

     <SarakUIProvider options={{ mode: 'embedded' }}>
         <SarakShell />
     </SarakUIProvider>
     ```
     O Provider renderiza um `<div class="sarak-scope">` ao redor dos filhos — é ele que ancora o CSS e recebe os design tokens.
   - **Múltiplas ilhas:** use **N módulos sob 1 Provider embarcado** (o Shell resolve a navegação entre eles) OU monte o componente de um módulo isolado sem `SarakShell`, se não precisar de navegação. **N Providers na mesma página está FORA do suporte** — eles disputariam a mesma classe de escopo e o mesmo stylesheet.
   - **O que muda vs. Modo App (esperado, não é bug):** o título e o favicon da aba continuam sendo do host; as fontes do Google NÃO são injetadas (a ilha herda a tipografia do host — para forçar, use `options={{ mode: 'embedded', embedded: { injectGlobalFonts: true } }}`); `NoiseOverlay` e a mídia de fundo global do Design Engine não são renderizados (cobririam a página do host).
   - **Feedback continua zero-config:** toasts/modais/drawers vão para portal em `document.body` e recebem a classe de escopo automaticamente — nada a fazer.
   - **Verificação obrigatória antes de declarar pronto:** abra a página do host e confira, nesta ordem: (1) o front existente está visualmente IDÊNTICO ao de antes (títulos, botões, espaçamentos); (2) o título da aba não mudou; (3) dentro da ilha os componentes Sarak estão estilizados (não "crus"); (4) um toast/modal do módulo renderiza estilizado. Se (3) falhar, quase sempre é o import do CSS escopado faltando ou o `dist/sarak.css` importado por engano.
5. **Handoff (Ponto de Transição)**
   - **Ação:** Após a base estar acoplada e o módulo de exemplo renderizando com sucesso no `SarakShell`, informe ao usuário que a integração arquitetural terminou.
   - **Próximo Passo Obrigatório:** oriente o usuário (ou você mesmo no próximo turno) a **escrever seus próprios módulos de negócio** como componentes React comuns em `src/modules/`, usando os componentes atômicos (`SarakButton`, `SarakCardGrid`, etc. — catálogo em `docs/component-catalog.md`) e os tokens públicos (`var(--sarak-*)`) para serem temáveis pela central, registrando cada um via `registerSarakModule`/`registerLocalComponent` no `main.tsx`, no mesmo padrão do módulo de exemplo apagado.

## Como atualizar a biblioteca (Spec 39)

A `@sarak/lib-ui-core` é instalada por **URL git** (`github:Lib-Sarak/Sarak-Lib-UI-Core`), não por
registry — e a `version` do `package.json` fica parada em `3.0.0` por muitos commits seguidos (o
módulo ainda está em desenvolvimento; tags/semver ficam fora de escopo por decisão do mantenedor,
`specs/plan/39-importacao-e-atualizacao.md` §2.6). Isso tem uma consequência que **não é intuitiva**:

- **Um `npm install` comum NÃO atualiza a lib — e isso é o comportamento ESPERADO do npm, não um bug.**
  O `package-lock.json` grava o commit git exato que foi resolvido na primeira instalação
  (`resolved: "...#<sha>"`). Como a `version` não muda, o npm considera o lock satisfeito e nunca
  volta à rede — `npm install` reinstala fielmente o MESMO commit antigo, em silêncio, sem erro nem aviso.
  Achado real: um consumidor de teste (`Earendel/ERP`) ficou preso 4 commits atrás por semanas sem
  ninguém perceber.
- **Consequência prática:** "o consumidor está sempre na versão mais atual" só é alcançável como
  **atualização sob comando**, nunca automática. Automático de verdade exigiria registry + faixa
  semver (`^3.1.0`) — fora do escopo atual; ver §2.6 da Spec 39 para a porta documentada.

**O comando (gerado pelo `init` no `package.json` do consumidor):**
```bash
npm run sarak:update
```
Ele faz, nesta ordem: `npm uninstall @sarak/lib-ui-core` (remove o pin do lockfile) `&& npm cache
clean --force` (invalida o cache git do npm, que também serviria o commit velho) `&& npm install
<mesmo spec git usado na instalação>` (reinstala do zero, resolvendo o HEAD atual do branch). As
duas primeiras etapas são obrigatórias — pular qualquer uma delas reproduz o mesmo travamento.

**Como conferir se está atualizado (correção pós-Spec-39):**
```bash
npm run sarak:check
```
Ele lê o SHA REALMENTE instalado (`resolved` do `package-lock.json` do próprio consumidor — a fonte
exata) e compara contra o HEAD remoto do repositório (`git ls-remote`), imprimindo um veredito
("Atualizado" ou "Desatualizado — rode `npm run sarak:update`"). Não depende de rede além do
`git ls-remote`; falha com mensagem legível se não achar `package.json`/lock ou não alcançar o
repositório.

**Por que NÃO usar `dist/BUILD_INFO.json` para responder "estou atualizado?":** o arquivo existe
(grava `baseCommit`/`builtAt`/`libVersion` a cada `npm run build` da lib) mas **não pode** conter o
commit que o publica — o `dist/` (incluindo o próprio `BUILD_INFO.json`) é commitado DEPOIS de
gerado, e o hash de um commit depende do seu conteúdo; gravar dentro dele o próprio hash é uma
auto-referência impossível. Por isso o campo se chama `baseCommit` (o commit-BASE do build, sempre
um passo atrás do commit real) e nunca `commit`. Use `BUILD_INFO` só para saber `builtAt`/`libVersion`;
para "estou atualizado?", `npm run sarak:check` (ou o `resolved` do lock, na unha) é a única fonte
confiável.

**Modo de desenvolvimento local (`file:`/`npm link`) — avaliado, não incorporado ao `init`:** para
quem desenvolve a lib e o consumidor ao mesmo tempo, trocar a dependência por
`"@sarak/lib-ui-core": "file:../Sarak-Lib-UI-Core"` (caminho relativo ao repo da lib clonado ao lado)
propaga mudanças sem reinstalar a cada teste — é o que o `Sarak-MyService` já faz. `npm link` tem o
mesmo efeito. **Trade-off a ter em mente:** isso NÃO reproduz o pacote publicado (aponta para o
`dist/` local, sem passar pelo `npm pack`/`files` allowlist) — nunca use este modo para validar uma
instalação real ou testar o fluxo de atualização acima; é estritamente uma conveniência de
desenvolvimento simultâneo. Volte para o spec git antes de qualquer teste de instalação.

**Tamanho do bundle — o que resolve e o que NÃO resolve (Spec 41, medido):** quando o `dist/` do
consumidor parecer grande, **não** vá mexer em `manualChunks`: ele não reduz um byte, só decide em
qual arquivo cada byte cai — e uma regra ampla demais ainda FUNDE de volta os chunks lazy que a lib
já divide. Três achados de medição, para não repetir a investigação:
- **Acesso dinâmico a barril de ícone é o vilão clássico.** `Icons[nomeEmRuntime]` impede o
  tree-shaking e segura a biblioteca inteira. Na lib isso valia 789 KB de `lucide-react` no chunk de
  boot; com o mapa curado do `SarakIcon` caiu para 56 KB. **No SEU código, use `<SarakIcon name="..." />`**
  com um nome do catálogo (`docs/component-catalog.md`, seção "Ícones") em vez de importar o barril.
- **Peso de verdade fica atrás de `React.lazy` + `import()`.** É o que mantém echarts/pdfjs/prism/
  reactflow (~2,7 MB só de gráfico) fora do boot: viram chunk sob demanda. Se você criar um
  componente pesado próprio, faça o mesmo.
- **`export * from '@sarak/lib-ui-core'` no seu barril NÃO custa nada.** Medido byte a byte contra a
  alternativa (reexportar só o que se usa): saída idêntica, mesmos chunks. O Rollup resolve o grafo
  igual nos dois casos. A "porta única" de um monorepo pode ser um `export *` tranquilo.

## Regras (SRP - Responsabilidade Única)
- **NÃO escreva arquivo de infraestrutura à mão** (`vite.config.ts`, `package.json` de scripts/deps, etc.) — isso é o que o `init` (Spec 21/45) existe para eliminar. A única saída manual permitida é a Etapa 4 (montagem da ilha embarcada), porque o scaffolder pressupõe um host que ainda não existe.
- **NÃO** ensine ou tente montar telas via manifesto/JSON nesta skill — o foco aqui é DevOps/Infraestrutura e o registro de módulos React (`registerSarakModule`/`registerLocalComponent`). O motor de manifesto foi removido (Spec 46); o modelo de consumo é 100% React.
- **SEMPRE** garanta que cada módulo de negócio seja registrado (`registerSarakModule`+`registerLocalComponent`) e monte sob `SarakShell` — nunca oriente o consumidor a renderizar telas soltas fora da base (perderiam Shell/tema/navegação).

## Referências
**Artefatos do pacote (`node_modules/@sarak/lib-ui-core/`):**
- `bin/sarak-ui.mjs` (`npx sarak-ui init`) — o scaffolder oficial (Spec 21/45); gera o starter padrão inteiro, Node puro, idempotente.
- `docs/component-catalog.md` / `.json` — catálogo GERADO de componentes/props/CSS Variables públicas (fonte da verdade dos tokens e do que existe).
- `docs/migracoes.md` — breaking changes do contrato público, com "antes/depois". Consulte ao ATUALIZAR a lib num consumidor que já existe (`npm run sarak:update`), antes de investigar quebra de tipo.

**Skills (ordem do fluxo):**
- `ui-contexto-repositorio` — ambientação (se estiver trabalhando NA lib).
- **Esta skill** → conduz a entrevista e roda o `init`. É o handoff padrão único — não há skill de continuação.

**Specs da Biblioteca Core:**
- Spec 43 (`43-design-system-primeiro.md`) — o modelo módulos-plugin oficial: API pública, contrato de tokens.
- Spec 44 (`44-temas-json-e-persistencia.md`) — Design Engine central, temas em JSON, persistência sem backend.
- Spec 45 (`45-scaffolder-react-e-skills.md`) — este starter e esta skill.
- Spec 21 (`21-scaffolder-init.md`) — histórico do scaffolder original (stack/storage — superado pela Spec 45).
- Spec 08 (`08-consumo-externo-e-integracao.md`) — contrato de consumo: **§0 Modos de Consumo (App vs Embarcado)**, CSS automático, Provider obrigatório.
- Spec 04 (`04-estrutura-shell-discovery.md`) — Shell/Discovery: o modelo de módulos-plugin em si.
- `references/examples.md` — exemplos práticos de instalação (CSS automático, SSR).

**Ambiente (lições de instalação real):** portas ocupadas por processos node antigos causam teste contra código velho — libere-as antes de subir o dev.
