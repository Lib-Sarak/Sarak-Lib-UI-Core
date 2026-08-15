---
tipo: "spec"
titulo: "Responsividade e multidispositivo — o contrato zero-config"
dominio: "Sarak-Lib-UI-Core / Layout / Multidispositivo"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "responsividade", "multidispositivo", "mobile", "breakpoints", "zero-config"]
relacionados: ["[[00-regras-e-invariantes]]", "[[05-cromo-e-slots]]", "[[04-contrato-de-tokens-e-paridade]]", "[[06-painel-de-customizacao-e-preview]]", "[[01-gates-e-baseline]]"]
---

# 1. O princípio

> **Layout multidispositivo é POR PADRÃO. Zero-config.**

O consumidor **não escreve CSS nem media query** para as telas se adaptarem. Onde quiser refinar, passa
um `ResponsiveValue<T>` — que **nunca é obrigatório**.

Isto é a regra **zero-gambiarra** ([[00-regras-e-invariantes]]) aplicada ao layout, e a consequência é
direta:

> **Se o consumidor precisou escrever CSS para consertar um componente da lib no celular, é BUG DA LIB.**

Não é "customização", não é "caso de uso avançado". É defeito, e entra como tal.

# 2. Breakpoints

Fonte única: `src/core/Design/breakpoints.ts`.

| Faixa | Largura |
| --- | --- |
| celular (`smartphone`) | `< 768px` |
| tablet | `768px – 1023px` |
| desktop | `≥ 1024px` |

```ts
export const BREAKPOINT_TABLET = 768;   // breakpoints.ts:16
export const BREAKPOINT_DESKTOP = 1024; // breakpoints.ts:19
```

Refletidos na paridade como tokens `breakpointTablet` / `breakpointDesktop` (schema `structural`,
`src/core/Design/schema/structural.ts:20-40`), sliders com faixa declarada (480-1024 e 768-1600), cujos
`defaultValue`/`legacyValue` **são** as constantes acima. **O consumidor nunca chuma 768 no código dele** —
lê o token ou usa `useSarakDevice`.

Nota técnica registrada no próprio arquivo (`breakpoints.ts:11-13`): `@media` **não aceita
`var(--…)`** na condição, então o número é interpolado no JS ao gerar a media-query — não existe como
variável CSS consumível na condição.

## 2.1 ⚠️ Alcance real do token de breakpoint — 2 dos 3 caminhos andam juntos desde 2026-08-04

O cabeçalho de `breakpoints.ts:4-7` afirma que a fonte única garante que *"CSS e JS nunca divirjam sobre o
que é tablet/desktop"*. Isso é verdade **para os valores default**. Se o consumidor **alterar** o token no
tema:

| Caminho | Segue o token do tema? | Onde |
| --- | --- | --- |
| **Media-query dos tokens responsivos** | ✅ **sim** — lê `design.breakpointTablet`/`Desktop` e só cai na constante se ausente | `src/core/Design/hooks/useDesignVariables.ts:58-59` |
| **Detecção JS de dispositivo** (`useSarakDevice`) | ✅ **sim, desde a `plan-08` (F5, 2026-08-04)** — `SarakUIProvider` memoiza os breakpoints do tema ativo e os desce ao `DeviceProvider` via `DeviceBreakpointsContext`; sem o tema atravessar a fronteira de bundle, o pior caso é o comportamento anterior (nunca pior) | `src/core/Provider/SarakUIProvider.tsx:180-190`, `DeviceProvider.tsx:41-52,78-92` |
| **Classes estruturais de container query** (`@min-[768px]:`, `@min-[1024px]:`) | ❌ **não** — a constante é **interpolada em build-time** na string da classe. **Limite de ferramenta, não dívida** — Tailwind resolve a classe em build-time e não aceita `var()` na condição | `useStructuralStyles.ts:40,42,86-87,229`; `useStructuralStyles.presets.ts:13-15,21`; `ShellContent.tsx:38,54`; `TopbarNav.tsx:111`; `useShellLayoutStyles.ts:33` |

**Consequência prática, hoje:** mover `breakpointTablet` no tema já muda **onde o valor responsivo de um
token troca** *e* em que largura `useSarakDevice` diz `'tablet'` — os dois andam juntos. O que **continua**
sem seguir o token é o grid estrutural resolvido por classe Tailwind (a camada 3 da §6), e essa metade foi
**aceita como característica** na triagem de 2026-08-01 — o motivo está em [[00-contexto]] §8: classe
Tailwind com valor arbitrário é build-time, token de tema é runtime, e fechar essa divergência exigiria
abandonar as classes de container query em favor de CSS gerado.

