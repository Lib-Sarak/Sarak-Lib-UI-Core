---
tipo: "spec"
titulo: "Expansão de Mídia e Renderizadores"
dominio: "Sarak-Lib-UI-Core (Visual)"
status: "🟢 Completa (Onda 10 — Markdown + Lightbox + PDFViewer; todos registrados no manifesto)"
prioridade: "Baixa"
tags: ["spec", "markdown", "pdf", "media"]
relacionados: []
---

# 1. Visão Geral
Trata a capacidade de renderização avançada para componentes que extrapolam inputs e layouts convencionais. Ideal para sistemas de documentação (Wikis), faturamento (com visualizadores de notas fiscais) e saídas de Chats baseados em IAs generativas que usam sintaxe Markdown pesada.

# 2. Regras de Negócio
- **Regra 1: Motor Markdown Seguro e Estilizado:** O `SarakMarkdownRenderer` deve ingerir strings cruas e renderizá-las convertidas em átomos Sarak (Ex: traduzir `# Título` não para um `<h1>` cru, mas para um `<SarakTypography variant="h1">`). Deve incluir renderizador de blocos de código com highlight estritamente atrelado aos tokens do sistema de cor.
- **Regra 2: Isolamento do Visualizador de PDF:** O `SarakPDFViewer` deve usar uma biblioteca leve em background (como Mozilla PDF.js ou similar abstraído) para desenhar páginas sem depender do plugin bloqueado do navegador (Chrome PDF renderer), garantindo visual estilizado dos controles de zoom e página.
- **Regra 3: Lightbox para Imagens:** Uma visualização de galeria expansiva e escura que permite avançar/retroceder mídias (carrossel overlay).

# 3. Critérios de Aceite
- [x] O componente Markdown não injeta HTML cru malicioso (*Sanitization* via purificador seguro embutido). *(react-markdown sem `rehype-raw` → HTML cru vira texto; URLs por allowlist (Spec 40).)*
- [x] O visualizador de PDF possui barra de controles customizada na parte superior (Botão de Zoom In, Zoom Out e Download) alinhada à estética da Sarak UI. *(Onda 10 — `SarakPDFViewer` sobre `pdfjs-dist` (peer+lazy); controles tokenizados, worker fora da main thread.)*
- [x] Tabelas escritas em sintaxe de Markdown no JSON devem se transmutar para tabelas HTML formatadas. *(renderers `table`/`th`/`td` → `<table>` estilizada por tokens.)*

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [x] **Deve** higienizar e neutralizar com sucesso uma string de ataque contendo injeção `javascript:alert(1)` vinda da string do Markdown. *(`Media/__tests__/SarakMarkdownRenderer.test.tsx`)*
- [x] **Deve** injetar o CSS da sintaxe (highlighting de código fonte) perfeitamente de acordo com se o ambiente estiver em *Dark Mode* ou *Light Mode*. *(`codeStyle` = `oneDark`/`oneLight` por `design.mode`; contêiner expõe `data-mode`.)*

## Testes de Contrato (API)
- [ ] N/A.

## Testes E2E (Integração)
- [x] Visual: Confirmar a não deformação visual quando uma imagem muito larga for inserida no renderizador Markdown, assegurando uso de `max-width: 100%`. *(renderer `img` aplica `max-w-full h-auto`; coberto em teste.)*

# 5. Status de Implementação (Onda 7 — parte 1)
- **`SarakMarkdownRenderer`** (`components/atomic/Media/SarakMarkdownRenderer/`): `React.lazy` (Impl + index) mantém `react-markdown` + `react-syntax-highlighter` fora do entry. Mapeia Markdown → elementos com tokens `var(--sx-*)`; highlight por modo do tema; sanitização por ausência de `rehype-raw` + allowlist de URL (Spec 40). Renderize sob `<Suspense>`.
- **`SarakLightbox`** (`components/atomic/Media/SarakLightbox.tsx`): overlay/carrossel leve (sem dep nova) reusando `useFocusTrap` (trap + ESC + restauração); setas ←/→, prev/next e contador. Regra 3 atendida.
- **Exports:** ambos em `src/index.ts` via `components/atomic/Media`.
- **Parte 2 (Onda 10 — entregue):** `SarakPDFViewer` (`components/atomic/Media/SarakPDFViewer/`): `React.lazy` sobre `pdfjs-dist` (peer + `--external`); render em `<canvas>` com worker fora da main thread (hook `usePdfDocument`); barra de controles (zoom/página/download) tokenizada. **Registro nativo finalizado:** Markdown/Lightbox/PDFViewer agora no manifesto — o `LeafNode` envolve os pesados-lazy (`HEAVY_LAZY`) num `<Suspense>` localizado; Conferência re-derivada (35 tipos).
