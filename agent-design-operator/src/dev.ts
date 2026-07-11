import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDesignAgent } from './main.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

async function runDevServer() {
  try {
    console.log('[Design Operator Dev] Iniciando modo standalone...');
    
    // Inicia a inteligência do agente
    const agentRouter = await initDesignAgent();
    
    // Acopla as rotas na API de desenvolvimento
    app.use('/api/design-agent', agentRouter);
    
    app.listen(PORT, () => {
      console.log(`[Design Operator Dev] Online e operante na porta ${PORT}`);
    });
  } catch (err) {
    console.error('[Design Operator Dev] Falha crítica no Boot:', err);
    process.exit(1);
  }
}

runDevServer();
