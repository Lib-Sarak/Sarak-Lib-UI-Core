---
tipo: "arquitetura"
titulo: "Forma do produto e modos de consumo"
dominio: "Arquitetura / Produto / Contrato do importador"
status: "🟢 Vigente"
tags: ["arquitetura", "produto", "modos-de-consumo", "ui-kit", "cromo", "embarcado"]
relacionados: ["[[00-mapa-do-modulo]]", "[[02-design-engine]]", "[[03-superficie-publica]]", "[[04-contrato-de-tokens-e-paridade]]", "[[001-tres-arquiteturas]]", "[[005-modelo-modulos-plugin-e-apps-separados]]", "[[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]]"]
---

# 1. Propósito

Este documento responde a uma pergunta só: **o que a Sarak-Lib-UI-Core é hoje, e como um sistema a consome.** É o ponto de entrada da arquitetura — leia antes de qualquer outro documento desta pasta.

Ele não explica *por que* a lib chegou nesta forma; isso é `specs/adr/`, e cada virada tem seu registro. Também não explica o mecanismo do motor de tema ([[02-design-engine]]), a API dos componentes ([[03-superficie-publica]]) nem onde cada arquivo mora ([[00-mapa-do-modulo]]).

# 2. O que a lib é

**Uma base de front em React + TypeScript, sem backend, distribuída como `@sarak/lib-ui-core`.**

Ela é composta de **componentes atômicos + Provider + Design Engine** (`src/components/atomic/`, `src/core/Provider/`, `src/core/Design/`) — os blocos visuais e a central que os pinta — e de **um cromo** (`src/components/Layout/`, o `SarakAppChrome`): a casca apresentacional que cada aplicação monta. **A lib não é host:** não registra módulos, não descobre módulos e não é dona das rotas do importador.

**Nenhuma regra de negócio vive aqui.** A lib se ocupa de renderização tipada, resiliência visual (zero hardcode) e aplicação determinística de design tokens.

## 2.1 O que foi REMOVIDO

Quatro capacidades saíram da biblioteca. Se você encontrar documentação, skill ou comentário que as descreva como vigentes, **o documento está errado e o código está certo**:

| Removido | Registro |
| --- | --- |
| O renderizador de páginas por manifesto (`src/core/Manifest/`) e toda a superfície de autoria em JSON | [[002-remocao-motor-manifesto]] |
| O backend próprio (`backend/`, drivers de banco, endpoints de tema e branding) | [[003-remocao-backend-proprio]] |
| O Design Agent (agente LLM embarcado de geração de temas) | [[004-remocao-design-agent]] |
| O modo host: `SarakShell`, a descoberta e o registro de módulos (`registerSarakModule`…) e o roteador próprio (`useSarakRouter`) | [[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]] |

# 3. A fronteira LAYOUT × LOOK

Esta é a frase que mais evita mal-entendido nesta base, e vale reler:

> **O importador POSSUI o layout. A base POSSUI o look.**

**O importador possui o layout.** Ele escreve seus próprios apps e rotas, em React livre. Não há obrigação de programar em JSON, não há gramática a aprender, não há estrutura de tela imposta. Faltou um componente? Escreva o seu.

**A base possui o look.** O Design Engine é a **central**: trocar o tema nela repinta o sistema inteiro. Mas o alcance dessa repintura tem uma condição precisa, e é aqui que quase todo mal-entendido nasce:

- **Qualquer marcação que consuma os tokens públicos responde à troca de tema** — os componentes da lib, e igualmente um componente escrito pelo próprio importador que use `var(--sarak-*)`.
- **Marcação com estilo hardcoded fora do contrato de tokens NÃO é tematizada.** Um `background: #1e293b` escrito à mão não muda quando o tema muda. Não é bug da central; é marcação que optou por sair do contrato.

O corolário prático é o *escape hatch*: quando falta um componente, escreva React próprio **usando os tokens**. A tela continua sob a central. O contrato de tokens está em [[04-contrato-de-tokens-e-paridade]].

# 4. O modo de consumo: ui-kit + central

Há **um** modo de consumo, e o consumidor é dono do layout e das rotas. `SarakUIProvider`, tokens e Design Engine são a central; o cromo e os componentes são o kit. A decisão está em [[018-um-cromo-so-e-o-consumidor-e-dono-das-rotas]], que fecha o que o [[005-modelo-modulos-plugin-e-apps-separados]] deixou em dois modos.

## 4.1 O consumidor é dono do layout

O consumidor tem os próprios apps e a lib entra como caixa de componentes + tokens + Design Engine. **Não há registro e não há Discovery.**

O cromo é **por-app**: cada aplicativo renderiza o seu `SarakAppChrome` (`src/components/Layout/SarakAppChrome.tsx`) — 100% apresentacional, topbar/sidebar + `children`, temável por token. A navegação é **dado** (`navItems`), e a seleção sai por callback (`onNavigate`): o host decide *como* navegar, seja redirect de página inteira, router local ou qualquer outra coisa. O item de navegação é um **link de verdade** ([[05-cromo-e-slots]] §2.1.2).

