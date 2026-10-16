// Monta o `THIRD-PARTY-FONTS`: crédito e texto de licença de cada família embarcada, lidos do `LICENSE` e do
// `package.json`/`metadata.json` do pacote — nenhum texto de licença é escrito à mão aqui.
import type { ResolvedFont } from './fontPackages';

export const FAMILY_MARK = '##### FAMILY: ';
export const THIRD_PARTY_FILE = 'THIRD-PARTY-FONTS';

const INTRO = [
    'FONTES DE TERCEIROS EMBARCADAS NA @sarak/lib-ui-core',
    '',
    'Os arquivos woff2 em `fonts/` são cópias SEM MODIFICAÇÃO dos pacotes Fontsource indicados abaixo. Cada família',
    'segue a licença do seu pacote, reproduzida na íntegra na seção da família. Raleway, Merriweather e Lato declaram',
    'Reserved Font Name: são distribuídas sem modificação e sem renomear a família.',
].join('\n');

function summaryLine(font: ResolvedFont): string {
    const { entry } = font;
    return `- ${font.family} — ${entry.license.type} — ${entry.package}@${entry.version}`;
}

function section(font: ResolvedFont): string {
    const { entry } = font;
    return [
        `${FAMILY_MARK}${font.family}`,
        `Pacote: ${entry.package}@${entry.version}`,
        `Licença: ${entry.license.type}`,
        `Crédito: ${entry.license.notice}`,
        '',
        font.licenseText.trim(),
    ].join('\n');
}

export function buildThirdPartyFonts(fonts: ResolvedFont[]): string {
    const index = fonts.map(summaryLine).join('\n');
    const sections = fonts.map(section).join('\n\n');
    return `${INTRO}\n\nFamílias (${fonts.length}):\n${index}\n\n${sections}\n`;
}

/** Seções do arquivo por família: `família → corpo` (do marcador seguinte ou do fim). */
export function parseThirdPartyFonts(text: string): Map<string, string> {
    const sections = new Map<string, string>();
    const parts = text.split(`\n${FAMILY_MARK}`).slice(1);
    for (const part of parts) {
        const newline = part.indexOf('\n');
        const name = (newline === -1 ? part : part.slice(0, newline)).trim();
        sections.set(name, newline === -1 ? '' : part.slice(newline + 1));
    }
    return sections;
}
