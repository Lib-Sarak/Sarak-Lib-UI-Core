# Design Engine & Token Injection (v10.2)

O Design Engine é o núcleo soberano do Sarak UI. Ele impõe uma abordagem "Manifest-First" onde a lógica de código e o estilo visual são 100% desacoplados e controlados via variáveis CSS dinâmicas.

## 1. O Mandato "Zero Hardcoded"
- **NUNCA** use valores literais como `color: "#3b82f6"`.
- **SEMPRE** consuma variáveis CSS: `text-[var(--theme-primary)]` ou `bg-[var(--theme-sidebar-bg)]`.
- Qualquer nova propriedade visual DEVE ser registrada no `DESIGN_MANIFEST`.

## 2. Multi-Tone Engine (v10.2)
O sistema suporta três níveis de profundidade cromática, configurados via `colorDepth`:
1. **Mono-Tone**: Foco em uma única cor de branding com tons neutros.
2. **Dual-Tone**: Harmonização entre cores Primária e Secundária.
3. **Tri-Tone**: Esquema completo com cores Primária, Secundária e Terciária.

## 3. Soberania Granular e Injeção
A injeção ocorre no `DesignInjector.tsx` seguindo uma hierarquia de autoridade:
1. **Presets de Tema**: Configurações base (ex: `futurist`, `industrial`).
2. **Estratégia Multi-Tone**: Mapeamento dinâmico baseado em `colorDepth` e `colorVariation`.
3. **Overrides Granulares (Soberania Máxima)**: Cores explícitas definidas pelo usuário para componentes específicos (`sidebarColor`, `topbarColor`, `textureColor`). 
   - Overrides SEMPRE têm a palavra final e devem injetar variantes `-rgb` para transparências.

## 4. Camadas Atmosféricas (Texturas)
- **Isolamento Crítico**: A cor da textura (`--theme-texture-color`) deve ser tratada como uma camada independente.
- **NÃO SOBRESCREVER**: A injeção de textura nunca deve sobrescrever o background global (`--bg-body`), exceto se explicitamente configurado no rascunho de design.

## 5. Sincronização e Hidratação
- **Reactive Hydration**: O motor de injeção aguarda `isHydrated` para re-sincronizar o estado persistente do `localStorage`.
- **Draft Sync**: O rascunho (`useDesignDraft`) deve ser espelhado reativamente quando o estado global é carregado no boot para evitar perdas de configuração.

---
**Sarak Engineering v10.2**
