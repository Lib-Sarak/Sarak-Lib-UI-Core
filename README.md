# 💠 Sarak-Lib-UI-Core

O **Sarak-Lib-UI-Core** é o motor de interface industrial de alta performance da Sarak. Ele utiliza uma arquitetura baseada em **Contratos Visuais (Zero-Code Frontend)** e um **Design Engine Data-Driven**, permitindo que sistemas inteiros sejam renderizados e estilizados puramente através de manifestos JSON declarativos, sem necessidade de escrever código de interface repetitivo.

---

## 🚀 Como Funciona

A biblioteca funciona como um barramento centralizado de UI que:
1.  **Orquestra o Design:** Injeta variáveis CSS dinâmicas baseadas em tokens de design.
2.  **Resolve Módulos:** Lê manifestos JSON para descobrir abas, ícones e rotas.
3.  **Renderiza via Contratos:** Utiliza o `DynamicRenderer` para transformar definições de tipo (`TABLE`, `CHART`, `FORM`) em componentes físicos funcionais conectados a APIs.
4.  **Isolamento de Negócio:** Permite que o desenvolvedor foque no backend e nos dados, enquanto a UI é gerada automaticamente.

---

## 📦 Instalação e Importação

Para utilizar o núcleo da Sarak UI no seu projeto React/TypeScript:

### 1. Importação do Provedor e Componentes
No seu arquivo de entrada principal (ex: `App.tsx` ou `main.tsx`), importe o `SarakUIProvider` e o `SarakShell`.

```tsx
import { SarakUIProvider, SarakShell } from '@sarak/lib-ui-core';
import '@sarak/lib-ui-core/dist/style.css'; // Importe os estilos base
```

### 2. Configuração Inicial (Bootstrap)
O `SarakUIProvider` deve envolver toda a aplicação. O `SarakShell` é o componente que renderiza a moldura (menus, headers, etc.).

```tsx
export const App = () => {
    return (
        <SarakUIProvider 
            options={{ 
                manifest: myMergedManifest, // Ver seção "Criação do Manifest"
                theme: { defaultTheme: 'classic' } 
            }}
        >
            <SarakShell 
                user={{ name: "Admin", role: "Manager" }} 
                logout={() => console.log("Logout")}
            />
        </SarakUIProvider>
    );
};
```

---

## 📑 Guia do Manifesto (100% Declarativo)

O Manifesto é o cérebro da sua aplicação. Ele deve ser dividido para manter a modularidade.

### 1. Estrutura Recomendada
Recomendamos criar uma pasta `/manifests` no seu projeto host:
- `brand.json`: Configurações de identidade e marca.
- `tabs/*.json`: Um arquivo para cada aba/módulo funcional do sistema.

### 2. Manifesto de Marca (`brand.json`)
Define a identidade visual e opções globais.

```json
{
  "brand": {
    "name": "Sarak OS",
    "logo": "/assets/logo.svg",
    "supportEmail": "suporte@empresa.com"
  },
  "options": {
    "themeBase": "dark",
    "defaultLayout": "sidebar"
  },
  "themeOverrides": {
    "headingFont": "'Outfit', sans-serif",
    "bodyFont": "'Inter', sans-serif",
    "textColorMaster": "#ffffff"
  }
}
```

### 3. Manifesto de Módulo/Aba (`tabs/vendas.json`)
Cada aba define sua identidade no menu e quais **Contratos Visuais** ela carrega.

```json
{
  "id": "mod-vendas",
  "label": "Vendas",
  "icon": "ShoppingCart",
  "category": "Comercial",
  "priority": 100,
  "endpoints": { "base": "/api/v1/vendas" },
  "visualContracts": [
    {
      "id": "vendas-stats",
      "type": "STATS",
      "label": "Resumo de Vendas",
      "endpoint": "/metrics"
    },
    {
      "id": "vendas-lista",
      "type": "TABLE",
      "label": "Últimos Pedidos",
      "endpoint": "/list",
      "mapping": {
        "id": "Código",
        "customer": "Cliente",
        "total": "Valor Total"
      }
    }
  ]
}
```

---

## 🛠️ Contratos Visuais Suportados

Ao criar um `visualContract` dentro de uma aba, você deve escolher um `type`. Os principais são:

| Tipo | Descrição | Parâmetros Principais |
|---|---|---|
| `STATS` | Cards de métricas e KPIs. | `importance` ("hero", "subtle") |
| `TABLE` | Tabelas de dados com busca e ações. | `mapping`, `actions` |
| `FORM` | Formulários dinâmicos. | `formMapping` (ex: `{"nome": "text"}`) |
| `CHART` | Gráficos (Linha, Barra, Pizza). | `config` (type, axes) |
| `EXPANDABLE_MATRIX` | Matrizes de permissões ou árvores. | `config.manifest` (hierarquia) |
| `ADVANCED_CHAT` | Interface de chat para IA/Suporte. | `endpoint` (streaming) |
| `CUSTOM` | Liga a um componente físico registrado. | `component` (ID do componente) |

---

## 🔌 Integração de Componentes Físicos (`CUSTOM`)

Se o sistema precisar de uma lógica que o JSON não cobre, você pode registrar um componente TSX local:

1. **Registre no código (antes do Shell):**
```tsx
import { registerLocalComponent } from '@sarak/lib-ui-core';
import MyDashboard from './components/MyDashboard';

registerLocalComponent('meu-dash-custom', MyDashboard);
```

2. **Chame no Manifesto:**
```json
{
  "id": "aba-custom",
  "label": "Dashboard Especial",
  "visualContracts": [
    { "id": "c1", "type": "CUSTOM", "component": "meu-dash-custom" }
  ]
}
```

---

## 🎨 Design Engine e CSS Tokens

A biblioteca injeta automaticamente variáveis CSS baseadas no seu manifesto. Você pode utilizá-las nos seus componentes customizados:

- `--sarak-text-main`: Cor de texto principal.
- `--sarak-accent-primary`: Cor de destaque do sistema.
- `--font-heading`: Fonte configurada para títulos.
- `--theme-card`: Cor de fundo para cards e superfícies.

---

> **Nota:** Para detalhes sobre esquemas de validação, consulte o arquivo `sarak-contract.schema.json` na pasta de exemplos da biblioteca.
