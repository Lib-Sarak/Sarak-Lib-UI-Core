---
tipo: "arquitetura"
titulo: "Processamento Híbrido de Luminância (Web Worker)"
dominio: "Core / Infraestrutura"
status: "🟢 Vigente"
tags: ["arquitetura", "performance", "web-worker", "hsp"]
relacionados: ["01-motor-tema-data-driven"]
---

# 1. Propósito
Garantir o processamento assíncrono e não-bloqueante para varreduras de inteligência analítica em mídia. O componente de renderização de fundos `SarakBackgroundRenderer` precisa calcular a luminância real de uma imagem usando a equação matemática HSP para poder injetar a cor de texto (claro ou escuro) correta na UI. Como o cálculo itera sobre arrays massivos de pixels via Canvas 2D, seu processamento síncrono bloqueava o Thread principal em imagens pesadas, exigindo a arquitetura de Web Worker híbrida.

# 2. Stack e Ferramentas
- Web Workers API Nativa do Browser
- React Hooks (`useMediaLuminance`)
- Canvas 2D API (`getImageData`)
- Fallbacks síncronos de emergência em JS Vanilla

# 3. Diagramas / Estruturas
A mecânica ocorre da seguinte maneira:

1. **Amostragem Híbrida**: A imagem base fornecida no provedor (se não for vídeo) é pintada em um Canvas off-screen minúsculo (50x50px) usando a instrução `willReadFrequently` para máxima performance de memória.
2. **Transferência de Buffer (Web Worker)**: O `useMediaLuminance` envia os dados binários (`imageData.data.buffer`) de forma transferível (`Transferable Objects`) via PostMessage para o `luminance.worker.ts`. Isso copia os bytes instantaneamente para fora do UI Thread.
3. **Cálculo de HSP**: O Worker aplica a equação matemática (Highly Sensitive Perceived luminance): `Math.sqrt(0.299*R² + 0.587*G² + 0.114*B²)`. Baseado no limite matemático (127.5), a imagem é classificada como 'light' ou 'dark'.
4. **Resiliência e Fallbacks**:
   - Timeout: O hook lança um gatilho simulado (500ms max). Se o Worker demorar, trava ou falhar, a operação é revertida para JS sincrono para não deixar o usuário pendurado.
   - CORS Block: Caso o servidor da imagem (ex: Unsplash) recuse a diretiva `crossOrigin = 'anonymous'`, o bloco lança um gracefully 'unknown', não injetando variáveis falhas.
