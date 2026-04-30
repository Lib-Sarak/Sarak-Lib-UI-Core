# 03 - System Integration

To integrate the library into your application, you need to set up the Rendering Pipeline.

## 🐚 Sarak Shell & Provider

A integração agora é feita centralizando a descoberta de módulos no `SarakUIProvider`.

```tsx
import { SarakUIProvider, SarakShell } from '@sarak/lib-ui-core';

export function Layout() {
  return (
    <SarakUIProvider 
      options={{
        endpoints: { 
          discovery: [
            'http://auth-service/api', 
            'http://estoque-service/api'
          ] 
        }
      }}
    >
      <SarakShell 
        brand={{ name: "Sarak Industrial" }} 
        user={currentUser}
        logout={doLogout}
      />
    </SarakUIProvider>
  );
}
```

### ⚡ Como a Mágica acontece?
1. O `SarakUIProvider` faz o scan de todos os URLs na lista `discovery`.
2. Ele busca o `/module/manifest` em cada um.
3. O `SarakShell` monta a barra lateral automaticamente com as abas descobertas.
4. Ao clicar em uma aba, o motor de renderização dinâmica desenha a tela baseada no contrato visual do manifesto.

## 🎨 Registro de Componentes Locais

Se o seu sistema tem uma tela ultra-customizada que não pode ser descrita apenas por manifesto, você pode registrar um componente React local:

```tsx
import { registerLocalComponent } from '@sarak/lib-ui-core';

const MinhaTelaEspecial = () => <div>Design Customizado</div>;

// Registre ANTES do Shell carregar
registerLocalComponent('meu-id-especial', MinhaTelaEspecial);
```

No manifesto do Backend, você apenas aponta para o ID:
```json
{
  "id": "aba-vendas",
  "label": "Vendas",
  "component": "meu-id-especial"
}
```

Próximo: [Design Tokens](./04_Design_Tokens.md)
