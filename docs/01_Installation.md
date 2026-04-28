# 01 - Installation & Setup

This guide covers the necessary steps to import and configure the **Sarak-Lib-UI-Core** library into your project.

## 🏁 Requirements

Before installing, ensure your environment meets the following criteria:
- **Node.js**: v18.0.0 or higher.
- **TailwindCSS**: v4.0.0 or higher (required for the industrial design engine).
- **React**: v18.0.0 or higher.

## 📦 Installation

The library is hosted on GitHub. You can install it directly using your package manager:

```bash
# Using NPM
npm install github:Lib-Sarak/Sarak-Lib-UI-Core

# Using Yarn
yarn add github:Lib-Sarak/Sarak-Lib-UI-Core

# Using PNPM
pnpm add github:Lib-Sarak/Sarak-Lib-UI-Core
```

### Peer Dependencies
Ensure you have the following dependencies installed in your project:
```bash
npm install framer-motion lucide-react recharts echarts echarts-for-react reactflow react-grid-layout
```

## 🎨 Global Styling

To activate the Sarak Design System, you must import the compiled CSS in your application's entry point (e.g., `main.tsx` or `app.tsx`):

```typescript
import '@sarak/lib-ui-core/style.css';
```

## 🛠️ Tailwind Integration (v4)

If you are using TailwindCSS v4, you can import the Sarak base styles directly in your CSS entry file to inherit the core design tokens:

```css
@import "tailwindcss";
@import "@sarak/lib-ui-core/sarak-base.css";
```

Next: [02 - Manifest Contracts](./02_Manifest_Contracts.md)
