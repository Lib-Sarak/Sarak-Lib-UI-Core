export const SARAK_BUILD_INFO = {
    "baseCommit": "61169554d72092fbc647625fd69bfd11416bfe8f",
    "baseCommitShort": "6116955",
    "builtAt": "2026-10-13T03:35:00.741Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
