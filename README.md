# 💠 Sarak-Lib-UI-Core (Design Engine & Visual Contracts)

O **Sarak-Lib-UI-Core** é o motor de interface industrial de alta performance do ecossistema Sarak. Ele utiliza uma arquitetura baseada em **Contratos Visuais (Zero-Code Frontend)** e um **Design Engine Data-Driven**, permitindo que sistemas inteiros sejam renderizados e estilizados puramente através de manifestos declarativos, sem a necessidade de escrever código de interface repetitivo ou hardcoded.

---

## 🤖 Guia Rápido para Agentes IA (Contexto Inicial)

> **Atenção Agente:** Se você está iniciando uma conversa neste repositório, leia esta seção atentamente.

Este módulo é estritamente regulado por 4 skills principais da Sarak que devem ditar o seu comportamento e escolhas de código:

1. **`/ui-arquitetura-design`**: **Regra de Ouro do Design Engine.** NENHUMA propriedade visual (como `margin: 10px`, `color: #fff`, ou `bg-[#050505]`) deve ser inserida de forma "hardcoded" ou "inline" nos componentes. A estilização deve seguir o fluxo pipeline: `Schema → Master Map → CSS Variables → Tailwind Classes`.
2. **`/ui-novo-componente`**: **Regra da Paridade 1:1:1:1:1.** Ao adicionar um novo "token" de design ou componente base, ele deve obrigatoriamente ser refletido em: `Schema TS`, `MasterMap`, `Banco de Dados`, `Gêmeo Digital (Presets)` e `Catálogo JSON`.
3. **`/padrao-escrita`**: Funções curtas (≤ 40 linhas, ≤ 3 níveis aninhamento), modularidade extrema e encapsulamento rigoroso.
4. **`/code-limpeza-projeto`**: Manter a árvore limpa (Zero lixo, TODOs abandonados ou variáveis mortas).

### Integração com Tailwind v4
Este projeto utiliza **Tailwind CSS v4**. Isso significa que as variáveis de cor geradas pelo Design Engine (ex: `--sarak-card-bg` ou `--sarak-bg-base`) são mapeadas no bloco `@theme` no arquivo `src/styles/sarak-base.css` e expostas como variáveis semânticas do Tailwind (`--color-theme-card`, `--color-theme-bg`).
- **NUNCA use:** `bg-[var(--theme-card)]` ou classes dinâmicas arbitrárias de fallback de CSS puro se a variável existir no `@theme`.
- **USE SEMPRE:** As classes semânticas canônicas nativas como `bg-theme-card`, `bg-theme-bg`, `bg-theme-sidebar`, `border-theme-border`, e `text-theme-text`. Elas se encarregam da reatividade nativa e transparência correta sem causar falhas de escurecimento.

---

## 🚀 Como Funciona a Arquitetura

A biblioteca funciona como um barramento centralizado de UI que opera em dois grandes eixos:

### 1. O Design Engine (Motor Visual)
Responsável por orquestrar a estética do sistema de maneira unificada e reativa.
- Ele recebe um JSON de configuração (O "Manifesto" ou "Preset").
- O hook `useDesignVariables` transforma essas definições de alto nível em **CSS Variables Globais**.
- O componente `DesignInjector` pendura essas variáveis no `:root` e no `body` da aplicação de forma transparente.
- Os componentes físicos e o Tailwind CSS (`@theme`) consomem essas variáveis passivamente, gerando mudanças globais instantâneas sem a necessidade de re-renderizações onerosas no React.

### 2. Os Visual Contracts (Motor Lógico)
Aplicações hosts injetam um manifesto estrutural descrevendo o sistema funcional.
O módulo resolve esse JSON descobrindo abas, navegação e rotas, acionando o `DynamicRenderer` para transformar Definições de Tipo (ex: `TABLE`, `CHART`, `FORM`) em componentes físicos perfeitamente conectados a endpoints de API.

---

## 📦 Inicialização e Desenvolvimento

### Comandos Principais
- `npm run dev`: Inicia o **Canvas do Design Engine** e a área de Live Preview local. Essencial para testar novos presets, tipografia e catálogos atômicos.
- `npm run build`: Compila a biblioteca (Gera os bundles JS via `tsup` e compila o CSS via Tailwind CLI) criando a pasta `dist/` pronta para ser consumida como pacote `@sarak/lib-ui-core`.
- `npm run build:js` e `npm run build:css`: Sub-comandos isolados.

### Consumindo na Aplicação Host (SarakUIProvider)
```tsx
import { SarakUIProvider, SarakShell } from '@sarak/lib-ui-core';
import '@sarak/lib-ui-core/dist/sarak.css'; // Importe os estilos base v4

export const App = () => {
    return (
        <SarakUIProvider 
            options={{ 
                manifest: myMergedManifest, 
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

## 📑 O Manifesto Funcional (Visual Contracts)

Cada sistema modular define suas abas através de manifestos.
Exemplo (`tabs/vendas.json`):

```json
{
  "id": "mod-vendas",
  "label": "Vendas",
  "icon": "ShoppingCart",
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

### Contratos Principais Suportados:
| Tipo | Descrição | Parâmetros Principais |
|---|---|---|
| `STATS` | Cards de métricas e KPIs. | `importance` ("hero", "subtle") |
| `TABLE` | Tabelas de dados conectadas com endpoints e busca. | `mapping`, `actions` |
| `FORM` | Formulários dinâmicos com schema inference. | `formMapping` |
| `CHART` | Gráficos (ECharts / Recharts). | `config` (type, axes) |
| `EXPANDABLE_MATRIX` | Matrizes de permissões e árvores hierárquicas. | `config.manifest` |
| `ADVANCED_CHAT` | Interface LLM para IA conversacional de negócio. | `endpoint` |
| `CUSTOM` | Liga um manifest genérico a um componente físico React registrado localmente via código. | `component` (ID) |

---

Mantendo a ordem estrutural e garantindo as normativas de *Design Architecture*, este repositório continua modular, escalável e 100% "Production Ready" para arquiteturas Headless/Zero-Code.
