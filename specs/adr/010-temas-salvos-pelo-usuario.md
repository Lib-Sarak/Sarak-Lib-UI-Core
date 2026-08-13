---
tipo: "adr"
titulo: "Temas salvos pelo usuário em runtime — segunda porta de persistência"
status: "🔴 Substituído"
tags: ["adr", "persistencia", "temas", "design-engine", "painel"]
relacionados: ["[[003-remocao-backend-proprio]]", "[[009-persistencia-tenant-aware]]"]
substitui: ""
substituido_por: "[[011-tema-salvo-por-uma-porta-de-escrita]]"
---

# 1. Contexto e Problema

**Data da decisão: 2026-08-12.**

Hoje "salvar um tema" é, deliberadamente, **exportar um arquivo JSON** — o `SaveThemeModal.tsx` (rotulado
"Exportar Tema (JSON)") baixa o design atual; o comentário de `useThemePersistenceHandlers.ts:19-24` registra
a decisão com todas as letras: *"não existe mais 'salvar no banco'"*. É um fluxo de **desenvolvedor**: o
arquivo precisa ser colado em código e passado via `customThemes` no `SarakUIProvider`, o que exige acesso ao
repositório e um novo deploy.

`ThemeList.tsx` — a lista de temas selecionáveis no painel — hoje mescla só duas fontes: `layouts`
(`GLOBAL_THEMES`, embutidos na lib) e `customThemes` (a prop, definida em código pelo dev). **Não existe
terceira fonte**: um usuário final do sistema importador, sem acesso ao código, não tem como criar um tema no
painel e vê-lo persistir — a única ação disponível para ele é a mesma "Exportar JSON" pensada para o dev.

O dono pediu explicitamente: **o usuário final poderá salvar temas criados** — sem depender de deploy. Isto
é capacidade nova, não conserto de um defeito.

# 2. Decisão

**Duas ações passam a coexistir no painel, sem uma substituir a outra:**

| Ação | Para quem | O que faz | Muda nesta decisão? |
| --- | --- | --- | --- |
| **Exportar JSON** | desenvolvedor | baixa o arquivo; o dev cola em código e passa via `customThemes` | **não** — intocada |
| **Salvar** *(nova)* | usuário final | persiste via o backend do sistema importador; aparece na lista de temas a partir daí, sem redeploy | é o objeto deste ADR |

`options.persistence` ganha **três portas novas**, na mesma filosofia "traga sua persistência" de
[[003-remocao-backend-proprio]] e [[009-persistencia-tenant-aware]] — a lib nunca fala com servidor; quem
persiste é o backend do consumidor, chamado pela lib:

```ts
onSaveTheme?: (theme: ThemePreset) => Promise<void> | void;
onLoadThemes?: () => Promise<ThemePreset[]> | ThemePreset[];
onDeleteTheme?: (themeId: string) => Promise<void> | void;
```

**Reaproveita o tipo `ThemePreset` já existente** (`{ id, name, description, design }`) — é o mesmo shape que
o export e os temas embutidos já usam ([[09-temas-e-presets]] §2.1 item 4: *"o mesmo formato serve para os
dois lados"*). Nenhum tipo novo é criado para isto.

**Escopo do CRUD, decidido aqui:** **criar + listar + apagar**. Editar ou renomear um tema já salvo fica
**fora** deste corte — quem quiser ajustar um tema salvo apaga e salva de novo. É decisão deliberada para não
inflar o primeiro corte; pode virar ADR próprio se a demanda aparecer.

**Sem `onSaveTheme`/`onLoadThemes` configurados, o botão "Salvar" não aparece** (ou aparece desabilitado,
com dica explicando por quê) — não regride nada, e "Exportar JSON" continua **sempre** disponível, com ou sem
as portas novas.

**Todo tema recebido de `onLoadThemes` é dado não-confiável**, exatamente como um tema vindo de
`localStorage` ou de arquivo — passa pela mesma fronteira de [[10-seguranca-e-acessibilidade]] §2.1 antes de
poder ser aplicado. A porta não abre um caminho novo de injeção; ela só amplia **de onde** o dado de tema pode
vir.

# 3. Consequências

- **Positivas:**
  - Usuário final ganha personalização real sem depender de acesso a código nem de deploy — o pedido do dono.
  - Zero mudança para quem não configurar as portas novas: sem elas, o painel se comporta exatamente como
    hoje.
  - Reaproveita padrão já estabelecido (portas opcionais, `ThemePreset` como shape único, validação na
    fronteira) em vez de inventar um mecanismo paralelo.
  - A chave tenant-aware de [[009-persistencia-tenant-aware]] resolve, de graça, o escopo de "tema salvo de
    quem" — é o backend do importador quem decide (por tenant, por usuário, ou os dois), a lib só chama a
    porta.

- **Negativas (Trade-offs):**
  - Mais três callbacks a documentar no contrato público.
  - O painel passa a ter uma chamada assíncrona nova (`onLoadThemes`) com estado de carregamento/erro que
    não existia antes na lista de temas.
  - Sem editar/renomear no primeiro corte, a experiência de "ajustar um tema salvo" é apagar e recriar — uma
    limitação real, aceita conscientemente.
  - Mais uma fronteira de validação a manter em sincronia com `validateDesign` — mas é a mesma função, não
    uma nova.

> **Escopo:** este ADR decide o contrato das três portas novas e o corte de CRUD. A implementação — UI do
> botão "Salvar", a lista de "Meus Temas", a exclusão com confirmação — é a
> `plan-38-salvar-tema-em-runtime`.
