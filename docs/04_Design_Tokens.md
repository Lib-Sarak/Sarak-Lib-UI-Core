# 04 - Design Tokens & Engine

The **Sarak Design Engine** ensures visual sovereignty by driving all CSS properties through tokens. Hardcoding values like `hex colors` or `pixel sizes` in your components is strictly prohibited.

## 📐 Key Token Categories

### 1. Typography
Control the kinetic feel of text via standard fonts and scales.
- `headingFont`: The primary typeface for titles.
- `bodyFont`: The readable typeface for content.
- `fontScale`: Predefined steps (`p1`, `m`, `g`, etc.).

### 2. Geometry
Defines the industrial "physics" of the interface.
- `borderRadius`: Corner roundness of all surfaces.
- `borderWidth`: Stroke thickness of cards and buttons.
- `layoutGap`: Consistent spacing between modules.

### 3. Materials & Atmosphere
The surface properties that define the aesthetic era (Cyber, Formal, Minimal).
- `surfaceMaterial`: `glass`, `metallic`, `acrylic`, `matte`.
- `texture`: `grid`, `dots`, `noise`, `carbon`, `circuit`.
- `glassBlur`: Strength of the background blur.

## 🎨 Theme Injection

You can inject a complete `Preset` into the `SarakUIProvider` to transform the entire system instantly.

```tsx
const industrialTheme = {
  primaryColor: "#3b82f6",
  borderRadius: 8,
  surfaceMaterial: "metallic",
  headingFont: "'Satoshi', sans-serif"
};

<SarakUIProvider initialTheme={industrialTheme}>
  <App />
</SarakUIProvider>
```

## 🚫 The "Zero Hardcoded" Mandate

To maintain 1:1 parity between the **Design Engine Preview** and the **Production System**, developers must use CSS variables injected by the provider:

```css
/* INCORRECT */
.my-card {
  background: white;
  border-radius: 12px;
}

/* CORRECT */
.my-card {
  background: var(--sarak-surface);
  border-radius: var(--sarak-border-radius);
  border: var(--sarak-border-width) solid var(--sarak-border-color);
}
```

---
**Sarak UI-Core v8.5**  
*Precision Engineering for the Digital Industrial Era.*
