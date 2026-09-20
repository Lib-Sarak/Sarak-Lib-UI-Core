# Prompt direto 11 — máscara e moeda, sem dependência nova

> Escrito em **2026-09-19** pelo revisor. Prompt **direto** ([[00-prompt-revisor]] §6): não há plan, não há
> linha na fila gerada, e o resumo do executor vive na conversa. Confira que o estado do código ainda bate
> com o que o bloco afirma antes de despachá-lo — prompt guardado em arquivo envelhece.

````md
Leia specs/00-prompt-executor.md e execute a tarefa abaixo.

**Não há plan para esta tarefa** — a instrução completa é este bloco. Cumpra o
ritual de leitura (§2) pulando o passo 1, e entregue o resumo da §5 **nesta
conversa**, não em arquivo.

**Objetivo:** entrada com máscara (`SarakMaskedInput`) e entrada monetária
(`SarakCurrencyInput`), que mantêm o cursor no lugar certo ao digitar, colar e
apagar no meio do texto, e entregam a quem chama o valor limpo, não o formatado.
**Dentro do escopo:** `src/components/atomic/Inputs/` (os dois componentes, a
lógica de máscara em módulo próprio com teste próprio, o barril da categoria e
os testes 1:1), `src/index.ts`, e os gerados por regeneração.
**Fora do escopo:** **nenhuma dependência nova** — esta base tem três
dependências e a máscara é escrita aqui. Validar documento (dígito verificador
de CPF ou CNPJ) é regra de negócio do consumidor, não da lib. Alterar o
`SarakInput`, que os dois compõem por dentro. Nada em `specs/`.
**Referências:** skills `ui-novo-componente`, `ui-arquitetura-design`,
`test-unitario` · `specs/arquitetura/03-superficie-publica.md` §6.1 (composição
atômica: os dois compõem `SarakInput`, nunca `<input>` cru) e a nota do §8.0
sobre `SarakInput` **não** expor `ref` — é a restrição que decide como você
controla o cursor, e o `SarakMultiSelect` mostra o precedente de quem precisou
disso · `specs/specs/11-testes-e-cobertura.md`.
**A forma:** a máscara é um padrão de posições (por exemplo `000.000.000-00`),
com presets nomeados para os documentos e telefones brasileiros; a moeda usa a
formatação nativa do JavaScript, com moeda e idioma vindos de prop, e valor
padrão coerente com o que a lib já usa para idioma. Nenhum texto fixo em
português no componente.
**Pronto quando:** testes cobrindo digitar do zero, colar valor completo, apagar
no meio, cursor depois de cada uma dessas operações, valor limpo entregue a quem
chama, e moeda com zero, negativo e casas decimais; nenhum `<input>` cru; sem
dependência nova em `package.json`; `barrel:check` e `catalog:check` verdes com
os gerados regenerados; `npm run audit` no baseline; `npx vitest run` inteiro
verde.
````
