export const SARAK_BUILD_INFO = {
    "baseCommit": "e49bc5defee23bc36d4cf680d3847641f336bbf6",
    "baseCommitShort": "e49bc5d",
    "builtAt": "2026-10-11T04:34:56.830Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
