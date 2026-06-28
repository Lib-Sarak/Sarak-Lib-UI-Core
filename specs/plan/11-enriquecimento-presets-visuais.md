---
tipo: "spec"
titulo: "Enriquecimento de Presets Modulares e Diversidade Visual"
dominio: "Design Engine / Presets"
status: "🔴 Planejamento Inicial"
prioridade: "Média"
tags: ["spec", "presets", "design-system", "hitl", "ui-criar-preset"]
relacionados: ["06-presets-engine"]
---

# 1. Visão Geral e Objetivo

Atualmente, o Design Engine possui presets base para os componentes atômicos (`cards`, `buttons`, `inputs`, `atmosphere`). No entanto, para maximizar o potencial da engine e demonstrar a robustez do "Design as Data", é necessário expandir a galeria de presets com opções visualmente mais radicais e variadas.

O objetivo desta spec é organizar o enriquecimento de presets modulares no sistema, trazendo diversidade estética genuína para que os usuários (ou os agentes LLM) tenham um cardápio rico de variações ao gerar novos temas e layouts.

# 2. Regra de Negócio: Fluxo HITL (Human In The Loop) Obrigatório

Como estipulado pela skill `ui-criar-preset`, a injeção em massa ou arbitrária de presets não é permitida. A criação de novos presets seguirá obrigatoriamente as seguintes etapas de contenção:

1. **Definição de Escopo (Aprovação Humana):** O agente ou desenvolvedor deverá propor a lista de novos presets (tema e propósito) agrupados por tipo (Cards, Buttons, Inputs, etc.). O usuário (humano) deve aprovar **quais componentes** receberão novos presets e a **quantidade** exata permitida.
2. **Prototipação JSON:** Após a definição, os objetos tipados (`ComponentPreset`) devem ser gerados e apresentados para aprovação visual. Nenhuma regra global do tema deve vazar para dentro do preset modular (Merge Parcial).
3. **Validação de Schema:** O nome de cada preset e suas chaves devem corresponder estritamente às propriedades existentes nos arquivos TS (`cards.ts`, `buttons.ts`, etc.). Nenhuma propriedade CSS hardcoded é permitida.
4. **Implementação:** Apenas após o 'OK' expresso, os objetos serão adicionados aos vetores do catálogo.

# 3. Propostas de Expansão Temática (Backlog)

Quando esta spec for implementada, as seguintes estéticas podem ser exploradas como ponto de partida (sujeito à triagem HITL descrita na Seção 2):

## 3.1. Cards
- **Claymorphism (Massinha):** Bordas ultra-arredondadas, sem borda física, duas sombras espessas (sombra interna clara para volume, sombra externa sólida).
- **Retro OS (Anos 90):** Cantos duros (radius 0), bordas cinzas sólidas chanfradas, sem desfoque.
- **Holographic HUD:** Estilo sci-fi ultra transparente. Muito blur, sombras claras ou neons espalhados, bordas translúcidas de 1px.

## 3.2. Buttons
- **3D Tactile / Arcade:** Botões com aparência altamente física, utilizando `box-shadow` inset inferior para dar ilusão de profundidade ao ser pressionado.
- **Hollow Neon:** Sem preenchimento interno, apenas borda, texto e um glow externo forte em volta do botão, excelente para temas escuros.
- **Brutalist / Terminal:** Estilo 8-bit, quadrado, linhas espessas de altíssimo contraste (preto/branco ou verde-fósforo).

## 3.3. Inputs
- **Terminal Dotted:** Borda pontilhada ou tracejada grossa, fundo puro negro.
- **Floating Pill:** Radius máximo (pílula), sem bordas demarcadas, com uma sombra projetada suave embaixo (efeito flutuante sobre o background).
- **Industrial Inset:** Um input com sombra forte "para dentro" (inset), parecendo entalhado no fundo da página.

## 3.4. Atmosphere
- **Auroras Animadas:** Vídeos curtos em loop suave ou gradientes CSS muito borrados.
- **Texturas Físicas:** Opções de grid, ruído estático, papel amassado ou malha isométrica.

# 4. Critérios de Aceite para a Futura Implementação
- [ ] O fluxo HITL ocorreu, listando claramente quantidade e escopo de cada preset antes da injeção.
- [ ] Os presets modulares contém estritamente suas variáveis (Ex: `cardBorderRadius` em Cards, nunca `colorPrimary`).
- [ ] A aba/catálogo da Preview 2 exibe todos os novos presets perfeitamente, provando o funcionamento da Engine.
