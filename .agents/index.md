# Catálogo de Inteligência Local (.agents)

Este arquivo é auto-gerado. Ele lista todas as regras de negócio deste projeto para as IAs.

## Skills

- **meta-create-skill**: Padrão oficial para criar e revisar skills do ecossistema Sarak — estrutura em 3 camadas, description (o gatilho), workflow, regras e checklist. Use APENAS quando pedirem para criar, padronizar ou revisar uma skill. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/meta-create-skill/SKILL.md`

- **ui-arquitetura-design**: Define a regra arquitetural do módulo Design Engine do Sarak-Lib-UI-Core. Use ao desenvolver, revisar ou validar o CSS/Design de componentes. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-arquitetura-design/SKILL.md`

- **ui-auditoria-modulo**: Audita a integridade estrutural do Sarak-Lib-UI-Core. Varre o módulo em busca de quebras de Clean Code, falhas de cobertura (Coverage), dependências circulares, tipagens inseguras (any), hardcoded e paridade de Design Tokens. Use APENAS quando pedirem para auditar a base ou validar um PR. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-auditoria-modulo/SKILL.md`

- **ui-contexto-repositorio**: Orquestradora de onboarding e contexto. Use SEMPRE que iniciar uma nova conversa ou precisar se ambientar com as regras estruturais e limites da biblioteca Sarak-Lib-UI-Core.
  - *Caminho*: `.agents/skills/ui-contexto-repositorio/SKILL.md`

- **ui-criar-preset**: Cria presets modulares parciais (cards, atmosphere, typography) no Design Engine da UI Core. Use ao adicionar variantes visuais para componentes específicos. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-criar-preset/SKILL.md`

- **ui-criar-tema**: Orquestra a geração autônoma e paramétrica de temas completos (ThemePresets) para a Sarak UI Core. Use ao configurar esquemas globais de cores e atmosferas. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-criar-tema/SKILL.md`

- **ui-integra-consumidor**: Instala e acopla a base Sarak (@sarak/lib-ui-core) num sistema consumidor React — npm install, peerDependencies, SarakUIProvider+SarakShell, registro de módulos de negócio (módulos-plugin). Use quando o usuário pedir para baixar/instalar/importar a biblioteca Sarak UI (ex.: "baixe a biblioteca Sarak-UI <link>, ela será responsável pelo Shell e tema do sistema"), iniciar a infraestrutura do front-end com a Lib, ou plugar a base num projeto novo. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-integra-consumidor/SKILL.md`

- **ui-novo-componente**: Orquestra a adição de novos componentes atômicos à UI Core garantindo a paridade 1:1:1:1:1. Use ao adicionar um token ou componente base ao sistema. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-novo-componente/SKILL.md`

- **ui-novo-pipe**: Cria e registra novos modificadores de dados (Pipes) para a Engine Declarativa. Use ao adicionar formatações (ex uppercase, currency) que as telas consumirão via JSON. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-novo-pipe/SKILL.md`

- **ui-refatorar-componente**: Orquestra a refatoração, deleção ou modificação de tipagem de propriedades e tokens no Sarak-Lib-UI-Core. Use APENAS quando precisar deletar um token existente ou alterar sua assinatura sem quebrar a paridade 1:1:1:1:1. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-refatorar-componente/SKILL.md`


## Comandos Customizados


## Subagentes
