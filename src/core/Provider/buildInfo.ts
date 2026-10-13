export const SARAK_BUILD_INFO = {
    "baseCommit": "4fb63916c38ad3cbc963d48b5a3003fa0a4d1503",
    "baseCommitShort": "4fb6391",
    "builtAt": "2026-10-13T21:08:57.299Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
