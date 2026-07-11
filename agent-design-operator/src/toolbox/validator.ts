import { getDesignCatalog, DesignCatalogToken } from '@sarak/lib-ui-core/backend/node';

export class ThemeValidator {
  private catalog: Map<string, DesignCatalogToken> = new Map();

  /**
   * Carrega o catálogo real de tokens (Schema/MasterMap da Sarak-Lib-UI-Core — mesma
   * SSOT validada pela paridade 1:1:1:1:1), pelo canal Node sancionado (Spec 08 §4).
   * Nunca uma allowlist estática: o catálogo muda quando a lib expande, o agente
   * precisa refletir isso sem exigir deploy manual.
   */
  async loadDynamicCatalog(): Promise<void> {
    const tokens = getDesignCatalog();
    this.catalog = new Map(tokens.map(token => [token.id, token]));
    console.log(`[Validator] Loaded ${this.catalog.size} tokens from UI-Core Catalog.`);
  }

  /**
   * Valida o payload gerado pelo LLM contra o catálogo real: a chave precisa existir
   * (nunca alucina token novo) E o valor precisa respeitar o domínio do token
   * (opção válida em `select`, número dentro do range em `slider`/`number`).
   */
  validatePayload(payload: Record<string, unknown>): void {
    if (this.catalog.size === 0) {
      throw new Error('SYSTEM_ERROR: Validator sem catálogo carregado — chame loadDynamicCatalog() antes de validar.');
    }

    for (const [key, value] of Object.entries(payload)) {
      const token = this.catalog.get(key);
      if (!token) {
        throw new Error(`SECURITY_VIOLATION: Key '${key}' does not exist in the Design Catalog. Hallucination detected.`);
      }
      this.validateValueDomain(key, value, token);
    }
  }

  private validateValueDomain(key: string, value: unknown, token: DesignCatalogToken): void {
    if (token.type === 'select' && token.options?.length) {
      const allowed = token.options.map(opt => opt.value ?? opt.id);
      if (!allowed.includes(String(value))) {
        throw new Error(`SECURITY_VIOLATION: Value '${String(value)}' for key '${key}' is not one of the allowed options [${allowed.join(', ')}].`);
      }
      return;
    }

    if ((token.type === 'slider' || token.type === 'number') && typeof value === 'number') {
      if (token.min !== undefined && value < token.min) {
        throw new Error(`SECURITY_VIOLATION: Value '${value}' for key '${key}' is below the minimum (${token.min}).`);
      }
      if (token.max !== undefined && value > token.max) {
        throw new Error(`SECURITY_VIOLATION: Value '${value}' for key '${key}' is above the maximum (${token.max}).`);
      }
      return;
    }

    if (token.type === 'boolean' && typeof value !== 'boolean') {
      throw new Error(`SECURITY_VIOLATION: Value for key '${key}' must be boolean.`);
    }
  }
}

export const themeValidator = new ThemeValidator();
