# Sarak Module Integration Specialist (v1.0)

Este documento instrui agentes de IA sobre como integrar novos módulos ao ecossistema Sarak utilizando o `Sarak-Lib-UI-Core` como **Renderizador Universal**.

## 1. Princípio da Soberania Visual
Nenhum módulo (ex: Auth, CRM, Stock) deve conter código de interface complexo. O design deve ser delegado ao `UI-Core` através do `manifest.json`.

## 2. Passo a Passo para Integração

### Passo 1: Configurar o Manifesto
O novo módulo deve possuir um `manifest.json` na raiz que siga o esquema definido em `Sarak-Lib-UI-Core/sarak-contract.schema.json`.

```json
{
  "$schema": "../Sarak-Lib-UI-Core/sarak-contract.schema.json",
  "id": "meu-novo-modulo",
  "visualContracts": [
    {
      "id": "minha-tabela",
      "type": "TABLE",
      "label": "Dados do Sistema",
      "endpoint": "v1.data",
      "mapping": { "coluna": "Título" }
    }
  ]
}
```

### Passo 2: Consumir o Renderizador
No sistema cliente, utilize o `DynamicRenderer` para transformar o JSON em interface real.

```tsx
import { DynamicRenderer } from '@sarak/ui-core';
import manifest from './manifest.json';

const MyPage = () => {
  return <DynamicRenderer contracts={manifest.visualContracts} />;
};
```

## 3. Tipos de Contrato Disponíveis
- `TABLE`: Listagens dinâmicas.
- `MANAGEMENT_GRID`: Gestão complexa de papéis/itens.
- `CHART` / `ELITE_CHART`: Visualização de dados.
- `FORM`: Captação de dados com validação.
- `SECURITY_ORCHESTRATOR`: Fluxos de MFA e Segurança.
- `CUSTOM`: Renderização de componentes injetados no Registry.

## 4. Dica para a IA
Ao criar um novo módulo, sempre valide o manifesto contra o schema do `UI-Core`. Isso evita erros de renderização e garante que o design sistema seja aplicado corretamente.
