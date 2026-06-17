---
tipo: "spec"
titulo: "Taxonomia de Componentes Atômicos"
dominio: "Componentes UI Base"
status: "🟢 Implementado"
prioridade: "Alta"
tags: ["spec", "atomic", "taxonomy", "library"]
relacionados: ["03-padrao-biblioteca-atomica"]
---

# 1. Visão Geral
Esta especificação atua como um catálogo descritivo para as hierarquias visuais, variantes e propósitos dos componentes da Sarak-Lib-UI-Core. Enquanto a Spec 03 define a proibição do uso de HTML (Dogfooding e Regras de Negócio), esta Spec define o **comportamento** e as **variantes** de cada componente dentro da taxonomia da biblioteca.

# 1.1 Fronteiras da Arquitetura (O Guia para Agentes e Devs)
Para garantir a sanidade da Sarak UI Core, o ecossistema é estritamente particionado em três camadas mentais e estruturais:

- **Componentes Físicos:** É a métrica de infraestrutura. Refere-se à existência literal de um arquivo `.tsx` exportável no código-fonte.
- **Componentes Atômicos (`src/components/atomic/`):** São blocos de construção indivisíveis, cegos e altamente reutilizáveis (Dumb Components). A única responsabilidade de um átomo é consumir o payload visual do Banco de Dados (Tokens JSON) e renderizar a UI. Eles **NUNCA** possuem lógica de negócio, requisições de API ou regras de estado complexas.
- **Features / Módulos (`src/features/`):** São os "organismos funcionais". Uma feature é a composição de dezenas de átomos acoplada a gerenciamento de estado global (Context/Redux) e regras de negócio. O Agente LLM visual modifica os átomos indiretamente (via BD), o que reflete magicamente em toda a Feature sem alterar a lógica de negócio estrutural.

# 2. Taxonomia de Botões (`<SarakButton>` e derivados)
Para suportar temas complexos como Neon Glow e Frosted Glass sem perder hierarquia ou poluir as interfaces, os botões são categorizados nos seguintes níveis de ênfase:

- **Primary (Primário):** Alta ênfase (ex: "Salvar", "Confirmar"). Recebe fundo preenchido e, caso o engine exija, brilho máximo e sombras profundas. É a principal via de chamada para ação na tela.
- **Secondary (Secundário):** Média ênfase (ex: "Cancelar", "Filtros"). Geralmente renderizado com fundo translúcido ou estritamente com bordas. Em temas extremos como o Neon, absorve a cor matriz apenas através de um aro iluminado, mantendo-se hierarquicamente inferior ao Primário.
- **Ghost / Tertiary (Fantasma / Terciário):** Baixa ênfase (ex: "Ignorar", "Ler Mais"). Não apresenta contornos ou fundos no estado de repouso. Propriedades de blur ou brilho são ativadas exclusivamente nas pseudo-classes (`onHover`, `onFocus`).
- **Danger (Destrutivo):** Ações críticas (ex: "Excluir Conta"). Força a sobreposição do canal semântico de Erro (rubi/vermelho) sobre o estilo do preset atual, gerando um contraste de alerta inescapável.
- **Icon / Utility (`<SarakIconButton>`):** Botões estritamente iconográficos. Distinguem-se por proporções geométricas restritas (quadrados, círculos perfeitos). Devido à sua utilidade de alta densidade (tabelas, modais), consomem blurs ou glows numa escala micro-reduzida.
- **Link Action (`<SarakLinkButton>`):** Abstração puramente textual e sem padding estrutural. Herda tipografia primária e injeta micro-sombras textuais no `hover` para mimetizar o Engine sem invocar propriedades de caixa geométrica (`box-shadow`).

# 3. Micro-Inputs e Superfícies
O comportamento atômico se estende para além de instâncias de clique, controlando o ingresso de dados e as malhas de layout:

- **Controles Binários e Seleções (`<SarakSelect>`, `<SarakCheckbox>`, `<SarakRadio>`, `<SarakToggleSwitch>`):** Abstrações do input nativo do navegador. Eles leem e materializam transições vetoriais (ex: movimento suave da trilha do toggle e brilhos neon ao serem ativados), substituindo completamente as tags `<select>` e `<input type="checkbox">`.
- **Superfícies Universais (`<SarakSurface>`):** O invólucro fundamental de qualquer Card, Modal ou Área de Conteúdo. Controla cortes diagonais cibernéticos, blurs, texturas de ruído e opacidades globais de fundo.
- **Tipografia Restrita (`<SarakLabel>`, `<SarakText>`):** Componentes textuais que consomem estritamente a escala definida no motor (Micro, Muted, Subtitle, H1), banindo o uso de dimensões de fonte avulsas na interface (ex: não existe `text-[10px]` fora deste átomo).
