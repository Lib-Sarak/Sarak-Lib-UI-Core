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

/** Predicado próprio dos tokens `image`/`file`. `CSS_BREAKOUT_PATTERN` sozinho
 * rejeitava TODA `data:` URI porque `;base64,` carrega um `;` — o caractere de
 * breakout mais comum, mas aqui em posição inofensiva (dentro do prefixo fixo do
 * formato, nunca do payload). Aceita URL `https:` (sob a mesma trava de breakout
 * do texto CSS) e mídia embutida bem-formada; recusa o resto — inclusive `data:`
 * com MIME que não é imagem/vídeo, `javascript:` e qualquer outro esquema. */
export const isSafeMediaString = (value: string): boolean => {
    const inner = unwrapCssUrl(value);
    if (inner.startsWith('https://')) return isSafeCssString(inner);
    return EMBEDDED_MEDIA_PATTERN.test(inner);
};
