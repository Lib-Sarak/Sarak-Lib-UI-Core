# Manifest-Driven Registration & Discovery (v10.2)

A Sarak UI-Core atua como um hospedeiro soberano que descobre e renderiza funcionalidades baseadas em contratos visuais agnósticos definidos via manifestos.

## 1. O Ecossistema de Contratos Visuais
Módulos e aplicações registram suas capacidades através do objeto `manifest`. O `SarakShell` traduz estas definições em rotas, abas e templates de página.

### Tipos de Módulos Suportados:
- `DASHBOARD`: Visão geral com grids de métricas.
- `MANAGEMENT`: Listagens e tabelas de gestão (ex: Gestão de Ativos).
- `CONFIG`: Interfaces de configuração e personalização.
- `ANALYTICS`: Gráficos e visualização de dados intensiva.
- `KNOWLEDGE`: Bases de conhecimento e documentação técnica.

## 2. Registro Local de Componentes (Plug & Play)
Para que uma aplicação host integre seus próprios componentes no shell da biblioteca, ela deve utilizar o mecanismo de registro:

```tsx
// Exemplo de Registro no main.tsx do Host
import { registerLocalComponent } from 'sarak-lib-ui-core';
import MyLocalPage from './pages/MyLocalPage';

registerLocalComponent('MY_CUSTOM_PAGE', MyLocalPage);
```

No manifesto, o módulo deve referenciar este ID:
```json
{
  "id": "custom-module",
  "name": "Meu Módulo",
  "componentId": "MY_CUSTOM_PAGE"
}
```

## 3. Protocolos de Comunicação
- **Endpoint Resolution**: Todos os contratos de dados devem ser resolvidos via provedor para suportar diferentes URLs de API entre projetos.
- **Sovereign Shell**: O `SarakShell` orquestra a navegação entre módulos da biblioteca e módulos registrados localmente de forma transparente.
- **Agnostic Logic**: A UI-Core gerencia o estado da interface (Loading, Empty, Error), enquanto o host fornece os dados e a lógica de negócio.

---
**Sarak Engineering v10.2**
