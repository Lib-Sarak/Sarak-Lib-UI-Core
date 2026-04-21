# 📑 Contratos Visuais e Mapeamento de Dados

O componente central do agnotiscismo na Sarak Matrix é o **Visual Contract**. Ele permite que um módulo dite *o que* exibir sem precisar saber *como* renderizar.

## 1. Tipos de Contratos Disponíveis

| Tipo | Uso Recomendado | Componente Core |
| :--- | :--- | :--- |
| `CARD_GRID` | Listagem de itens com imagem/ícone e metadados rápidos. | `SarakCardGrid` |
| `TABLE` | Gestão de dados densos, logs e listas extensas. | `SarakTable` |
| `STATS` | Dashboards de indicadores e métricas financeiras. | `SarakStats` |
| `MANAGEMENT_GRID` | Interface avançada com agrupamento e ações por linha. | `SarakManagementGrid` |
| `FORM` | Captura de dados e configurações dinâmicas. | `SarakForm` |
| `CHAT_INTERFACE` | Experiências de conversação e LLM Playground. | `SarakChat` |
| `CHART` | Visualização de dados analíticos (Linha, Barra, Pizza). | `SarakChart` |

## 2. A Lógica de Mapeamento (`mapping`)

O objeto `mapping` é o tradutor entre o seu **JSON de Backend** e as **Props da UI**. Ele utiliza "Dot Notation" para acessar campos aninhados.

### Exemplo Prático:

**Seu Backend retorna este JSON:**
```json
{
  "id": "model_01",
  "display_name": "GPT-4o",
  "details": {
    "provider": "OpenAI",
    "cost": 0.015
  }
}
```

**Seu Manifesto deve mapear assim:**
```json
"mapping": {
  "title": "display_name",
  "subtitle": "details.provider",
  "price": "details.cost"
}
```

## 3. Como Servir as Informações (Backend)

Para que a renderização automática funcione, o seu endpoint de dados deve seguir estas regras:

1.  **Estrutura de Lista**: Para Grids e Tables, o endpoint deve retornar um **Array de Objetos** ou um objeto contendo uma chave com o array (o Core tentará localizar a lista automaticamente).
2.  **Chave Primária**: Cada objeto **deve** possuir um campo `id` ou `uuid` único.
3.  **Tipagem Consistente**: Se um mapeamento espera um número (ex: métricas no `STATS`), certifique-se de que o backend envie um tipo numérico ou uma string formatada pronta para exibição.

## 4. Definição de Ações (`actions`)

Você pode injetar inteligência nos contratos através do array de `actions`. Isso criará botões automaticamente na UI que executam chamadas via API:

```json
"actions": [
  {
    "label": "REINICIAR",
    "endpoint": "/api/v1/worker/restart",
    "method": "POST",
    "icon": "RotateCw"
  }
]
```

---
[Anterior: Design Engine](./1-design-engine-v10.md) | [Próximo: Guia do Módulo Soberano](./3-guia-do-modulo-soberano.md)
