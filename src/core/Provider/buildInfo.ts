export const SARAK_BUILD_INFO = {
    "baseCommit": "b59418fd182fc7d3d2b1460e9fe468d71a4b7b17",
    "baseCommitShort": "b59418f",
    "builtAt": "2026-10-29T21:13:20.560Z",
    "libVersion": "8.0.0-rc.4",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
