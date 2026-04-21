# 🎨 Design Engine v10.0: Soberania Visual

O **Design Engine v10.0** é o sistema que garante que 100% da interface Sarak Matrix seja dinâmica e configurável em tempo real. Ele elimina a necessidade de "rebuilds" para mudanças estéticas.

## 1. O Princípio "Zero-Hardcode"

Nesta biblioteca, é terminantemente proibido o uso de valores estáticos do Tailwind para:
- **Espaçamentos:** `p-4`, `m-2`, `gap-6` (Proibidos)
- **Arredondamentos:** `rounded-xl` (Proibido para componentes de tema)
- **Animações:** `duration-500` (Proibido)

### Substituição por Tokens Dinâmicos

Utilizamos variáveis CSS injetadas pelo `SarakUIProvider`. Sempre prefira o uso do atributo `style` ou classes utilitárias que consomem estas variáveis:

| Propriedade | Variável CSS | Exemplo de Uso |
| :--- | :--- | :--- |
| **Padding** | `--theme-pad` | `style={{ padding: 'var(--theme-pad)' }}` |
| **Gap** | `--theme-gap` | `style={{ gap: 'var(--theme-gap)' }}` |
| **Arredondamento** | `--theme-radius` | `className="rounded-theme"` |
| **Velocidade** | `--animation-speed` | `style={{ transitionDuration: 'var(--animation-speed)' }}` |

## 2. A Classe Mestra: `.rounded-theme`

Para garantir que todos os botões, cards e inputs tenham o mesmo "feel", utilize a classe utilitária `.rounded-theme` em vez de classes nativas do Tailwind. Ela escala automaticamente de acordo com a configuração de "Border Radius" feita pelo usuário no painel de Design.

## 3. Escalonabilidade Condicional

Algumas áreas exigem proporcionalidade. Recomendamos o uso de `calc()` para derivar valores:

```tsx
// Exemplo: Um componente interno que precisa de metade do padding do container
<div style={{ padding: 'calc(var(--theme-pad) / 2)' }}>
    Conteúdo Proporcional
</div>
```

## 4. Animações e Sincronia

Todas as transições do Framer Motion ou transições CSS puras devem consumir `--animation-speed`. Isso garante que o sistema inteiro "respire" no mesmo ritmo definido pelo usuário.

```tsx
<motion.div
    transition={{ duration: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--animation-speed')) || 0.5 }}
>
    ...
</motion.div>
```

---
[Anterior: Arquitetura](./0-arquitetura-matrix-v6.md) | [Próximo: Contratos Visuais](./2-contratos-visuais-e-mapeamento.md)
