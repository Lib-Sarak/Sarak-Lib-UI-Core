---
tipo: "plan"
titulo: "Substituir as mídias hospedadas por terceiros por atmosferas geradas pela própria lib"
objetivo: "Todo fundo que a biblioteca entrega funciona sem rede e sem depender de nenhum servidor de terceiro"
dominio: "Sarak-Lib-UI-Core / Design Engine / Atmosfera"
status: "🔴 A executar"
prioridade: "Média"
tags: ["plan", "atmosfera", "presets", "plug-and-play"]
relacionados: ["[[specs/09-temas-e-presets]]", "[[specs/05-cromo-e-slots]]", "[[adr/006-zero-marca-soberania-host]]"]
depende_de: ""
retida_por: ""
destino_sintese: "specs/09-temas-e-presets.md"
---

# 1. Objetivo

Os fundos de atmosfera que a lib entrega passam a ser gerados por ela mesma, sem requisição a servidor de
terceiro — e foto ou vídeo de verdade permanecem possíveis, como ativo do consumidor.

# 2. Contexto

`src/core/Design/presets/components/atmosphere.ts:4-46` define `MEDIA_PRESETS` com quatro entradas, e as
quatro apontam para fora:

| Preset | Onde mora | Peso medido |
| --- | --- | --- |
| `bg-kinetic-flow` | `test-videos.co.uk` | 1.022 KB |
| `bg-stellar-nebula` | `images.unsplash.com` | 456 KB |
| `bg-cyber-grid-img` | `images.unsplash.com` | 245 KB |
| `bg-dark-cinematic` | `images.unsplash.com` | 1.258 KB |

Os quatro respondem hoje (verificado). O problema não é estarem fora do ar — é a categoria de falha: um
sistema atrás de proxy corporativo, com CSP restritiva, offline, ou no dia em que uma dessas URLs mudar, vê
um fundo que **some sem erro**. O dono foi direto: *"a biblioteca é plug and play — na prática o importador
só escreve a tela em React e escolhe o tema, e todo o restante a biblioteca faz"*. Uma aba do catálogo que
depende de um servidor de terceiro não cumpre isso.

**A alternativa óbvia — empacotar os arquivos — foi descartada por duas razões.** A primeira é peso: são
~2,9 MB contra um `dist/` de 3,4 MB, distribuído por git com o `dist/` commitado. A segunda é mais séria:
hospedar vira **redistribuição**, e aí entra licença. As fotos são Unsplash License; o vídeo é *Big Buck
Bunny*, da Blender Foundation, sob **CC-BY** — que exige atribuição. Uma lib com regra de zero-marca
([[adr/006-zero-marca-soberania-host]]), que não tem onde carimbar crédito de terceiro no produto do
consumidor, não deveria redistribuir obra que a exige.

**O caminho certo já existe dentro da própria lib.** `src/styles/_atmosphere.css` gera **33 texturas
inteiramente em CSS**, por `[data-sx-texture="…"]::before` com gradientes — aurora boreal, campo estelar,
blueprint, favo de mel, seda líquida, circuitos. Peso zero, licença nenhuma, funciona offline. É a aba
"Texturas" do mesmo catálogo, ao lado da aba que depende de terceiro. `TEXTURE_PRESETS` inclusive já é
**derivado** de `TEXTURE_OPTIONS` por `.map()`, em vez de duplicado — o padrão que [[09-temas-e-presets]]
§5.1 registra como o correto.

Foto e vídeo de verdade continuam existindo — como **ativo do consumidor**, pela porta do upload no painel
(o predicado de mídia de [[10-seguranca-e-acessibilidade]] §2.1 c-bis aceita mídia embutida) ou por URL própria. É o mesmo desenho de `customThemes`: a lib dá o mecanismo,
o dado é do importador.

