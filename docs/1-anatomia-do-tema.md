# 🎨 Anatomia do Tema Sarak UI

Um tema no Sarak não é apenas um conjunto de cores; é um ecossistema visual composto por **6 camadas independentes** que interagem para criar uma interface harmoniosa.

## 1. As 6 Camadas de Definição

### 🏛️ Camada de Fundações (Tokens)
São as variáveis CSS que determinam a alma cromática da aplicação:
- `--theme-primary`: Sua cor de marca e destaque principal.
- `--theme-body`: Fundo de toda a aplicação (preto profundo, cinza executivo, etc.).
- `--theme-sidebar`: Cor da navegação (pode ser diferente do body para contraste).
- `--theme-card`: Cor usada em todos os módulos e containers (geralmente com transparência).
- `--theme-border`: Cor de contorno e separação (ajusta-se automaticamente ao contraste).
- `--theme-text` e `--theme-title`: Definições de legibilidade e impacto.

### 🎭 Camada de Personalidade (Personalities)
Dita o estilo artístico através das classes `layout-*`:
- **N Personalidades Disponíveis:** Desde *Modern Glass* (transparências e desfoques) até *Solid Corporate* (blocos puros e sombras clássicas).
- Cada personalidade altera automaticamente o raio de arredondamento (`--radius-theme`) e intensidades de luz.

### 📏 Camada de Geometria (Densidade & Escala)
- **Escala Adaptativa:** O motor motor de escala (`--font-size-factor`) redimensiona toda a UI harmonicamente.
- **Várias Densidades:** Opções como *Compact*, *Standard* e *Comfortable*, que ajustam o respiro entre os elementos.

### 🧭 Camada de Estrutura (Navegação)
- Estilos intercambiáveis de menu (Sidebar vs Topbar).
- Largura de navegação controlada e adaptativa.

### ✨ Camada de Experiência (Interação)
- **Vários Efeitos de Animação:** Estilos como *Blur*, *Slide* ou *Perspective* para entradas de página.
- **Coleções de Emojis:** Conjuntos temáticos (N coleções) que decoram o dashboard de acordo com o contexto operacional.

### ⌨️ Camada Operacional (Funcionalidades)
- Sistema global de atalhos e seleção de idioma (PT, EN, ES, etc.).

---
[Anterior: Visão Geral](./0-visao-geral.md) | [Próximo: Arquitetura Federada](./2-arquitetura-federada.md)
