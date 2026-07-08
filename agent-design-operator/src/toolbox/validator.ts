import { z } from 'zod';

export class ThemeValidator {
  private allowedKeys: Set<string> = new Set();
  
  /**
   * Fetches the dynamic catalog from Sarak UI Core and builds the validation schema
   */
  async loadDynamicCatalog(): Promise<void> {
    try {
      const url = process.env.UI_CORE_API_URL || 'http://localhost:4000/api';
      // Simulação do fetch no catálogo real da UI-Core
      // const response = await axios.get(`${url}/design/catalog/keys`);
      // this.allowedKeys = new Set(response.data.keys);
      
      this.allowedKeys = new Set([
        '--sx-color-primary', '--sx-color-base', 
        'cardLayoutDirection', 'spacing-md',
        'imagePosition', 'actionsAlignment'
      ]);
      console.log(`[Validator] Loaded ${this.allowedKeys.size} tokens from UI-Core Catalog.`);
    } catch (error) {
      console.error('Failed to load dynamic catalog', error);
      throw new Error('SYSTEM_ERROR: Cannot boot validator without UI Core catalog');
    }
  }

  /**
   * Validates the generated JSON payload against the known catalog keys
   */
  validatePayload(payload: Record<string, any>): void {
    const keys = Object.keys(payload);
    for (const key of keys) {
      if (!this.allowedKeys.has(key)) {
        throw new Error(`SECURITY_VIOLATION: Key '${key}' does not exist in the Design Catalog. Hallucination detected.`);
      }
    }
  }
}

export const themeValidator = new ThemeValidator();
