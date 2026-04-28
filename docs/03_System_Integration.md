# 03 - System Integration

To integrate the library into your application, you need to set up the Rendering Pipeline.

## 🧱 The Provider

Wrap your application in the `SarakUIProvider`. This context manages the design engine state, themes, and global tokens.

```tsx
import { SarakUIProvider } from '@sarak/lib-ui-core';

export function App() {
  return (
    <SarakUIProvider>
      <YourContent />
    </SarakUIProvider>
  );
}
```

## 🐚 The Shell

The `SarakShell` is the master layout component. It handles navigation (Sidebar/Topbar), user widgets, and the search interface.

```tsx
import { SarakShell } from '@sarak/lib-ui-core';

function Layout({ children }) {
  return (
    <SarakShell 
      systemName="Forze Industrial"
      logoUrl="/logo.png"
    >
      {children}
    </SarakShell>
  );
}
```

## ⚡ Dynamic Rendering

The `DynamicRenderer` consumes the `visualContracts` from your manifest and projects the UI automatically.

```tsx
import { DynamicRenderer } from '@sarak/lib-ui-core';
import manifest from './manifest.json';

function ModulePage() {
  return (
    <DynamicRenderer 
      contracts={manifest.visualContracts} 
    />
  );
}
```

## 🎨 Custom Components

If you need a specialized component that is not part of the standard templates, use the `CUSTOM` type and register your component in the discovery registry:

```tsx
import { registerLocalComponent } from '@sarak/lib-ui-core';

const MySpecialWidget = () => <div>Special Content</div>;

// Register before rendering the DynamicRenderer
registerLocalComponent('my-custom-id', MySpecialWidget);
```

In your manifest:
```json
{
  "type": "CUSTOM",
  "component": "my-custom-id",
  "label": "My Widget"
}
```

Next: [04 - Design Tokens](./04_Design_Tokens.md)
