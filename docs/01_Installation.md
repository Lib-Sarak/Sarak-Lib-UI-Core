# 01 - Installation & Setup

This guide covers the necessary steps to import and configure the **Sarak-Lib-UI-Core** library into your project.

## 🏁 Requirements

Before installing, ensure your environment meets the following criteria:
- **Node.js**: v18.0.0 or higher.
- **TailwindCSS**: v4.0.0 or higher (required for the industrial design engine).
- **React**: v18.0.0 or higher.

## 📦 Instalação

A biblioteca é hospedada via GitHub. Instale diretamente usando seu gerenciador:

```bash
npm install github:Lib-Sarak/Sarak-Lib-UI-Core
```

### Dependências de Peer
Para o funcionamento pleno das animações e gráficos:
```bash
npm install framer-motion lucide-react recharts echarts-for-react
```

## 🎨 Estilização Global

Importe o CSS base no ponto de entrada da sua aplicação (`main.tsx`):

```typescript
import '@sarak/lib-ui-core/sarak-base.css';
```

A biblioteca agora utiliza um sistema de **Design Soberano**. Isso significa que ela injeta variáveis CSS dinâmicas que controlam o visual sem que você precise configurar o Tailwind no projeto host.

Próximo: [Integração de Sistema](./03_System_Integration.md)

Next: [02 - Manifest Contracts](./02_Manifest_Contracts.md)
