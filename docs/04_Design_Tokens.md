# 🎨 Sarak Design Engine & Tokens Governance (v11.0)

Este guia documenta o funcionamento dos **Design Tokens** atômicos do Sarak, a política soberana de **Zero Hardcoding** e as diretrizes estéticas para alinhar novos componentes ou specimens ao motor de iluminação e texturas matemáticas da atmosfera industrial.

---

## 1. Política Soberana de Zero Hardcoding

No ecossistema Sarak, **nenhuma** folha de estilo, classe utilitária do Tailwind ou propriedade de estilo inline React de um componente deve definir diretamente valores de cores, sombras, fontes, opacidades ou raios de borda. 

### O que NÃO fazer:
```tsx
// ❌ INCORRETO: Viola a política data-driven de controle de tokens centralizados
return (
  <div className="bg-slate-900 border-red-500 rounded-lg p-4 font-mono shadow-lg">
    Dados
  </div>
);
```

### O que FAZER:
```tsx
// ✅ CORRETO: Consome variáveis mapeadas dinamicamente pelo Design Engine
return (
  <div 
    className="border p-4 transition-all duration-300"
    style={{
      backgroundColor: 'var(--sarak-card-bg, var(--theme-card))',
      borderColor: 'var(--sarak-card-border-color, var(--theme-border))',
      borderRadius: 'var(--sarak-card-border-radius, var(--radius-theme))',
      fontFamily: 'var(--sarak-font-family-mono, monospace)',
      boxShadow: 'var(--sarak-shadow-industrial)'
    }}
  >
    Dados
  </div>
);
```

---

## 2. Atmosfera e Efeitos Especiais (`_atmosphere.css`)

O arquivo [_atmosphere.css](file:///c:/Users/Igor/Desktop/Sarak/X%20-%20Trabalho/Code/Biblioteca/Sarak-Lib-UI-Core/src/styles/_atmosphere.css) gerencia padrões geométricos e overlays que trazem a estética cibernética e industrial ao sistema. Você pode acioná-los em qualquer componente simplesmente injetando o atributo de dados correspondente:

### Injetando Texturas de Alta Fidelidade
Para aplicar padrões industriais em contêineres e cards, adicione o atributo `data-sx-texture`:

```tsx
// Renderiza o card com grid cibernético ou micro-pontos com base no token ativo
return (
  <div 
    className="sarak-card relative w-full h-48" 
    data-sx-texture={activeDesign.cardTextureType || 'grid'}
  >
    Conteúdo Industrial
  </div>
);
```

### Lista de Padrões Suportados no Engine
-   `grid`: Malhas de engenharia ortogonais.
-   `micro-dots`: Padrão densificado de micropontos técnicos.
-   `noise` / `grain`: Textura analógica de ruído estático de alta fidelidade.
-   `carbon`: Fibra de carbono militar.
-   `brushed`: Metal escovado.
-   `frosted`: Efeito de vidro ácido jateado.
-   `aurora`: Gradiente cromático dinâmico com ciclo animado de 30s.
-   `cyber-binary`: Sobreposições de strings criptográficas em pseudocódigo `01`.

---

## 3. Quinas Geométricas e Clip-Path Dinâmico

O Sarak suporta cortes geométricos dinâmicos nas quinas dos cartões baseados em fórmulas poligonais de clip-path. As variáveis são calculadas pelo hook `useDesignVariables` de forma transparente.

Para habilitar em specimens customizados, consuma a variável `--sarak-card-clip-path`:

```tsx
return (
  <div 
    className="bg-[var(--theme-card)] border border-[var(--theme-border)]"
    style={{
      clipPath: 'var(--sarak-card-clip-path)',
      WebkitClipPath: 'var(--sarak-card-clip-path)' // Compatibilidade Safári/iOS
    }}
  >
    Card com Corte Poligonal Ativo
  </div>
);
```

---

## 4. Rastreamento e Efeitos Físicos de Mouse

O Sarak captura e injeta no DOM global as coordenadas exatas do cursor do mouse em tempo de execução via *RequestAnimationFrame (RAF)*, disponibilizando-as em variáveis CSS dinâmicas:
-   `--mouse-x` (Coordenada X do mouse em pixels em relação à viewport)
-   `--mouse-y` (Coordenada Y do mouse em pixels em relação à viewport)

Você pode consumi-las para criar gradientes interativos sob medida ou iluminação física em cards:

```css
/* Exemplo de efeito de iluminação interativa em cartões */
.interactive-spotlight-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(
        400px circle at var(--mouse-x) var(--mouse-y),
        rgba(var(--theme-primary-rgb), 0.15),
        transparent 80%
    );
    z-index: -1;
    pointer-events: none;
}
```

---

> [!IMPORTANT]
> Ao desenvolver novos componentes, sempre verifique a conformidade com o checklist de **[Checklist de Validação](./04_validacao.md)** da skill para garantir compatibilidade reativa com o Sandbox de Preview do Design Engine.
