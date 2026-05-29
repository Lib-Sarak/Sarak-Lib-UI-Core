# Workflow de Execução: Sarak-UI-Import

Siga estes passos rigorosamente para instalar o Sarak-Lib-UI-Core em qualquer sistema.

## Passo 1: Identificação do Ecossistema
1. Utilize a ferramenta `list_dir` na raiz do projeto consumidor.
2. Procure por `package.json` (indica projeto Node.js/Next.js).
3. Procure por `requirements.txt` ou `app.py` (indica backend Python).
4. Se o projeto for Fullstack (ex: Next.js + Python API na mesma pasta), identifique qual serviço se conecta ao Banco de Dados Principal e aplique a integração de banco de dados **apenas nele**.

## Passo 2: Instalação da Dependência Visual (Frontend)
1. Se houver `package.json`, adicione `@sarak/lib-ui-core` nas dependências apontando para o pacote local (ex: `"file:../../Biblioteca/Sarak-Lib-UI-Core"` ou via repositório).
2. Adicione o `SarakUIProvider` no layout raiz do frontend (`app/layout.tsx` ou `src/App.tsx`).
   ```tsx
   import { SarakUIProvider } from '@sarak/lib-ui-core';
   import '@sarak/lib-ui-core/sarak.css';

   export default function App() {
       return (
           <SarakUIProvider
               // RECOMENDADO: Injeção de dependência para uploads híbridos
               // Sem isso, a UI bloqueará mídias > 2MB e converterá em Base64.
               onMediaUpload={async (file) => {
                   // Exemplo: const url = await uploadToS3(file);
                   // return url;
                   return "";
               }}
           >
               <SuaAplicacao />
           </SarakUIProvider>
       );
   }
   ```

## Passo 3: Injeção da Inicialização de Banco de Dados (Bridges)
O módulo Sarak UI necessita criar o schema `ui_core` e a tabela `custom_themes` no banco de dados. **NUNCA crie essas tabelas manualmente.** Use as Bridges.

### Se o Backend for Node.js (ex: Next.js)
1. Localize ou crie o arquivo `instrumentation.ts` na raiz do Next.js.
2. Certifique-se de que o `instrumentationHook` está habilitado no `next.config.ts`.
3. Adicione o import da Node Bridge:
   ```typescript
   import { setupUIDatabase } from '@sarak/lib-ui-core/backend/node/database';
   
   export async function register() {
       if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.DATABASE_URL) {
           await setupUIDatabase(process.env.DATABASE_URL);
       }
   }
   ```

### Se o Backend for Python (ex: FastAPI)
1. Certifique-se de que a pasta raiz do módulo Sarak esteja acessível no `sys.path`.
2. No arquivo de startup (ex: `app.py`), importe a função de setup da ponte Python:
   ```python
   from sarak_ui_core.core.database import setup_ui_db
   # Passe a Engine do SQLAlchemy para inicializar:
   setup_ui_db(engine)
   ```

## Passo 4: Criação da Pasta Obrigatória `Sarak-UI/` (Contrato Duplo)

**Esta é a etapa mais crítica.** Todo sistema que importa o módulo UI deve possuir uma pasta `Sarak-UI/` (preferencialmente dentro de `src/`, mas aceita-se dentro de `frontend/`). Esta pasta centraliza **todo** o acoplamento visual com o Sarak-Lib-UI-Core.

### Estrutura Obrigatória

```text
MeuSistema/
└── src/
    └── Sarak-UI/
        ├── manifest.ts       # [Obrigatório] O Cérebro
        ├── Painel.tsx         # [Obrigatório] O Corpo  
        ├── index.ts           # [Obrigatório] O Contrato
        └── components/        # [Opcional] Extensões visuais específicas
```

### 4.1: Criar `manifest.ts`

Define a identidade do módulo no ecossistema. Deve conter obrigatoriamente `id`, `label`, `icon`, e opcionalmente `category`, `priority`, `endpoints`, `visualContracts`.

```typescript
export const MeuModuloManifest = {
    id: "meu-modulo",
    label: "Meu Módulo",
    icon: "LayoutDashboard",
    category: "Negócios",
    version: "1.0.0",
    priority: 10,
    endpoints: {
        // endpoints da API do módulo
    },
    visualContracts: [
        // contratos visuais para renderização dinâmica (opcional)
    ]
};
```

### 4.2: Criar `Painel.tsx`

