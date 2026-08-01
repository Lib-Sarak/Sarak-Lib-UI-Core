# Exemplos de Criação de Tema

## Exemplo Bom

```typescript
// Paridade mantida: todas as chaves existem no dicionário vivo.
import { ThemePreset } from './index';

export const techOceanTheme: ThemePreset = {
    id: 'tech-ocean',
    name: 'Tech Ocean',
    description: 'Tema limpo com variações de azul marítimo e estilo glass.',
    design: {
        mode: 'dark',
        navigationStyle: 'sidebar',
        // ... demais chaves vindas do gabarito gerado ...
        cardBorderRadius: 16,
        cardBackdropBlur: 20,
        btnStyleType: 'glass',
        animEnabled: true
        // Nenhum token inventado aqui.
    }
};
```

**Por que é bom:**
1. Partiu do gabarito gerado (`generate_theme_template.ts`), não do zero.
2. Toda chave existe no dicionário — nada é descartado em runtime.
3. Os tipos batem com o `token.type` de cada chave.

---

## Exemplo Ruim

```typescript
import { ThemePreset } from './index';

export const techOceanTheme: ThemePreset = {
    id: 'tech-ocean',
    name: 'Tech Ocean',
    description: 'Tema limpo com variações de azul marítimo e estilo glass.',
    design: {
        mode: 'dark',
        navigationStyle: 'sidebar',

        // ⚠️ VIOLAÇÃO 1: chave que não existe em nenhum schema
        meuBotaoLindo: true,

        // ⚠️ VIOLAÇÃO 2: tipagem incorreta ('16px' onde o token é number)
        cardBorderRadius: '16px',

        // ⚠️ VIOLAÇÃO 3: só cor preenchida — fonte, cromo e movimento ficaram vazios
        //    sem que ninguém tenha decidido isso
    }
};
```

**Por que é ruim:**

1. **`meuBotaoLindo` não existe no dicionário.** Um tema **consome** chaves, nunca as inventa —
   criar chave é Expansão, e passa pelas três fontes da paridade (`ui-novo-componente`).
   Em runtime, `validateDesign` a descarta com
   `[Sarak:Design] Chave "meuBotaoLindo" desconhecida no schema de tema — descartada.`
   O tema *parece* completo e não é.

2. **`'16px'` onde o token é `number`** quebra a compilação; e, se atravessar por um caminho
   destipado, o valor é descartado pelo contrato de valor. Nos dois casos o raio não muda.

3. **Incompletude acidental.** Tema parcial **é legítimo** — a lib não força completude, porque
   forçar quebraria quem tem motivo para um tema parcial. O defeito aqui não é a lacuna: é ela ser
   **silenciosa**. Meça com `findMissingThemeAxes(seuTema)` antes de declarar pronto; se ele
   devolver `chrome` ou `typography`, foi descuido, não escolha.

> ⚠️ **O que NÃO acontece:** chave faltando **não** causa tela branca. O motor degrada para o
> default e avisa — `validateDesign` **nunca lança**. Um tema corrompido no `localStorage`
> degrada; não derruba a aplicação do consumidor.
