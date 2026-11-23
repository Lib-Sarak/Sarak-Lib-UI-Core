import { lineAt } from './text';

export interface LibDeclaration {
    section: string;
    spec: string;
    line: number;
}

const DEPENDENCY_SECTIONS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'] as const;
/** Fixada na tag exata: `…#vX.Y.Z`, com pré-lançamento opcional. */
const PINNED_SPEC = /#v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

const lineOfKey = (text: string, section: string, libName: string): number => {
    const sectionIndex = text.indexOf(`"${section}"`);
    const keyIndex = text.indexOf(`"${libName}"`, Math.max(sectionIndex, 0));
    return lineAt(text, Math.max(keyIndex, 0));
};

const specIn = (group: unknown, libName: string): string | undefined => {
    if (!group || typeof group !== 'object') return undefined;
    const spec = (group as Record<string, unknown>)[libName];
    return typeof spec === 'string' ? spec : undefined;
};

/** Onde um `package.json` declara a lib e com qual especificação. JSON inválido não gera achado. */
export const findLibDeclarations = (text: string, libName: string): LibDeclaration[] => {
    let manifest: Record<string, unknown>;
    try {
        manifest = JSON.parse(text) as Record<string, unknown>;
    } catch {
        return [];
    }
    const found: LibDeclaration[] = [];
    for (const section of DEPENDENCY_SECTIONS) {
        const spec = specIn(manifest[section], libName);
        if (spec !== undefined) found.push({ section, spec, line: lineOfKey(text, section, libName) });
    }
    return found;
};

export const isPinnedToTag = (spec: string): boolean => PINNED_SPEC.test(spec);

/** O `kitHash` do arquivo `sarak-ui/VERSION` (formato textual `chave=valor`). */
export const readKitHash = (versionText: string): string | undefined => /^kitHash=(\S+)/m.exec(versionText)?.[1];
