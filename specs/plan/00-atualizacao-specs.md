# Plano de Atualização das Especificações (spec-atualizar)

Devido ao grande volume de arquivos e à complexidade das mudanças (evolução de um Motor de Temas para uma Engine Declarativa completa), a transferência das documentações de `specs/plan/` para as pastas definitivas (`specs/specs/` e `specs/arquitetura/`) será dividida em **5 Blocos Lógicos**. 

Isto garante segurança, organização e evita a sobreposição de regras. Cada bloco será executado sequencialmente, exigindo aprovação via HITL antes de migrar os arquivos.

## Bloco 1: A Nova Fundação e Erradicação do Any
Este bloco foca em atualizar os documentos centrais de arquitetura com a realidade da tipagem rigorosa e do novo modelo do módulo.
- **Entradas (`plan/`):** 
  - `60-erradicacao-any-plano-mestre.md` até `65-foundation-design-state.md`
  - `01-plano-mestre-expansao-generica.md`, `02-plano-mestre-expansao-logica-e-dados.md`
- **Destino (`arquitetura/` e `specs/`):**
  - Atualização do manifesto arquitetural principal para incluir a lei do Zero Any.
  - Criação de documento específico sobre o Foundation Design State.

> **Status de Execução (Bloco 1):** ✅ CONCLUÍDO
> - **[Modificado]** `specs/specs/00-manifesto-arquitetural-ui-core.md` (Adição das regras Zero Any Estrito e Engine Declarativa).
> - **[Criado]** `specs/arquitetura/05-diretriz-zero-any-e-foundation.md` (Consolidação das Specs 60 a 65).
> - **[Criado]** `specs/arquitetura/06-plano-diretor-expansao-visual.md` (Consolidação do Plano Mestre Genérico 01).
> - **[Criado]** `specs/arquitetura/07-plano-diretor-engine-declarativa.md` (Consolidação do Plano Mestre Lógica e Dados 02).
> - **[Specs Absorvidas (`plan/`)]:** `60`, `61`, `62`, `63`, `64`, `65`, `01` e `02`.

## Bloco 2: A Expansão Visual Atômica
Consolidação dos novos componentes e o conceito de responsividade como dado.
- **Entradas (`plan/`):**
  - `10-expansao-micro-layout.md` até `16-responsividade-como-dado.md`
- **Destino (`specs/`):**
  - Mesclagem com o `03-padrao-e-taxonomia-biblioteca-atomica.md` ou criação de um novo documento `10-taxonomia-estendida-e-responsividade.md`.

> **Status de Execução (Bloco 2):** ✅ CONCLUÍDO
> - **[Criado]** `specs/specs/10-taxonomia-estendida-e-responsividade.md` (Documento mestre absorvendo todas as expansões visuais, estruturais e responsividade guiada por dados).
> - **[Specs Absorvidas (`plan/`)]:** `10`, `11`, `12`, `13`, `14`, `15` e `16`.

## Bloco 3: A Revolução da Engine Declarativa (O Coração)
Migração do núcleo funcional (Low-Code/No-Code), que é a maior novidade arquitetural.
- **Entradas (`plan/`):**
  - Série `20-manifest-schema...` até `34-conferencia-funcional-do-manifesto.md` (ManifestNode, Pipes, Dispatcher, DataStore, Error Boundaries, etc).
- **Destino (`arquitetura/` e `specs/`):**
  - Criação de um novo subdiretório ou um grande documento `11-engine-declarativa-e-manifestos.md`.

> **Status de Execução (Bloco 3):** ✅ CONCLUÍDO
> - **[Criado]** `specs/specs/11-engine-declarativa-e-manifestos.md` (Documento mestre consolidando a arquitetura do Manifest Renderer, DataStore, Dispatcher, Parsers e Safe Evaluator).
> - **[Specs Absorvidas (`plan/`)]:** `20`, `21`, `22`, `23`, `24`, `25`, `26`, `27`, `28`, `29`, `30`, `31`, `32`, `33` e `34`.

## Bloco 4: Blindagem e Segurança
Garantia de que a fronteira de confiança, introduzida pela execução de lógicas em JSON, esteja oficialmente documentada.
- **Entradas (`plan/`):**
  - `40-modelo-de-seguranca-e-fronteira-de-confianca.md`, `41-contrato-de-acessibilidade.md`, `42-ponte-tema-designscope.md`.
- **Destino (`specs/`):**
  - Consolidar como novas especificações oficiais (ex: `12-modelo-de-seguranca.md`).

> **Status de Execução (Bloco 4):** ✅ CONCLUÍDO
> - **[Criado]** `specs/specs/12-modelo-de-seguranca-e-acessibilidade.md` (Documento mestre absorvendo o manual de purificação HTML, o contrato de Acessibilidade ARIA e a blindagem contra vazamento do DesignScope).
> - **[Specs Absorvidas (`plan/`)]:** `40`, `41` e `42`.

## Bloco 5: Ecossistema de Skills (Nova Exigência)
Como a Engine ganhou superpoderes lógicos, os agentes precisarão de novas skills para orquestrar essas funcionalidades.
- **Criação/Atualização de Skills:**
  - `ui-escrever-manifesto`: Skill para construir e validar as lógicas, IFs e repetições dentro dos JSONs.
  - `ui-novo-pipe`: Skill focada em adicionar novos formatadores de dados.
  - `ui-auditoria-manifesto`: Skill para validar amarras lógicas e de estado no Manifesto JSON.
  - (Opcional) Refinamento nos scripts de `ui-novo-componente` e `ui-refatorar-componente` para apontarem para o orquestrador unificado (`auditor_paridade.mjs`).

---
> ⚠️ **Ação Necessária (HITL):** Você aprova este particionamento em 5 blocos? Se sim, me dê o sinal verde para iniciar a execução do **Bloco 1**, onde lerei o conteúdo correspondente e formatarei os arquivos definitivos para sua aprovação final.