[[09-temas-e-presets]] §8 já registra isto como backlog nunca executado: *"Expansão/hospedagem de mídias de
atmosfera — biblioteca de texturas/imagens de fundo além das embutidas, e a decisão de onde elas ficam
hospedadas"*. Esta plan é a decisão.

**Remover os quatro ids é quebra de contrato público** — um consumidor pode ter salvo um deles no tema
persistido. E, como [[09-temas-e-presets]] §4.4.3 lembra, valor persistido vence default: tirar do catálogo
não tira do tema de quem já salvou. A degradação para esse caso tem de ser desenhada, não descoberta.

> ✅ **Pré-requisito cumprido (2026-09-09).** O cromo dos dois modos já honra `globalBackgroundImageUrl` —
> escolher uma mídia muda a tela, então a substituição desta plan é verificável de verdade. Contrato em
> [[05-cromo-e-slots]] §3.1.

# 3. Escopo

## 3.1 Dentro
- `src/core/Design/presets/components/atmosphere.ts` — `MEDIA_PRESETS` passa a ser composto de atmosferas
  geradas; os quatro hot-links saem.
- `src/styles/_atmosphere.css` — as composições de tela cheia que os presets novos usam, se as 33 texturas
  existentes não bastarem.
- `src/core/Design/schema/atmosphere.ts` — só se um valor novo de enum for necessário; nenhum token muda de
  assinatura.
- `src/features/DesignEngine/Canvas/components/AtmosphereCatalog.tsx` — a aba de mídia passa a
  previsualizar o que os presets novos são.
- Testes de preset e o snapshot do catálogo de atmosfera.
- `docs/migracoes.md` — nota MAJOR: os quatro ids saem, e o que acontece com quem tinha um deles salvo.

## 3.2 Fora
- O token `globalBackgroundImageUrl` — continua existindo, com a mesma assinatura; é a porta do consumidor.
- `SarakBackgroundRenderer` — continua servindo imagem e vídeo por URL.
- `TEXTURE_PRESETS` e as 33 texturas existentes — não mudam.
- `MediaUploaderControl` e a fronteira de validação — já resolvidos; ver [[10-seguranca-e-acessibilidade]] §2.1 c-bis.
- Empacotar arquivo binário no `dist/` — descartado nesta plan pelas razões da §2.
- Qualquer refactor não listado em §5.

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
| --- | --- | --- |
| Spec fixa | `specs/09-temas-e-presets.md` | §5.1 (presets derivados em vez de duplicados), §8 (o backlog que esta plan fecha), §4.4.3 (valor persistido vence default) |
| Spec fixa | `specs/05-cromo-e-slots.md` | §3 — atmosfera é do tema, ornamento localizado é do slot |
| Spec fixa | `adr/006-zero-marca-soberania-host.md` | por que a lib não carimba nada de terceiro no produto do consumidor |
| Spec fixa | `specs/03-versionamento-e-release.md` | §5 — o que a remoção de nome público exige |
| Spec fixa | `arquitetura/02-design-engine.md` | como token vira CSS, e onde a textura é aplicada |
| Contexto | `00-contexto.md` · `00-knowledge.md` | sempre |
| Skill | `padrao-escrita` + `padrao-typescript` | sempre |
| Skill | `ui-criar-preset` | a skill dona de preset parcial de atmosfera |
| Código | `src/core/Design/presets/components/atmosphere.ts` | os quatro presets a substituir e o padrão derivado do `TEXTURE_PRESETS` |
| Código | `src/styles/_atmosphere.css` | as 33 texturas geradas, e como cada uma é montada |
| Código | `src/features/DesignEngine/Canvas/components/AtmosphereCatalog.tsx` | como a aba previsualiza cada preset hoje |

# 5. Instruções de execução

1. Ler as referências da §4 e o `_atmosphere.css` inteiro — o inventário do que já se gera é o ponto de
   partida, não uma folha em branco.
2. Desenhar as atmosferas de tela cheia que substituem as quatro entradas, aproveitando o motor existente.
   **Pronto quando** cada uma funciona com a rede desligada e nenhuma requisição sai da página.
