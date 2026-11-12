export const SARAK_BUILD_INFO = {
    "baseCommit": "ad52df30d11d9169a23f82e5b6c2fe52b9e6bd01",
    "baseCommitShort": "ad52df3",
    "builtAt": "2026-11-12T13:07:51.904Z",
    "libVersion": "8.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
