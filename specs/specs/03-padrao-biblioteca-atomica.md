---
tipo: "spec"
titulo: "Padrão da Biblioteca Atômica"
dominio: "Componentes UI Base"
status: "🟢 Implementado"
prioridade: "Máxima"
tags: ["spec", "atomic", "components", "1-1-1-1-1", "library"]
relacionados: ["01-motor-tema-data-driven"]
---

# 1. Visão Geral
Esta spec define a regra imutável para a construção, manutenção e consumo dos componentes atômicos (Botões, Cards, Inputs, Modais) disponíveis em `/src/components/atomic`. O objetivo de cada componente não é ser apenas bonito por padrão, mas sim se comportar como uma interface "vazia" que consome passivamente a Fonte da Verdade do Design Engine. 

# 2. Regras de Negócio
- **Regra 1 (Ausência de Hardcode):** Sob NENHUMA hipótese um componente exposto da biblioteca pode ter configurações rígidas de UI em classes ou styles inline. Exceção feita a layouts estruturais flexbox (ex: `flex`, `items-center`). Cores, arredondamentos, espaçamentos e tipografias devem sempre mapear variáveis (ex: `className="bg-[var(--sx-color-surface-base)] rounded-[var(--sx-radius-md)]"`).
- **Regra 2 (Paridade 1:1:1:1:1):** Qualquer novo token exigido por um componente base recém-criado deve respeitar a Paridade absoluta da Skill `ui-novo-componente`. Isso significa que o Token deve nascer no `Schema`, no `MasterMap`, no `Database`, no `DesignEngine (Preview)` e no `Catalog JSON`. Nunca crie um token solto dentro de um componente.
- **Regra 3 (Herança Passiva):** Os componentes atômicos nunca injetam o `<SarakUIProvider>` em si mesmos. Eles pressupõem que estão sendo renderizados debaixo de uma árvore que gerencia o contexto CSS, atuando apenas como folhas reativas.
- **Regra 4 (Proibição de HTML Nativo e Dogfooding):** É terminantemente proibido o uso de tags HTML nativas engessadas (ex: `<button>`, `<input>`, `<select>`) em Mocks ou templates da aplicação consumidora. A UI deve sempre utilizar as instâncias atômicas base (`<SarakButton>`, `<SarakInput>`). Além disso, o próprio Design Engine (suas abas, botões de salvar, modais de customização) deve aderir a esta regra ("Dogfooding"), renderizando-se através de seus próprios átomos para refletir as alterações dinâmicas do usuário em tempo real.

# 3. Critérios de Aceite
- [x] Os componentes do diretório `atomic/` utilizam apenas propriedades que começam com `--sx-`.
- [x] Ao alterar um token central do `MASTER_DESIGN_MAP` na aplicação-mãe, todos os componentes que utilizam este token espelham a mudança automaticamente.
- [x] Cada componente exporta adequadamente seus `Props` via interface Typescript, garantindo auto-complete estrito para o desenvolvedor consumidor.

# 4. Plano de Testes (Quality Gate)

## Testes Unitários
- [x] **Deve** checar as propTypes e a renderização em Snapshot, garantindo que nenhum hardcode injetou valores não mapeados de cor, borda ou espaçamento.

## Testes de Contrato (API)
- [x] N/A (Componentes puros de UI não possuem requisições diretas de I/O na raiz).

## Testes E2E (Integração)
- [x] Fluxo visual via Storybook/Preview Canvas validando a metamorfose do componente entre os temas Light/Dark acionando a simetria da variável.
