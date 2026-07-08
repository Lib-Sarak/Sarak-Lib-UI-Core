import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { themeValidator } from './toolbox/validator.js';
import { agentRepository } from './database/repository.js';
import { routes } from './api/routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Registra as rotas do Agente
app.use('/api', routes);

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  try {
    console.log('[Design Operator] Iniciando boot do serviço...');
    
    // Inicializa a camada de persistência (Cria tabelas se não existirem)
    await agentRepository.initDatabase();
    
    // Passos de Qualidade Críticos: Carregar o Dicionário Dinâmico da Sarak-UI-Core ANTES de subir o server.
    // Isso garante que o agente só operará se tiver a verdade absoluta das chaves.
    await themeValidator.loadDynamicCatalog();
    
    app.listen(PORT, () => {
      console.log(`[Design Operator] Online e operante na porta ${PORT}`);
    });
  } catch (err) {
    console.error('[Design Operator] Falha crítica no Boot:', err);
    process.exit(1);
  }
}

bootstrap();
