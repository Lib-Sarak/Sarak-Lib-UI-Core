---
tipo: "spec"
titulo: "Contrato do Importador e Manifest Renderer"
dominio: "Sarak-Lib-UI-Core (Arquitetura Suprema)"
status: "🟢 Implementado"
prioridade: "Crítica"
tags: ["spec", "architecture", "renderer", "integration"]
relacionados: ["08-consumo-externo-e-integracao", "31-fonte-de-dados-declarativa", "33-composicao-pagina-rota-shell"]
---

# 1. Visão Geral
Esta é a Spec fundamental que finaliza a conversão da biblioteca Sarak. Ela descreve o Entrypoint (A Porta de Entrada) do Sarak UI. É o arquivo/contrato que dita o que o sistema consumidor (ex: O Site Earendel) deve invocar e injetar para iniciar todo o motor lógico do Agente JSON e desenhar a aplicação.

# 2. Regras de Negócio
- **Regra 1: O Componente Raiz `<SarakManifestRenderer />`:** Este será o único componente que a biblioteca Sarak exportará publicamente para os casos de automação total. Componentes isolados (como `SarakButton`) continuam acessíveis, mas a mágica do JSON ocorre somente dentro deste motor raiz.
- **Regra 2: Assinatura TypeScript do Contrato:** O componente raiz deve exigir estritamente:
  - `payload`: A string/objeto do JSON.
  - `dataStore`: O objeto/contexto global com as variáveis locais para a interpolação.
  - `networkInterceptor`: Uma função Global provida pelo Importador para processar as `api_calls` do JSON (permitindo injetar tokens JWT corporativos).
  - `routerInterceptor`: Uma função para processar os `navigates` do JSON (para que a Sarak acione o `router.push` do Next.js do importador, por exemplo).
- **Regra 3: Tratamento de Fallback Crítico:** Se o `payload` injetado pelo importador estiver malformado, o Renderer deve acionar seu Error Boundary Base instantaneamente informando "Manifesto de UI Inválido" no Console.

# 3. Critérios de Aceite
- [ ] O componente exige as 4 chaves cruciais via TypeScript para complilação correta.
- [ ] As ações do Event Bus disparam e atravessam com sucesso os interceptadores injetados pelo consumidor (provando que o Agente Sarak consegue chamar a API autenticada externa).

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** validar que a não entrega da função `networkInterceptor` pelo importador levanta um aviso em desenvolvimento se uma `api_call` tentar ser executada.

## Testes de Contrato (API)
- [ ] **Deve** consolidar o arquivo `src/index.ts` final com os exports limpos apenas para o Manifesto de Contrato e suas Interfaces TS equivalentes.

## Testes E2E (Integração)
- [ ] Montagem Total: Forjar um servidor de testes que provém o `networkInterceptor` via Contexto e garantir que um clique gerado totalmente pelo JSON desencadeie a subrotina final isolada no framework host.
