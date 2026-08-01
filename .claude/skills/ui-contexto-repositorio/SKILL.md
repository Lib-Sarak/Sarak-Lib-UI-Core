---
name: ui-contexto-repositorio
description: Orquestradora de onboarding e contexto. Use SEMPRE que iniciar uma nova conversa ou precisar se ambientar com as regras estruturais e limites da biblioteca Sarak-Lib-UI-Core.
---

# Skill: Entendimento de Contexto (Sarak-Lib-UI-Core)

> **Esta é a "Porta de Entrada" do repositório.** Ela diz **em que ordem ler** e **para onde ir**.
> Ela **não define regra nenhuma**: a regra mora nas specs, e quando esta skill divergir de uma
> spec, **a spec vence** — e a divergência é um defeito desta skill, a ser corrigido aqui.

> ⚠️ **O CÓDIGO É A FONTE DA VERDADE.** Onde qualquer documento contradiz o código, o **código
> vence**. Se você encontrar uma spec que descreve algo que não existe, isso não é uma descoberta
> a corrigir sozinho: **registre e pergunte.**

## Workflow de Ambientação (leitura obrigatória, nesta ordem)

O índice operacional desta base é o **kit do mantenedor**, `sarak-dev/`. Comece por ele:

| # | Leia | Por quê |
| --- | --- | --- |
| 0 | `sarak-dev/START-HERE.md` | O índice operacional e o **carimbo de estado** do repositório — números recontados a cada geração, nunca escritos à mão. |
| 1 | `specs/specs/00-regras-e-invariantes.md` | **O contrato único.** As 17 regras do módulo, cada uma com o gate que a cobra — ou com a admissão honesta de que **nenhum** gate a cobra (são 6 dessas). |
| 2 | `specs/arquitetura/01-forma-do-produto-e-modos-de-consumo.md` | O que a lib **é** hoje, e os dois modos de consumo. |
| 3 | `specs/arquitetura/00-mapa-do-modulo.md` | Onde cada coisa mora e o que pode importar o quê. |
| 4 | `sarak-dev/GUIA-MANUTENCAO.md` | O roteador de fluxos: qual é o passo a passo do que você vai mexer, e **qual spec é dona** daquilo. |
| 5 | `specs/specs/01-gates-e-baseline.md` | **Antes de rodar qualquer gate.** O `run_audit` **NÃO está em zero** — acusar regressão onde há dívida conhecida custa uma rodada inteira. |

Os **ADRs** (`specs/adr/`) respondem *por quê*. Leia-os quando a pergunta for "por que isto é
assim?" ou quando estiver prestes a propor reverter uma decisão — é o que evita propor de novo o
que já falhou. Eles são **imutáveis**: decisão errada não se edita, cria-se um ADR novo que a
substitui (protocolo em `specs/adr/README.md`).

Ordem geral da base: **`specs/arquitetura/` → `specs/adr/` → `specs/specs/`**. O mapa das
categorias está em `specs/INDEX.md`.

## As Bases e Regras Absolutas do Módulo

A **Sarak-Lib-UI-Core** não é um site; é um **Design System Vivo** guiado por dados exportáveis.
O enunciado completo, com o "por quê", o exemplo certo × errado e o gate de cada regra, está em
`specs/specs/00-regras-e-invariantes.md`. O resumo que você precisa carregar:

### 0. Regra Zero (Design as Data) — Configuração × Expansão *(R11)*
Antes de tocar em `src/`, responda: **a chave já existe no dicionário de tokens?**
- **Existe → Configuração.** Só dado: um valor num tema/preset. **Nenhum arquivo de `src/` é
  tocado.** É estritamente proibido alterar `.tsx` ou injetar CSS genérico para satisfazer um
  ajuste que o catálogo já cobre — isso cria uma segunda fonte da verdade que o Engine não governa.
- **Não existe → Expansão.** Paridade nas três fontes + hook + teste + catálogo.

⚠️ Erro clássico: partir para Expansão porque o token "não pareceu existir". Os ids são camelCase
e específicos (`btnBorderRadius`, não `buttonRadius`) — procure no catálogo antes.

### 1. Três camadas estritas *(R1)*
- `src/core/`: o cérebro (`SarakUIProvider`, Design Engine, Discovery, Shell, dicionário). Nenhuma UI.
- `src/components/atomic/`: os músculos. Componentes visuais burros, sem lógica de negócio.
- `src/features/`: a inteligência local (ex.: o painel do Design Engine).

