# 📜 Sarak Visual Contracts & Manifest Architecture (v11.0)

Este documento define a especificação industrial para a arquitetura de **Manifestos Baseados em Pastas** e **Contratos Visuais (Zero-Code Frontend)** para qualquer sistema que importe o `@sarak/lib-ui-core`.

---

## 1. Arquitetura da Pasta de Manifestos (`manifests/`)

Para manter o desenvolvimento modular, limpo e em conformidade com a transição para microsserviços, o sistema host **não deve** declarar um único arquivo de manifesto gigantesco. Em vez disso, o host deve estruturar um diretório dedicado `/manifests` na raiz de suas configurações:

```
/src
  /manifests
    ├── brand.json           # Exclusivo: Configurações de Identidade, Marca e Estilos Base
    └── /tabs
         ├── dashboard.json   # Aba 1: Métricas e Indicadores (STATS + CHARTS)
         ├── billing.json     # Aba 2: Faturamento e Cobrança (TABLE + FORM)
         ├── security.json    # Aba 3: Controle IAM e Permissões (EXPANDABLE_MATRIX)
         └── llm-chat.json    # Aba 4: Interface Conversacional (ADVANCED_CHAT)
```

---

## 2. Modelos de Exemplo (Templates JSON)

### 2.1 Manifesto de Marca Exclusivo (`brand.json`)
Este arquivo é o manifesto soberano de identidade corporativa. Ele dita o nome do sistema, logos, regras padrão de navegação e overrides estéticos de fallback.

```json
{
  "brand": {
    "name": "Sarak OS",
    "tagline": "Industrial Operations Engine",
    "logo": "/assets/brand/sarak-logo-industrial.svg",
    "favicon": "/assets/brand/favicon.ico",
    "supportEmail": "support@sarak.io"
  },
  "options": {
    "debug": false,
    "themeBase": "dark",
    "defaultLayout": "sidebar",
    "tokenPersistence": "local-storage"
  },
  "themeOverrides": {
    "headingFont": "'Outfit', sans-serif",
    "bodyFont": "'Inter', sans-serif",
    "monoFont": "'JetBrains Mono', monospace",
    "h1Size": 48,
    "h2Size": 32,
    "bodySize": 14,
    "textColorMaster": "#ffffff",
    "textColorSecondary": "rgba(255, 255, 255, 0.7)",
    "textColorMuted": "rgba(255, 255, 255, 0.4)",
    "headingTransform": "none",
    "textSmoothing": true,
    "textGlowIntensity": 0.15
  }
}
```

---

### 2.2 Manifesto de Aba Individual (`tabs/billing.json`)
Cada arquivo dentro da pasta `/tabs` representa uma aba funcional auto-contida. Ele descreve a identidade do módulo no menu lateral/superior e seus **Contratos Visuais** para renderização.

```json
{
  "id": "mod-billing",
  "label": "Faturamento",
  "icon": "DollarSign",
  "category": "Operações",
  "priority": 200,
  "endpoints": {
    "base": "/api/v1/billing"
  },
  "visualContracts": [
    {
      "id": "billing-stats",
      "type": "STATS",
      "label": "KPIs Financeiros",
      "endpoint": "/api/v1/billing/metrics",
      "importance": "hero"
    },
    {
      "id": "billing-invoices",
      "type": "TABLE",
      "label": "Faturas Emitidas",
      "endpoint": "/api/v1/billing/invoices",
      "density": "compact",
      "mapping": {
        "id": "ID",
        "clientName": "Cliente",
        "amount": "Valor (R$)",
        "dueDate": "Vencimento",
        "status": "Situação"
      },
      "actions": [
        {
          "label": "Estornar",
          "endpoint": "/api/v1/billing/invoices/refund",
          "method": "POST",
          "icon": "RotateCcw"
        },
        {
          "label": "Remover Registro",
          "endpoint": "/api/v1/billing/invoices/delete",
          "method": "DELETE",
          "icon": "Trash"
        }
      ]
    },
    {
      "id": "billing-new-invoice",
      "type": "FORM",
      "label": "Lançar Nova Fatura",
      "endpoint": "/api/v1/billing/invoices/create",
      "formMapping": {
        "clientName": "text",
        "amount": "number",
        "dueDate": "date"
      }
    }
  ]
}
```

---

### 2.3 Manifesto de Aba Individual para Segurança (`tabs/security.json`)
Este exemplo ilustra como estruturar uma matriz expansível de controle de acessos baseada em árvore recursiva utilizando o contrato `EXPANDABLE_MATRIX`.

```json
{
  "id": "mod-security",
  "label": "Segurança e Acessos",
  "icon": "ShieldAlert",
  "category": "Governança",
  "priority": 900,
  "visualContracts": [
    {
      "id": "security-matrix",
      "type": "EXPANDABLE_MATRIX",
      "label": "Matriz de Permissões Recursiva",
      "endpoint": "/api/v1/security/permissions",
      "actions": [
        {
          "label": "Salvar Mapeamento",
          "endpoint": "/api/v1/security/permissions/save",
          "method": "POST"
        }
      ],
      "config": {
        "manifest": {
          "default": {
            "badgeColor": "neutral"
          },
          "levels": {
            "0": {
              "badgeColor": "accent",
              "icon": "Folder"
            },
            "1": {
              "badgeColor": "primary",
              "icon": "Key"
            }
          }
        }
      }
    }
  ]
}
```

---

