# 📜 Manifestos e Contratos (v9.2 Sovereign)

Na arquitetura **Sarak Sovereign**, o manifesto é a "certidão de nascimento" do seu módulo. Ele pode ser entregue via API (Descoberta Ativa) ou injetado localmente (Registro Estático).

## 📡 O Endpoint `/module/manifest`

Cada módulo deve expor uma rota GET que retorna o contrato de interface. Isso permite que a UI mude dinamicamente baseada em permissões ou contexto.

### Estrutura Base
```json
{
  "id": "relatorios-financeiros",
  "label": "Relatórios",
  "icon": "BarChart3",
  "category": "Financeiro",
  "priority": 100,
  "visualContracts": [
    {
      "role": "primary",
      "type": "STATS",
      "label": "Resumo de Vendas",
      "endpoint": "/api/v1/stats"
    }
  ]
}
```

## 🏗️ Injeção Local (v9.2)

Agora o sistema Host pode definir a estrutura de módulos antes mesmo do discovery acontecer, usando o `options.manifest` no Provider:

```tsx
<SarakUIProvider 
  options={{
    manifest: {
      modules: [
        { id: 'vendas', label: 'Vendas', icon: 'ShoppingBag', basePath: '/api/vendas' },
        { id: 'mx-customization', label: 'Design', icon: 'Palette', category: 'Sistema' }
      ]
    }
  }}
>
```

## 🧩 Tipos de Componentes Atômicos

A UI-Core interpreta o `type` e aplica automaticamente o **Industrial Design Engine**:

| Tipo | Descrição |
| :--- | :--- |
| `TABLE` | Grid de dados com filtros e paginação automática. |
| `STATS` | Cards de indicadores (KPIs) com suporte a sparklines. |
| `FORM` | Geração dinâmica de formulários baseada em JSON Schema. |
| `CHART` | Visualização de dados (Line, Bar, Pie) com temas neon. |
| `CHAT` | Interface de conversação para agentes de IA. |

---

## 🔗 Mapeamento de Dados (v9.2)

O mapeamento suporta agora **Dot Notation** para navegar em objetos complexos:

```json
"mapping": {
  "Nome": "user.profile.fullName",
  "Saldo": "account.balance",
  "Status": "flags.active"
}
```

> **Regra de Ouro**: O manifesto é o seu contrato. Se o backend respeitar o formato, a UI garantirá 100% de fidelidade visual e funcional, independente do tema escolhido pelo usuário.

Próximo: [Integração de Sistema](./03_System_Integration.md)
