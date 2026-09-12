---
tipo: "plan"
titulo: "Pente fino de usabilidade no consumidor real, por navegação e interação"
objetivo: "Fechar a campanha com um inventário medido do que ainda falta, colhido navegando e interagindo com o sistema de verdade"
dominio: "Sarak-Lib-UI-Core / Diagnóstico"
status: "🔴 A executar"
prioridade: "Alta"
tags: ["plan", "diagnostico", "usabilidade", "navegador", "sem-codigo"]
relacionados: ["[[specs/05-cromo-e-slots]]", "[[specs/09-temas-e-presets]]", "[[specs/11-testes-e-cobertura]]", "[[specs/13-instalacao-e-atualizacao]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/00-backlog.md"
---

# 1. Objetivo

Um inventário **medido** do que ainda separa a biblioteca de "instalar, escolher o tema e estar pronto" —
colhido percorrendo e operando um consumidor real, tela a tela, não lendo código.

A saída desta plan **não é código**: é uma tabela de achados com dono, que o dono usa para decidir a
próxima campanha.

# 2. Contexto

A campanha inteira nasceu de um veredito do dono comparando dois sistemas na tela: *"o sistema atual
recebeu evoluções funcionais e está muito mais robusto, porém na prática a usabilidade e a experiência
ficaram piores"*. As plans que ela gerou foram todas derivadas de **leitura de código** mais medições
pontuais em navegador.

Isso achou muita coisa e deixou um vão conhecido: **ninguém percorreu o sistema como usuário.** As duas
vezes em que alguém olhou a tela de verdade, o retorno foi imediato e caro — o fundo que não aplicava, os
tokens de cromo sem consumidor, o realce do item ativo que sumiu. Nenhum dos três tinha gate que os
pegasse, e todos apareceram em segundos para quem estava olhando.

Esta plan fecha a campanha do jeito que ela deveria ter começado. A barra configurada pelo administrador
e as preferências do usuário já existem ([[05-cromo-e-slots]] §2.2.2 · [[09-temas-e-presets]] §4.7), e o
passo 3 as exercita.

## 2.1 A armadilha que já custou dois ciclos, e que é pré-condição aqui

Duas camadas de cache separam um `dist/` novo do que o navegador executa ([[13-instalacao-e-atualizacao]]
§9.1):

1. a cópia da lib no store do gerenciador de pacotes — uma **cópia**, não um link;
2. o pré-bundle do bundler do consumidor — que reotimiza por lockfile, versão e config, **nunca por
   conteúdo**, e mantém um cache **por app**, não um por repositório.

Já aconteceu duas vezes de o dono medir contra código velho e reportar como defeito da lib. A segunda vez,
metade dos apps tinha cache novo e metade velho — o sintoma foi *"funcionou, mas não em todas as abas"*, e
custou um ciclo inteiro de diagnóstico para virar uma linha de `rm -rf`.

**Por isso o passo 1 da §5 é bloqueante:** enquanto não estiver provado que o navegador executa o código
que se quer medir, **nenhum achado desta plan vale**, e os que forem colhidos antes disso vão para o lixo,
não para a tabela.

# 3. Escopo

## 3.1 Dentro
- Percorrer e operar um consumidor real em navegador, nas telas que ele tiver.
- Exercitar o painel de design: temas, modo claro/escuro, tokens de cromo, atmosfera/fundo.
- Registrar cada achado no formato da §5 item 5.
- Escrever o resumo da §9 com a tabela completa e o roteamento de cada linha.

## 3.2 Fora
- **Qualquer alteração de código de produção.** Esta plan não conserta nada; ela nomeia.
- Alterar spec fixa, ADR ou gate.
- Mexer no consumidor — nem código, nem dado persistido ([[00-knowledge]]: conserto que mexe no importador
  é recusado, e limpar dado persistido conta como mexer). Limpar **cache de build** não é dado persistido,
  e é justamente o passo 1.
- Julgar se um achado vira plan ou backlog — isso é triagem do revisor, com o dono.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/13-instalacao-e-atualizacao.md` | §9.1 — as duas camadas de cache; é o passo 1 |
| Spec fixa | `specs/05-cromo-e-slots.md` | o contrato do cromo — é contra ele que se mede |
| Spec fixa | `specs/09-temas-e-presets.md` | §2.1 `contraparte`; §4.3 aplicar; §5.1 atmosferas |
| Spec fixa | `specs/07-responsividade-e-multidispositivo.md` | §1 — zero-config é contrato; exigir trabalho do consumidor é bug da lib |
| Spec fixa | `specs/11-testes-e-cobertura.md` | §7 — o que a medição de navegador já cobre, para não repetir |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` | sempre |
| Skill | `ui-arquitetura-design` | julgar usabilidade com critério, não com gosto |

# 5. Instruções de execução

1. **Provar que o navegador executa o código atual — bloqueante (§2.1).**
   Escolher um **marcador literal** presente no `dist/` da lib e ausente na versão anterior (uma classe ou
   string que a última plan mudou serve; um token que já existia antes **não** serve). Então:
   - derrubar o consumidor;
   - apagar **todos** os caches de pré-bundle do consumidor, não só o do app que se vai olhar;
   - reinstalar/reconstruir a cópia da lib no consumidor;
   - subir, e **baixar o bundle que o navegador de fato requisitou**, procurando o marcador nele.

   Marcador ausente = **parar**. Não seguir para o passo 2 "para adiantar".

2. **Percorrer todas as telas** do consumidor, uma a uma, em desktop. Em cada uma, registrar o que um
   usuário faria e o que acontece: a navegação leva aonde diz, o item ativo corresponde à tela, o conteúdo
   cabe, nada fica sob a barra, nada exige rolagem horizontal.

3. **Operar o painel de design**, e para cada eixo abaixo aplicar de verdade (não só pré-visualizar) e
   voltar às telas do passo 2 para ver o efeito:
   - cada tema shippado — pelo menos um claro e um escuro, mais os de referência;
   - **a alternância claro/escuro em cada um** — a paleta volta inteira ao alternar de ida e de volta, ou
     degrada? Os temas do próprio consumidor contam: é neles que a derivação por espalhamento aparece.
   - cada token de cromo: posição da sidebar, layout da barra, alinhamento do conteúdo, colapso da nav,
     auto-hide, posição da busca, espaçamento das abas, cores de realce;
   - fundo/atmosfera: cada opção que o painel oferece, aplicada e conferida na tela;
   - **a barra configurada pelo administrador**: cada preferência em cada posição (não oferecida, no menu,
     fixa na barra), e o que o usuário final vê em cada caso — nos dois cromos e no drawer do celular;
   - **as preferências como usuário final**: modo (inclusive *sistema*), tamanho da fonte, navegação topo ou
     lateral, recolher e idioma — cada uma aplicada e conferida nas telas do passo 2.

   **Isolamento entre usuários — obrigatório:** com dois perfis de navegador abertos ao mesmo tempo, uma
   preferência escolhida num **não** pode aparecer no outro, e **não** pode alterar o tema salvo no
   servidor. É a garantia central da camada de preferências; se ela falhar, é achado de severidade máxima.

   **Trocar `navigationStyle` e repetir os tokens que dependem da outra orientação.** Token de sidebar
   medido com topbar ativa não tem no que agir — isso não é achado, é medição inválida.

4. **Repetir o passo 2 em celular e tablet**, pela emulação de dispositivo do navegador. A regra de
   degradação ([[05-cromo-e-slots]] §2.3) é: **nada some** — cada elemento tem destino declarado. Conferir
   elemento a elemento, não pela impressão geral.

5. **Registrar cada achado** numa linha, e **só** com estes campos preenchidos:

   | Campo | Regra |
   | --- | --- |
   | O que se fez | a ação, reproduzível por quem não estava lá |
   | O que se esperava | e **de onde vem a expectativa** — spec, token oferecido no painel, ou a regra de zero-config |
   | O que aconteceu | o observado, com o valor medido quando houver |
   | Onde | tela, tema, orientação, dispositivo |
   | Severidade | impede de usar · degrada a experiência · incômodo |

   **Sem "achei feio" sem referência.** Um achado sem expectativa ancorada é gosto, e gosto não entra na
   tabela — vai para uma seção separada de *impressões*, claramente marcada como tal.

6. **Não consertar nada.** Achado é achado. Se algo for trivial de corrigir, isso entra na coluna de
   severidade como observação, não no código.

7. Fechar o resumo (§9) com a tabela completa, a seção de impressões, e a lista do que foi **conferido e
   está correto** — o que passou vale tanto quanto o que falhou, porque é o que evita remedir depois.

# 6. Critérios de aceite

- [ ] O passo 1 está no resumo com o marcador nomeado e a prova de que ele estava no bundle servido.
- [ ] Todas as telas percorridas estão listadas, incluindo as que não geraram achado.
- [ ] Todo token de cromo foi exercitado **na orientação em que ele age**.
- [ ] A alternância claro/escuro foi conferida em cada tema testado, ida e volta.
- [ ] Celular e tablet foram percorridos, com a regra de degradação conferida elemento a elemento.
- [ ] Cada achado tem os cinco campos, e a expectativa está ancorada em spec, token ou zero-config.
- [ ] Impressões sem âncora estão numa seção separada e rotulada.
- [ ] **Zero arquivo de produção alterado** — `git status` limpo fora desta plan.
- [ ] A lista do que foi conferido e está correto existe.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o produto desta plan é um relatório, e o que o valida é a reprodutibilidade.

- `git status` → só esta plan mudou. Qualquer arquivo de produção tocado **reprova**.
- Ler o passo 1 do resumo → o marcador é nomeado e a prova é verificável; se faltar, **reprova sem ler o
  resto**, porque nada abaixo dele vale.
- Escolher **três achados ao acaso** e reproduzi-los pelo campo "o que se fez". Não reproduziu = reprova.
- Conferir a cobertura contra a §6: tela que não aparece na lista é lacuna, não ausência de achado.
- Conferir que nenhum achado da tabela é gosto disfarçado de defeito.

# 8. Destino da síntese

**Destino:** `specs/00-backlog.md`

A tabela de achados **não vira spec fixa** — ela é matéria-prima. Na síntese, o revisor tria cada linha com
o dono ([[00-prompt-revisor]] §4) e a manda para **um** destino: plan nova, backlog, ou descartada com o
motivo escrito. Achado sem destino não sobrevive à síntese.

O que for **confirmado como correto** no passo 7 não vai para lugar nenhum — não é verdade nova, é a
verdade que já estava escrita, agora conferida na tela.

Ao registrar no backlog, vale a regra de sempre: reler os itens que já estão lá e **remover** os que esta
passagem provou resolvidos.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
