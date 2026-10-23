export const SARAK_BUILD_INFO = {
    "baseCommit": "5094abee208a3271818a53a33f42041f9f21d713",
    "baseCommitShort": "5094abe",
    "builtAt": "2026-10-23T20:37:20.729Z",
    "libVersion": "8.0.0-rc.2",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
