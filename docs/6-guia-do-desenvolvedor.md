# 🖥️ Guia do Desenvolvedor (Soberania de Código)

Para manter a Sarak UI como a biblioteca visual de referência do ecossistema, todos os colaboradores devem seguir rigorosamente estes padrões de engenharia.

## 1. Proibição de CommonJS (Require)
- **REGRA DE OURO:** NUNCA utilize `require()` em arquivos `.tsx` ou `.ts`.
- **RAZÃO:** Nossa biblioteca é exportada como ESM nativo. O uso de `require` quebra o processo de pre-bundling do Vite e do Esbuild no consumidor final. Utilize apenas `import` e `export` padrão ES6.

## 2. Injeção de CSS e Tailwind v4
A Sarak UI é otimizada para o motor CSS o mais próximo do nativo possível:
- Estilos globais e tokens residem em `sarak-base.css`.
- Para utilizar o Tailwind no seu módulo:
    - Nunca use aliases; use `@import "@sarak/lib-ui-core/sarak-base.css";` no seu CSS principal.
    - O consumidor final deve adicionar o caminho da `node_modules/@sarak/lib-ui-core` no `@source` do seu `tailwind.config`.

## 3. Fluxo de Contribuição e Sync
Cada módulo é **Independente e Soberano**.
1. Alterações devem ser feitas localmente e testadas em modo **Standalone**.
2. Após a validação local, o commit e push devem ser realizados no repositório individual do GitHub.
3. Para consumir as mudanças no Portal (App), force a atualização: `npm install github:Lib-Sarak/Sarak-Lib-UI-Core --force`.

## 4. Nomenclatura e Semântica
- Use nomes reveladores de intenção.
- Prefira `camelCase` para funções e variáveis, e `PascalCase` para Componentes e Providers.
- Evite abreviações genéricas; o código deve ser auto-documentado.

---
[Anterior: Controles Avançados](./5-controles-avancados.md) | [Voltar: Visão Geral](./0-visao-geral.md)
