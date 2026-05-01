# Template de Tema Sarak v6.0 (100% Config)

Copie e cole este template para criar novos temas. Substitua os valores entre `< >` pelos desejados conforme o `design_engine_map.md`.

```typescript
  // Nome do ID do Tema (Slug)
  nome_do_tema: {
    // 1. ARQUITETURA
    '--nav-style': '<sidebar | topbar | dock>',
    '--sidebar-width': '<number>px',
    '--layout-density': '<compact | standard | comfortable>',
    '--auto-hide': '<0 | 1>',

    // 2. ESTRUTURAS & BUSCA
    '--split-view': '<0 | 1>',
    '--secondary-module': '<moduleId | null>',
    '--search-style': '<minimal | command-palette>',

    // 3. TIPOGRAFIA
    '--font-heading': "'<Nome da Fonte>', sans-serif",
    '--font-subtitle': "'<Nome da Fonte>', sans-serif",
    '--font-tab': "'<Nome da Fonte>', sans-serif",
    '--font-main': "'<Nome da Fonte>', sans-serif",
    '--font-weight-heading': '<300 | 400 | 600 | 800 | 900>',
    '--letter-spacing-heading': '<tight | normal | wide | widest>',
    '--font-scale': '<p1 | p | m | g | g1>',

    // 4. GEOMETRIA & MATERIAIS
    '--radius-theme': '<number>px',
    '--border-width': '<number>px',
    '--border-style': '<solid | dashed | dotted | double>',
    '--surface-material': '<glass | metallic | brushed | acrylic | matte>',
    '--border-type': '<default | inlet | neon | beveled>',
    '--theme-gap': '<number>px',
    '--glass-opacity': '<number 0-1>',
    '--glass-blur': '<number>px',
    '--is-geometric': '<true | false>',
    '--cursor-physics': '<true | false>',

    // 5. ATMOSFERA
    '--bg-texture': '<none | grid | dots | noise | scanlines | ...>',
    '--texture-opacity': '<number 0-0.3>',

    // 6. CORES & IDENTIDADE
    '--theme-primary': '<hex_color>',
    '--system-name': '<string>',
    '--logo-url': '<url | data_base64>',
    '--logo-dark-url': '<url | data_base64>',
    '--logo-scale': '<number 0.5-2.5>',
    '--logo-position': '<left | center>',
    '--system-tone': '<formal | friendly | cyber>',

    // 7. DADOS & GRÁFICOS
    '--chart-style': '<line | bar | solid | glass>',
    '--chart-palette': '<array_of_hex_separated_by_comma>', // Ex: "#3b82f6,#10b981"

    // 8. SOMBRAS & PROFUNDIDADE
    '--shadow-intensity': '<number 0-1>',
    '--shadow-orientation': '<top-down | isometric | inner>',
    '--shadow-color-mode': '<neutral | adaptive | match>',

    // 9. EFEITOS
    '--animation-speed': '<number>s',
    '--mode': '<light | dark | system>'
  }
```

### Regras de Ouro:
1. **Unidades**: Certifique-se de incluir `px` ou `s` onde necessário.
2. **Booleans**: Use `'true'`/`'false'` ou `0`/`1` como strings para compatibilidade com injeção CSS.
3. **Cores**: Use sempre Hexadecimal completo.
