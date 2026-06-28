---
name: ui-novo-pipe
description: Cria e registra novos modificadores de dados (Pipes) para a Engine Declarativa. Use ao adicionar formatações (ex uppercase, currency) que as telas consumirão via JSON. NÃO acione proativamente.
---

# Skill: Criar Novo Pipe

Skill responsável por estender o motor de Data Binding da Sarak-Lib-UI-Core, adicionando novos transformadores de strings (Pipes).

## Quando usar
- Quando houver necessidade de aplicar formatações ou máscaras nos dados consumidos pelo JSON (Exemplo: Transformar `{{user.name}}` em maiúsculas usando `{{user.name | uppercase}}`).
- Use APENAS no repositório da Biblioteca Sarak-Lib-UI-Core (para expandir o motor mestre). NÃO acione proativamente.

## Workflow

1. **Definição e Tipagem (Zero Any)**
   - O novo Pipe deve ser uma função pura em TypeScript.
   - **Contrato:** Todo Pipe recebe um valor (`string | number | boolean`) e argumentos opcionais estritos, retornando o valor transformado. O uso do tipo `any` é terminantemente proibido.
2. **Criação do Módulo**
   - Crie o arquivo do Pipe na pasta apropriada da Engine (ex: `src/core/engine/pipes/uppercasePipe.ts`).
3. **Registro no Pipe Resolver**
   - Registre a nova função no dicionário central de Pipes da Sarak (ex: `PipeRegistry`). Isso torna a palavra reservada (ex: `uppercase`) acessível para uso global nos Manifestos.
4. **Testes Unitários**
   - Crie o arquivo `.test.ts` cobrindo os caminhos de sucesso e falhas (ex: passar valores nulos ou indefinidos para o Pipe não deve quebrar o componente, mas retornar um fallback seguro).

## Regras de Ouro
- **Pipes SÃO SÍNCRONOS:** Jamais crie um Pipe que faça requisições assíncronas (Promises). As formatações e substituições na árvore JSON visual precisam ser instantâneas e sem *flicker*.
- Respeite o manifesto arquitetural base `00-manifesto-arquitetural-ui-core.md`.

## Checklist
- [ ] O Pipe possui tipagem estrita (sem any)?
- [ ] O Pipe foi registrado e exposto no dicionário central do Renderer?
- [ ] A função é pura, síncrona e não possui side-effects (como mutar variáveis externas)?
