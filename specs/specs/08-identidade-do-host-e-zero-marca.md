---
tipo: "spec"
titulo: "Identidade do host e zero-marca — a lib nunca estampa a própria marca"
dominio: "Sarak-Lib-UI-Core / Identidade / Branding"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "zero-marca", "identidade", "branding", "soberania-host", "gate"]
relacionados: ["[[00-regras-e-invariantes]]", "[[01-gates-e-baseline]]", "[[006-zero-marca-soberania-host]]", "[[04-shell-e-discovery]]", "[[05-cromo-e-slots]]", "[[06-painel-de-customizacao-e-preview]]"]
---

# 1. A regra

> **A identidade da página é SEMPRE do importador.**

Zero-config significa, literalmente: a lib **não escreve** `document.title`, **não troca** o favicon e
**não exibe** marca nenhuma. O que está no `index.html` do consumidor permanece exatamente como ele
escreveu — antes e depois do React montar.

**É opt-in, não opt-out.** A lib só toca em identidade quando o consumidor **fornece o valor**. Não existe
`disableBranding`, não existe "sobrescreva o default" — porque **não existe default de identidade**.

A **decisão** está em [[006-zero-marca-soberania-host]]. Esta spec é o **como**: as portas, a precedência,
o gate e as lições. O contrato voltado ao consumidor está publicado em `docs/identidade-do-host.md`.

# 2. As duas portas e a precedência

```ts
const resolvedTitle = branding?.tabName || systemName;
```

`src/core/Provider/hooks/useSarakUIEffects.ts:31`.

| # | Porta | Como se passa | Alcance |
| --- | --- | --- | --- |
| 1 | **`options.branding.initial.tabName`** | `<SarakUIProvider options={{ branding: { initial: { tabName } } }}>` | **só o nome da aba** |
| 2 | **`config.systemName`** | `<SarakUIProvider config={{ systemName }}>` (ou pelo tema) | nome da aba **+** rótulo de marca no cromo (sidebar/topbar) |

**Precedência: do mais específico para o mais genérico** (`useSarakUIEffects.ts:28-31`). `tabName` é a porta
explícita "nome da aba" e vence; `systemName` é o nome do sistema, mais amplo.

**Sem nenhuma das duas: `resolvedTitle` é `undefined` e a lib não escreve — ponto.** O guard é literal
(`:56-58`): `if (resolvedTitle) { document.title = resolvedTitle; }`.

# 3. Fonte única do `document.title` — e por que isso é regra, não detalhe

O cabeçalho de `useSarakUIEffects.ts:13-17` registra o que existia antes:

> **DOIS efeitos independentes escreviam o título** — este, via `branding.tabName`, e o `DesignInjector`,
> via `systemName`. **O resultado dependia da ordem de execução dos effects.**

Dois setters para o mesmo recurso global produzem um bug de **ordem**: não-determinístico, dependente de
árvore de componentes, e que muda quando alguém move um Provider. O consumidor vê "o título às vezes está
certo".

> **Padrão a NÃO repetir:** *dois efeitos escrevendo o mesmo recurso global.* Todo recurso global do
> documento (`title`, favicon, atributos do `<html>`, `<link>`/`<style>` no `head`) precisa de **um** dono.
> Precedência resolve-se **por valor** — como na §2 —, nunca por ordem de montagem.

# 4. Favicon

`useSarakUIEffects.ts:60-67`: só age **se** `branding.logoBase64` existir. Aceita data URI ou URL. Procura
`link[rel~='icon']`; se não houver, **cria**.

Sem `logoBase64`, o `<link rel="icon">` do host fica **intocado**. Mesma lógica de guard do título: valor
ausente = nenhuma ação.

# 5. Comportamento por modo — no embarcado, NUNCA

```ts
useEffect(() => {
    if (typeof document === 'undefined' || isEmbedded) return;
    ...
```

`useSarakUIEffects.ts:53-54`.

