# 📜 Manifestos e Contratos (v9.0)

Na arquitetura **Sarak Sovereign**, o manifesto não é mais um arquivo estático no seu frontend. Ele é uma **Resposta de API** entregue pelo seu microsserviço.

## 📡 O Endpoint `/module/manifest`

Cada módulo deve expor uma rota GET que retorna o contrato de interface. Isso permite que a UI mude dinamicamente baseada em permissões, status do sistema ou contexto do usuário.

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

## 🏗️ Contratos Visuais (Agnósticos)

Os contratos visuais permitem que o seu backend solicite componentes sem se preocupar com o design final. A UI-Core interpreta as propriedades e aplica o tema atual.

| Propriedade | Descrição | Exemplo |
| :--- | :--- | :--- |
| `role` | O papel semântico do componente | `primary`, `neutral`, `danger` |
| `type` | O tipo atômico de renderização | `TABLE`, `STATS`, `FORM`, `CHART` |
| `endpoint` | Onde buscar os dados reais para este componente | `/api/venda/list` |
| `density` | A densidade visual desejada | `compact`, `standard` |

---

## 🔗 Mapeamento de Campos (Mapping)

O objeto `mapping` vincula as chaves do seu JSON de dados aos nomes que aparecerão na interface:

```json
{
  "id": "contract-01",
  "type": "TABLE",
  "label": "Dispositivos Ativos",
  "endpoint": "/api/v1/devices",
  "mapping": {
    "Número Serial": "sn",
    "Temperatura": "telemetry.temp",
    "Status": "status"
  }
}
```

> **Regra de Ouro**: O manifesto descreve **O QUE** exibir. O motor de design da Sarak decide **COMO** exibir baseado na aba de Personalização.

Próximo: [Integração de Sistema](./03_System_Integration.md)
