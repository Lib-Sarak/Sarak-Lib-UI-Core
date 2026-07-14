# 00. Manifesto Arquitetural Sarak-Lib-UI-Core

Este documento atua como o ponto de partida (Root Spec) da arquitetura visual do ecossistema Sarak. Ele define o papel da biblioteca, suas regras universais e a separação estrita de camadas.

## 1. O Papel da Biblioteca
A **Sarak-Lib-UI-Core** não é apenas uma biblioteca de componentes; ela é um **Design System Vivo** guiado por dados. Ela fornece a fundação atômica, o motor de design dinâmico e os layouts estruturais para o desenvolvimento de todas as frentes web e mobile da Sarak. 

**Nenhuma regra de negócio (business logic)** deve residir aqui. Esta biblioteca se preocupa exclusivamente com:
- Renderização limpa e tipada.
- Resiliência visual (Zero Hardcode).
- Aplicação determinística de Design Tokens.

### A Filosofia do Preenchimento (Não programe, configure)
Aqui, criar um layout diferente ou um comportamento funcional novo não significa criar um componente React ou escrever lógica imperativa. Significa apenas **enviar um conjunto diferente de dados (Manifestos)** para as propriedades mapeadas no sistema.
O motor UI Core atua como uma **Engine Declarativa (Low-Code/No-Code)** que reage a dicionários de dados (JSON/Payloads). Seu trabalho é alimentar a máquina com os valores estruturais e os comandos lógicos (ex: `renderFor`, ações) corretos, sem atuar como um *Front-End Coder* tradicional. Alterações de UI e Lógica são tratadas estritamente como injeção de dados.

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
