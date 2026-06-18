---
tipo: "spec"
titulo: "Agente LLM: Operador de Design e Expansão Estrutural"
dominio: "Design Engine (Sarak UI Core)"
status: "🟢 Vigente"
prioridade: "Alta"
tags: ["spec", "ai-agent", "design-system", "data-driven", "database-only", "architecture", "layout-engine"]
relacionados: ["03-padrao-e-taxonomia-biblioteca-atomica"]
---

# 1. Visão Geral
Esta spec define a arquitetura e limites de atuação do Agente LLM focado em Design. O agente atua puramente como "Operador de Dados de Banco", traduzindo requisições de linguagem natural do usuário em **Registros (Payloads JSON) na Tabela de Temas do Banco de Dados**. Este payload controla tokens visuais (Alavanca 1 - Cores, Geometria) e **Tokens Estruturais** (Alavanca 2 - Arranjos de Layout do DOM). O Agente **NUNCA** interage com o código-fonte.

# 2. Regras de Negócio e Limites de Atuação
- **Regra 1 (No Code / Filesystem Touch):** O agente não altera, lê ou cria arquivos `.ts`, `.tsx`, `.css` ou `.json` do repositório.
- **Regra 2 (Atuação 100% via Banco):** Toda criação de tema ou preset é salva exclusivamente no banco. A aplicação puxa os registros via API.
- **Regra 3 (Catálogo como Dicionário Estrito):** O agente consulta as partições do Catálogo (`src/core/Design/catalog/partitions/*.json`) e **só pode gerar payloads preenchendo chaves existentes**. É proibido inventar novas variáveis (ex: `--sx-nova-variavel`).
- **Regra 4 (Validador de Integridade):** Qualquer tentativa do agente de usar chaves não cadastradas é descartada pelo validador antes do `INSERT`.

# 3. Expansão Estrutural: Data-Driven Layout (Tokens Estruturais)
Para permitir que o agente desenhe recriações de sites estruturalmente diferentes, a **Expansão via Tokens Estruturais (Structural Props)** foi a rota arquitetural aprovada, rejeitando o uso de Composição Headless complexa.

## Dinâmica de Layout Orientado a Dados:
O Agente envia em seu JSON tokens que ditam opções predefinidas:
- `cardLayoutDirection: "row" | "column"`
- `imagePosition: "top" | "left" | "right" | "background"`
- `actionsAlignment: "flex-start" | "space-between"`

Os componentes base atômicos tornam-se receptores flexíveis dessas propriedades para redesenhar a tela.
**Regra Estrita de Paridade:** A lógica condicional de transformação dessas props estruturais em classes utilitárias (Tailwind) ocorre na **Camada 6 (Hook Controlador)**, mantendo o JSX atômico sem poluição visual.

## Fases de Expansão Geométrica:
Para desengessar os componentes antigos e suportar essa inteligência:
1. **Adição de Containers:** Criação de átomos de macro-layout (`SarakGrid`, `SarakFormGroup`).
2. **Refatoração Dinâmica:** Remoção de Tailwind estrutural chumbado (`p-4`, `flex-col`) dos 38 átomos antigos.
3. **Cisão de Átomos:** Quebra de átomos excessivamente complexos.
4. **Auditoria Final:** 0% de ocorrências Tailwind estruturais fixas.

# 4. Critérios de Aceite
- [ ] Agente retorna JSON apenas com chaves válidas.
- [ ] Sistema persiste saída do agente no DB.
- [ ] Agente não realiza commits ou alterações em arquivos locais para temas.
- [ ] Propriedades estruturais reagem instantaneamente reconstruindo o arranjo do card via Hooks Controladores.

# 5. Plano de Testes (Quality Gate)
- **Testes Unitários:** [ ] Validação estrita das chaves do JSON contra o mapeamento no Backend antes de salvar.
- **Testes de Contrato (API):** [ ] Endpoint de gravação valida e persiste relacionalmente o `ThemePayload`.
- **Testes E2E:** [ ] Fluxo LLM -> Backend -> Frontend: Alteração gerada pela IA propaga para a interface redesenhando a UI em tempo real.
