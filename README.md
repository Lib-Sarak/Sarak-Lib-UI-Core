# Sarak-UI-Core

O Sistema de Design da Biblioteca Sarak. Define a identidade visual única e fornece componentes atômicos premium.

## 🚀 Funcionalidades
- **Tokens de Design:** Cores harmônicas, tipografia moderna (Inter/Outfit) e espaçamentos.
- **Componentes Base:** Buttons, Inputs, Cards e Modais com animações suaves (Framer Motion).
- **Tematização:** Suporte nativo a Dark Mode e Glassmorphism.

## 🛠️ Como Implementar

### Frontend (React)
```bash
npm install @sarak/ui-core
```

```tsx
import { Button, Card } from '@sarak/ui-core';

function MyPage() {
  return (
    <Card>
      <Button variant="premium">Clique Aqui</Button>
    </Card>
  );
}
```

## 🔗 Conexões
- **Todos os Módulos:** Todos os componentes de Frontend da biblioteca Sarak (Auth, LLM, Translator) consomem os estilos definidos aqui para manter a consistência.

---
**Desenvolvido por Igor Sarak**