**A regra derivada continua valendo para a metade que resta:** os tokens de breakpoint ajustam fino o valor
responsivo e a detecção de dispositivo; **não** redefinem a largura em que o grid estrutural muda de
colunas.

# 3. `useSarakDevice` — e a lição arquitetural que ele carrega

```ts
export const useSarakDevice = (): DeviceType => {
    const override = useContext(DeviceOverrideContext);
    const [detected, setDetected] = useState<DeviceType>(() => deviceForWidth(currentWidth()));
    useEffect(() => {
        if (override) return undefined;
        const sync = () => setDetected(deviceForWidth(window.innerWidth));
        window.addEventListener('resize', sync);
        sync();
        return () => window.removeEventListener('resize', sync);
    }, [override]);
    return override ?? detected;
};
```

`src/core/Provider/DeviceProvider.tsx:36-50`.

> ## O item mais valioso desta spec: o contexto transporta o OVERRIDE, nunca o ESTADO
>
> A detecção é **self-contained no hook** — cada consumidor lê o viewport direto. O
> `DeviceOverrideContext` carrega **apenas o override**.
>
> A versão anterior centralizava o **estado detectado** num contexto, e falhava de **duas** formas
> (ambas escritas em `DeviceProvider.tsx:19-33`, ambas observadas em runtime real):
>
> 1. **FLASH de desktop.** O estado inicial era `'desktop'`, corrigido só por efeito pós-montagem. O
>    cromo pintava topbar/desktop por um frame antes de virar hambúrguer. Corrigido pelo inicializador
>    **lazy** do `useState` (`:38`), que já nasce com a largura real.
> 2. **Identidade de contexto partida entre chunks.** Se o build fragmentasse o módulo do contexto,
>    Provider e consumidor leriam **instâncias diferentes** do contexto e o consumidor ficava preso no
>    default `'desktop'` — sem erro, sem aviso. Corrigido por não depender do contexto para o valor:
>    ler o viewport funciona mesmo se o contexto não atravessar a fronteira de bundle.
>
> **O padrão a NÃO repetir:** *centralizar em contexto um estado que cada consumidor pode derivar
> sozinho.* Você paga o flash de valor inicial errado **e** amarra a corretude à topologia do bundle. Isto
> vale para qualquer estado derivável do ambiente (viewport, `prefers-*`, online/offline), não só para
> dispositivo.

**`DeviceProvider overrideDevice`** (`:53-68`): sem a prop é **passthrough transparente** (a detecção real
governa); com ela, sequestra o valor **e desliga a escuta de `resize`** (`:41`). Serve ao Gêmeo Digital
(preview do painel) e a testes.

# 4. `ResponsiveValue<T>` — o refinamento opcional

`src/core/Design/resolveResponsiveValue.ts`:

- `isResponsiveValue(v)` (`:27-28`) — verdadeiro só se o objeto tem **as três** camadas `mob`/`tab`/`desk`.
- `resolveResponsiveValue(v, device)` (`:34-37`) — mapeia device → camada (`smartphone→mob`,
  `tablet→tab`, `desktop→desk`, `:20-24`); **valor escalar passa direto**; nunca lança.
- É **função pura** e não lê contexto React (`:11`) — recebe o `device` já resolvido. Por isso é testável
  isoladamente e reusável por qualquer primitiva sem duplicar a lógica de seleção.

**Nos tokens:** os tokens marcados `isResponsive` aceitam `{ desk, tab, mob }` — hoje **40 tokens** em 13
schemas (`grep -c "isResponsive: true" src/core/Design/schema/*.ts`). Cada eixo é validado
**individualmente e clampado** aos limites do token por `validateResponsiveValue`
(`src/core/Provider/utils/validation.ts:88-97`): se **qualquer** eixo não for número finito, o valor
inteiro é rejeitado — não há aceitação parcial.

**`SarakHidden`** (`src/components/Layout/SarakHidden.tsx`): `on={['smartphone']}` remove o conteúdo da
árvore naquele dispositivo. Não é `display: none` — é **não renderizar**, poupando DOM e RAM.

# 5. A TABELA DO CONTRATO — o que adapta sozinho

