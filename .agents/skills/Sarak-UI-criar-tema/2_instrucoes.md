# Workflow de Execução: Criar um Novo Tema (ThemePreset)

Execute os passos a seguir sequencialmente para criar um novo tema paramétrico.

## Passo 1: Definição da Identidade

Defina claramente o escopo do novo tema respondendo (ou inferindo do pedido do usuário):
- **ID do Tema** (ex: `meu-tema-escuro`)
- **Nome** (ex: `Meu Tema Escuro`)
- **Modo** (`dark` ou `light`)
- **Vibe / Paleta Base** (ex: Tecnológico com Neon, Minimalista corporativo, etc).

## Passo 2: Geração Dinâmica do Template

Utilize o terminal para executar o script gerador de templates presente nesta skill. Este script extrai dinamicamente todas as chaves do catálogo/schema oficial do Sarak UI, garantindo que você possuirá todos os tokens mais recentes (future-proof).

Ferramenta: `run_command`
Comando: `npx tsx .agents/skills/Sarak-UI-criar-tema/ferramentas/scripts/generate_theme_template.ts [id-do-tema]`

Isso criará um arquivo vazio em `src/core/Design/presets/themes/[id-do-tema].ts` com um objeto TypeScript tipado `ThemePreset`, preenchido com comentários orientativos.

## Passo 3: Preenchimento do Tema

Utilize ferramentas de edição (`replace_file_content` ou `multi_replace_file_content`) para preencher os valores no arquivo recém-criado em `src/core/Design/presets/themes/`.
- Substitua as chaves com valores padrão pelos valores que correspondem à identidade definida no Passo 1.
- Mantenha estritamente o tipo de dado (se é `number`, forneça número sem "px", a menos que a tipagem exija string).
- **CRÍTICO - Paridade Integral:** Você **NÃO PODE DELETAR** nenhuma chave ou propriedade gerada pelo script. O arquivo deve manter **100% dos tokens** (mesmo os que não sofrerem alteração). O banco de dados e a arquitetura exigem que um tema novo seja um "dump" integral de todas as variáveis do sistema naquele instante (Cápsula do Tempo).

## Passo 4: Teste de Paridade do Tema (Obrigatório)

Obrigatoriamente rode o script de verificação de paridade para atestar que o tema manteve 100% dos tokens:
```bash
npx tsx .agents/skills/Sarak-UI-criar-tema/ferramentas/scripts/verify_theme_parity.ts [id-do-tema]
```
Se o script acusar erro, você **NÃO TEM PERMISSÃO PARA FINALIZAR A TAREFA**. Você deve corrigir as dessincronizações apontadas (provavelmente você deletou propriedades geradas no template).

## Passo 5: Registro no Catálogo de Temas

O novo tema deve estar acessível para o Design Engine.
Abra o arquivo `src/core/Design/presets/themes/index.ts`.
- Importe o novo tema gerado.
- Adicione o tema na lista exportada (geralmente `const presets = [...]`).

## Passo 5: Apresentação e Confirmação do Usuário (HITL)

```markdown
## ✅ Plano de Execução — Criação do Tema [Nome do Tema]

**O que foi criado:** `src/core/Design/presets/themes/[id-do-tema].ts`
**Identidade Visual Aplicada:** [Descreva o estilo, ex: Cores primárias vibrantes, bordas arredondadas e sombras neon].
**Registro:** Adicionado em `index.ts`.

⚠️ Confirma para prosseguir e compilar a biblioteca com este novo tema?
```

Regra: Pare e aguarde a resposta do usuário antes de realizar builds ou passar para próximas etapas.

## Passo 6: Registro
Registre as atividades executadas na sessão para garantir o tracking de desenvolvimento (se aplicável no seu workflow geral).
