# Catálogo de Inteligência Local (.agents)

Este arquivo é auto-gerado. Ele lista todas as regras de negócio deste projeto para as IAs.

## Skills

- **git-ci-cd**: Instrui a operação de Git e release deste repositório — diagnóstico de estado, commit de rotina, sincronizar develop↔main, abrir PR, ler a CI, merge na main, decidir o nível do bump (minor×major), emitir o release (npm version), o que conferir depois, e limpeza de branch. A fronteira é MUTAÇÃO, não execução: o agente LÊ o estado sozinho (git status/log/diff/fetch e os *:check) e chega com o diagnóstico pronto, mas NUNCA muta o repositório (add, commit, push, merge, tag, checkout, npm version) — esses comandos ele entrega prontos para o PowerShell do dono digitar. Use quando o dono pedir ajuda para commitar, sincronizar branches, abrir PR, decidir o nível de uma release ou emitir uma release deste repositório. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/git-ci-cd/SKILL.md`

- **ui-arquitetura-design**: Define a regra arquitetural do módulo Design Engine do Sarak-Lib-UI-Core. Use ao desenvolver, revisar ou validar o CSS/Design de componentes. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-arquitetura-design/SKILL.md`

- **ui-auditoria-modulo**: Audita a integridade estrutural do Sarak-Lib-UI-Core. Varre o módulo em busca de quebras de Clean Code, falhas de cobertura (Coverage), violações de camada, tipagens inseguras (any), hardcoded, variáveis-fantasma e paridade de Design Tokens. Use APENAS quando pedirem para auditar a base ou validar um PR. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-auditoria-modulo/SKILL.md`

- **ui-criar-preset**: Cria presets modulares parciais (cards, atmosphere, typography, buttons, inputs) no Design Engine da UI Core. Use ao adicionar variantes visuais para componentes específicos. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-criar-preset/SKILL.md`

- **ui-criar-tema**: Orquestra a geração autônoma e paramétrica de temas completos (ThemePresets) para a Sarak UI Core. Use ao configurar esquemas globais de cores e atmosferas. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-criar-tema/SKILL.md`

- **ui-integra-consumidor**: Instala e acopla a base Sarak (@sarak/lib-ui-core) num sistema consumidor React — npm install, peerDependencies, SarakUIProvider, cromo/Shell, temas e o kit de uso `sarak-ui/`. Use quando o usuário pedir para baixar/instalar/importar a biblioteca Sarak UI (ex.: "baixe a biblioteca Sarak-UI <link>, ela será responsável pelo design e pelo tema do sistema"), iniciar a infraestrutura do front-end com a Lib, ou plugar a base num projeto novo. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-integra-consumidor/SKILL.md`

- **ui-novo-componente**: Orquestra a adição de novos tokens de design e componentes atômicos à UI Core, garantindo a paridade nas três fontes do dicionário e o alcance pelo barril público. Use ao adicionar um token ou componente base ao sistema. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-novo-componente/SKILL.md`

- **ui-refatorar-componente**: Orquestra a refatoração, deleção ou modificação de tipagem de propriedades e tokens no Sarak-Lib-UI-Core. Use APENAS quando precisar deletar um token existente ou alterar sua assinatura sem quebrar a paridade das três fontes. NÃO acione proativamente.
  - *Caminho*: `.agents/skills/ui-refatorar-componente/SKILL.md`


## Comandos Customizados


## Subagentes
