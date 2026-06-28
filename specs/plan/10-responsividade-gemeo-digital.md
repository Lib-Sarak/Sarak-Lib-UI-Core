---
tipo: "spec"
titulo: "Responsividade e Isolamento de Viewport no Gêmeo Digital"
dominio: "Design Engine / Sandbox (Preview)"
status: "🔴 Planejamento Inicial"
prioridade: "Alta"
tags: ["spec", "sandbox", "preview", "responsiveness", "media-queries"]
---

# 1. Visão Geral e Descrição do Problema

O Gêmeo Digital (área de Preview/Sandbox) do Sarak UI Core permite a visualização e customização de componentes em diferentes formatos de dispositivo (ex: Mobile, Tablet, Desktop). Quando o usuário altera a seleção do dispositivo, a interface do Sandbox redimensiona com sucesso a "moldura" (container) física do gêmeo digital.

No entanto, o **conteúdo renderizado dentro dessa moldura não se adapta corretamente ao formato simulado**. O layout interno permanece se comportando como se estivesse em uma tela de Desktop.

# 2. Causa Raiz

A raiz do problema encontra-se no mecanismo padrão de responsividade web: **CSS Media Queries**.

A atual estilização dos componentes atômicos e layouts provavelmente depende de *Media Queries* tradicionais (como as classes de breakpoint do Tailwind: `sm:`, `md:`, `lg:` ou diretivas `@media (min-width: ...)`). 
Essas diretivas baseiam-se única e exclusivamente na **largura total da janela (viewport real) do navegador**. 

Como o usuário acessa o Design Engine primariamente de um monitor Desktop, a largura do navegador será grande. Consequentemente:
- O navegador entende que tem espaço sobrando;
- Aplica as regras de Desktop (`lg:` ou `md:`) para todo o código da página;
- Ignora o fato de que aquele componente específico está visualmente comprimido dentro de um espaço restrito (ex: 375px Mobile) dentro do Gêmeo Digital.

# 3. O Desafio Arquitetural

A solução exigirá um mecanismo para isolar a responsividade do Gêmeo Digital do restante do navegador. O conteúdo do Sandbox precisa parar de "escutar" o viewport do monitor e passar a "escutar" apenas a largura do seu próprio container simulado.

Exigências para a Solução Futura:
- Não quebrar a renderização normal da aplicação quando exportada e rodando nativamente na web.
- Manter o padrão *Zero Hardcode* da Biblioteca Atômica.

*(A especificação técnica e arquitetural de solução será elaborada nas próximas etapas deste documento)*
