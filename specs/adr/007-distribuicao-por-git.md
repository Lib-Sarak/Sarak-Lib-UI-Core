---
tipo: "adr"
titulo: "Distribuição por Git, sem registry npm"
status: "🔴 Substituído"
tags: ["adr", "distribuicao", "empacotamento", "atualizacao", "dx", "cli"]
relacionados: ["[[005-modelo-modulos-plugin-e-apps-separados]]", "[[003-remocao-backend-proprio]]"]
substitui: ""
substituido_por: "[[008-releases-com-tag-e-semver-em-git]]"
---

# 1. Contexto e Problema

**Data da decisão: 2026-07-21 (escopo fixado) · reforçada em 2026-07-26 (aviso ativo).**

A `@sarak/lib-ui-core` nunca foi publicada em registry. Consumidores a instalam por especificação **git** (`github:…`) ou por **caminho local** (`file:`/`link:`). O `package.json` confirma: há `bin` e `files` declarados, e **não existe `publishConfig`**. O repositório tem **zero tags git em 329 commits**.

Isso funciona — até a hora de atualizar. E aí produz uma **falha silenciosa**, que é a pior categoria.

**O mecanismo do defeito:** o lockfile existe precisamente para congelar o commit resolvido. Como a `version` do pacote não muda entre builds, **`npm install` vira no-op** — ele reinstala fielmente o pacote velho e termina com sucesso. O consumidor não recebe nenhum sinal, e o comando natural reforça o engano.

**Não é hipótese. São dois incidentes reais, medidos:**

**Incidente 1 — o consumidor preso quatro commits atrás, por semanas.** Um lockfile pinado num commit antigo enquanto o `main` já tinha avançado; faltavam ali correções inteiras. Foi descoberto **por acaso**, ao investigar outra coisa. O empacotamento estava correto: `npm pack --dry-run` produzia o tarball certo. O defeito estava no *fluxo de atualização*, que não existia. A consequência direta era grave: se o Teste Real tivesse rodado naquele estado, o agente teria exercitado a lib antiga e produzido **achados falsos**.

**Incidente 2 — o build stale que reprovou uma spec por engano.** Numa validação de browser, o cromo mobile foi **reprovado pelo dono** por não colapsar em hambúrguer. A investigação mostrou que **o código estava correto**: o consumidor rodava uma cópia velha no store do pnpm, e como a `version` não mudava, o gerenciador não recopiou o `dist:` — cache mais fundo do que aquele que se costuma limpar. Custou uma rodada inteira de investigação para provar que não havia bug.

O denominador comum dos dois: **a distribuição por Git não dá identidade de build nem sinal de desatualização, e a intuição do desenvolvedor não cobre esse buraco.**

# 2. Decisão

**Manter a distribuição por Git enquanto o módulo estiver em desenvolvimento — e compensar explicitamente o que ela não entrega.** Tags, releases e publicação em registry ficam fora, por decisão do mantenedor.

Três compensações, cada uma atacando uma parte do buraco:

**1. Identidade de build verificável.** `dist/BUILD_INFO.json`, gerado no build, com `baseCommit`, `builtAt` e `libVersion`.

> ⚠️ **A armadilha do `baseCommit`, que já produziu um falso negativo real.** O campo se chamava `commit`, implicando "o commit que este build publica". Isso é **impossível de garantir**: o `dist/` é commitado *depois* de gerado, e o hash de um commit depende do próprio conteúdo — gravar dentro dele o próprio hash é auto-referência circular. Na prática, um consumidor recém-atualizado leu o `BUILD_INFO` e **pareceu desatualizado estando em dia**. O campo foi renomeado para `baseCommit` (semântica honesta: o commit-BASE sobre o qual o build rodou, sempre um passo atrás do que o publica) e ganhou um campo `note` autoexplicativo dentro do próprio JSON.
>
> **Para responder "estou atualizado?", use `sarak-ui check` ou o `resolved` do lockfile. NUNCA o `BUILD_INFO`.**

**2. Comando de atualização explícito.** Um `npm install` simples não basta — o comando precisa **furar o pin do lockfile e o cache**, que são as duas causas reais do travamento. O comando é gerado pelo scaffolder e reflete o gerenciador detectado no projeto.

