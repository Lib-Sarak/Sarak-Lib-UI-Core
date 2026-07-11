---
tipo: "spec"
titulo: "Pipeline de Visão em 2 Estágios (Imagem → Perfil Visual → Valores de Token)"
dominio: "Design Engine (Sarak UI Core) — agent-design-operator"
status: "🔴 A Implementar"
prioridade: "Média"
tags: ["spec", "ai-agent", "vision", "multimodal"]
relacionados: ["05-ingestao-multimodal-html", "02-mapeamento-semantico-rag-catalogo", "03-separacao-estrutural-chat-acao"]
---

# 1. Visão Geral
Quando o usuário envia uma imagem (upload direto, ou extraída de um link/PDF/PPT pela spec 05), pedir para o mesmo modelo "ver a imagem e já escolher os tokens do catálogo" numa única chamada mistura duas competências distintas (percepção visual e conhecimento do dicionário de tokens) e tende a produzir resultados menos confiáveis. Esta spec define um pipeline em 2 estágios que separa essas responsabilidades, reaproveitando a arquitetura de duas-chamadas já definida na spec 03.

# 2. Regras de Negócio
- **Regra 1 (Estágio 1 — Percepção):** um modelo com capacidade de visão (escolha do importador — mesma regra de sempre, o módulo `agent-design-operator` não decide qual modelo usar) recebe a imagem e devolve um "perfil visual" estruturado: paleta de cores dominante, densidade percebida (compacto/espaçoso), estilo tipográfico percebido (serifada/sans/display), "mood"/atmosfera (ex.: corporativo, lúdico, minimalista, noturno). Sem qualquer menção a tokens do catálogo neste estágio — é pura descrição do que foi visto.
- **Regra 2 (Estágio 2 — Mapeamento):** o perfil visual do Estágio 1, combinado com o pedido textual do usuário e o retrieval semântico da spec 02, alimenta a mesma Chamada B (spec 03) que já converte intenção em valores de token — sem pipeline novo de "ação", reaproveita o existente.
- **Regra 3 (Dependência explícita de capability do modelo):** nem todo modelo (principalmente free-tier) tem suporte a visão. Se o modelo configurado pelo importador (`DESIGN_AGENT_LLM_PROVIDER`/`_MODEL`) não suporta visão e uma imagem é enviada, o agente deve responder com erro claro ("este modelo não processa imagens, configure um modelo com suporte a visão") em vez de falhar silenciosamente ou tentar mesmo assim.
- **Regra 4 (Imagem nunca vira token diretamente):** o Estágio 1 nunca gera valores de token — só descrição. Isso garante que toda decisão de "qual token usar pra expressar X" passe pelo mesmo funil de validação (`ThemeValidator`) que qualquer outro pedido, visual ou textual.

# 3. Critérios de Aceite
- [ ] Upload de imagem (via `SarakUploader`, componente já existente na lib) chega ao backend do agente.
- [ ] Estágio 1 produz um perfil visual estruturado e plausível para um conjunto de imagens de teste (screenshots de sites reais, logos).
- [ ] Estágio 2 consome o perfil visual e gera um payload validado, sem tentar reinventar o mapeamento de percepção → token fora do fluxo já estabelecido pela spec 03.
- [ ] Erro claro e específico quando o modelo configurado não suporta visão.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** o Estágio 1 nunca incluir nomes de token/chaves do catálogo na sua saída (separação de responsabilidade verificável).
- [ ] **Deve** o sistema detectar e reportar corretamente quando uma imagem é enviada mas o modelo configurado não suporta visão.

## Testes de Contrato (API)
- [ ] **Endpoint** de prompt aceita anexo de imagem (formato de entrada a definir junto com a spec 05, já que ambas tratam de upload).

## Testes E2E (Integração)
- [ ] Fluxo feliz: usuário sobe uma imagem de referência (ex.: screenshot de um site) → resultado final (Preset 1/2) reflete características plausíveis da imagem (paleta, densidade) — validação qualitativa/manual.

# 5. Schema Exato do "Perfil Visual" (saída do Estágio 1)

```ts
interface VisualProfile {
  dominantColors: string[];      // 3-5 cores em hex, ordenadas da mais pra menos dominante. Ex: ["#0d1117", "#58a6ff", "#f0f6fc"]
  density: 'compact' | 'balanced' | 'spacious';
  typographyStyle: 'serif' | 'sans-serif' | 'display' | 'monospace';
  cornerStyle: 'sharp' | 'rounded' | 'pill';   // pistas de geometria observadas (bordas de botões/cards na imagem)
  mood: string[];                 // 2-4 adjetivos livres, ex: ["corporativo", "minimalista", "noturno"]
  hasVisibleTexture: boolean;     // grão, ruído, gradientes complexos visíveis?
}
```

## 5.1. Prompt do Estágio 1 (visão)

```
Você é um analista visual. Observe a imagem anexada e descreva SOMENTE o que você vê,
sem mencionar nomes técnicos de propriedades de nenhum sistema de design.

Responda EXCLUSIVAMENTE com um JSON no formato:
{
  "dominantColors": ["#hex1", "#hex2", "#hex3"],
  "density": "compact" | "balanced" | "spacious",
  "typographyStyle": "serif" | "sans-serif" | "display" | "monospace",
  "cornerStyle": "sharp" | "rounded" | "pill",
  "mood": ["adjetivo1", "adjetivo2"],
  "hasVisibleTexture": true | false
}

Nenhum texto fora do JSON. Se não conseguir identificar um campo com confiança, use sua melhor
estimativa — nunca deixe um campo vazio.
```

## 5.2. Como o Estágio 2 consome isso

O `VisualProfile` vira parte do "pedido do usuário" que alimenta a Chamada B da spec 03 — concatenado ao texto original do usuário antes do retrieval semântico (spec 02) e antes do prompt final:

```ts
const visualProfile = await runVisionStage(uploadedImage); // Estágio 1
const enrichedPrompt = `${userPrompt}\n\n[REFERÊNCIA VISUAL ANALISADA]\n${JSON.stringify(visualProfile)}`;
const relevantTokens = await retrieveRelevantTokens(enrichedPrompt, embeddingsProviderName); // spec 02, mesma função
// enrichedPrompt + relevantTokens seguem pro prompt da Chamada B (spec 03, Seção 5.2) normalmente —
// nenhuma chamada nova de LLM além do Estágio 1; o Estágio 2 REAPROVEITA a Chamada B já existente.
```

# 6. Detecção de Suporte a Visão (Regra 3)

Não existe uma forma universal de "perguntar" a um provider se um modelo suporta visão antes de chamar. Abordagem pragmática: tente a chamada; se o provider devolver um erro de formato/modalidade não suportada (mensagens tipicamente contêm `"image"`, `"vision"`, `"modality"` no corpo do erro — inspecionar `error.response.data` de cada provider), capture e traduza pra uma mensagem clara ao usuário em vez de deixar o erro cru subir:

```ts
try {
  return await runVisionStage(uploadedImage);
} catch (err) {
  const msg = JSON.stringify(err?.response?.data || err.message).toLowerCase();
  if (msg.includes('image') || msg.includes('vision') || msg.includes('modality')) {
    throw new Error('O modelo configurado (DESIGN_AGENT_LLM_MODEL) não processa imagens — configure um modelo com suporte a visão para usar este recurso.');
  }
  throw err; // outro tipo de erro, propaga normalmente
}
```
