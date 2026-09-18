/**
 * Os seis idiomas que a lib oferece. `LANGUAGES` (`Discovery/constants.ts`) não é
 * `as const` — `(typeof LANGUAGES)[number]['id']` resolveria para `string`, não
 * para a união literal, e todo acesso `catalogo[chave][idioma]` perderia a
 * checagem de tipo. Os seis literais aqui são a fonte do TIPO; a validação em
 * RUNTIME (idioma pedido é um dos seis) usa `LANGUAGES.map(l => l.id)` — ver
 * `useLibraryText.ts` — que é a fonte do VALOR e não pode divergir desta lista.
 */
export type SarakLibraryLanguage = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it';
