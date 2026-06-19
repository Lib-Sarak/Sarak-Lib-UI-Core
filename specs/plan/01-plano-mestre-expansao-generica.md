# Plano Mestre de Expansão: O Motor Genérico Sarak

Este documento atua como o **Master Plan** para expandir a biblioteca Sarak-Lib-UI-Core. O objetivo é transformá-la de um sistema focado em componentes de alto nível (Cards) para um **Motor UI totalmente agnóstico e genérico**, capaz de renderizar dashboards financeiros, CRMs, ferramentas de RH, clones de SaaS (Clockify) e automações complexas, puramente via configuração de dados (Design as Data).

Para atingir a Regra Zero, a biblioteca precisa fornecer um arsenal abrangente de "blocos de Lego". Cada categoria abaixo será posteriormente desmembrada em uma Spec arquitetural independente.

---

## 1. Categoria: Estrutura Base e Micro-Layout (O Esqueleto)
*A fundação estrutural para compor interfaces que não são apenas "Cards flutuantes".*

**O que DEVE ser expandido:**
- **Primitivas Flex e Grid (`<SarakFlex>`, `<SarakGrid>`):** Componentes estritamente estruturais que expõem 100% das regras do Flexbox via Data/Tokens.
- **Split Panes (Painéis Redimensionáveis):** Estruturas como a do VSCode onde o usuário pode arrastar o divisor entre áreas.
- **Drawers e Painéis Laterais Avançados:** Modais deslizantes (esq/dir/baixo), cruciais para formulários de edição em sistemas de gestão.
- **Acordeões e Collapsibles Estruturais:** Containers que permitem esconder/mostrar conteúdo de forma aninhada.
- **Tabs Aninhadas (Advanced Tabs):** Abas horizontais ou verticais em qualquer nível de profundidade.

---

## 2. Categoria: Entrada de Dados e Formulários de Negócios
*Sistemas de HR e Finanças são formados por formulários altamente densos.*

**O que DEVE ser expandido:**
- **Date / Time Pickers:** Calendários, range de datas (relatórios financeiros), seleção de horas e fusos horários.
- **Combobox & Multi-select (Tags):** Selects avançados com pesquisa interna, lazy loading e seleção de múltiplas opções.
- **File Uploaders (Drag & Drop Zones):** Áreas de upload de arquivos com progresso e preview.
- **Rich Text Editors (WYSIWYG):** Editor de texto formatado necessário para RH (vagas) ou notas.
- **Sliders Avançados:** Sliders de faixa dupla (Range Sliders) para filtros de preços ou períodos.
- **Color Pickers:** Input específico para seleção hexadecimal/RGB.

---

## 3. Categoria: Densidade e Visualização de Dados (Data Grids & Vis)
*O coração visual de CRMs e ferramentas analíticas.*

**O que DEVE ser expandido:**
- **DataGrid Avançado:** Tabelas com suporte a *virtual scrolling*, redimensionamento de colunas, ordenação e *pinned columns*.
- **Visualização de Árvore (Tree Views):** Componentes colapsáveis infinitos para organogramas ou pastas.
- **Kanban Boards (Drag & Drop):** Componente base de colunas e cards arrastáveis para gestão de tarefas.
- **Calendários e Visão de Agenda:** Tela completa de calendário (mês/semana) com eventos blocados e arrastáveis (essencial para agendamentos).
- **Data Visualization (Gráficos e Sparklines):** Wrappers de gráficos (Linhas, Barras, Pizza, Scatter) estilizados pelo Design Engine, e *Sparklines* (mini-gráficos para cards de resumo financeiro).
- **Listas Reordenáveis:** Listas verticais com suporte a drag & drop e ações rápidas no swipe.

---

## 4. Categoria: Feedback, Status e Micro-Interações
*A comunicação detalhada do sistema com o usuário.*

**O que DEVE ser expandido:**
- **Menus de Contexto (Right-Click Menus):** Menu suspenso de ações ativado com o clique direito, imitando apps desktop.
- **Toast Notifications (Snackbars):** Sistema global de notificações empilhadas (sucesso, erro, alerta).
- **Modais Multi-step (Dialogs Avançados):** Modais que coordenam "passos" (wizards).
- **Progress Bars e Spinners:** Barras de progresso lineares e indicadores circulares.
- **Tooltips e Popovers:** Balões de contexto e menus flutuantes atrelados a botões.
- **Skeleton Loaders Baseados em Dados:** Estruturas de carregamento que espelham o layout exato gerado pelos tokens.
- **Badges e Avatares Complexos:** Sistemas de grouping de avatares e contadores vermelhos de notificação.

---

## 5. Categoria: Navegação Contextual e Produtividade
*Para navegação profunda dentro de sistemas multi-tenant.*

**O que DEVE ser expandido:**
- **Breadcrumbs:** Trilhas de migalhas para localização em hierarquias profundas.
- **Steppers (Passo-a-passo):** Indicadores horizontais ou verticais para fluxos de onboarding.
- **Command Palette (Spotlight/K-bar):** Busca universal acionada por atalho (ex: `Ctrl/Cmd+K`) para pular rapidamente entre áreas.
- **Paginação Explícita:** Controles numéricos avançados para rodapé de tabelas.

---

## 6. Categoria: Mídia e Renderizadores Especializados
*Formatos avançados de leitura e exibição imersiva.*

**O que DEVE ser expandido:**
- **Renderizador de Markdown e Code Blocks:** Motor de leitura de Markdown com *syntax highlighting* perfeito (obrigatório para Chats de IA e Wikis internas).
- **Visualizadores de Mídia (Document Viewers):** Renderizador de PDF embutido (para leitura de faturas em ERPs) e Lightboxes para galerias de imagens avançadas.
- **Reprodutores de Áudio/Vídeo Customizados:** Players cujos controles obedeçam os tokens da biblioteca Sarak.

---

## Próximos Passos (Faseamento)

A implementação de tudo isso em um único fôlego quebraria a integridade da Sarak. O plano estratégico será "recortar" este documento em várias **Specs Arquiteturais Individuais** (ex: `10-expansao-micro-layout.md`, `11-expansao-data-grids.md`). 
Cada categoria passará pela validação estrita da **Paridade 1:1:1:1:1** antes da próxima começar.
