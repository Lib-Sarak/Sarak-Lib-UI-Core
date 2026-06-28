---
tipo: "spec"
titulo: "Expansão e Hospedagem de Mídias de Atmosfera"
dominio: "Design Engine / Atmosphere"
status: "🔴 Planejamento Inicial"
prioridade: "Média"
tags: ["spec", "assets", "storage", "atmosphere", "media"]
relacionados: ["11-enriquecimento-presets-visuais"]
---

# 1. Visão Geral

O ecossistema Sarak UI Core permite a configuração de cenários de fundo complexos através do pilar *Atmosphere* (ex: `globalBackgroundImageUrl`). Para enriquecer a galeria de presets com fundos animados, loops de vídeo e imagens texturizadas de alta resolução, precisamos de um local centralizado para armazenar e servir esses arquivos.

Esta spec define a estratégia de hospedagem, formatos e consumo desses *assets* de mídia sem degradar a performance da engine.

# 2. Decisão Arquitetural: Armazenamento e Hospedagem

## A Rejeição do GitHub como Host de Mídia
A ideia de criar um **segundo repositório no GitHub** focado apenas em imagens resolve o problema de não inchar o repositório principal de código. No entanto, ela **não é recomendada para produção**, pelos seguintes motivos técnicos:
1. **Limitações de Vídeo (Byte-Range Requests):** Fundos de tela animados usam `.mp4` ou `.webm`. Para que um vídeo carregue rápido na UI, o servidor precisa suportar *HTTP 206 Partial Content* de forma eficiente. O raw do GitHub e o GitHub Pages não são otimizados para streaming de vídeo e podem causar engasgos pesados na UI.
2. **Git LFS (Large File Storage):** Arquivos grandes no GitHub exigem LFS. O limite gratuito de banda do LFS é de apenas 1GB/mês. Se o Gêmeo Digital for usado frequentemente, esse limite será estourado rapidamente, bloqueando o acesso aos arquivos.

## A Solução Oficial: Object Storage (Supabase Storage / S3)
A arquitetura definida para a Sarak é o uso de um **Object Storage dedicado** (como Supabase Storage ou AWS S3).
- **Escalabilidade:** Feito especificamente para hospedar e servir binários e mídias brutas.
- **Performance de UI:** Com uma CDN na frente do Storage, as imagens carregam instantaneamente na borda (edge) e os vídeos fazem streaming progressivo perfeito.
- **Contrato:** O frontend da Sarak apenas receberá a URL final pública gerada por esse Storage (ex: `https://storage.sarak.../bg-neon-grid.webm`).

# 3. Diretrizes de Formato e Otimização (Assets)

Para que a experiência no Gêmeo Digital seja fluida, todo asset subido para o Storage deve seguir regras estritas de otimização antes do deploy:

## 3.1. Imagens Estáticas
- **Formato Mandatório:** `WebP` (ou `AVIF`). É proibido o uso de `PNG` pesados ou `JPEG` sem compressão.
- **Resolução Máxima:** 1920x1080 (Full HD) para backgrounds globais. Padrões de textura que se repetem (CSS `repeat`) devem ter no máximo 512x512.
- **Tamanho Limite:** < 400KB por imagem de fundo.

## 3.2. Vídeos (Motion Backgrounds)
- **Formato Mandatório:** `WebM` (para transparência/performance) ou `MP4` (codec H.264 para compatibilidade global).
- **Comportamento:** Devem ser vídeos em loop perfeito (Seamless Loop), curtos (máximo 10 a 15 segundos).
- **Sem Áudio:** A trilha de áudio deve ser removida no momento do render para economizar bitrate.
- **Tamanho Limite:** < 2.5MB por vídeo (compressão agressiva focando no visual de "fundo", onde artefatos leves são mascarados pelos componentes em cima).

# 4. Plano de Implementação (Futuro)

1. Provisionar um Bucket público (ex: `sarak-atmosphere-assets`) no Storage escolhido (Supabase/S3).
2. Otimizar as mídias em lote para os formatos WebP/WebM estipulados na Seção 3.
3. Fazer o upload das mídias.
4. Mapear as URLs absolutas geradas e aplicá-las nos objetos JSON descritos na spec `11-enriquecimento-presets-visuais`.
