# ⚡ Sarak UI-Core Quick Start (v9.0)

Este guia ensina como integrar a biblioteca em um novo sistema em menos de 5 minutos, seguindo a arquitetura **Agnóstica e Plug-and-Play**.

---

## 🏗️ Passo 1: O Backend (O Manifesto)
O seu microsserviço deve apenas entregar um JSON em um endpoint. Ele define **O QUE** aparece na tela, mas não **COMO** aparece (o visual é soberania da UI-Core).

**Exemplo (FastAPI):**
```python
@app.get("/module/manifest")
def get_manifest():
    return {
        "id": "meu-modulo-id",
        "label": "Gestão de Vendas",
        "icon": "TrendingUp",
        "visualContracts": [
            { "role": "card", "type": "STATS", "label": "Vendas Hoje" },
            { "role": "primary", "type": "TABLE", "label": "Últimos Pedidos" }
        ]
    }
```

---

## 🧩 Passo 2: O Host (Frontend que importa a Lib)
No seu projeto React, configure o Provider e aponte para o URL do seu backend.

```tsx
import { SarakUIProvider, SarakShell } from '@sarak/lib-ui-core';

export function Main() {
  return (
    <SarakUIProvider 
      options={{
        endpoints: { 
          baseUrl: '/api/ui',     // Onde o tema é salvo
          discovery: ['/api/vendas'] // Onde seu backend está
        }
      }}
    >
      <SarakShell brand={{ name: "Sarak ERP" }} />
    </SarakUIProvider>
  );
}
```

---

## 🎨 Passo 3: O Visual (Aba de Personalização)
Ao rodar o sistema, a aba de **Personalização** aparecerá automaticamente. 
- Use-a para definir as cores, fontes e materiais (Glass, Metal, etc).
- Todas as abas que você adicionou no `discovery` respeitarão essas cores instantaneamente.

---

### 💡 Regra de Ouro
- **Mudança de Estrutura?** (Mudar nome de aba, ícone, colunas): Altere no **Backend**.
- **Mudança de Estética?** (Mudar cor, arredondamento, transparência): Altere na **Interface (Aba Personalização)**.

**Próximo Passo:** [Instalação Detalhada](./01_Installation.md)