3. Substituir `MEDIA_PRESETS` pelas novas, preferindo derivar de uma lista de opções, como
   `TEXTURE_PRESETS` já faz, em vez de escrever entradas à mão.
4. Desenhar a degradação de quem tem um dos quatro ids salvo no tema: o valor persistido continua sendo uma
   URL válida e o renderizador segue servindo. **Decidir e registrar** o que acontece — nada quebra em
   silêncio, e o comportamento escolhido vai para a nota de migração.
5. Ajustar a aba do catálogo para previsualizar os presets novos.
6. Escrever a nota MAJOR em `docs/migracoes.md`: os ids que saem, o que acontece com quem os tinha salvos, e
   como continuar usando foto ou vídeo próprio.
7. Rodar `npx vitest run`, `npm run audit` (o `auditor_presets` tem de seguir com 0 chaves órfãs) e
   `npm run build`.
8. Confirmar, com a rede desligada, que nenhum preset da lib dispara requisição externa.

# 6. Critérios de aceite

- [ ] Nenhuma entrada de `MEDIA_PRESETS` aponta para servidor de terceiro.
- [ ] Cada preset novo renderiza com a rede desligada, sem requisição externa — verificado, não presumido.
- [ ] Nenhum arquivo binário novo entrou no `dist/`.
- [ ] `globalBackgroundImageUrl` mantém a assinatura; foto e vídeo por URL do consumidor seguem funcionando.
- [ ] Quem tinha um dos quatro ids salvo tem comportamento definido e documentado, sem quebra silenciosa.
- [ ] A aba de atmosfera previsualiza os presets novos corretamente.
- [ ] `auditor_presets` com 0 chaves órfãs; `npm run audit` comparado ao baseline.
- [ ] `docs/migracoes.md` tem a nota MAJOR.
- [ ] `npx vitest run` verde; `npm run build` verde.

# 7. Como verificar (uso do revisor)

**Gate:** `nenhum` — o invariante ("nenhum preset shippado depende de servidor de terceiro") é sobre o dado
shippado, e o dono natural seria uma regra de gate; mas a plan 66 já gasta a única regra de gate da
campanha, e a [[00-prompt-revisor]] §5.4 admite no máximo uma por plan. O invariante fica com um teste que
varre `MEDIA_PRESETS` procurando esquema `http`/`https`, e **isso está declarado aqui** em vez de ser
esquecido: se o dono quiser a régua no nível de gate, é plan própria.

- `git diff --stat` → só os arquivos de §3.1; nenhum binário.
- `grep` por `http` em `src/core/Design/presets/components/atmosphere.ts` → sem ocorrência.
- `npx vitest run src/core/Design` → verde, com o teste que varre os presets.
- `npm run audit` → `auditor_presets` com 0 órfãs, comparado ao baseline.
- Verificação manual com a rede desligada → nenhum preset dispara requisição.
- `npm run build` → verde; `dist/` sem arquivo binário novo.
- `npx vitest run` → verde.

# 8. Destino da síntese

**Destino:** `specs/09-temas-e-presets.md`

O item 1 do backlog da §8 **fecha** — e a decisão que o fecha vai para a §5.1. Texto pronto para transporte:

> **Nenhum preset shippado depende de servidor de terceiro.** As atmosferas que a biblioteca entrega são
> geradas por ela — o mesmo motor CSS das texturas —, então funcionam offline, não carregam licença de
> terceiro e não somem quando uma URL externa muda. Foto e vídeo de verdade continuam suportados por
> `globalBackgroundImageUrl`, como ativo do **consumidor**: ele envia pelo painel ou informa a própria URL.
> É a mesma divisão de `customThemes` — a lib dá o mecanismo, o dado é do importador.

---

# 9. Resumo da execução

---

# 10. Veredito

---

# 11. Síntese