## 3. Como o Host Integra e Mescla os Manifestos

Para alimentar o `SarakUIProvider` sem acoplamento estático, o sistema host deve mesclar dinamicamente os manifestos individuais na inicialização do aplicativo. Abaixo está o código de integração canônico recomendado para o host:

```tsx
import React, { useMemo } from 'react';
import { SarakUIProvider, SarakShell } from '@sarak/lib-ui-core';

// 1. Importação dos Manifestos Individuais
import brandConfig from './manifests/brand.json';
import dashboardTab from './manifests/tabs/dashboard.json';
import billingTab from './manifests/tabs/billing.json';
import securityTab from './manifests/tabs/security.json';

export const AppBootstrap: React.FC = () => {
    // 2. Mesclagem dinâmica em tempo de compilação/execução
    const mergedManifest = useMemo(() => {
        return {
            brand: brandConfig.brand,
            options: brandConfig.options,
            modules: [
                dashboardTab,
                billingTab,
                securityTab
            ]
        };
    }, []);

    return (
        <SarakUIProvider 
            options={{ 
                manifest: mergedManifest,
                theme: {
                    defaultTheme: brandConfig.options.themeBase === 'dark' ? 'classic' : 'light-neon',
                    extraTokens: brandConfig.themeOverrides // Injeção de tokens granulares de tipografia solicitados pelo manifesto
                }
            }}
            config={brandConfig.themeOverrides} // Injeção de fallback no bootstrap inicial
        >
            <SarakShell 
                brand={mergedManifest.brand} 
                fallback={<div>Reconectando ao barramento de microsserviços...</div>}
            />
        </SarakUIProvider>
    );
};
```

---

## 4. Tipos de Contratos Visuais Suportados

| Contrato Visual | Tipo (`type`) | Descrição | Principais Parâmetros de Configuração |
|---|---|---|---|
| **Métricas KPI** | `STATS` | Mostra cards com valores de métricas e status. | `importance` ("hero", "subtle") |
| **Grade de Tabelas** | `TABLE` | Renderiza dados tubulares interativos com busca. | `mapping` (colunas), `actions` (API actions), `density` |
| **Formulário** | `FORM` | Renderiza inputs dinâmicos para escrita ou filtros. | `formMapping` (chaves e tipos de inputs) |
| **Matriz Recursiva** | `EXPANDABLE_MATRIX` | Exibe estruturas RBAC/IAM expansíveis em árvore. | `config.manifest` (níveis e cores de badges) |
| **Chat de IA** | `ADVANCED_CHAT` | Painel conversacional inteligente e contextual. | `endpoint` (rota de streaming/mensagens) |
| **Gráficos** | `CHART` / `ELITE_CHART` | Motor Recharts/Echarts embarcado e otimizado. | `config` (tipo de gráfico, eixos e séries) |
| **Controles Customizados** | `CUSTOM` | Permite ligar IDs a componentes físicos locais. | `component` (ID do componente registrado) |

---

## 5. Solicitação de Customização Granular de Fontes e Estilos

O motor visual da Sarak permite configurações granulares de altíssima fidelidade (ex: fontes distintas para títulos, textos de corpo, elementos de componente, tamanhos, pesos e cores), tudo de forma 100% declarativa.

O sistema host pode solicitar e parametrizar essas variáveis diretamente na chave `themeOverrides` do arquivo `brand.json`. O compilador dinâmico do `@sarak/lib-ui-core` injetará os tokens diretamente como variáveis CSS globais no DOM, garantindo paridade instantânea.

### Principais Tokens Granulares Suportados:

| Categoria | ID do Token | Padrão (Fallback) | Variável CSS Gerada | Descrição |
|---|---|---|---|---|
| **Famílias** | `headingFont` | `'Outfit', sans-serif` | `--font-heading` | Família de fonte aplicada a títulos (H1, H2, headers). |
| | `bodyFont` | `'Inter', sans-serif` | `--font-main` | Família de fonte para blocos de texto e parágrafos de corpo. |
| | `monoFont` | `'JetBrains Mono', mono` | `--font-mono` | Família de fonte para dados, matrizes, IDs e código. |
| **Hierarquia** | `h1Size` | `48` (pixels) | `--sarak-h1-size` | Tamanho do texto para títulos principais (H1). |
| | `h2Size` | `32` (pixels) | `--sarak-h2-size` | Tamanho do texto para títulos de seção (H2). |
| | `bodySize` | `14` (pixels) | `--sarak-body-size` | Tamanho do texto para o corpo da interface. |
| **Cores** | `textColorMaster` | `#ffffff` | `--sarak-text-main` | Cor principal de títulos e textos em foco. |
| | `textColorMuted` | `rgba(..., 0.4)` | `--sarak-text-muted` | Cor para elementos desativados, hints ou legendas. |
| **Estética** | `headingTransform`| `none` | `--sarak-h-transform`| Capitalização de títulos (`uppercase`, `capitalize`, `none`). |
| | `textGlowIntensity`| `0` (range 0 a 1) | `--sarak-text-glow` | Intensidade do efeito cibernético de neon/brilho sob títulos H1. |

---

> [!NOTE]
> Ao utilizar esta abordagem modular, qualquer novo microsserviço ou aba funcional requer apenas a adição de um novo arquivo JSON na pasta `/tabs`, sem necessitar de novas compilações, testes unitários de interface ou alterações de layout no aplicativo frontend principal.
