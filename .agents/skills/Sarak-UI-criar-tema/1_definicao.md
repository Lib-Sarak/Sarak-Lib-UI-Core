## O que é

Esta skill orquestra a geração autônoma e paramétrica de temas completos (ThemePresets) orientados a dados para o sistema Sarak UI. No Sarak UI, um Tema não é um conjunto de componentes visuais, mas sim um dicionário restrito de tokens atômicos (cores, opacidades, geometrias e animações) preenchidos em um único objeto de configuração. Esta skill ensina o agente a consumir o Master Map e preencher um novo preset garantindo a paridade arquitetural (1:1:1:1:1), sem inventar novos tokens.

## Objetivo

- Gerar templates de temas 100% atualizados via script (evitando defasagem estrutural).
- Preencher todos os tokens atômicos de um tema baseando-se na emoção ou identidade visual desejada.
- Acoplar o novo tema criado ao catálogo mestre (`src/core/Design/presets/themes/index.ts`).
- Manter a integridade de dados (nenhum token faltante, nenhum token inventado).

## Responsabilidades Exclusivas desta Skill

1. Executar o script gerador de template de temas.
2. Definir a paleta e os valores matemáticos de layout para o novo tema.
3. Preencher o template `ThemePreset` e validá-lo contra o schema Typescript.
4. Exportar e injetar o novo tema no dicionário global de presets do Sarak.

## Quando usar

- Quando o usuário ou o sistema solicitar a criação de um "novo tema visual", "nova aparência", ou "novo preset".
- Quando um novo cliente/módulo necessitar de uma identidade gráfica padronizada dentro do Sarak UI.
