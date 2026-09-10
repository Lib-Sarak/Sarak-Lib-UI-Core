/** Caracteres que permitem escapar de uma declaração CSS (`--x:VALOR;`) ou de
 * uma tag `<style>` (breakout de HTML). Nenhum valor de tema pode contê-los. */
const CSS_BREAKOUT_PATTERN = /[<>{};]/;

export const isSafeCssString = (value: string): boolean => !CSS_BREAKOUT_PATTERN.test(value);

/** Um tema legado guarda `globalBackgroundImageUrl` envolto em `url(...)` (herança de
 * valor de CSS cru — ver o mesmo desembrulho em `MediaUploaderControl.tsx:52`).
 * Desembrulha antes de julgar; string sem o wrapper passa direto. */
const unwrapCssUrl = (value: string): string => {
    const match = value.match(/^url\((['"]?)(.*)\1\)$/);
    return match ? match[2] : value;
};

/** Mídia embutida bem-formada: esquema `data:`, tipo MIME de imagem ou
 * vídeo, codificação `base64` DECLARADA, payload restrito ao alfabeto base64. Os
 * cinco caracteres de breakout de `CSS_BREAKOUT_PATTERN` não pertencem a esse
 * alfabeto — um payload bem-formado é inerte por construção. */
const EMBEDDED_MEDIA_PATTERN = /^data:(image|video)\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/]+={0,2}$/i;

/** Detecta QUALQUER esquema de URI (`scheme:`, RFC 3986 §3.1) — não só os
 * conhecidos. Separa "caminho relativo do consumidor" (sem esquema, ex.:
 * `/assets/bg.png`) de "esquema explícito" (`javascript:`, `vbscript:`, um
 * `data:` que não bateu `EMBEDDED_MEDIA_PATTERN`…), que fica fora do conjunto
 * aceito por padrão — só entra pelos ramos nomeados abaixo. Julga sobre o
 * valor já normalizado por `stripLeadingUrlNoise`: sem ruído residual na
 * borda esquerda, a âncora `^[a-zA-Z]` não tem mais como escapar do esquema. */
const URI_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/** Maior código de um controle C0 (0 a 31, RFC 3986 / WHATWG URL Standard) —
 * escrito como número, não como escape `\u`, porque um escape de controle
 * embutido no texto-fonte é exatamente o tipo de byte cru que este arquivo
 * não deve carregar. */
const MAX_C0_CONTROL_CODE = 0x1f;

/** Um caractere é "ruído de borda" se é espaço em branco reconhecido por
 * `\s` (espaço, tab, quebra de linha, NBSP, BOM…) OU um controle C0 cru que
 * `\s` não cobre (ex.: NUL, SOH). */
const isLeadingUrlNoiseChar = (char: string): boolean => /\s/.test(char) || char.charCodeAt(0) <= MAX_C0_CONTROL_CODE;

/**
 * Normaliza a borda ESQUERDA como o parser de URL do browser normaliza antes
 * de resolver o esquema (WHATWG URL Standard, passo de aparar espaço/controle
 * C0). Sem isto, um caractere de ruído na borda quebra a âncora de
 * `URI_SCHEME_PATTERN`, o valor escapa para o ramo de "caminho relativo" —
 * que só barra breakout, não esquema — e um esquema perigoso (`javascript:`)
 * atravessa. Normalizar UMA VEZ aqui, antes de qualquer ramo, fecha a classe
 * inteira de uma vez; testar um caractere por vez é o que já falhou duas
 * rodadas seguidas. */
const stripLeadingUrlNoise = (value: string): string => {
    let start = 0;
    while (start < value.length && isLeadingUrlNoiseChar(value[start])) start += 1;
    return value.slice(start);
};

/**
 * Predicado próprio dos tokens `image`/`file`. `CSS_BREAKOUT_PATTERN` sozinho
 * rejeitava TODA `data:` URI porque `;base64,` carrega um `;` — o caractere de
 * breakout mais comum, mas aqui em posição inofensiva (dentro do prefixo fixo do
 * formato, nunca do payload).
 *
 * O conjunto aceito, e o motivo de cada entrada — medido contra valores reais
 * de consumidor, não hipotéticos:
 *
 * - **string vazia** — é o próprio "sem mídia": `defaultValue`/`legacyValue` de
 *   `globalBackgroundImageUrl` (`schema/media.ts`) e o preset "Nenhuma (Sem
 *   Mídia)" são `''`. Recusá-la fazia a config default de TODO consumidor —
 *   boot sem nenhuma mídia configurada — emitir um aviso de segurança falso a
 *   cada render.
 * - **`https://`** — sob a mesma trava de breakout do texto CSS (`isSafeCssString`).
 * - **`http://`** — restaurado: é a MESMA classe de risco que `https://`, porque
 *   quem busca o recurso é o browser do usuário final, não esta lib (a lib não
 *   faz fetch de servidor-para-servidor — `specs/specs/10-seguranca-e-acessibilidade.md`
 *   §3.2). Isso é diferente de `COLOR_PATTERN` barrar `url()` num valor de
 *   COR: lá não há uso legítimo para uma URL; aqui `url()` **é** o uso
 *   legítimo, e intranet/ambiente local servem mídia sem TLS.
 * - **mídia embutida bem-formada** (`data:image|video/...;base64,...`).
 * - **caminho relativo do próprio consumidor** — sem esquema de URI (ex.:
 *   `/assets/bg.png`, `bg.png`): ativo do próprio host, resolvido pelo browser
 *   contra a origem da página, nunca por esta lib; ainda sob a trava de
 *   breakout. Restaurado pelo mesmo motivo que `''`: é um valor real de
 *   consumidor que a versão anterior recusava.
 * - **qualquer um dos quatro acima envolto em `url(...)`** (herança de CSS cru
 *   — `unwrapCssUrl`).
 *
 * Recusa o resto: qualquer OUTRO esquema de URI (`javascript:`, `vbscript:`,
 * um `data:` fora do formato de mídia…), mesmo com ruído (espaço/controle C0)
 * antes do esquema, e qualquer cauda anexada a um valor válido — o padrão é
 * ancorado nas duas pontas.
 */
export const isSafeMediaString = (value: string): boolean => {
    const inner = stripLeadingUrlNoise(unwrapCssUrl(value));
    if (inner === '') return true;
    if (inner.startsWith('https://') || inner.startsWith('http://')) return isSafeCssString(inner);
    if (EMBEDDED_MEDIA_PATTERN.test(inner)) return true;
    if (URI_SCHEME_PATTERN.test(inner)) return false;
    return isSafeCssString(inner);
};