```tsx
import { SarakUIProvider, SarakAppChrome } from '@sarak/lib-ui-core';

const NAV_ITEMS = [
    { id: 'inicio', label: 'Início', href: '/' },
    { id: 'relatorios', label: 'Relatórios', href: '/reports' },
];

ReactDOM.createRoot(document.getElementById('root')!).render(
    <SarakUIProvider>
        <SarakAppChrome brand={{ name: 'Minha Aplicação' }} navItems={NAV_ITEMS} onNavigate={navegar}>
            {telaDaRota}
        </SarakAppChrome>
    </SarakUIProvider>,
);
```

`npx sarak-ui init` gera exatamente isto: `src/main.tsx` com o Provider e `src/App.tsx` com o cromo, `navItems` e um roteamento local de exemplo.

**Como a central alcança todas as telas**, em duas camadas — e a maior delas não é estado de runtime:

1. **As definições de tema viajam como código compartilhado.** O catálogo de temas mora num pacote que todos os apps importam, então os temas disponíveis e o padrão são idênticos em todo o sistema **por construção**, com zero sincronização.
2. **A seleção ativa do usuário vive em `localStorage`**, com `persistence.crossTabSync` (`src/core/Provider/types.ts:165`, default ligado) reagindo ao evento `storage` para revalidar e reaplicar quando outro app grava a mesma chave.

> **Limite físico, não escolha da lib:** `localStorage` é **por origem**. No deploy único isso funciona. Em desenvolvimento, com cada app num servidor de porta própria, são origens diferentes e a troca em runtime não cruza — o tema *default* continua consistente, porque vem do código. Servir os próprios apps sob uma origem é ação normal de consumidor.

## 4.2 Quando a rota é do consumidor, e sempre é

> **Quem decide qual tela aparece? O seu código.** Router, redirect, deploy separado, o que for. A lib nunca pergunta, não escreve na URL e não resolve módulo: pede `navItems` e devolve `onNavigate`.

Encaixar um sistema de apps separados num modelo em que a lib decide significaria reescrever a arquitetura do importador para acomodar a biblioteca, que é exatamente o inverso do que uma biblioteca deve pedir — e é por isso que o modo host saiu.

# 5. O eixo ortogonal: `mode: 'app' | 'embedded'`

**Isto não é outro modo de consumo.** É outro eixo, e a pergunta que ele responde é diferente: **a lib é dona da página, ou é uma cidadã dela?** O modo da §4 pode rodar em qualquer um dos dois modos de página.

O valor é declarado em `options.mode` e resolvido por `resolveSarakUIMode` (`src/core/Provider/scope.ts:42`), com default `'app'`.

| | **App** (`'app'`, default) | **Embarcado** (`'embedded'`) |
| --- | --- | --- |
| Papel do Provider | Dono da página | Cidadão da página |
| CSS | `dist/sarak.css` injetado automaticamente no `<head>` na importação do módulo | `dist/sarak-scoped.css`, importado pelo consumidor; preflight e utilities confinados a `.sarak-scope` |
| Onde os tokens são ancorados | `document.documentElement` + `body` | No container da ilha |
| `document.title` / favicon | Escritos **só** se o consumidor fornecer valor | **Nunca** tocados — nem com valor fornecido |
| Fontes globais | Injetadas no `<head>` | Não injetadas (a ilha herda a tipografia do host); opt-in por `embedded.injectGlobalFonts` |
| Overlays de página inteira | Renderizados sobre o viewport | Não renderizados (cobririam o front do host) |
| Escopo do `SovereignThemeInjector` | Ancorado em `body` | Ancorado em `.sarak-scope` |
| Toasts / overlays em portal | Portal em `document.body` | Portal em `document.body` **+ a classe de escopo**, para continuarem estilizados fora da árvore da ilha |

A classe de escopo é `SARAK_SCOPE_CLASS` (`scope.ts:19`), e ela precisa casar com o que o build gera.

**Anti-flash recomendado no modo embarcado:** marque o documento com `<html data-sarak-ui-mode="embedded">` (`SARAK_MODE_ATTRIBUTE`, `scope.ts:33`). A injeção automática de CSS roda na **importação do módulo**, antes de qualquer Provider montar e portanto antes de a lib saber o modo; com a marcação, ela nem acontece. Sem a marcação, o Provider desfaz o CSS global ao montar — mas pode haver um flash do host re-estilizado antes disso.

> **Limite declarado, e é dos que importam:** **N ilhas sob 1 Provider embarcado é suportado.** **N Providers embarcados na mesma página NÃO é** — disputariam a mesma classe de escopo e o mesmo stylesheet.

# 6. Consumo por outras linguagens e por agentes

**Não há endpoint.** A lib não sobe servidor e não expõe API de rede ([[003-remocao-backend-proprio]]).

Quem precisa dos dados do Design System — um script, um backend em qualquer linguagem, um agente — lê o **catálogo estático publicado**: `docs/component-catalog.json`, gerado do código e conferido por gate no build. O consumidor tem ainda `sarak-ui/catalog.json`, a variante que viaja no kit de uso.

**Nunca leia esses dados de uma cópia em markdown.** Lista de componente, de prop, de token ou de ícone não é transcrita em prosa nesta base justamente para não envelhecer — o artefato gerado é a fonte.
