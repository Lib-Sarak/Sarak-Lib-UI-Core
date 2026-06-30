# Índice de Implementação das Especificações (Por Complexidade)

Este guia define a ordem recomendada para a implementação das especificações presentes na pasta `plan`, ordenadas da **maior complexidade estrutural para a menor**.

## Nível 1: Alta Complexidade (Arquitetura e Refatoração Estrutural)

1. **[07 - Agente LLM: Operador de Design e Expansão Estrutural](./07-agente-llm-design-e-expansao-estrutural.md)**
   - **Por que é o mais complexo:** Exige refatoração profunda de 38 átomos antigos para remover Tailwind hardcoded, criação de novos containers de macro-layout e validação estrita de payloads JSON via banco de dados para permitir layouts puramente data-driven.

2. **[10 - Responsividade e Isolamento de Viewport no Gêmeo Digital](./10-responsividade-gemeo-digital.md)**
   - **Por que é o mais complexo:** Demanda uma quebra do padrão tradicional de Media Queries do CSS para garantir que o Gêmeo Digital responda ao seu próprio container simulado e não ao viewport do monitor. Envolve mudanças arquiteturais na forma como a responsividade é tratada no sistema inteiro.

## Nível 2: Média Complexidade (Integração e Dados)

3. **[13 - Revisão e Gestão de Brand (Logo, Cores e Brandbook)](./13-revisao-e-upload-de-brand.md)**
   - **Por que é complexo:** Envolve integração com Object Storage para upload de arquivos, lógica de geração automática de escalas de cores e mapeamento reativo de tipografia direto no Payload JSON.

4. **[11 - Enriquecimento de Presets Modulares e Diversidade Visual](./11-enriquecimento-presets-visuais.md)**
   - **Por que é complexo:** Depende de um fluxo obrigatório de Human-in-the-Loop (HITL) e a expansão considerável da base de dados e tipagens (TS) para suportar diversos presets estéticos complexos e radicais.

5. **[12 - Expansão e Hospedagem de Mídias de Atmosfera](./12-expansao-midias-atmosfera.md)**
   - **Por que é complexo:** Requer setup de infraestrutura externa (Object Storage via Supabase/S3), rotinas de otimização pesada de mídias (conversão para WebP/WebM, controle de tamanho e loop) e conexão dessas URLs geradas com o catálogo da biblioteca.

## Nível 3: Baixa Complexidade (Condicionais e Débito Técnico)

6. **[14 - Controle de Visibilidade da Aba Design Engine](./14-visibilidade-aba-design-engine.md)**
   - **Por que é simples:** Trata-se de uma melhoria pontual de Inversão de Controle, passando a exigir uma prop (`showDesignEngineTab`) no `SarakUIProvider` para renderizar condicionalmente a aba de navegação.

7. **[15 - Revisão e Limpeza de Marcadores TODO](./15-revisao-marcadores-todo.md)**
   - **Por que é simples:** É uma tarefa puramente operacional de varredura de débito técnico. Consiste em validar 233 marcações `TODO`, deletar arquivos órfãos e converter itens necessários em *skipped tests* vinculados ao Jira/Backlog.
