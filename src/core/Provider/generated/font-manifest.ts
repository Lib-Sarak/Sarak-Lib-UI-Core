// GERADO por `scripts/generate-font-manifest.ts` (`npm run fonts:manifest`) — não edite à mão.
// Espelho em JS de `dist/fonts/manifest.json` (família → faces), lido pelo carregador de fontes em runtime. Cada
// `url` é um `new URL` literal relativo ao módulo publicado em `dist/`, para o bundler do importador enxergá-lo.

export interface BundledFontFace {
    file: string;
    /** Peso numérico (estática) ou faixa `"min max"` (variável). */
    weight: string;
    subset: string;
    url: () => URL;
}

export interface BundledFontFamily {
    variable: boolean;
    faces: BundledFontFace[];
}

export const BUNDLED_FONT_UNICODE_RANGES: Record<string, string> = {
    "latin": "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD",
};

export const BUNDLED_FONTS: Record<string, BundledFontFamily> = {
    "Inter": { variable: true, faces: [{ file: "inter-latin-wght-normal.woff2", weight: "100 900", subset: "latin", url: () => new URL("./fonts/inter-latin-wght-normal.woff2", import.meta.url) }] },
    "Outfit": { variable: true, faces: [{ file: "outfit-latin-wght-normal.woff2", weight: "100 900", subset: "latin", url: () => new URL("./fonts/outfit-latin-wght-normal.woff2", import.meta.url) }] },
    "Roboto": { variable: true, faces: [{ file: "roboto-latin-wght-normal.woff2", weight: "100 900", subset: "latin", url: () => new URL("./fonts/roboto-latin-wght-normal.woff2", import.meta.url) }] },
    "Montserrat": { variable: true, faces: [{ file: "montserrat-latin-wght-normal.woff2", weight: "100 900", subset: "latin", url: () => new URL("./fonts/montserrat-latin-wght-normal.woff2", import.meta.url) }] },
    "Space Grotesk": { variable: true, faces: [{ file: "space-grotesk-latin-wght-normal.woff2", weight: "300 700", subset: "latin", url: () => new URL("./fonts/space-grotesk-latin-wght-normal.woff2", import.meta.url) }] },
    "Plus Jakarta Sans": { variable: true, faces: [{ file: "plus-jakarta-sans-latin-wght-normal.woff2", weight: "200 800", subset: "latin", url: () => new URL("./fonts/plus-jakarta-sans-latin-wght-normal.woff2", import.meta.url) }] },
    "Lexend": { variable: true, faces: [{ file: "lexend-latin-wght-normal.woff2", weight: "100 900", subset: "latin", url: () => new URL("./fonts/lexend-latin-wght-normal.woff2", import.meta.url) }] },
    "Sora": { variable: true, faces: [{ file: "sora-latin-wght-normal.woff2", weight: "100 800", subset: "latin", url: () => new URL("./fonts/sora-latin-wght-normal.woff2", import.meta.url) }] },
    "Syne": { variable: true, faces: [{ file: "syne-latin-wght-normal.woff2", weight: "400 800", subset: "latin", url: () => new URL("./fonts/syne-latin-wght-normal.woff2", import.meta.url) }] },
    "Archivo": { variable: true, faces: [{ file: "archivo-latin-wght-normal.woff2", weight: "100 900", subset: "latin", url: () => new URL("./fonts/archivo-latin-wght-normal.woff2", import.meta.url) }] },
    "Chakra Petch": { variable: false, faces: [{ file: "chakra-petch-latin-300-normal.woff2", weight: "300", subset: "latin", url: () => new URL("./fonts/chakra-petch-latin-300-normal.woff2", import.meta.url) }, { file: "chakra-petch-latin-400-normal.woff2", weight: "400", subset: "latin", url: () => new URL("./fonts/chakra-petch-latin-400-normal.woff2", import.meta.url) }, { file: "chakra-petch-latin-500-normal.woff2", weight: "500", subset: "latin", url: () => new URL("./fonts/chakra-petch-latin-500-normal.woff2", import.meta.url) }, { file: "chakra-petch-latin-600-normal.woff2", weight: "600", subset: "latin", url: () => new URL("./fonts/chakra-petch-latin-600-normal.woff2", import.meta.url) }, { file: "chakra-petch-latin-700-normal.woff2", weight: "700", subset: "latin", url: () => new URL("./fonts/chakra-petch-latin-700-normal.woff2", import.meta.url) }] },
    "Nunito": { variable: true, faces: [{ file: "nunito-latin-wght-normal.woff2", weight: "200 1000", subset: "latin", url: () => new URL("./fonts/nunito-latin-wght-normal.woff2", import.meta.url) }] },
    "DM Sans": { variable: true, faces: [{ file: "dm-sans-latin-wght-normal.woff2", weight: "100 1000", subset: "latin", url: () => new URL("./fonts/dm-sans-latin-wght-normal.woff2", import.meta.url) }] },
    "Manrope": { variable: true, faces: [{ file: "manrope-latin-wght-normal.woff2", weight: "200 800", subset: "latin", url: () => new URL("./fonts/manrope-latin-wght-normal.woff2", import.meta.url) }] },
    "Work Sans": { variable: true, faces: [{ file: "work-sans-latin-wght-normal.woff2", weight: "100 900", subset: "latin", url: () => new URL("./fonts/work-sans-latin-wght-normal.woff2", import.meta.url) }] },
    "Open Sans": { variable: true, faces: [{ file: "open-sans-latin-wght-normal.woff2", weight: "300 800", subset: "latin", url: () => new URL("./fonts/open-sans-latin-wght-normal.woff2", import.meta.url) }] },
    "Raleway": { variable: true, faces: [{ file: "raleway-latin-wght-normal.woff2", weight: "100 900", subset: "latin", url: () => new URL("./fonts/raleway-latin-wght-normal.woff2", import.meta.url) }] },
    "Source Sans 3": { variable: true, faces: [{ file: "source-sans-3-latin-wght-normal.woff2", weight: "200 900", subset: "latin", url: () => new URL("./fonts/source-sans-3-latin-wght-normal.woff2", import.meta.url) }] },
    "Poppins": { variable: false, faces: [{ file: "poppins-latin-300-normal.woff2", weight: "300", subset: "latin", url: () => new URL("./fonts/poppins-latin-300-normal.woff2", import.meta.url) }, { file: "poppins-latin-400-normal.woff2", weight: "400", subset: "latin", url: () => new URL("./fonts/poppins-latin-400-normal.woff2", import.meta.url) }, { file: "poppins-latin-500-normal.woff2", weight: "500", subset: "latin", url: () => new URL("./fonts/poppins-latin-500-normal.woff2", import.meta.url) }, { file: "poppins-latin-600-normal.woff2", weight: "600", subset: "latin", url: () => new URL("./fonts/poppins-latin-600-normal.woff2", import.meta.url) }, { file: "poppins-latin-700-normal.woff2", weight: "700", subset: "latin", url: () => new URL("./fonts/poppins-latin-700-normal.woff2", import.meta.url) }, { file: "poppins-latin-800-normal.woff2", weight: "800", subset: "latin", url: () => new URL("./fonts/poppins-latin-800-normal.woff2", import.meta.url) }, { file: "poppins-latin-900-normal.woff2", weight: "900", subset: "latin", url: () => new URL("./fonts/poppins-latin-900-normal.woff2", import.meta.url) }] },
    "Lato": { variable: false, faces: [{ file: "lato-latin-300-normal.woff2", weight: "300", subset: "latin", url: () => new URL("./fonts/lato-latin-300-normal.woff2", import.meta.url) }, { file: "lato-latin-400-normal.woff2", weight: "400", subset: "latin", url: () => new URL("./fonts/lato-latin-400-normal.woff2", import.meta.url) }, { file: "lato-latin-700-normal.woff2", weight: "700", subset: "latin", url: () => new URL("./fonts/lato-latin-700-normal.woff2", import.meta.url) }, { file: "lato-latin-900-normal.woff2", weight: "900", subset: "latin", url: () => new URL("./fonts/lato-latin-900-normal.woff2", import.meta.url) }] },
    "Unbounded": { variable: true, faces: [{ file: "unbounded-latin-wght-normal.woff2", weight: "200 900", subset: "latin", url: () => new URL("./fonts/unbounded-latin-wght-normal.woff2", import.meta.url) }] },
    "Bebas Neue": { variable: false, faces: [{ file: "bebas-neue-latin-400-normal.woff2", weight: "400", subset: "latin", url: () => new URL("./fonts/bebas-neue-latin-400-normal.woff2", import.meta.url) }] },
    "Orbitron": { variable: true, faces: [{ file: "orbitron-latin-wght-normal.woff2", weight: "400 900", subset: "latin", url: () => new URL("./fonts/orbitron-latin-wght-normal.woff2", import.meta.url) }] },
    "VT323": { variable: false, faces: [{ file: "vt323-latin-400-normal.woff2", weight: "400", subset: "latin", url: () => new URL("./fonts/vt323-latin-400-normal.woff2", import.meta.url) }] },
    "Oswald": { variable: true, faces: [{ file: "oswald-latin-wght-normal.woff2", weight: "200 700", subset: "latin", url: () => new URL("./fonts/oswald-latin-wght-normal.woff2", import.meta.url) }] },
    "Playfair Display": { variable: true, faces: [{ file: "playfair-display-latin-wght-normal.woff2", weight: "400 900", subset: "latin", url: () => new URL("./fonts/playfair-display-latin-wght-normal.woff2", import.meta.url) }] },
    "Fraunces": { variable: true, faces: [{ file: "fraunces-latin-wght-normal.woff2", weight: "100 900", subset: "latin", url: () => new URL("./fonts/fraunces-latin-wght-normal.woff2", import.meta.url) }] },
    "Source Serif 4": { variable: true, faces: [{ file: "source-serif-4-latin-wght-normal.woff2", weight: "200 900", subset: "latin", url: () => new URL("./fonts/source-serif-4-latin-wght-normal.woff2", import.meta.url) }] },
    "Roboto Slab": { variable: true, faces: [{ file: "roboto-slab-latin-wght-normal.woff2", weight: "100 900", subset: "latin", url: () => new URL("./fonts/roboto-slab-latin-wght-normal.woff2", import.meta.url) }] },
    "Lora": { variable: true, faces: [{ file: "lora-latin-wght-normal.woff2", weight: "400 700", subset: "latin", url: () => new URL("./fonts/lora-latin-wght-normal.woff2", import.meta.url) }] },
    "Merriweather": { variable: true, faces: [{ file: "merriweather-latin-wght-normal.woff2", weight: "300 900", subset: "latin", url: () => new URL("./fonts/merriweather-latin-wght-normal.woff2", import.meta.url) }] },
    "PT Serif": { variable: false, faces: [{ file: "pt-serif-latin-400-normal.woff2", weight: "400", subset: "latin", url: () => new URL("./fonts/pt-serif-latin-400-normal.woff2", import.meta.url) }, { file: "pt-serif-latin-700-normal.woff2", weight: "700", subset: "latin", url: () => new URL("./fonts/pt-serif-latin-700-normal.woff2", import.meta.url) }] },
    "Dancing Script": { variable: true, faces: [{ file: "dancing-script-latin-wght-normal.woff2", weight: "400 700", subset: "latin", url: () => new URL("./fonts/dancing-script-latin-wght-normal.woff2", import.meta.url) }] },
    "Pacifico": { variable: false, faces: [{ file: "pacifico-latin-400-normal.woff2", weight: "400", subset: "latin", url: () => new URL("./fonts/pacifico-latin-400-normal.woff2", import.meta.url) }] },
    "Satisfy": { variable: false, faces: [{ file: "satisfy-latin-400-normal.woff2", weight: "400", subset: "latin", url: () => new URL("./fonts/satisfy-latin-400-normal.woff2", import.meta.url) }] },
    "Caveat": { variable: true, faces: [{ file: "caveat-latin-wght-normal.woff2", weight: "400 700", subset: "latin", url: () => new URL("./fonts/caveat-latin-wght-normal.woff2", import.meta.url) }] },
    "Patrick Hand": { variable: false, faces: [{ file: "patrick-hand-latin-400-normal.woff2", weight: "400", subset: "latin", url: () => new URL("./fonts/patrick-hand-latin-400-normal.woff2", import.meta.url) }] },
    "JetBrains Mono": { variable: true, faces: [{ file: "jetbrains-mono-latin-wght-normal.woff2", weight: "100 800", subset: "latin", url: () => new URL("./fonts/jetbrains-mono-latin-wght-normal.woff2", import.meta.url) }] },
    "Fira Code": { variable: true, faces: [{ file: "fira-code-latin-wght-normal.woff2", weight: "300 700", subset: "latin", url: () => new URL("./fonts/fira-code-latin-wght-normal.woff2", import.meta.url) }] },
    "IBM Plex Mono": { variable: false, faces: [{ file: "ibm-plex-mono-latin-300-normal.woff2", weight: "300", subset: "latin", url: () => new URL("./fonts/ibm-plex-mono-latin-300-normal.woff2", import.meta.url) }, { file: "ibm-plex-mono-latin-400-normal.woff2", weight: "400", subset: "latin", url: () => new URL("./fonts/ibm-plex-mono-latin-400-normal.woff2", import.meta.url) }, { file: "ibm-plex-mono-latin-500-normal.woff2", weight: "500", subset: "latin", url: () => new URL("./fonts/ibm-plex-mono-latin-500-normal.woff2", import.meta.url) }, { file: "ibm-plex-mono-latin-600-normal.woff2", weight: "600", subset: "latin", url: () => new URL("./fonts/ibm-plex-mono-latin-600-normal.woff2", import.meta.url) }, { file: "ibm-plex-mono-latin-700-normal.woff2", weight: "700", subset: "latin", url: () => new URL("./fonts/ibm-plex-mono-latin-700-normal.woff2", import.meta.url) }] },
    "Space Mono": { variable: false, faces: [{ file: "space-mono-latin-400-normal.woff2", weight: "400", subset: "latin", url: () => new URL("./fonts/space-mono-latin-400-normal.woff2", import.meta.url) }, { file: "space-mono-latin-700-normal.woff2", weight: "700", subset: "latin", url: () => new URL("./fonts/space-mono-latin-700-normal.woff2", import.meta.url) }] },
};
