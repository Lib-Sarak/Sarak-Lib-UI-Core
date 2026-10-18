export const SARAK_BUILD_INFO = {
    "baseCommit": "da45131cf63e86f8c6ec9e9bd04057854dedd593",
    "baseCommitShort": "da45131",
    "builtAt": "2026-10-18T22:23:44.294Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