**No modo embarcado a lib não toca em título nem favicon — nem com valor fornecido.** Não é "o valor está
faltando"; é que **a ilha não é dona da página**. Um widget Sarak dentro de um portal alheio não renomeia a
aba do portal, mesmo que quem o montou tenha passado `tabName`.

O mesmo raciocínio vale para as fontes globais: no embarcado elas só entram com opt-in explícito
(`options.embedded.injectGlobalFonts`, default `false` — `types.ts:137-144`), porque `@import` de webfont é
**necessariamente global** (não existe `@font-face` confinado a seletor).

# 6. `SarakBrandingState` — identidade × rótulo de UI

```ts
export interface SarakBrandingState {
    companyName?: string;
    loginName: string;        // <- o único NÃO-opcional
    tabName?: string;
    logoBase64: string | null;
}
```

`src/core/Provider/types.ts:186-191`. E os defaults:

```ts
const DEFAULT_BRANDING: SarakBrandingState = {
    loginName: 'Acesso ao Sistema',
    logoBase64: null
};
```

`src/core/Provider/hooks/useBrandingManager.ts:20-23`.

| Campo | Classe | Default | Por quê |
| --- | --- | --- | --- |
| `companyName` | **IDENTIDADE** | **ausente** | é marca — só o consumidor a tem |
| `tabName` | **IDENTIDADE** | **ausente** | é o nome da página dele |
| `logoBase64` | **IDENTIDADE** | `null` | é o ícone dele |
| `loginName` | **RÓTULO DE UI** | `'Acesso ao Sistema'` | descreve uma **função** ("acesso"), não uma marca |

> **Esta distinção é o coração da regra.** Campo de identidade nasce **ausente** porque os guards a jusante
> (`if (branding?.tabName)`, `if (branding?.logoBase64)`) então **não escrevem nada**. Rótulo de UI pode ter
> default genérico porque não nomeia ninguém.
>
> **O bug histórico foi exatamente confundir as duas classes:** dali saía `'Sarak OS'`, que era **sempre
> truthy** — e portanto todo consumidor tinha o `<title>` do `index.html` sobrescrito pela marca da lib
> (`useBrandingManager.ts:7-17`; `docs/migracoes.md` §"Identidade da página"). Não havia bug de lógica: o
> guard funcionava perfeitamente. **O defeito era o default existir.**

`useBrandingManager` (`:31-49`) semeia o estado com `{ ...DEFAULT_BRANDING, ...options.branding.initial }` e
expõe `updateBranding`, que chama `options.branding.onChange` — a porta "traga sua persistência", para o
backend **do consumidor**. A lib **não faz fetch** ([[003-remocao-backend-proprio]]).

# 7. O gate `zero-brand:check`

`gates/scripts/contrato/check-zero-brand.mjs`. Comando: `npm run zero-brand:check` — e ele roda **encadeado no
`npm run build`**, então marca nova derruba o build.

## 7.1 Como ele varre — por AST, e o motivo importa

Literais proibidos (`:31`): **`'Sarak Lib'`, `'Sarak OS'`, `'Sarak AI'`**.

A varredura usa a **API do compilador TypeScript** e considera **apenas nós de texto de saída**
(`:76-84`): `StringLiteral`, `NoSubstitutionTemplateLiteral`, partes fixas de `TemplateLiteral` e `JsxText`.

**Por que AST e não regex de arquivo** (o motivo está escrito em `:10-13`): para **não acusar comentário**.
Este repositório documenta a própria correção citando a string antiga — inclusive nas notas de migração e
nesta spec. Um grep ingênuo acusaria a documentação da correção como se fosse o defeito.

É o mesmo problema, ao contrário, do `auditor_ghostvars`, que varre **linha a linha por regex** e por isso
acusa um `--token` dentro de um JSDoc ([[01-gates-e-baseline]] §4.2). **Duas ferramentas, dois níveis de
precisão** — e a diferença é exatamente AST × regex.

