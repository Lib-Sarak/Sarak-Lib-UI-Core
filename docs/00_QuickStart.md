# ⚡ Sarak UI-Core Quick Start (v9.2 Sovereign)

Este guia ensina como integrar a biblioteca em um novo sistema seguindo a arquitetura **Industrial e Descentralizada**.

---

## 🏗️ Passo 1: O Backend (O Manifesto)
O seu microsserviço deve apenas entregar um JSON em um endpoint. Ele define **O QUE** aparece na tela, mas não **COMO** aparece (o visual é soberania da UI-Core).

**Exemplo (FastAPI):**
```python
@app.get("/module/manifest")
def get_manifest():
    return {
        "id": "vendas-service",
        "label": "Gestão de Vendas",
        "icon": "TrendingUp",
        "category": "Negócios",
        "visualContracts": [
            { "role": "card", "type": "STATS", "label": "Vendas Hoje" },
            { "role": "primary", "type": "TABLE", "label": "Últimos Pedidos" }
        ]
    }
```

---

## 🧩 Passo 2: O Host (Frontend que importa a Lib)
No seu projeto React, memorize as configurações para garantir estabilidade visual.

```tsx
import { useMemo } from 'react';
import { SarakUIProvider, SarakShell } from '@sarak/lib-ui-core';

export function App() {
  // Configurações estáveis impedem resets indesejados da Design Engine
  const designConfig = useMemo(() => ({
    theme: 'glass',
    mode: 'dark'
  }), []);

  return (
    <SarakUIProvider 
      config={designConfig}
      token={myAuthToken} // Passagem direta para independência de módulos
      options={{
        endpoints: { 
          baseUrl: '/api/ui',
          discovery: ['/api/vendas', '/api/estoque']
        },
        persistence: { strategy: 'hybrid' }
      }}
    >
      <SarakShell brand={{ name: "Sarak ERP" }} />
    </SarakUIProvider>
  );
}
```

---

## 🎨 Passo 3: O Visual (Persistência)
A v9.2 introduz a **Soberania do LocalStorage**:
- As alterações feitas na interface de **Personalização** têm prioridade absoluta sobre o `config` inicial.
- Para resetar o visual para o padrão do código, limpe o localStorage ou use o botão "Reset" na interface.

---

### 💡 Regra de Ouro (v9.2)
- **IDs de Módulos**: Devem ser exatos. Se o backend retornar `vendas-service`, use esse ID em qualquer referência cruzada.
- **Tokens**: Sempre use o `SarakUIProvider` para propagar o token; ele será injetado automaticamente em todos os sub-módulos.

**Próximo Passo:** [Manifestos e Contratos](./02_Manifest_Contracts.md)
