# 🛡️ Guia do Módulo Soberano

Este guia explica como criar um novo módulo que segue os padrões da Sarak Matrix v6.5 e se integra automaticamente ao ecossistema.

## 1. Estrutura Padrão

Todo módulo deve possuir, no mínimo, esta estrutura de arquivos no diretório `src/`:

```text
src/
├── api.ts          # Configuração Axios/API local
├── index.tsx        # Ponto de entrada e Export do Manifesto
├── components/      # Componentes customizados (se houver)
└── styles/          # CSS específico do módulo
```

## 2. O Ponto de Entrada (`index.tsx`)

O arquivo `index.tsx` é o que o sistema principal consome. Ele deve exportar o manifesto e, opcionalmente, um componente "Wrapper" para telas extremamente customizadas.

```tsx
import { ModuleManifest } from '@sarak/lib-ui-core';
import { Settings } from './components/Settings';

export const MyModuleManifest: ModuleManifest = {
  id: "my-module",
  label: "Meu Novo Módulo",
  icon: "Zap",
  category: "Utilities",
  version: "1.0.0",
  priority: 5,
  endpoints: {
    base: "/api/v1/my-module"
  },
  visualContracts: [
    {
      id: "main_config",
      type: "MANAGEMENT_GRID",
      label: "Configuração",
      endpoint: "/config",
      tab: "Geral"
    }
  ]
};

// Export opcional de componente raiz (se não for usar 100% manifesto)
export default Settings;
```

## 3. Desenvolvimento Standalone

Para testar seu módulo sem precisar rodar todo o Portal Sarak:

1.  Rode seu backend localmente.
2.  No seu `index.tsx` ou em um arquivo global de desenvolvimento, utilize o `SarakUIProvider` sem o parâmetro `shared`.
3.  O módulo entrará em **Modo Autônomo**, salvando as configurações de tema no seu próprio `localStorage`.

## 4. Comunicação com Backend via `authApi`

Para que o seu módulo conserte as chamadas de API com a segurança do sistema (JWT), use o padrão de exportação do `authApi` configurado para o seu endpoint específico. Nunca faça hardcode de URLs de produção nos componentes.

---
[Anterior: Contratos Visuais](./2-contratos-visuais-e-mapeamento.md) | [Próximo: Integração e Deploy](./4-integracao-e-deploy.md)