Cada linha foi **conferida no código**, e cada uma tem teste identificado.

| Componente | Comportamento por dispositivo | Onde | Teste |
| --- | --- | --- | --- |
| **`SarakAppChrome`** | **celular:** barra + hambúrguer + drawer acessível (`aria-expanded`, foco preso, ESC, scroll travado) · **tablet:** topbar compacta · **desktop:** sidebar OU topbar por `navigationStyle` | `SarakAppChrome.tsx:170-172`; mobile em `SarakAppChromeMobile.tsx` | `SarakAppChrome.viewport.test.tsx`, `SarakAppChromeMobile.test.tsx` |
| **Slots do cromo** | migram, nunca desaparecem (sidebar→drawer, topbar→compacta, faixas full-width em todos) | `chrome/ChromeFrame.tsx:20-24` | `chrome/__tests__/` |
| **`SarakGrid`** | `templateColumns` **string** vira **`1fr` no celular**; `ResponsiveValue` é resolvido no device | `SarakGrid.tsx:44-53` | `SarakGrid.test.tsx`, `SarakLayoutsResponsive.test.tsx` |
| **`SarakGrid` SEM `templateColumns`** — o caminho zero-config, e o mais usado | delega à estratégia do Design Engine (`layoutGridTemplate`). O default `auto-fit` dá células de **no mínimo 280px**, e o número de colunas é resolvido pelo **próprio CSS Grid** em runtime — sem depender de container query. `col-12` dá **12 trilhas**, e o filho que não declara span recebe um default por breakpoint (§6.1) | `useStructuralStyles.presets.ts` (`GRID_LAYOUT_STRATEGIES`); `useStructuralStyles.ts:23,41` | `useStructuralStyles.test.ts`, `useStructuralStyles.presets.test.ts`, `SarakGrid.test.tsx` |
| **`SarakFlex`** | `wrap` **liga por default** — itens quebram em linhas em vez de transbordar; `direction` aceita `ResponsiveValue` | `SarakFlex.tsx:16-21,46-48,58` | `SarakFlex.test.tsx`, `SarakLayoutsResponsive.test.tsx` |
| **`SarakSplitPane`** | **celular:** painéis **empilham** em coluna full-width, **sem a divisória de arraste** (não faz sentido em touch estreito); tablet/desktop mantêm o split | `SarakSplitPane.tsx:18-21,32` | `SarakSplitPane.test.tsx` |
| **`SarakDataTable`** | **celular:** colapsa para `SarakDataCards`; **opt-out explícito** `responsive={false}` | `SarakDataTableImpl.tsx:41-42,71,74,77` | `SarakDataTableImpl.test.tsx`, `SarakDataCards.test.tsx` |
| **`SarakTable`** | **celular:** colapsa para `SarakTableCards`; **opt-out explícito** `responsive={false}` *(desde 2026-08-04)* | `SarakTable.tsx:32-37,44,46,116` | `SarakTable.responsive.test.tsx`, `SarakTableCards.test.tsx` |
| **`SarakHidden`** | remove da árvore nos dispositivos listados | `SarakHidden.tsx:17-24` | `SarakHidden.test.tsx` |

✅ **A assimetria fechou em 2026-08-04 (`plan-08`, F6).** `SarakTable` ganhou `responsive?: boolean` com
default `true`, espelhando `SarakDataTableImpl` — mesma prop, mesmo default, mesmo efeito. Mudança aditiva
(`minor`), sem esperar o major. Entrada em `docs/migracoes.md`.

## 5.1 ⚠️ O que NÃO adapta — explicitamente

**Silêncio aqui seria a pior forma de mentir.** Dois componentes densos **não têm colapso mobile
próprio**:

| Componente | Verificação |
| --- | --- |
| `SarakManagementGrid` (`src/components/atomic/Templates/SarakManagementGrid.tsx`) | `grep useSarakDevice\|smartphone\|responsive` = **0 ocorrências** |
| `SarakDataGrid` (`src/components/atomic/DataDisplay/SarakDataGrid/SarakDataGridImpl.tsx`) | **0 ocorrências** |

**Por que ficaram de fora:** nenhum consumidor real os exigiu no mobile. `SarakDataGrid` é, além disso,
uma primitiva **headless** — o consumidor monta a apresentação, e impor um colapso contradiria o papel
dela.

