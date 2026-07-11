---
tipo: "spec"
titulo: "Multi-Preset Diversificado por Eixo na Preview 2"
dominio: "Design Engine (Sarak UI Core) — agent-design-operator"
status: "🔴 A Implementar"
prioridade: "Média"
tags: ["spec", "ai-agent", "presets", "preview"]
relacionados: ["02-mapeamento-semantico-rag-catalogo", "03-separacao-estrutural-chat-acao", "06-presets-engine"]
---

# 1. Visão Geral
Pedidos plurais ("crie vários presets de cards com bordas e efeitos diferentes", "mostre todas as texturas disponíveis", "mostre todas as fontes disponíveis") devem resultar em **múltiplas** sugestões visivelmente distintas na Preview 2 (Preset 2) — não N variações que só mudam a cor do mesmo tema base. O contrato de dados pra isso (`DesignAgentPromptResult.componentPresets: DesignAgentComponentPreset[]`, `useAgentGeneratedPresets.addComponentPresets`) já existe e já renderiza em `PresetsCatalog`/catálogas irmãs (Cards/Buttons/Inputs/Typography/Atmosphere) — o que falta é o agente saber *pedir* isso de forma diversificada.

# 2. Regras de Negócio
- **Regra 1 (Depende do eixo — Spec 02):** cada token tem uma classificação `axis` (`color`/`geometry`/`elevation`/`texture`/`density`/`motion`). Quando o pedido é plural, a Chamada B (spec 03) recebe instrução de gerar N variações, cada uma com um eixo dominante diferente — variação 1 varia geometria, variação 2 varia textura, variação 3 varia elevação, etc. — evitando que todas as variações sejam só recolorizações.
- **Regra 2 (Detecção de pedido plural):** heurística simples no prompt da Chamada B: se o pedido do usuário contém sinais de pluralidade/exaustividade ("vários", "todas as", "algumas opções de", "diferentes"), o agente é instruído a devolver `componentPresets` com múltiplas entradas em vez de um único `themePatch`.
- **Regra 3 (Categoria mapeada pro catálogo de destino):** cada entrada de `componentPresets[].category` precisa mapear pra uma das categorias já existentes em `PresetsCatalog` (`cards`, `buttons`, `inputs`, `typography`, `atmosphere`) — sem categoria nova sem que a Frente 1 (spec 01) primeiro confirme que ela é uma família real do catálogo.
- **Regra 4 (Sem mudança de plumbing no frontend):** `useAgentGeneratedPresets.addComponentPresets` e a renderização em `PresetsCatalog`/`CardsCatalog`/etc. (já implementadas) não mudam — esta spec é só sobre o backend/prompt saber popular esse array de forma diversificada.
- **Regra 5 (Teto de variações):** limitar a N variações por resposta (ex.: 6) — evita respostas gigantes/custosas e listas longas demais pra comparação visual útil na Preview 2. Valor exato de N é uma decisão de produto, não travada nesta spec.

# 3. Critérios de Aceite
- [ ] Pedido plural detectado corretamente na maioria dos casos de teste manuais (não precisa ser NLP sofisticado — heurística de palavras-chave é aceitável nesta fase).
- [ ] Cada variação gerada num pedido plural varia um eixo dominante diferente das demais (verificação qualitativa/manual, comparando os `design` de cada entrada).
- [ ] `componentPresets[].category` sempre corresponde a uma aba real de `PresetsCatalog`.
- [ ] Número de variações por resposta respeita o teto definido.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** a heurística de detecção de pedido plural classificar corretamente um conjunto de frases de exemplo (positivas e negativas).
- [ ] **Deve** o número de variações geradas nunca exceder o teto configurado.

## Testes de Contrato (API)
- [ ] **Endpoint** `POST /api/design-agent/prompt`: quando o pedido é plural, `payload`/`componentPresets` retorna um array com mais de 1 entrada, cada uma com `category` válida.

## Testes E2E (Integração)
- [ ] Fluxo feliz: "mostre 3 presets de cards com texturas diferentes" → 3 cards aparecem na aba "Cards" da Preview 2, visivelmente distintos entre si (não só tonalidade de cor).

# 5. Heurística de Detecção de Pedido Plural (lista exata)

Implemente como checagem simples de substring (case-insensitive, sem acento — normalize o texto antes) contra esta lista. Não é NLP — é um filtro rápido que decide se a Chamada B (spec 03) recebe a instrução de gerar variações em vez de um único patch.

```ts
const PLURAL_REQUEST_KEYWORDS = [
  'vários', 'varios', 'algumas opções', 'algumas opcoes', 'diferentes opções',
  'mostre todas', 'mostrar todas', 'todas as texturas', 'todas as fontes',
  'algumas variações', 'algumas variacoes', 'opções de', 'opcoes de',
  'alguns exemplos', 'me dê opções', 'me de opcoes', 'compare',
];

function isPluralRequest(userPrompt: string): boolean {
  const normalized = userPrompt.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return PLURAL_REQUEST_KEYWORDS.some(kw => normalized.includes(kw.normalize('NFD').replace(/[̀-ͯ]/g, '')));
}
```

Falso-negativo (pedido plural não detectado) é aceitável — o agente simplesmente gera 1 variação, comportamento padrão. Falso-positivo é mais custoso (gera N chamadas quando bastava 1) mas não é incorreto — mantenha a lista enxuta, não tente cobrir 100% dos casos.

# 6. Prompt Adicional pra Chamada B (quando `isPluralRequest` = true)

Anexe isto ao prompt da Chamada B (spec 03, Seção 5.2), logo antes de `[TOKENS DISPONÍVEIS]`:

```
[MODO MÚLTIPLAS VARIAÇÕES]
O usuário pediu várias opções. Gere entre 2 e 6 variações distintas (nunca mais que 6 — Regra 5).
Cada variação DEVE ter um eixo visual dominante diferente das outras (cor, geometria, elevação,
textura, densidade ou movimento — os eixos dos tokens disponíveis abaixo indicam a qual eixo cada
um pertence). NÃO gere variações que só mudam a cor — isso é o erro mais comum, evite-o
ativamente. Responda no formato:

{"componentPresets": [
  {"category": "cards", "design": {"tokenA": valor}},
  {"category": "cards", "design": {"tokenB": valor}}
]}

em vez do formato de patch único ({"tokenX": valor}).
```

## Exemplo completo (pedido → saída esperada)

**Pedido:** "crie 3 presets de cards com bordas e efeitos diferentes"

**Saída esperada da Chamada B** (note que cada entrada varia um eixo dominante — geometria, elevação, textura — não só cor):
```json
{"componentPresets": [
  {"category": "cards", "design": {"cardBorderRadius": 24, "cardBorderWidth": 0}},
  {"category": "cards", "design": {"cardShadowBlur": 40, "cardShadowSpread": 8, "cardGlowColor": "rgba(0,242,255,0.3)"}},
  {"category": "cards", "design": {"cardTextureType": "grid", "cardTextureOpacity": 0.08}}
]}
```

`category: "cards"` mapeia direto pra aba "Cards" de `PresetsCatalog` — usar sempre os nomes de categoria já existentes (`cards`, `buttons`, `inputs`, `typography`, `atmosphere` — ver Regra 3 da Seção 2).
