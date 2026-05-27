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

## Passo 4: Apresentação e Confirmação do Usuário (HITL)

```markdown
## ✅ Plano de Execução — Importação do Sarak UI

**O que será modificado:** [lista de arquivos ex: package.json, layout.tsx, instrumentation.ts]
**Ecossistema Detectado:** [Node.js ou Python]
**Bridge Utilizada:** [bridge-node ou bridge-python]

⚠️ Confirma a execução desta injeção?
```
**Regra:** Aguarde a confirmação do usuário antes de realizar as alterações reais nos arquivos.

## Passo 5: Registro
Após a aprovação e execução bem-sucedida, compile os resultados para a documentação e registre no `skill-registro-sessao`.
