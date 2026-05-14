# Templates de Manifesto e Integração: Sarak Design Engine

Este documento fornece templates prontos para uso e instruções detalhadas de como integrar o motor de design do `Sarak-Lib-UI-Core` em sistemas hospedeiros (Host Systems).

---

## 1. O Manifesto de Design (Manifest)

O Manifesto é o objeto JSON que define a identidade visual completa do sistema. Ele deve ser passado para o `UI-Core` durante a inicialização ou via contexto.

### Template: Industrial Sovereign (Padrão Sarak)
Ideal para sistemas de alta performance e visual técnico.
```json
{
  "version": "13.0.0",
  "config": {
    "colorPrimary": "#00f2ff",
    "colorSecondary": "#7000ff",
    "bgBase": "#0a0a0c",
    "cardBg": "rgba(15, 23, 42, 0.6)",
    "cardRadius": 12,
    "h1Size": 48,
    "motionEaseMain": "cubic-bezier(0.4, 0, 0.2, 1)",
    "scrollWidth": 6,
    "zIndexSidebar": 500
  }
}
```

### Template: Crystal Glass (Aesthetic Lux)
Focado em transparências, blurs elevados e tipografia elegante.
```json
{
  "version": "13.0.0",
  "config": {
    "glassBlur": 25,
    "glassSaturation": 1.8,
    "glassSpecularity": 0.2,
    "cardInnerGlowWidth": 1,
    "cardInnerGlowColor": "rgba(255,255,255,0.1)",
    "h1Weight": 300,
    "h1LetterSpacing": 2
  }
}
```

---

## 2. Instruções de Integração para Sistemas Host

Para que o `Sarak-Lib-UI-Core` aplique o design corretamente no seu sistema, siga estes passos:

### Passo 1: Envolver a Aplicação no Escopo Design
O CSS do Sarak utiliza a classe `.sarak-design-scope` para isolar as variáveis. Certifique-se de que sua aplicação está dentro de um container com esta classe.

```tsx
// No seu App.tsx (Sistema Host)
import { DesignProvider } from '@sarak/ui-core';

const myDesignConfig = { /* seu manifesto aqui */ };

function App() {
  return (
    <DesignProvider config={myDesignConfig}>
      <div className="sarak-design-scope">
        <MyRouting />
      </div>
    </DesignProvider>
  );
}
```

### Passo 2: Sincronização de Variáveis
Se o seu sistema host possui componentes próprios que não são do `UI-Core`, eles podem consumir os tokens automaticamente usando variáveis CSS nativas:

```css
/* No CSS do seu sistema host */
.my-custom-card {
  background: var(--sarak-card-bg);
  border-radius: var(--sarak-card-border-radius);
  transition: all var(--sarak-motion-dur-normal) var(--sarak-motion-ease-main);
}
```

---

## 3. Como Gerar Novos Templates

A melhor forma de criar novos manifestos é usar a **Design Engine Bar** integrada no `UI-Core`. 

1.  Abra a aba **"Master Control"**.
2.  Ajuste os controles até atingir o visual desejado.
3.  Vá na aba **"Exportar Manifesto"** (em breve na UI).
4.  Copie o JSON gerado e cole no seu arquivo de configuração no sistema host.

---

## 4. Troubleshooting de Integração

- **As variáveis não estão aparecendo?** Verifique se o elemento raiz tem a classe `sarak-design-scope`.
- **O Hover dos botões não funciona?** Certifique-se de que as variáveis de `motion` foram incluídas no manifesto.
- **Conflito de Z-Index?** Use o schema `Layers` no seu manifesto para ajustar os valores de `zIndexSidebar` e `zIndexModal` de acordo com as necessidades do seu host.

---

> [!NOTE]
> Sistemas Host que utilizam o padrão Sarak devem sempre preferir o uso de variáveis CSS em vez de valores fixos para garantir compatibilidade futura com o agente de IA.