O componente mestre que envelopa a tela principal do módulo na fôrma inteligente `SarakAnalyticalPage`. Esta fôrma garante responsividade automática e limpa.

**Lei Arquitetural 1 (Contrato Dual Mínimo):** O `Painel.tsx` **NÃO DEVE** fatiar o código fonte interno do módulo para tentar separar em `navBar` e `sidePanel`. Ele deve manter o componente original inteiro, passando-o diretamente como `mainContent` para a `SarakAnalyticalPage`. A fôrma atuará apenas como um invólucro limpo.

**Lei Arquitetural 2 (Container Queries):** Para suportar a renderização em Drawers ou diferentes layouts do Shell Global, todo o layout interno do módulo (grid, flexbox) **DEVE OBRIGATORIAMENTE** utilizar Container Queries do Tailwind (ex: `@md:grid-cols-2` ao invés de `md:grid-cols-2`). Garanta que a raiz do seu componente principal possua a classe `@container` para que seus filhos reajam ao tamanho da fôrma.

```tsx
import React from 'react';
import { SarakAnalyticalPage } from '@sarak/lib-ui-core';
import MeuComponentePrincipal from '../components/MeuComponentePrincipal';

const Painel: React.FC<any> = (props) => {
    return (
        <SarakAnalyticalPage 
            // [Obrigatório e Exclusivo] mainContent: Conteúdo integral do módulo.
            // O componente deve ter @container na raiz e usar @md:, @lg:, etc internamente.
            mainContent={
                <MeuComponentePrincipal {...props} />
            }
        />
    );
};

export default Painel;
```

**Importante:** Historicamente existiam props como `navBar` e `sidePanel` no `SarakAnalyticalPage`, mas seu uso foi depreciado em prol do Contrato Mínimo e responsividade delegada ao Container Query do módulo.

### 4.3: Criar `index.ts`

O ponto de exportação final. **DEVE** espalhar (spread) as propriedades do manifesto na raiz do objeto para compatibilidade com `registerSarakModule()`.

```typescript
import { MeuModuloManifest } from './manifest';
import Painel from './Painel';

export const UI = {
    ...MeuModuloManifest,  // ← SPREAD obrigatório (NÃO aninhar em .manifest)
    component: Painel
};

export default UI;
```

### 4.4: Exportar no `index.ts` raiz do módulo

```typescript
// Exportação Estrita do Frontend
export { default as SarakUI } from './Sarak-UI';
```

## Passo 5: Registro no Sistema Host (ex: `main.tsx` do MyService)

No sistema que consome os módulos, o registro é feito com uma única linha por módulo:

```typescript
import { registerSarakModule } from '@sarak/lib-ui-core';
import { SarakUI as MeuModuloUI } from '@meu-pacote';

// Wrapper de segurança para registro
const registerSarakModuleSafe = (mod: any) => {
    const effectiveMod = mod?.default || mod;
    if (effectiveMod && effectiveMod.id) {
        registerSarakModule(effectiveMod);
    }
};

registerSarakModuleSafe(MeuModuloUI);
```

## Passo 6: Utilizando Smart Layouts para Responsividade Automática
Ao construir a tela principal do módulo consumido (o `Painel.tsx`), utilize a "Fôrma Inteligente" do Sarak para garantir mutação de layout perfeita em Celulares e Tablets, sem escrever media queries.

**Regras de Responsabilidade:**
- Controle visual do conteúdo: Fica no `.tsx` usando `SarakHidden` ou o hook `useSarakDevice()`.
- Controle da Casca (Menu Top/Side): Fica no `manifest.json` do sistema host.

## Passo 7: Apresentação e Confirmação do Usuário (HITL)

```markdown
## ✅ Plano de Execução — Importação do Sarak UI

**O que será modificado:** [lista de arquivos ex: package.json, layout.tsx, instrumentation.ts]
**Ecossistema Detectado:** [Node.js ou Python]
**Bridge Utilizada:** [bridge-node ou bridge-python]
**Pasta Sarak-UI criada:** [sim/não — com lista de arquivos]

⚠️ Confirma a execução desta injeção?
```
**Regra:** Aguarde a confirmação do usuário antes de realizar as alterações reais nos arquivos.

## Passo 8: Registro
Após a aprovação e execução bem-sucedida, compile os resultados para a documentação e registre no `skill-registro-sessao`.