**O que isso significa na prática:** usados no celular, eles vão estourar horizontalmente ou exigir scroll
lateral. **Não é bug reportável como "quebra do contrato zero-config"** — é lacuna declarada. Quando um
consumidor real precisar, entram em spec dedicada (e `SarakDataGrid` provavelmente por um helper opcional,
não por colapso automático).

# 6. Onde a responsividade é *decidida* — as três camadas

Vale saber, para não procurar no lugar errado:

1. **JS por dispositivo** (`useSarakDevice`) — decisões de **estrutura**: trocar de componente
   (tabela→cards), trocar de cromo, remover da árvore. É discreto: 3 estados.
2. **Media-query gerada por token** (`useDesignVariables.ts:58-59`) — valores responsivos de token
   (`{desk,tab,mob}`). Contínuo, segue o token de breakpoint (§2.1).
3. **Container query estrutural** (`@min-[Npx]:` nas classes) — layout interno de componente, reagindo ao
   **container**, não à janela. Constantes em build-time.

A camada 3 é a razão de `@container` aparecer na raiz do Shell (`SarakShell.tsx:86`): componentes internos
reagem à largura **disponível**, não à do viewport — é o que faz um card se comportar igual dentro de uma
sidebar estreita e de uma página larga.

## 6.1 As quatro regras de operação da camada 3

A camada 3 tem quatro modos de falhar **em silêncio** — nos quatro, a classe está no DOM, todo gate passa
verde e nada acontece na tela. Por isso são regras, não recomendações.

**1. Quem emite container query é responsável por garantir o container.** Uma container query pergunta ao
**ancestral** com `container-type`; sem ele a regra **nunca casa** — não há fallback para viewport, o
elemento fica no valor base para sempre. E o elemento **nunca é container de si mesmo**: `container-type`
no mesmo elemento da classe `@min-[…]` não faz a query dele casar. O container vai num **ancestral**.

Por isso todo componente que consome `getGridStyles`/`getResponsiveStackStyles`/`getHeaderStyles`/
`getResponsiveSpacingStyles` planta o seu próprio `@container`, em vez de depender de haver um `SarakShell`
acima. Cobrado por `container-query-boundary:check`. Caso especial: componente que renderiza em
`createPortal` planta o container na raiz **do portal**, não na raiz do componente — o portal escapa da
subárvore no DOM real.

**2. Nome de classe se escreve LITERAL.** O scanner do Tailwind lê o arquivo como **texto**: classe montada
por interpolação de template literal nunca vira classe válida, e a regra correspondente **nunca é gerada**.
A amarração com a constante do breakpoint mora no **teste**, que compara a forma literal contra a
interpolada e pega a deriva. Cobrado por `container-query:check`.

**3. Nunca soletre um nome de classe completo em comentário de código.** O scanner não distingue comentário
de código: um nome de classe completo dentro de um comentário vira **candidato**, e um valor inválido no
lugar da medida derruba `npm run build` com `SyntaxError: Invalid media query` no `lightningcss`. Cite só o
prefixo, ou descreva sem formar candidato — mantendo prefixo, medida e utilitário em trechos separados por
texto comum.

**4. Trocar um default não conserta uma opção quebrada — só muda quem cai nela.** Enquanto o valor existir
no schema, ele chega por **duas portas que nenhum default alcança**: o tema **persistido** (valor salvo
vence default por desenho — ver [[09-temas-e-presets]]) e a **escolha do usuário no painel**. Um valor
oferecido no schema é um contrato com o usuário final: ou ele **funciona**, ou sai do schema. É o que
sustenta o default de span do `col-12` (§5) existir em vez de o `col-12` ter sido simplesmente abandonado.

> **O que nenhum teste deste repositório pode provar.** `jsdom` não tem motor de layout e não resolve
> cascata de stylesheet: não avalia container query, não mede largura de coluna e não decide especificidade.
> Teste aqui prova **classe emitida** e **DOM**; o desenho se prova em **navegador real**, e o que o CSS
> publicado contém se prova **lendo o artefato**. Todo teste da camada 3 declara, no próprio corpo, qual das
> três coisas ele prova — confundir cobertura com prova é a origem comum dos quatro modos de falha acima.

# 7. ⚠️ Armadilhas de validação (as duas que já custaram uma reprovação errada)

## 7.1 BUILD STALE não é bug de código

