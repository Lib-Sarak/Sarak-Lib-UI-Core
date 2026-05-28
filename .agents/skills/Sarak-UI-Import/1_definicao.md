# Definição: Sarak-UI-Import

## O que é
A skill Sarak-UI-Import é a ferramenta automatizada para integração completa da biblioteca `Sarak-Lib-UI-Core` em sistemas externos (ERP, MyService, Portais, etc). Ela entende o contexto do sistema que está importando a biblioteca e escolhe a arquitetura de inicialização adequada ("Bridges") para criar as tabelas de design no banco de dados.

## Objetivo
- Instalar e referenciar a biblioteca Sarak UI no sistema consumidor.
- Injetar o Provider (`SarakUIProvider`) na raiz do frontend.
- Identificar se o ecossistema é baseado em Node.js ou Python.
- Configurar a inicialização automática do banco de dados (schema `ui_core` e tabelas híbridas) usando as pontes nativas da própria biblioteca.
- **Criar a pasta obrigatória `Sarak-UI/` no sistema consumidor**, contendo o Contrato Duplo (manifest + Painel) que isola toda a integração visual com o módulo UI Core.

## Responsabilidades Exclusivas desta Skill
1. Analisar a stack do projeto destino para decidir entre `bridge-node` ou `bridge-python`.
2. Adicionar as rotinas de inicialização no startup do servidor (`instrumentation.ts` para Node ou `app.py` para Python).
3. Garantir que as tabelas do UI Engine não sejam criadas por scripts manuais.
4. **Criar a estrutura `Sarak-UI/` com os 3 arquivos obrigatórios** (`manifest.ts`, `Painel.tsx`, `index.ts`).
5. **Registrar o módulo no sistema host** via `registerSarakModule()`.

## Quando usar
- Ao criar um novo sistema do ecossistema Sarak que precisará de interface gráfica.
- Quando um sistema legado for migrado para utilizar a `Sarak-Lib-UI-Core`.
- Sempre que o usuário disser "Instale a Sarak UI neste projeto".

## Conceitos-Chave

### Contrato Duplo
Todo sistema que importa o módulo UI deve possuir **obrigatoriamente** uma pasta `Sarak-UI/` contendo:
- `manifest.ts` — O Cérebro: define `id`, `label`, `icon`, `category`, `endpoints`, `visualContracts`.
- `Painel.tsx` — O Corpo: componente React mestre que utiliza `SarakAnalyticalPage` como fôrma inteligente.
- `index.ts` — O Contrato: exporta o objeto `SarakModule` final (`{ ...manifest, component: Painel }`).

### Registro no Sistema Host
O sistema que consome o módulo (ex: `MyService`) registra cada módulo com uma única linha:
```typescript
import { SarakUI as MeuModuloUI } from '@meu-pacote';
registerSarakModuleSafe(MeuModuloUI);
```
