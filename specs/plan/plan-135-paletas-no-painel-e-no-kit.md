---
tipo: "plan"
titulo: "Levar as paletas ao painel e ao kit: escolher, criar a partir de uma cor e ajustar por cima"
objetivo: "Fazer o usuário escolher uma paleta pronta ou criar uma a partir de uma cor e de um tipo, com prévia nos dois modos, aplicar e salvar pelo fluxo atual, e continuar ajustando qualquer cor individualmente; e fazer o kit ensinar o tema como estrutura mais paleta"
dominio: "Painel de customização / Kit do consumidor"
status: "🟡 Em execução"
prioridade: "Alta"
tags: ["plan", "rc.4", "paletas", "painel", "kit"]
relacionados: ["[[anexos/rc4-contrato]]", "[[plan-133-motor-de-paletas]]", "[[06-painel-de-customizacao-e-preview]]", "[[12-kit-do-consumidor]]"]
depende_de: "plan-133-motor-de-paletas"
retida_por: ""
destino_sintese: "specs/06-painel-de-customizacao-e-preview.md"
---

# 1. Objetivo

No painel: galeria de paletas agrupada por tipo, criação a partir de cor-base + tipo (+ secundária e acento opcionais), prévia nos dois
modos, aplicar e salvar como hoje, ajuste granular por cima. No kit: o guia e a skill `ui-criar-tema` ensinam tema = estrutura + paleta.

# 2. Contexto

O motor, o token `colorPalette` e o formato do valor são da `plan-133` (leia o §2 dela); os presets vêm da `plan-134` (esta plan
trabalha com o registro, qualquer que seja o número de presets nele). Decisões do dono (2026-10-27): o usuário escolhe uma pronta **ou**
cria a partir de uma cor; ajustar um token num tema e salvar guarda o valor ajustado. **Não há porta nova:** a paleta vai no tema salvo
como o valor de `colorPalette`, pelo fluxo do "Aplicar" e das portas `onSave` que já existem ([[06-painel-de-customizacao-e-preview]],
[[09-temas-e-presets]] §4.6). Escolher paleta é **rascunho** até "Aplicar", como a galeria de temas.

Ajuste granular de uma cor, depois de escolher a paleta, vira valor explícito no `design` e vence a paleta (regra de composição da
`plan-133`). Trocar de paleta pergunta se os ajustes de cor feitos à mão continuam ou são descartados.

# 3. Escopo

## 3.1 Dentro
- `src/features/DesignEngine/` — a seção de paletas no lugar onde o painel edita cor (localize; declare no resumo), seus componentes,
  hooks e testes; a confirmação de troca com ajustes manuais pelo `confirm` do overlay.
- `src/core/i18n/catalogEntries.palette.ts` — rótulos novos do painel (por acréscimo ao arquivo da `plan-133`).
- `browser-tests/` — um caso: escolher preset → criar a partir de cor → ajustar um token → "Aplicar" → o `onSave` recebe `colorPalette` e
  o token ajustado. Roda no fechamento (contrato §9).
- Kit: `sarak-ui/GUIA-FRONTEND.md` (autoria; seção curta "Cor vem da paleta", com o formato de `colorPalette`) e
  `.agents/skills/ui-criar-tema/` (tema = estrutura + paleta; quando sobrescrever cor e como justificar).
- `docs/migracoes.md` — subseção na `## 8.0.0` (o que o usuário do painel vê de novo).

## 3.2 Fora
- O motor e os presets (`plan-133`, `plan-134`); porta de persistência nova; paleta salva como entidade própria (fica dentro do tema).
- Arquivos gerados do kit (regenerados no fechamento).

# 4. Referências obrigatórias

| Tipo | Referência | Por quê |
|---|---|---|
| Plan | `specs/plan/plan-133-motor-de-paletas.md` §2 | token, formato, composição |
| Contrato | `specs/plan/anexos/rc4-contrato.md` §1.9, **§9** | o que entregar e como verificar |
| Spec fixa | `specs/06-painel-de-customizacao-e-preview.md` · `specs/09-temas-e-presets.md` §4.6, §4.7 | rascunho × aplicado, portas de tema |
| Spec fixa | `specs/12-kit-do-consumidor.md` | o que o guia ensina e como |
| **Skill** | `padrao-escrita` + `padrao-typescript` · `ui-arquitetura-design` | sempre · CSS por token |

# 5. Instruções de execução

1. Fotografe o worktree.
2. Galeria de paletas agrupada por tipo, cada uma com amostra dos dois modos; selecionar aplica ao rascunho.
3. "Criar paleta": seletor de cor-base, de tipo, secundária e acento opcionais, prévia ao vivo dos dois modos; confirmar grava a entrada
   `custom:` no rascunho.
4. Ajuste granular continua pelos controles atuais; trocar de paleta com ajustes de cor manuais pergunta (manter ou descartar).
5. Acessibilidade: galeria como `radiogroup` com setas; o seletor de tipo com rótulo; a prévia com nome acessível.
6. Kit (guia e skill); subseção em `docs/migracoes.md`.
7. **Prévia para o dono:** capturas PNG do painel numa página `C:\tmp\sarak-rc4-previa\135\index.html` (imagens na mesma pasta,
   caminhos relativos, abre sem servidor), na ordem do fluxo: galeria por tipo (claro e escuro), "criar paleta" com a prévia ao vivo,
   um ajuste granular por cima, a pergunta ao trocar de paleta com ajustes e a tela de amostra depois do "Aplicar". Legenda em cada
   captura. Gerada pelo harness do caso de navegador; o comando que a regenera vai no resumo.
8. `npm run verify -- --tier=quick` uma vez, resumo colado (contrato §9).

# 6. Critérios de aceite

- [ ] Escolher preset e criar a partir de cor mudam o rascunho e só gravam no "Aplicar" — teste de componente.
- [ ] O valor de `colorPalette` gravado é o formato da `plan-133`, e um ajuste de token sobrevive ao salvar — teste.
- [ ] Trocar de paleta com ajustes manuais pergunta, e as duas respostas fazem o que dizem — teste.
- [ ] Galeria navegável por teclado, com papéis e nomes — teste por papel.
- [ ] Caso de navegador escrito (roda no fechamento).
- [ ] Prévia do painel gerada em `C:\tmp\sarak-rc4-previa\135\index.html`; a aprovação do dono é registrada pelo revisor no veredito.
- [ ] Guia e skill ensinam o formato e a regra da sobrescrita justificada.
- [ ] Resumo com a tabela item → teste.

# 7. Como verificar (uso do revisor)

**Gate:** nenhum — comportamento do painel provado por teste de componente e por um caso de navegador no fechamento.

- `npx vitest run src/features/DesignEngine` — uma vez (nenhuma outra plan da `rc.4` toca o painel).
- Guia e skill lidos como quem cria o primeiro tema.
- O revisor passa o caminho da prévia ao dono; o veredito só fecha com a aprovação dele.
- Diff lido; `git diff --stat` só com a §3.1. O `quick` do executor é aceito pelo resumo colado.

# 8. Destino da síntese

**Destino:** `specs/06-painel-de-customizacao-e-preview.md` — novo §: "Paletas no painel": escolher, criar a partir de cor, rascunho até
"Aplicar", ajuste granular vence a paleta, troca com ajustes pergunta.

---

# 9. Resumo da execução

---

# 10. Veredito
