# START HERE — kit do MANTENEDOR da `@sarak/lib-ui-core`

> **Para quem é este arquivo:** para você, agente de IA (ou pessoa) que vai **EDITAR esta
> biblioteca**. Se o seu trabalho é *usar* a lib num projeto que a importou, você está no kit
> errado — o seu é `sarak-ui/`, e ele viaja dentro do pacote instalado.

Esta pasta é o **índice operacional** da base de specs. Ela não repete o que as specs dizem: ela
diz **em que ordem ler**, **qual fluxo seguir** para cada tipo de mudança, e **qual é o estado
real do repositório agora** — recontado a cada geração, nunca escrito à mão.

⚠️ **`sarak-dev/` é INTERNO.** Não entra no campo `files` do `package.json`, é proibido no
tarball e nenhum consumidor o recebe.

---

## A regra nº 1 — a spec manda; o guia só roteia

O `GUIA-MANUTENCAO.md` **não define regra nenhuma**. Ele é um roteador: cada fluxo diz o que
fazer, em que ordem, e **aponta para a spec dona**. Quando os dois divergirem, a spec vence — e
a divergência é um defeito deste kit, a ser corrigido aqui.

Isto não é preciosismo de organização. É a correção de um defeito real: por meses as skills do
mantenedor mandaram registrar componente novo num arquivo que já tinha sido **removido**, porque
elas duplicavam procedimento em vez de apontar para a fonte. Duplicata envelhece; ponteiro, não.

---

## Leia nesta ordem

| # | O quê | Por quê |
| --- | --- | --- |
| 1 | `specs/specs/00-regras-e-invariantes.md` | O contrato único. Toda regra do módulo está aqui, cada uma com o gate que a cobra — ou com a admissão honesta de que nenhum gate a cobra. |
| 2 | `specs/arquitetura/01-forma-do-produto-e-modos-de-consumo.md` | O que a lib **é** hoje, e os dois modos de consumo. |
| 3 | `specs/arquitetura/00-mapa-do-modulo.md` | Onde cada coisa mora e o que pode importar o quê. |
| 4 | A spec do que você vai mexer | Ver a tabela de fluxos do `GUIA-MANUTENCAO.md`. |
| 5 | `specs/specs/01-gates-e-baseline.md` | **Antes de rodar qualquer gate.** O `run_audit` NÃO está em zero, e acusar regressão onde há dívida conhecida custa uma rodada inteira. |

Os **ADRs** (`specs/adr/`) respondem *por quê* — leia-os quando a pergunta for "por que isto é
assim?" ou quando estiver prestes a propor reverter uma decisão. Eles são **imutáveis**: decisão
errada não se edita, cria-se um ADR novo que a substitui (o protocolo está em
`specs/adr/README.md`).

---

## O que tem aqui dentro

| Arquivo | O que é |
| --- | --- |
| `START-HERE.md` | Este arquivo. |
| `GUIA-MANUTENCAO.md` | Os fluxos de trabalho reais + o Apêndice B (gerado). |
| `state.json` | **GERADO.** O estado do repositório: schemas, tokens, categorias, componentes públicos, gates, auditores, baseline e a base de specs. |

`state.json` e os dois blocos injetados na prosa são regenerados por `npm run dev-kit` e
conferidos por `npm run dev-kit:check`. Não os edite à mão.

---

## O gate que sustenta este kit

```bash
npm run dev-kit         # regenera
npm run dev-kit:check   # confere — e é o único gate que caça PONTEIRO MORTO
```

O `dev-kit:check` reprova por **duas** razões independentes:

1. **Defasagem** — algum número mudou e o kit não foi regenerado. Mesma família de
   `npm run guide:check`.
2. **Ponteiro morto** — a prosa cita um caminho, um gate ou um script que **não existe**.

A segunda é a razão de este kit existir. Regenerar números impede o guia de mentir sobre
*quantos*; a caça a ponteiro morto impede que ele mande você abrir um arquivo removido.

---

## Carimbo deste repositório

<!-- SARAK-DEV:CARIMBO:INICIO -->

- **Versão da lib:** `6.1.0` · **carimbo do estado:** `7ac5abe8ab50`
- **Design:** 28 schemas · 423 tokens únicos no catálogo · MASTER_DESIGN_MAP v13.0.0
- **Componentes:** 77 públicos · 14 categorias atômicas · 3 categorias de engine
- **Gates:** 21 registrados · 12 auditores em `run_audit.mjs`
- **Base de specs:** 11 ADRs · 6 documentos de arquitetura · 16 specs
- **Baseline dos auditores medido em:** 2026-08-11

<!-- SARAK-DEV:CARIMBO:FIM -->

---

## Próximo passo

Abra **`GUIA-MANUTENCAO.md`** e vá direto ao fluxo do que você precisa mudar. Se o que você
precisa fazer não estiver lá, **isso é lacuna deste guia** — resolva a tarefa e depois acrescente
o fluxo. É o mesmo loop de completude do kit do consumidor, aplicado de dentro para fora.
