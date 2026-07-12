---
tipo: "spec"
titulo: "Revisão e Gestão de Brand (Logo, Cores e Brandbook)"
dominio: "Design Engine / Branding"
status: "🔴 Planejamento Inicial"
prioridade: "Alta"
tags: ["spec", "branding", "upload", "colors", "logo"]
relacionados: ["01-painel-customizacao-temas", "12-expansao-midias-atmosfera"]
---

# 1. Visão Geral e Objetivo

Um dos pilares de um Design Engine voltado para produtos B2B (ou white-label) é a capacidade de absorver a identidade visual do cliente de forma nativa. 

Esta spec tem como objetivo definir o fluxo arquitetural para que o usuário consiga efetivamente realizar o upload e a aplicação do **Logo da Empresa**, de sua **Paleta de Cores Oficial** e das diretrizes do seu **Brandbook** diretamente no Sarak UI Core.

# 2. Requisitos de Negócio (O Fluxo do Usuário)

A interface de Customização do Design Engine deverá oferecer uma seção dedicada a "Brand & Identidade". Os três pilares de interação são:

## 2.1. Upload de Logo
O usuário deve ser capaz de fazer upload da logomarca da sua empresa.
- **Variantes Light/Dark:** o sistema já tem os dois campos certos para isso — `logoUrl` e `logoDarkUrl` (`src/core/Provider/types.ts:79,139`, ambos já existem no payload, `SarakThemePayloadExtras`). **Não criar campo novo** — a spec original desta seção citava `globalBrandLogoUrl`, que não existe no código; use `logoUrl`/`logoDarkUrl`.
- **Componente de upload:** reaproveitar `SarakUploader` (`src/components/atomic/Inputs/SarakUploader.tsx`, já existe e já é exportado por `src/index.ts`) — não criar um novo componente de upload de arquivo.
- **Hospedagem:** o upload fará uso da mesma infraestrutura de *Object Storage* definida na Spec 12 (Expansão de Mídias) — **esta spec (13) depende da 12 estar pelo menos parcialmente implementada** (o bucket/mecanismo de upload precisa existir) antes de a Seção 2.1 poder ser executada de ponta a ponta. Se a 12 ainda não foi feita, implemente a UI (formulário + preview) e deixe o `onUpload` como um ponto de integração claramente marcado, sem persistir de verdade ainda.

## 2.2. Injeção da Paleta de Cores
O usuário deve conseguir inserir sua paleta institucional.
- **Input Manual (Hex):** Definição direta das cores Primária, Secundária e de Superfície.
- **Mapeamento Direto:** os tokens reais são `primaryColor`/`secondaryColor` (`src/core/Provider/types.ts:57-58`) — **não `colorPrimary`/`colorSecondary`**, que não existem no schema (correção da spec original). Sobrescrever esses dois já propaga para botões/links/estados ativos de toda a biblioteca (é assim que o motor de temas já funciona hoje).
- **Geração de Escala Automática — já existe, não precisa ser criada.** `computeColorVariants(v: string, fallback: string)` (`src/core/Provider/utils/color-engine.ts:153`, já exportado publicamente em `src/index.ts` via `export { computeColorVariants } from '.../color-engine'`) já calcula variantes claras/escuras a partir de 1 cor base. Esta seção da spec é sobre **conectar essa função já pronta** à UI de upload de brand — não escrever um gerador de escala novo.

## 2.3. Integração de Brandbook e Tipografia
O usuário deve ter uma maneira de alinhar o sistema às regras do seu Brandbook.
- **Seleção Tipográfica:** os tokens reais são `headingFont`/`bodyFont` (`src/core/Provider/types.ts:108-109`) — **não `globalFontFamily`**, que não existe (correção da spec original).
- **Upload de Arquivo (IA/LLM Context):** Permitir o upload do Brandbook em PDF. Isso é exatamente o caso de uso descrito em `specs/plan/05-ingestao-multimodal-html.md` (conversão de PDF para HTML/extração de texto+imagens) e `06-pipeline-visao-dois-estagios.md` (perfil visual → tokens) — **não reimplementar parsing de PDF aqui**; esta seção só precisa da UI de upload, a extração em si é escopo das specs 05/06 do sub-plano do Design Agent.

# 3. Desafio Arquitetural (Design as Data)

Seguindo a *Regra Zero* da Sarak UI Core (Design as Data), o módulo de "Upload de Brand" **não** deve injetar tags `<style>` avulsas ou forçar imagens na tela.

Toda a interação do usuário nesta tela deve resultar estritamente na mutação do **Theme Payload (JSON)**. 
- O arquivo de logo virará uma URL string no payload.
- A paleta virará strings de HEX no payload.
- A tipografia virará o nome da fonte no payload.

A engine do SarakUIProvider cuidará de distribuir essa identidade visual para os Átomos de forma reativa e padronizada.

# 4. Critérios de Aceite para Futura Implementação
- [ ] Existência de formulário/interface dedicada (seção "Brand & Identidade") para upload de Logo e input de Cores Primária/Secundária, usando `SarakUploader` e os tokens reais (`logoUrl`/`logoDarkUrl`/`primaryColor`/`secondaryColor`).
- [ ] O logo upado é salvo no Storage (Bucket, spec 12) e sua URL é injetada no rascunho (Draft) do Tema atual via `onUpdateDraft`/`applyConfig` (mesmo mecanismo que qualquer outro token — não um caminho de gravação separado).
- [ ] A alteração de uma Cor Primária no módulo de Brand atualiza instantaneamente a variável CSS real emitida pelo motor (**não** `--sx-color-primary` — esse namespace é proibido em toda a base; confirme o nome real emitido consultando `cssVars` do token `primaryColor` no schema antes de escrever qualquer CSS/teste).
- [ ] `computeColorVariants` é chamado quando o usuário fornece só a cor primária, preenchendo as variantes automaticamente no rascunho.
- [ ] Preparação estrutural (campo de arquivo) para upload de regras do Brandbook via `SarakUploader`, aceitando PDF — sem parsing próprio (delega às specs 05/06 quando existirem).

# 5. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** o formulário de Brand chamar `onUpdateDraft('primaryColor', ...)`/`onUpdateDraft('secondaryColor', ...)` corretamente ao editar os campos de cor.
- [ ] **Deve** `computeColorVariants` ser chamado com o valor da cor primária quando só ela é fornecida (sem cor secundária/superfície explícitas).
- [ ] **Deve** o upload de logo (mock do `SarakUploader`) resultar em `onUpdateDraft('logoUrl', <url>)` após sucesso.

## Testes de Contrato (API)
- [ ] Depende do endpoint de upload definido na spec 12 (Object Storage) — marcar como bloqueado até a 12 estar implementada, ou testar com mock do endpoint.

## Testes E2E (Integração)
- [ ] Fluxo feliz: usuário sobe um logo e define uma cor primária → Gêmeo Digital reflete ambos imediatamente, sem precisar salvar.
