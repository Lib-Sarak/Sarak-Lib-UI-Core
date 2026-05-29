---
name: Sarak-UI-new-component
description: Skill especialista em adicionar novos componentes atômicos (tokens) ao Sarak-Lib-UI-Core garantindo a paridade 1:1:1:1:1 (Schema, MasterMap, Banco de Dados, Gêmeo Digital, Catálogo JSON).
---

# Skill: Adicionar Componente (Paridade 1:1:1:1:1)

Esta skill é acionada obrigatoriamente SEMPRE que houver a necessidade de criar ou alterar uma propriedade visual (token/componente) no Design System da Sarak UI. O objetivo é evitar dessincronização entre o Front-end, o Catálogo e as instâncias de Banco de Dados de consumidores.

Para instruções detalhadas de execução, leia os arquivos abaixo sequencialmente:
1. [Definição](./1_definicao.md)
2. [Instruções Operacionais](./2_instrucoes.md)
3. [Regras e Limites](./3_regras_e_limites.md)
4. [Checklist de Validação](./4_validacao.md)

> **ATENÇÃO AO AGENTE**: Você deve rodar o script de verificação `npx tsx scripts/verify_parity.ts` localizado dentro do próprio diretório desta skill para atestar a funcionalidade após qualquer mudança.
