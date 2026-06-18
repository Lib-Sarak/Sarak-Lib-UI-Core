---
tipo: "spec"
titulo: "Correção de Bug: Preview de Presets Escurecida"
dominio: "Design Engine / UI Core"
status: "🟢 Implementado"
prioridade: "Alta"
tags: ["spec", "bugfix", "ui"]
relacionados: ["01-painel-customizacao-temas"]
---

# 1. Visão Geral
Esta especificação detalha a correção de um bug visual na seção "Preview 2" do módulo Design Engine, responsável por exibir os presets (como Atmosfera & Texturas). Atualmente, a área de preview está incorretamente escurecida — aparentando possuir uma redução de opacidade ou um overlay escuro indesejado. Isso prejudica a visualização fidedigna dos presets aplicados (como "VIDEO BACKGROUND", "IMAGE SPACE", etc.). O objetivo é remover essa interferência para exibir as mídias em sua cor e brilho originais.

# 2. Regras de Negócio
- **Regra 1:** A área de visualização (Preview) deve representar o preset exatamente como ele será renderizado na aplicação final, sem aplicação de overlays escurecedores de background globais.
- **Regra 2:** Elementos de estado### Diagnóstico Técnico 2.0
Após a primeira tentativa de correção, o bug de "escurecimento" persistiu porque dois fatores continuaram a impor uma redução de luminosidade no componente `AtmospherePresetPreview` ("Preview 2"):
1. O gradiente inferior `bg-gradient-to-t from-black/90 to-transparent`, embora reduzido a `h-1/2`, aplicava um preto 90% opaco na base da mídia, criando a ilusão de um "overlay de escurecimento" numa mídia primariamente brilhante (como o video do Big Buck Bunny).
2. O contêiner pai aplicava `bg-neutral-900` (um `#171717` sólido) que atuava como fundo âncora, interagindo dentro do contexto de empilhamento com o background nativo do `.sarak-card`.

### Solução Aplicada
1. Remoção completa do gradiente `from-black/90` no componente `AtmospherePresetPreview` para garantir a preservação de 100% da luminosidade original do vídeo/imagem.
2. Remoção da classe `bg-neutral-900` para garantir que as mídias utilizem a cor de superfície base real do tema, sem imposição de contrastes artificiais.
3. A legibilidade dos textos de preview é garantida via `drop-shadow-lg`, preservando a fidelidade da mídia ao custo de um sutil desfoque natural do texto.

### Status
- [x] Problema Isolado
- [x] Solução Implementada (Segunda Iteração)
- [ ] Validação do Usuário Necessária

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [x] **Deve** garantir que o componente renderizador de preview (`Preview` ou correspondente) receba as propriedades de estilo corretas sem classes CSS globais intrusivas (ex: utilitários de opacidade que aplicam `opacity: 0.5`).
- [x] **Deve** validar que estados inativos globais do painel não diminuam a opacidade do nó raiz da mídia reproduzida no preview.

## Testes de Contrato (API)
- N/A

## Testes E2E (Integração)
- [x] Fluxo feliz: O usuário abre a personalização do Design Engine, visualiza a seção de "Atmosphere & Textures" e constata que as imagens/vídeos de preview estão em cores vivas e sem overlay escuro limitador de visibilidade.
