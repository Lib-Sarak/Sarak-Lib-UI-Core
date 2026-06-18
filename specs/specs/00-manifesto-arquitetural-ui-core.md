# 00. Manifesto Arquitetural Sarak-Lib-UI-Core

Este documento atua como o ponto de partida (Root Spec) da arquitetura visual do ecossistema Sarak. Ele define o papel da biblioteca, suas regras universais e a separação estrita de camadas.

## 1. O Papel da Biblioteca
A **Sarak-Lib-UI-Core** não é apenas uma biblioteca de componentes; ela é um **Design System Vivo** guiado por dados. Ela fornece a fundação atômica, o motor de design dinâmico e os layouts estruturais para o desenvolvimento de todas as frentes web e mobile da Sarak. 

**Nenhuma regra de negócio (business logic)** deve residir aqui. Esta biblioteca se preocupa exclusivamente com:
- Renderização limpa e tipada.
- Resiliência visual (Zero Hardcode).
- Aplicação determinística de Design Tokens.

## 2. As Três Camadas (3-Layer Architecture)

A organização da biblioteca respeita uma divisão hermética. Componentes nunca podem pular ou mesclar responsabilidades.

### Camada 1: O Motor e o Provedor (`src/core/`)
O cérebro do sistema. Aqui residem o `SarakUIProvider`, o `DesignEngine` e o Catálogo JSON. O motor é responsável por ingerir tokens do banco ou de partições JSON locais, mesclá-los com rascunhos em tempo real e distribuir um objeto de contexto unificado (`SarakThemePayload`) para toda a árvore React.
> **Regra Mestra do Core:** "A Interface do Payload dita a Realidade". A tipagem TypeScript do Theme Payload é a Lei; se uma propriedade não existe no TS, ela não existe no sistema.

### Camada 2: Átomos e Templates Visuais (`src/components/atomic/`)
A fundação visual. Esta pasta abriga blocos puros que não sabem de onde seus dados vêm. Eles extraem os tokens globais injetados pelo Core usando o hook `useDesignManager`.
- **Átomos:** Botões, Inputs, Typografia.
- **Templates:** SarakCardGrid, SarakForm, SarakAuthScreen. Moldes avançados sem lógica de negócio.
> **Regra Mestra do Atomic:** NUNCA utilize dados hardcoded (ex: `w-4`). Tudo deve mapear variáveis expostas pelo DesignEngine (`w-[var(--sx-spacing))]`).

### Camada 3: Features / Módulos de Lógica (`src/features/`)
Os casos de uso inteligentes. Enquanto `atomic` tem os componentes puramente visuais, `features` abriga os blocos que interagem com o usuário, chamam APIs (ou simulam estados avançados) e disparam eventos (Redux, Zustand).
- Exemplo: `DesignEngine/Panels` possui regras reais de state management, salvamento em banco e lógica de troca de contexto, logo, pertence à `features`.

## 3. Diretriz de Contrato e Tipagem Estrita
A biblioteca atua sob a regra do "Zero Any". O uso de `any` ou `Record<string, unknown>` para burlar tipagem dinâmica é terminantemente proibido. A paridade entre Schema (TS), MasterMap (Motor), Banco de Dados e JSON do Catálogo deve ser mantida sempre em **1:1:1:1:1**.