O escopo é `src/`, excluindo `.d.ts`, `.test.*`, `.spec.*` e `__tests__/` (`:49-54`).

## 7.2 Baseline medido

```
[zero-brand:check] 361 arquivo(s) varrido(s); zero marca da lib fora da allowlist.
```

Medido em **2026-07-29** — **baseline exato** de [[01-gates-e-baseline]] §3. Eram **363** quando esta spec foi escrita; o P26 removeu dois componentes (`SarakVisualEngine`, `PaletteSelector`) e a contagem, que é de **arquivos varridos**, caiu junto. **O número que importa é o de violações: 0** — um total de arquivos que sobe ou desce acompanha o tamanho do `src/`, não a saúde da regra.

## 7.3 A allowlist, e como (não) entrar nela

Três arquivos, cada um com **motivo comentado ao lado** (`:37-46`):

| Arquivo | Motivo |
| --- | --- |
| `features/DesignEngine/Canvas/KitchenSinkPreview.tsx` | vitrine interna de componentes/temas, usada só pelo painel de autoria |
| `features/DesignEngine/Panels/LanguageTab.tsx` | cita a marca como **texto de exemplo** dentro da ferramenta de autoria |
| `features/DesignEngine/Panels/LayoutTab.tsx` | idem |

**Como adicionar:** editar `ALLOWLIST` com o caminho relativo a `src/` **e** o comentário do motivo.

**Por que a barra é alta:** o único motivo aceitável é **"este arquivo não é consumidor-facing"** — a peça
é ferramenta de autoria da própria lib, e o consumidor não a embute no produto dele. Nunca *"estava
vermelho"*. Isso não é preferência: é a regra anti-afrouxamento de [[01-gates-e-baseline]] §6, e ela existe
porque relaxar allowlist é a forma mais fácil de fabricar um gate verde sobre uma regra violada.

**Tensão registrada** (detalhe em [[06-painel-de-customizacao-e-preview]] §8): o `CustomizationPanel` **é**
exportado no barril público, então um consumidor **pode** exibi-lo. A allowlist se justifica pela
**intenção** de uso, não por uma barreira técnica.

# 8. Os sinks históricos — a lição que vale mais que a lista

Duas rodadas, e a segunda é a que ensina.

**Rodada 1 (Spec 47)** fechou a **FONTE**: os defaults de branding e a identidade da página.

**Rodada 2 (Spec 49)** descobriu que **o vazamento apenas MUDOU DE STRING**: componentes
consumidor-facing tinham `'Sarak Lib'` / `'Sarak AI'` **hardcoded** em textos decorativos — e um deles
**regrediu para `'Sarak Lib'` como efeito colateral da própria Spec 47** (`SarakEmptyState`, que antes caía
em `'Sarak OS'`).

Os sinks neutralizados (`docs/migracoes.md` §"Rótulos decorativos"):

| Componente | Antes | Depois |
| --- | --- | --- |
| `SarakEmptyState` (`minimal`) | `systemName \|\| 'Sarak Lib'` | `systemName \|\| 'Sistema'` |
| `SarakEmptyState` (`abstract`) | `'Sarak Lib Core Engine'` fixo | `systemName \|\| 'System Core Engine'` |
| `SarakSearch` (rodapé) | `'Sarak Lib Search Engine'` fixo | `` `${systemName} Search Engine` `` ou `'Search Engine'` |
| `ChatHeader` (subtítulo) | `'Agnostic Interface • Sarak Lib Engine'` | `'Agnostic Interface • Chat Engine'` |
| `SarakChat` (default de `label`) | `'Sarak AI Chat Lab'` | `'AI Chat'` |
| **`SarakShell`** (default de `brand`) | `{ name: 'Sarak Lib' }` | `{ name: 'Sistema' }` |
| **`ShellUserWidget`** (usuário sem nome) | `'Sarak User'` | `'User'` |

