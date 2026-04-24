# Skill: Sarak UI Discovery — Definição

## O que é
A `sarak-ui-discovery` é a ferramenta de engenharia responsável por migrar a interface do ecossistema Sarak (UI-Core) de um modelo de "Registro por Importação" para um modelo de "Descoberta por API". Ela atua no coração do `SarakShell` e do `NavigationEngine`.

No modelo anterior, cada módulo precisava "se apresentar" ao sistema chamando uma função do Shared. No modelo Atômico v5.5, a UI é quem "procura" pelos módulos através de manifestos JSON servidos via rede.

## Objetivo
- Eliminar o acoplamento de código entre o `UI-Core` e as bibliotecas de domínio.
- Garantir que a `Sidebar` e as `Rotas` sejam geradas dinamicamente a partir de dados, não de código compilado.
- Permitir que módulos sejam adicionados ou removidos do ecossistema sem tocar no repositório do `UI-Core`.

## Responsabilidades Exclusivas desta Skill
1. Identificar padrões de registro rígido (hardcoded) no `UI-Core`.
2. Refatorar o `SarakProvider` ou `SarakShell` para implementar o loop de descoberta de manifestos.
3. Garantir a resiliência da UI quando um módulo de backend estiver offline.

## Quando usar
- Ao detectar que a `Sidebar` está listando itens fixos ou importando componentes de outros módulos `lib-*`.
- Durante a fase inicial de migração para a Arquitetura Atômica v5.5.
- Ao adicionar novas categorias de navegação que devem ser consumidas dinamicamente.