> **Regra dura, escrita com sangue:** **comando não executado de verdade não entra.** Foi *deduzir* o comando de um gerenciador a partir da documentação que **quebrou o repositório de um consumidor real** — um `npm install` num workspace pnpm fez o npm entrar no store e tentar rodar o script de preparação de um pacote de terceiro. Cada comando por gerenciador foi validado executando num consumidor daquele gerenciador; um caso que não pôde ser validado ficou marcado como não-validado e **não é sugerido**. Gerenciador desconhecido não recebe chute — degrada para instrução genérica.

**3. Aviso ativo no terminal do consumidor.** `sarak-ui check --notify`, ligado pelo scaffolder como `predev` — o aviso aparece a cada `npm run dev`, que é onde o desenvolvedor olha. **Silêncio absoluto quando em dia** (ruído em toda execução vira ruído ignorado); bloco destacado quando há versão nova, com as duas versões e o comando certo. **Sempre `exit 0`**, inclusive sem rede, sem git ou com repositório inacessível — o aviso jamais derruba o `dev` do consumidor. A implementação vive em `bin/scaffold/checkUpdate/`.

A fronteira permanece: a lib **nunca instala nada sozinha** e **nunca chama a rede em runtime de aplicação**. O aviso é uma mensagem emitida por um comando que o próprio consumidor dispara; instalar segue sendo ato deliberado dele. E não se usa gatilho de pós-instalação para isso — é superfície de supply chain e roda no momento errado, já que quem acabou de instalar está, por definição, em dia.

**Registrado explicitamente: "sempre a mais atual" é SOB COMANDO.** Atualização automática de verdade exigiria **registry + faixa semver**, e não existe configuração que faça um `install` puxar sozinho o HEAD novo de uma dependência git.

## O achado técnico que a intuição erra

No modo `file:`/`link:`, a primeira implementação comparava o **conteúdo** dos arquivos de identidade instalados contra os da fonte — e dizia **"em dia" com a instalação comprovadamente velha**. A causa: o **pnpm hardlinka** os arquivos para o store, então reescrever um arquivo **existente** (o `BUILD_INFO.json` de um rebuild) propaga sozinho para a cópia instalada. O que o hardlink **não** propaga é arquivo **adicionado ou removido** — que era exatamente o sintoma real observado. A assinatura passou a incluir o **inventário** (caminho e tamanho, recursivo) das pastas publicadas. Fica registrado porque a intuição "comparar o conteúdo basta" é forte e está errada aqui.

# 3. Consequências

- **Positivas:**
  - **Iteração sem cerimônia.** Um módulo em desenvolvimento evolui sem ritual de release, sem decidir número de versão a cada mudança e sem infraestrutura de publicação.
  - **A falha silenciosa deixou de ser silenciosa.** O consumidor é avisado onde ele já está olhando, sem precisar lembrar de verificar nada.
  - **Os dois modos de dependência são cobertos.** O modo local, que é o que mais dói (rebuildar a lib não chega ao consumidor e nada avisa), tem tratamento próprio.
  - **O aviso é bem-comportado por desenho:** silencioso em dia, tolerante a ambiente hostil, e nunca derruba o fluxo de quem o recebe.
  - **A honestidade sobre `baseCommit` está no próprio artefato.** O `note` dentro do JSON impede que alguém "conserte" o nome de volta no futuro sem entender por quê.

- **Negativas (Trade-offs):**
  - **A causa-raiz continua de pé.** O aviso é um paliativo excelente para um problema que só o registry resolve na origem. `npm install` continua sendo no-op; a diferença é que agora alguém avisa.
  - **Sem versão significativa, não há como travar nem migrar.** O consumidor não consegue fixar uma versão e atualizar quando quiser, porque não há o que fixar. Zero tags em 329 commits é a medida disso.
  - **Manutenção proporcional ao número de gerenciadores.** Cada gerenciador de pacotes suportado exige um comando validado na prática — não é trabalho de documentação, é trabalho de execução.
  - **`dist/` commitado no repositório.** É a consequência de instalar por `github:` sem etapa de preparação: o artefato de build viaja versionado, com o ruído de diff que isso implica.
  - **O modelo já produziu dois incidentes com custo real** — semanas de defasagem em um caso, uma rodada inteira de investigação de bug inexistente no outro.

> ⚠️ **Escopo:** este ADR decide **como o pacote é distribuído**. A política do **número de versão** — inclusive a renumeração da lib — é decisão separada e mora na spec de versionamento e release. Ela existe; não é resolvida aqui.
