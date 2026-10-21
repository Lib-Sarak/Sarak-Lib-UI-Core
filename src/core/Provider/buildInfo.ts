export const SARAK_BUILD_INFO = {
    "baseCommit": "cc5b103e1ec2b373a71d42c4fd1b55e132736fdf",
    "baseCommitShort": "cc5b103",
    "builtAt": "2026-10-20T23:35:03.960Z",
    "libVersion": "7.0.0",
    "note": "baseCommit é o commit SOBRE o qual este build foi gerado — não o commit que o publica (o dist/ é commitado depois de gerado, e o hash de um commit não pode conter o próprio hash). Para saber se o consumidor está atualizado, use o \"resolved\" do package-lock.json ou rode \"npm run sarak:check\"."
} as const;