**Os dois últimos não estavam no levantamento inicial** — apareceram na confirmação em código. E o
`SarakShell` é o mais instrutivo: `SidebarNav`/`TopbarNav` **já consumiam corretamente**
(`systemName || brand.name`); era o **default do `brand`** que nomeava a lib quando o consumidor não passava
`manifest.brand`. **A porta certa estava certa; o vazamento entrou pela fonte do valor que passa por ela.**

> ## As duas regras derivadas
>
> 1. **Fechar a fonte não fecha o sink.** Corrigir o default de branding não corrige um literal hardcoded
>    três camadas abaixo. São defeitos independentes com a mesma aparência.
> 2. **Grep por UMA string não é auditoria de marca.** Procurar `'Sarak OS'` deu verde enquanto
>    `'Sarak Lib'` estava vivo em cinco componentes. A auditoria tem de varrer o **conjunto** de literais,
>    por AST, em todo o escopo consumidor-facing — que é precisamente o que o gate faz hoje (§7).
>
> É a mesma família da lição de [[09-temas-e-presets]] §6.2 (*amostra de console não é auditoria*):
> **evidência parcial produz confiança total e injustificada.**

**A regra de fallback, em ordem:**

```
marca do consumidor (systemName / brand.name)
    → rótulo genérico de FUNÇÃO ('Sistema', 'Search Engine', 'AI Chat', 'User')
        → NUNCA 'Sarak …'
```

E **nunca heading vazio**: um componente sem nome de marca precisa mostrar o rótulo de função, não uma
lacuna visual. Foi o que motivou `'System Core Engine'` em vez de string vazia no `SarakEmptyState`.

# 9. Backlog

| Item | Origem | Cuidado obrigatório |
| --- | --- | --- |
| **Gestão de brand mais ampla** — upload de logo, brandbook, cores de marca do consumidor | `plan/13-revisao-e-upload-de-brand.md`, **nunca executada** | qualquer coisa construída aqui gerencia a marca **DO CONSUMIDOR**. Nenhum default pode nomear a lib; todo campo de identidade novo nasce **ausente** (§6). Um "brandbook de exemplo" embutido seria uma reintrodução do defeito por outra porta |

# 10. Critérios de aceite

- [x] A regra está enunciada como **opt-in**, com o guard de código que a implementa.
- [x] As duas portas e a precedência têm `arquivo:linha`.
- [x] A fonte única do título está registrada com o padrão a não repetir.
- [x] O comportamento no modo embarcado (**nunca**, mesmo com valor) está explícito.
- [x] A distinção identidade × rótulo de UI está mapeada campo a campo, com o bug histórico explicado
      (*o defeito era o default existir*).
- [x] O gate está descrito com escopo, mecânica (AST), literais, baseline **medido** (363/0) e regra de
      allowlist.
- [x] Os sinks históricos aparecem com as duas regras derivadas.
- [x] Nenhum código, nem a allowlist, foi alterado nesta entrega.

# 11. Plano de testes (Quality Gate)

| Verificação | Onde | Situação |
| --- | --- | --- |
| Zero-config: a lib **não** escreve `title`/favicon sem valor | `src/core/Provider/__tests__/HostIdentity.test.tsx` | ✅ suíte |
| Precedência `tabName` > `systemName` | idem | ✅ suíte |
| Modo embarcado não toca em identidade **nem com valor** | `src/core/Provider/__tests__/EmbeddedMode.test.tsx` + `HostIdentity` | ✅ suíte |
| Provider zero-config não altera o documento do host | `src/core/Provider/__tests__/ProviderZeroConfig.test.tsx` | ✅ suíte |
| Semeadura e `onChange` de branding | `src/core/Provider/hooks/__tests__/useBrandingManager.test.ts` | ✅ suíte |
| Nenhuma marca da lib como texto renderizado | `npm run zero-brand:check` **e** `src/__tests__/ZeroBrand.test.ts` (reusa o script) | ✅ gate **+** suíte |

O gate estar **também** na suíte é deliberado: quem roda só `vitest` continua sendo barrado por marca nova,
sem depender de lembrar do script.
