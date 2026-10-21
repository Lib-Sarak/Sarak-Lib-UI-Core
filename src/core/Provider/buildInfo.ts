export const SARAK_BUILD_INFO = {
    "baseCommit": "1883435285f227690034c8c3e2a77f35057d3aee",
    "baseCommitShort": "1883435",
    "builtAt": "2026-10-21T04:51:03.576Z",
    "libVersion": "8.0.0-rc.1",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
