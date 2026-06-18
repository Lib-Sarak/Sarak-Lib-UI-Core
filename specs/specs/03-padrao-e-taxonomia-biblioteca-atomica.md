---
tipo: "spec"
titulo: "Padrão e Taxonomia da Biblioteca Atômica"
dominio: "Componentes UI Base"
status: "🟢 Implementado"
prioridade: "Máxima"
tags: ["spec", "atomic", "components", "1-1-1-1-1", "library", "taxonomy"]
relacionados: ["01-arquitetura-motor-tema-design-engine"]
---

# 1. Visão Geral
Esta spec define as regras imutáveis para construção, manutenção e consumo dos componentes atômicos em `/src/components/atomic`, além de atuar como catálogo taxonômico para suas variantes. O objetivo é que cada componente atue como uma interface "vazia" (Dumb Component), consumindo passivamente a Fonte da Verdade do Design Engine.

# 1.1 Fronteiras da Arquitetura (O Guia para Agentes e Devs)
- **Componentes Físicos:** O arquivo `.tsx` no código-fonte.
- **Componentes Atômicos (`src/components/atomic/`):** Blocos indivisíveis e cegos. NUNCA possuem lógica de negócio ou state complexo. Apenas consomem tokens JSON e renderizam UI.
- **Features / Módulos (`src/features/`):** "Organismos funcionais" que compõem átomos + lógica (Context/Redux) + negócio.

# 2. Regras de Negócio
- **Regra 1 (Ausência de Hardcode):** Sob NENHUMA hipótese um componente pode ter configurações rígidas em classes ou inline styles (exceto `flex`, etc). Tudo deve mapear variáveis (`bg-[var(--sx-variavel)]`).
- **Regra 2 (Paridade 1:1:1:1:1):** Todo Token deve nascer no `Schema`, `MasterMap`, `Database`, `DesignEngine` e `Catalog JSON`. Nunca crie tokens soltos.
- **Regra 3 (Herança Passiva):** Átomos não injetam `<SarakUIProvider>`. Eles pressupõem a existência da árvore superior.
- **Regra 4 (Proibição de HTML Nativo e Dogfooding):** É terminantemente proibido o uso de `<button>`, `<input>`, `<select>` puros. Deve-se usar `<SarakButton>`, `<SarakInput>`. O próprio Design Engine obedece a isso (Dogfooding).
- **Regra 5 (Controlador de Variantes Dinâmicas):** É ESTRITAMENTE PROIBIDO escrever injeção manual de `switch/case` ou `<style>` no JSX para rotear design. Abstrações complexas usam um **Hook Puro Controlador** (ex: `useAtomicStyles`).

# 3. Taxonomia de Componentes Atômicos

## 3.1 Botões (`<SarakButton>` e derivados)
- **Primary:** Alta ênfase ("Confirmar"). Fundo preenchido, brilho máximo.
- **Secondary:** Média ênfase. Fundo translúcido ou estritamente com bordas.
- **Ghost / Tertiary:** Baixa ênfase ("Ler Mais"). Sem contornos/fundos em repouso.
- **Danger:** Ações críticas. Usa canal de Erro sobrepondo o preset atual.
- **Icon / Utility (`<SarakIconButton>`):** Proporções geométricas restritas (quadrados/círculos).
- **Link Action (`<SarakLinkButton>`):** Textual puro sem padding.

## 3.2 Micro-Inputs e Superfícies
- **Controles Binários e Seleções (`<SarakSelect>`, `<SarakCheckbox>`, `<SarakRadio>`, `<SarakToggleSwitch>`):** Abstrações reativas que materializam transições vetoriais (movimento e brilhos neon).
- **Superfícies Universais (`<SarakSurface>`):** Invólucro fundamental de Cards, Modais. Controla cortes, blurs e ruídos.
- **Tipografia Restrita (`<SarakLabel>`, `<SarakText>`):** Consomem estritamente a escala definida no motor, banindo o uso de classes de fonte avulsas.

# 4. Critérios de Aceite
- [x] Átomos usam apenas propriedades iniciadas com `--sx-`.
- [x] Alterações no `MASTER_DESIGN_MAP` refletem instantaneamente nos átomos.
- [x] Exportam Props via interface Typescript para auto-complete.

# 5. Plano de Testes (Quality Gate)
- **Testes Unitários:** [x] Checar propTypes e Snapshot sem hardcode vazado.
- **Testes E2E:** [x] Validar a metamorfose visual via Storybook/Preview Canvas.