`src/components/` **não** importa de `features/`. `src/core/` **não** importa de `features/`.
A dependência aponta sempre para dentro.

### 2. Zero hardcode *(R2)*
Nenhum `#hex` nem `px`/`rem`/`em` solto em `.tsx`, e nenhum Tailwind **estrutural**
(`p-4`, `gap-4`, `flex-col`, `grid-cols-N`) em `.tsx` de `atomic/`. Toda geometria vem do **Hook
Controlador** (`useStructuralStyles`, `useAtomicStyles`); todo valor vem de token.

### 3. Namespace e fallback *(R7)*
Toda CSS Variable consumida é **`--sarak-*`** ou **`--theme-*`**, **SEMPRE com fallback**:

```tsx
// ERRADO — namespace proibido, e sem fallback
style={{ color: 'var(--sx-color-primary-base)' }}
style={{ gap: 'var(--sarak-layout-gap-md)' }}

// CERTO
style={{ gap: 'var(--sarak-layout-gap-md, 16px)' }}
```

⚠️ **`--sx-*` é PROIBIDO** — nunca foi emitido por nenhuma fonte, logo é variável-fantasma por
definição: resolve para vazio, o espaçamento colapsa e o console fica limpo.

### 4. Tipagem inquebrável *(R3)*
Proibido `any`, `@ts-ignore` e `as any` em `src/`. Fronteira dinâmica real usa `unknown` +
type guard; valor conhecido usa **união própria**, não `unknown`.

### 5. Paridade — **TRÊS** fontes *(R4)*
Uma chave de design só é **real** se existir simultaneamente no **Schema**
(`src/core/Design/schema/*.ts` → `MASTER_DESIGN_MAP`), no **roteamento de persistência**
(`catalog/theme_table_mapping.json`) e no **catálogo** (`catalog/partitions/*.json`).

> ⚠️ **A antiga "6ª camada" (o Registry do motor de manifesto) MORREU** junto com o motor
> (`specs/adr/002-remocao-motor-manifesto.md`). Se você encontrar documento ou skill exigindo
> paridade com um **NATIVE_COMPONENTS** ou o **RegistryParity.test.tsx**, é ponteiro morto. O
> **alcance** hoje é cobrado por `npm run barrel:check` e `npm run catalog:check`.

### 6. Não transcrever fonte viva *(R17)*
Lista de tokens, componentes, props ou ícones **jamais** é copiada para dentro de markdown.
Aponte para `docs/component-catalog.json`, `sarak-ui/catalog.json`, `getAllDesignTokens()` ou
`getScaffold()`. Cópia estática é mentira com data marcada.

## O que NÃO existe mais (não procure, não reintroduza)

| Removido | ADR |
| --- | --- |
| O renderizador de páginas por manifesto (**src/core/Manifest/**, **NATIVE_COMPONENTS**, pipes, dispatcher) | `specs/adr/002-remocao-motor-manifesto.md` |
| O backend próprio (**backend/**, drivers de banco, endpoints de tema/branding) — tema é JSON no código do consumidor | `specs/adr/003-remocao-backend-proprio.md` |
| O Design Agent (agente LLM embarcado, **options.designAgent**) | `specs/adr/004-remocao-design-agent.md` |

## Mapeamento de Skills Específicas
Ferramentas em `.agents/skills/` (`.claude/skills` é um **symlink** para cá — não há cópia a espelhar):

- **`ui-novo-componente`**: adicionar token ou componente atômico (paridade nas 3 fontes + barril).
- **`ui-refatorar-componente`**: deletar ou alterar a assinatura de um token/componente (paridade inversa).
- **`ui-auditoria-modulo`**: rodar o verificador estático geral. **Leia o baseline antes.**
- **`ui-arquitetura-design`**: a lei do pipeline `Schema → Master Map → CSS Variables`.
- **`ui-criar-tema` / `ui-criar-preset`**: manipular temas e presets (só dado — é Configuração).
- **`ui-integra-consumidor`**: instalar a lib **num sistema consumidor**. Não é para uso aqui
  dentro; ela é a fonte espelhada para o kit `sarak-ui/`.

## Antes de declarar qualquer tarefa concluída
```bash
npm run audit           # compare com o BASELINE, NUNCA com zero
npx vitest run          # a suíte INTEIRA — rodar pasta a dedo esconde quebra de terceiro
```

Ao terminar de ler este documento e os itens 0–5 acima, informe ao usuário que você está
integrado às regras da Sarak UI Core e pronto para a tarefa.
