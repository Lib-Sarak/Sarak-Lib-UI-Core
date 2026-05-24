# Definição: Sarak-UI-Import

## O que é
A skill Sarak-UI-Import é a ferramenta automatizada para integração completa da biblioteca `Sarak-Lib-UI-Core` em sistemas externos (ERP, MyService, Portais, etc). Ela entende o contexto do sistema que está importando a biblioteca e escolhe a arquitetura de inicialização adequada ("Bridges") para criar as tabelas de design no banco de dados.

## Objetivo
- Instalar e referenciar a biblioteca Sarak UI no sistema consumidor.
- Injetar o Provider (`SarakUIProvider`) na raiz do frontend.
- Identificar se o ecossistema é baseado em Node.js ou Python.
- Configurar a inicialização automática do banco de dados (schema `ui_core` e tabelas híbridas) usando as pontes nativas da própria biblioteca.

## Responsabilidades Exclusivas desta Skill
1. Analisar a stack do projeto destino para decidir entre `bridge-node` ou `bridge-python`.
2. Adicionar as rotinas de inicialização no startup do servidor (`instrumentation.ts` para Node ou `app.py` para Python).
3. Garantir que as tabelas do UI Engine não sejam criadas por scripts manuais.

## Quando usar
- Ao criar um novo sistema do ecossistema Sarak que precisará de interface gráfica.
- Quando um sistema legado for migrado para utilizar a `Sarak-Lib-UI-Core`.
- Sempre que o usuário disser "Instale a Sarak UI neste projeto".
