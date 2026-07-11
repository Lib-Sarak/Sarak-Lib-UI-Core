import pkg from 'pg';
import { schemaSql } from './schema.js';

const { Pool } = pkg;

// Configuração básica do pool. Em produção, passaremos as configs do DB real.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/dbname',
});

export class AgentRepository {
  private initialized = false;

  /**
   * Inicializa o banco de dados lendo e executando o schema.ts
   */
  async initDatabase(): Promise<void> {
    if (this.initialized) return;
    try {
      await pool.query(schemaSql);
      this.initialized = true;
      console.log('[Repository] Banco de Dados inicializado isoladamente (Tabelas verificadas/criadas).');
    } catch (err) {
      console.error('[Repository] Erro ao inicializar banco de dados:', err);
      throw err;
    }
  }


  /**
   * Salva uma mensagem no histórico de conversas do Agente
   */
  async saveMessage(sessionId: string, role: string, content: string): Promise<void> {
    await this.initDatabase();
    const query = `
      INSERT INTO "ui_core"."sarak_ui_design_agent_conversations" (session_id, role, content)
      VALUES ($1, $2, $3)
    `;
    try {
      await pool.query(query, [sessionId, role, content]);
    } catch (err) {
      console.error('[Repository] Erro ao salvar mensagem:', err);
    }
  }

  /**
   * Recupera o histórico de conversas de uma sessão
   */
  async getConversationHistory(sessionId: string): Promise<any[]> {
    await this.initDatabase();
    const query = `
      SELECT role, content, created_at 
      FROM "ui_core"."sarak_ui_design_agent_conversations" 
      WHERE session_id = $1
      ORDER BY created_at ASC
    `;
    try {
      const { rows } = await pool.query(query, [sessionId]);
      return rows;
    } catch (err) {
      console.error('[Repository] Erro ao buscar histórico:', err);
      return [];
    }
  }

  /**
   * Salva o Payload JSON validado de um tema/preset
   */
  async saveArtifact(sessionId: string, artifactType: string, payload: Record<string, any>): Promise<void> {
    await this.initDatabase();
    const query = `
      INSERT INTO "ui_core"."sarak_ui_design_agent_artifacts" (session_id, artifact_type, payload)
      VALUES ($1, $2, $3)
    `;
    try {
      await pool.query(query, [sessionId, artifactType, JSON.stringify(payload)]);
      console.log(`[Repository] Artefato (${artifactType}) salvo com sucesso na sessão ${sessionId}.`);
    } catch (err) {
      console.error('[Repository] Erro ao salvar artefato JSON:', err);
    }
  }
}

export const agentRepository = new AgentRepository();
