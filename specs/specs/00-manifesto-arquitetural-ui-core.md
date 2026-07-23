# 00. Manifesto Arquitetural Sarak-Lib-UI-Core

Este documento atua como o ponto de partida (Root Spec) da arquitetura visual do ecossistema Sarak. Ele define o papel da biblioteca, suas regras universais e a separação estrita de camadas.

> **Virada de tese (Spec 43, 2026-07-23):** o §1 abaixo foi reescrito. O modelo de consumo oficial passou a ser **módulos-plugin** (o que o `Sarak-MyService` usa), não mais "100% via manifesto". Ver `specs/plan/00-indice.md` (Princípio vigente) e `specs/plan/43-design-system-primeiro.md` para o histórico completo da decisão.

## 1. O Papel da Biblioteca
A **Sarak-Lib-UI-Core** é uma **BASE de front com Shell + Design Engine central**, consumida pelo modelo de **módulos-plugin**: o sistema importador registra seus próprios módulos de negócio (React) na base — `registerSarakModule`/`registerLocalComponent`, sobre `SarakUIProvider`+`SarakShell` — e a base fornece o **Shell** (navegação/layout), o **Design Engine** (central de tema/template que aplica a TODA tela que consome os tokens públicos) e os **componentes atômicos** como blocos prontos. É o padrão do `Sarak-MyService`, o único consumidor real da lib hoje, agora oficial.

**Nenhuma regra de negócio (business logic)** deve residir aqui. Esta biblioteca se preocupa exclusivamente com:
- Renderização limpa e tipada (Shell, Design Engine, componentes atômicos).
- Resiliência visual (Zero Hardcode).
- Aplicação determinística de Design Tokens — a central que, ao trocar de tema, atinge todas as telas que a consomem.

### A Fronteira Layout × Look (o que o importador possui vs. o que a base possui)
O importador **possui o layout**: registra seus módulos de negócio como componentes React normais (`registerSarakModule`/`registerLocalComponent`) e pode criar o que precisar — não há obrigação de "programar em JSON". A base **possui o look**: o Design Engine é a central de tema/template, e qualquer módulo/componente — da lib ou do próprio importador — que use os tokens públicos (`var(--sarak-*)`) responde automaticamente a uma troca de tema feita na central. Marcação com estilo hardcoded fora do contrato de tokens **não é tematizada**. O motor de renderização por manifesto (`src/core/Manifest/`, camada opcional descrita na Spec 11) segue disponível para telas que preferirem 100% dado/JSON, mas **não é o modelo de consumo** — o piso de funcionalidade da lib é o padrão módulos-plugin do `Sarak-MyService`.

## 2. As Três Camadas (3-Layer Architecture)

A organização da biblioteca respeita uma divisão hermética. Componentes nunca podem pular ou mesclar responsabilidades.

### Camada 1: O Motor e o Provedor (`src/core/`)
O cérebro do sistema. Aqui residem o `SarakUIProvider`, o `DesignEngine` e o Catálogo JSON. O motor é responsável por ingerir tokens do banco ou de partições JSON locais, mesclá-los com rascunhos em tempo real e distribuir um objeto de contexto unificado (`SarakThemePayload`) para toda a árvore React.
> **Regra Mestra do Core:** "A Interface do Payload dita a Realidade". A tipagem TypeScript do Theme Payload é a Lei; se uma propriedade não existe no TS, ela não existe no sistema.

### Camada 2: Átomos e Templates Visuais (`src/components/atomic/`)
A fundação visual. Esta pasta abriga blocos puros que não sabem de onde seus dados vêm. Eles extraem os tokens globais injetados pelo Core usando o hook `useDesignManager`.
- **Átomos:** Botões, Inputs, Typografia.
- **Templates:** SarakCardGrid, SarakForm, SarakAuthScreen. Moldes avançados sem lógica de negócio.
> **Regra Mestra do Atomic:** NUNCA utilize dados hardcoded (ex: `w-4`). Tudo deve mapear variáveis reais expostas pelo DesignEngine, sempre com fallback (`w-[var(--sarak-spacing-md,1rem)]`). Namespace `--sx-*` é proibido (variável-fantasma).

### Camada 3: Features / Módulos de Lógica (`src/features/`)
Os casos de uso inteligentes. Enquanto `atomic` tem os componentes puramente visuais, `features` abriga os blocos que interagem com o usuário, chamam APIs (ou simulam estados avançados) e disparam eventos (Redux, Zustand).
- Exemplo: `DesignEngine/Panels` possui regras reais de state management, salvamento em banco e lógica de troca de contexto, logo, pertence à `features`.

### O Registry do Manifesto é o Ponto de Composição Oficial
O `NATIVE_COMPONENTS` (`src/core/Manifest/Registry/nativeComponents.ts`, Camada 1) é o ÚNICO lugar autorizado a costurar as camadas para o motor declarativo: referencia a Camada 2 por import direto e, excepcionalmente, módulos da Camada 3 elegíveis a manifesto **somente via `React.lazy`** (ex.: `CustomizationPanel`) — o bloco pesado fica fora do caminho crítico e não há ciclo em runtime. Nenhum outro arquivo do `core/` pode importar `features/`.

## 3. Diretriz de Contrato e Tipagem Estrita (Zero Any Absoluto)
A biblioteca atua sob a **Lei do "Zero Any"**, solidificada após a extensa Campanha de Erradicação. O uso de `any` ou `Record<string, unknown>` para burlar tipagem dinâmica é terminantemente proibido em toda a base. 
O sistema exige tipagem determinística até nas fronteiras dinâmicas (utilizando `SarakDesignState`, *Type Guards* e genéricos restritos).
A paridade entre Schema (TS), MasterMap (Motor), Banco de Dados, Lógica da Engine, JSON do Catálogo e **Registry do Manifesto** deve ser mantida sempre em **1:1:1:1:1:1** — a 6ª camada (alcançabilidade via `"type"`) é cobrada automaticamente pelo gate `RegistryParity.test.tsx` e pelo catálogo gerado (`npm run catalog` / `catalog:check` no build): componente sem registro e sem exclusão declarada derruba o build.