A reprovação do cromo mobile numa rodada do ciclo 40.x **não era bug**: o código estava correto, e a cópia
**instalada no consumidor** era velha. A `version` imóvel do `package.json` fez o pnpm **não recopiar** o
`file:` — o store devolveu o build anterior ([[007-distribuicao-por-git]]).

**Regra derivada:** antes de acusar bug de responsividade num consumidor, **confirme qual build está
instalado**. `dist/BUILD_INFO.json` existe exatamente para isso.

**E depois faça a pergunta seguinte, que é onde a armadilha realmente mora:** *o build instalado é o que o
**navegador executa**?* São coisas diferentes — entre o pacote em disco e a tela existe ainda o cache de
pré-bundle do bundler, que não se invalida quando a lib é reconstruída na mesma versão. Confirmar só o
pacote responde metade da pergunta e encerra a investigação no lugar errado. O procedimento das duas
camadas, e o aviso que as cobre, estão em [[13-instalacao-e-atualizacao]].

## 7.2 Teste com `overrideDevice` NÃO exercita a detecção real

`overrideDevice` **desliga** a escuta de `resize` (`DeviceProvider.tsx:41`). Um teste que o usa prova o
**reflow** (dado o dispositivo X, o layout é Y) — **não** prova a **detecção** (dada a largura W, o
dispositivo é X).

São dois contratos distintos, e o segundo é o que quebrou de verdade na prática (o flash e a identidade de
contexto partida, §3). A detecção tem cobertura própria em
`src/core/Provider/__tests__/DeviceProvider.test.tsx`; **toda** a cobertura de reflow dos componentes usa
override. Saber a diferença é o que evita concluir "está coberto" quando o que quebra não está.

# 8. Lacunas e backlog (nomeados, não corrigidos)

| # | Item | Situação |
| --- | --- | --- |
| 1 | **Container Queries reais no Gêmeo Digital** — o preview simula viewport por escala/constraint de largura + `overrideDevice`, não por container query verdadeira. É o "Tier B" de `plan/10-responsividade-gemeo-digital.md`, **nunca feito** | backlog |
| 2 | ✅ **FECHADO em parte (2026-08-04, `plan-08` F5)** — token de breakpoint agora move a detecção JS; as classes estruturais continuam sem seguir o token | limite arquitetural, aceito como característica ([[00-contexto]] §8) |
| 3 | ✅ **FECHADO em 2026-08-04 (`plan-08` F6)** — `SarakTable` ganhou opt-out | — |
| 4 | **`SarakManagementGrid` e `SarakDataGrid` sem colapso mobile** (§5.1) | lacuna declarada |
| 5 | **Nenhum teste de detecção real por redimensionamento de janela** além do `DeviceProvider.test.tsx` — nenhum teste dispara `resize` com um componente de layout montado | lacuna de cobertura |

# 9. Critérios de aceite

- [x] Cada linha da tabela de contrato (§5) foi **conferida no código** com `arquivo:linha` **e** tem
      teste identificado.
- [x] A lista do que **não** adapta é explícita, com a verificação que a sustenta (§5.1).
- [x] Nenhuma diretiva JSON aparece — a `responsive` do manifesto morreu com o motor
      ([[002-remocao-motor-manifesto]]); o que vive é `ResponsiveValue` + `useSarakDevice`.
- [x] A lição arquitetural do contexto-com-override está registrada como padrão a não repetir.
- [x] As duas armadilhas de validação estão registradas.
- [x] Nenhuma adaptação foi prometida sem prova.

# 10. Plano de testes (Quality Gate)

Toda linha de §5 já tem teste (coluna própria na tabela). Além deles:

| Verificação | Onde |
| --- | --- |
| Detecção real: largura → dispositivo, override sequestra, sem flash inicial | `src/core/Provider/__tests__/DeviceProvider.test.tsx` |
| `resolveResponsiveValue`/`isResponsiveValue` puros | `src/core/Design/__tests__/resolveResponsiveValue.test.ts` |
| Validação eixo a eixo com clamp | `src/core/Provider/utils/__tests__/validation.test.ts` |
| Reflow conjunto das primitivas de layout | `src/components/atomic/Layouts/__tests__/SarakLayoutsResponsive.test.tsx` |

**A implementar (backlog, item 5 da §8):** um teste que dispare `resize` de verdade com cromo montado —
hoje a ponte "largura muda → layout muda" é provada em dois pedaços que nenhum teste costura.
