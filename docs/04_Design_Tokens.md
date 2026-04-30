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

## 🎨 Controle Soberano (Aba Personalização)

Diferente de bibliotecas tradicionais onde você configura o tema via código, na Sarak UI-Core v9.0, o design é controlado em **tempo real** através da aba de **Personalização**.

- **Feedback Instantâneo**: Altere cores, fontes e materiais e veja o sistema inteiro se transformar na hora.
- **Persistência Automática**: As mudanças são salvas via API no seu backend de preferência.
- **Sincronização Total**: Os microsserviços que você integra via `discovery` herdam esses tokens automaticamente, sem precisar de configuração extra.

---

## 🚫 Mandato "Zero Hardcoded"

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
