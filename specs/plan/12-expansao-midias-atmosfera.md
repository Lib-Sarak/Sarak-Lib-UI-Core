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

# 4. Decisão de Provedor (resolvida — pode executar)

**Provedor escolhido: Supabase Storage**, não AWS S3. Motivo: o ecossistema Sarak já usa Supabase em outro lugar — `@supabase/supabase-js` já é dependência de `agent-design-operator/package.json` e existe `agent-design-operator/src/toolbox/database/supabase_database.ts` — reaproveitar a mesma plataforma/conta evita introduzir um segundo provedor cloud (e um segundo conjunto de credenciais) só para mídia. Supabase Storage é compatível com a API do S3 por baixo dos panos, então uma migração futura pra S3 puro (se necessário por custo/escala) não exige reescrever o contrato de URLs.

**Segredos, mesma regra de sempre:** a credencial do Storage (`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` ou equivalente) fica no `.env` do sistema importador — nunca em `agent-design-operator` nem em `Sarak-Lib-UI-Core`, mesmo princípio já aplicado ao `DATABASE_URL`/chaves de LLM nas specs 03/07.

# 5. Plano de Implementação

1. Provisionar um Bucket público no Supabase Storage (ex: `sarak-atmosphere-assets`) no projeto Supabase que o sistema importador já usa (ou um projeto dedicado, a critério do importador).
2. Otimizar as mídias em lote para os formatos WebP/WebM estipulados na Seção 3 (fora do escopo de código desta spec — processo manual/script utilitário separado, não faz parte do runtime do agente/lib).
3. Fazer o upload das mídias (via `SarakUploader` no fluxo de usuário, ou upload em lote via script para o catálogo inicial de presets).
4. Mapear as URLs absolutas geradas e aplicá-las nos objetos JSON descritos na spec `11-enriquecimento-presets-visuais`.

## 5.1. Código de Referência — Upload

```ts
// Exemplo de handler de upload, no lado do sistema IMPORTADOR (não em agent-design-operator
// nem em Sarak-Lib-UI-Core — upload de mídia de usuário é responsabilidade do importador,
// mesmo princípio da Regra de Ouro já aplicada a banco/LLM nas specs 03/07).
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function uploadAtmosphereAsset(file: File, filename: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('sarak-atmosphere-assets')
    .upload(filename, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(`Falha no upload: ${error.message}`);

  const { data: publicUrlData } = supabase.storage
    .from('sarak-atmosphere-assets')
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl; // esta URL é o valor que vira globalBackgroundImageUrl no payload
}
```

Validação de formato/tamanho (Seção 3: WebP/WebM, <400KB imagem / <2.5MB vídeo) acontece **antes** de chamar `uploadAtmosphereAsset` — rejeitar no client (`SarakUploader` já tem props de validação, ver `accept`/tamanho máximo) antes de gastar upload com um arquivo fora do padrão.

# 6. Critérios de Aceite
- [ ] Bucket público provisionado no Supabase Storage, nome documentado (ex.: `sarak-atmosphere-assets`).
- [ ] Upload de imagem/vídeo através de `SarakUploader` resulta numa URL pública válida.
- [ ] Arquivos fora do padrão de formato/tamanho (Seção 3) são rejeitados **antes** do upload (client-side), não só depois.
- [ ] URL final é uma string simples atribuível a `globalBackgroundImageUrl` (ou token equivalente) sem transformação adicional.

# 7. Plano de Testes (Quality Gate)

## Testes Unitários
- [ ] **Deve** a validação de formato rejeitar um arquivo `.png`/`.jpg` não convertido (só `.webp`/`.avif` aceitos para imagem estática, Seção 3.1).
- [ ] **Deve** a validação de tamanho rejeitar um arquivo acima do limite (400KB imagem / 2.5MB vídeo) antes de chamar o upload.

## Testes de Contrato (API)
- [ ] **Endpoint** (Supabase Storage SDK, não REST próprio): `upload()` bem-sucedido retorna um `path` usável por `getPublicUrl()`; erro de upload (bucket inexistente, permissão) propaga uma mensagem clara, não uma exceção genérica.

## Testes E2E (Integração)
- [ ] Fluxo feliz: usuário sobe uma imagem de fundo válida → URL pública é gerada e aplicada como preview no Gêmeo Digital.
- [ ] Fluxo negativo: usuário tenta subir um arquivo de 10MB → rejeitado com mensagem clara antes de qualquer chamada de rede ao Storage.
