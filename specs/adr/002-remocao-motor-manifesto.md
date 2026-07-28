---
tipo: "adr"
titulo: "Remoção do renderizador de páginas por manifesto (#2)"
status: "🟢 Aceito"
tags: ["adr", "remocao", "manifesto", "arquitetura", "escopo"]
relacionados: ["[[001-tres-arquiteturas]]", "[[005-modelo-modulos-plugin-e-apps-separados]]"]
substitui: ""
substituido_por: ""
---

# 1. Contexto e Problema

**Data da decisão: 2026-07-22 (decidida) · 2026-07-25 (executada, após a prova empírica).**

O renderizador de páginas por manifesto era a arquitetura **#2** de [[001-tres-arquiteturas]]: um motor que ingeria um JSON autorado por pessoa ou IA e o transformava em aplicação viva — gramática de nós, data binding com pipes, diretivas de controle, dispatcher de eventos, form engine, avaliador seguro de expressões. A tese que ele sustentava era **"100% da interface via manifesto, zero React no consumidor"**.

**A tese falhou empiricamente, e o motivo é estrutural.**

A primeira tentativa do Teste Real — implementar funcionalidade de negócio real de um ERP inteiramente por manifesto — parou em **quatro paredes numa única tela simples de proposta**: overlays que só aceitavam texto plano e não conteúdo estruturado; um campo JSONB que virava `[object Object]` por falta de pipe; a moeda do próprio registro que não passava dinâmica ao pipe de formatação (argumento de pipe era literal, não binding); e a ausência de um tipo de link no catálogo.

O diagnóstico com o mantenedor não classificou isso como quatro bugs. **Um renderizador declarativo genérico é reconstruir uma linguagem de programação dentro de JSON — o gap nunca fecha**, porque cada tela real de produção encontra a próxima parede. Fechar as quatro descobertas apenas adiaria a quinta.

A evidência decisiva não era a falha em si, e sim quem *não* estava usando o motor: o `Sarak-MyService`, o aplicativo de produção que servia de piso mínimo da onda inteira, **nunca adotou o #2**. Rodava no modelo de módulos-plugin com React real e o Design Engine por cima. O aplicativo real sempre viveu no modelo para o qual a decisão pivotou.

Somando: uma tese refutada em campo, um motor sem nenhum consumidor, e um custo de manutenção que se pagava em nada.

# 2. Decisão

**Remover `src/core/Manifest/` inteiro e toda a superfície pública que dependia dele.** Não rebaixar a "opcional", não congelar — remover.

O que saiu junto com o motor: o renderizador e os tipos de manifesto de página no barril público; o Dispatcher e o conjunto de ações declarativas; os pipes de formatação; as diretivas de controle (`renderIf`, `renderFor`, `responsive`) e o avaliador seguro; o registro de componentes nativos do manifesto (`NATIVE_COMPONENTS`) e o gate `RegistryParity` que o cobria; o catálogo de manifesto e seu gerador; os templates manifesto-only; e as skills de autoria e auditoria de manifesto.

**A remoção teve gate empírico, não foi um ato de convicção.** A trava fixada em [[001-tres-arquiteturas]] exigia que o Teste Real primeiro provasse, num sistema real, que o modelo sobrevivente sustenta produção. O teste foi **aprovado pelo dono em 2026-07-25**, e só então a remoção executou — em seis fatias, cada uma com gates verdes, nunca num commit único.

## Prova de que a remoção está completa

Confirmado no HEAD atual, com os comandos e as saídas:

```
$ test -d src/core/Manifest && echo EXISTE || echo "NAO EXISTE"
NAO EXISTE

$ grep -rEn "SarakManifestRenderer|NATIVE_COMPONENTS|core/Manifest" src/ | wc -l
0

$ ls src/**/RegistryParity*
nenhum
```

A pasta não existe, e não sobrou **uma única referência viva** ao renderizador, ao registro de componentes nativos ou ao caminho do módulo em todo o `src/`.

## A consequência técnica que quase derrubou o #3

Durante o ciclo de correções que antecedeu a remoção, o ferramental de qualidade da arquitetura **#3** — o gate de paridade de barril público e o gerador do catálogo de componentes — havia sido construído **em cima do Registry do #2**, porque era ali que a lista de componentes vivia. Deletar o #2 sem tratar isso quebraria o #3.

A regra imposta foi que **cada uma dessas ferramentas passasse a ler o código-fonte por AST antes de o Registry ser apagado**, com `barrel:check` e `catalog:check` verdes em toda fatia. É por isso que `scripts/publicComponents.mjs` existe: ele é a fonte que substituiu o Registry como origem da lista de componentes públicos. Isso mudou o tamanho da tarefa — não era "deletar o #2", era "trocar a fonte do ferramental do #3 e então deletar o #2".

# 3. Consequências

- **Positivas:**
  - **A superfície de autoria some, e com ela uma classe inteira de falha silenciosa.** Nome de tipo, ação ou pipe inexistente num JSON não quebrava a tela — não fazia nada, que é pior. Em React, o mesmo erro é erro de compilação.
  - **O bundle melhorou de forma medida.** O Registry do #2 era *ansioso*: exigia todo componente não-lazy resolvível em runtime, o que era a causa estrutural do piso de bundle. Com ele fora: `dist/` 3,5 MB → 3,2 MB, `index.cjs` 1305 KB → 1257 KB, `index.d.ts` 161,7 KB → 107 KB (−33%), tarball de 60 → 55 arquivos. Foi essa saída que tornou possível a otimização seguinte, que derrubou o chunk de boot do consumidor em 52%.
  - **41 arquivos de teste e cerca de 233 testes** deixaram de ser mantidos e executados a cada rodada.
  - **O ferramental do #3 ficou mais honesto:** derivar a superfície pública do código-fonte por AST é mais confiável do que derivá-la de um registro paralelo que alguém precisava lembrar de atualizar.

- **Negativas (Trade-offs):**
  - **Capacidade validada, perdida.** O #2 tinha passado no Selo da Onda com 9,3/10 para telas simples. O que se removeu não era código quebrado — era código sem demanda.
  - **"Zero React no consumidor" deixa de ser oferecido.** Quem quiser autorar tela sem escrever React não tem caminho na lib. A fronteira passa a ser explícita: o importador possui o layout e escreve React; a lib possui o look.
  - **Documentação e skills mentiram por um período.** Specs e skills do mantenedor continuaram apontando para arquivos e gates removidos — dívida de ponteiro morto que a remoção criou e que precisou de trabalho próprio para fechar.
  - **Recuperar exige o git.** Não há pasta desativada nem flag de compatibilidade; a capacidade vive apenas no histórico.
