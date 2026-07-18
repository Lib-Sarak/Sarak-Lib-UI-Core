import React from 'react';
import type { ManifestValidationError } from '../validateNode';

/**
 * Telas DX da raiz do Renderer (Spec 17, §2.2).
 *
 * Substituem o antigo `SarakFallback type="ManifestoInvalido"` — que dizia
 * "Componente desconhecido: ManifestoInvalido" e fazia o dev caçar um componente
 * inexistente. Aqui a mensagem é honesta: ou o `payload` não foi passado, ou é
 * inválido (e listamos TODOS os erros com path). NÃO é o Fallback de "type
 * desconhecido", que tem outra semântica.
 */

/** Estilo com fallback explícito (só `--sarak-*`/`--theme-*`) — legível sem `sarak.css`. */
const screenBoxStyle: React.CSSProperties = {
    color: 'var(--sarak-color-error-base, currentColor)',
    border: 'var(--sarak-border-width-thin, thin) solid var(--sarak-color-error-base, currentColor)',
    background: 'var(--sarak-color-error-surface, transparent)',
};

const codeStyle: React.CSSProperties = { fontFamily: 'var(--sarak-font-mono, monospace)' };

/** `payload`/`manifest` ausente (undefined/null): instrui a passar a prop + template. */
export const SarakMissingManifestScreen: React.FC = () => (
    <div role="alert" data-sarak-missing-manifest="true" className="px-4 py-3 rounded text-sm" style={screenBoxStyle}>
        <strong>Manifesto não fornecido</strong>
        <p className="mt-1">
            Passe a prop <code style={codeStyle}>payload</code> ao{' '}
            <code style={codeStyle}>&lt;SarakManifestRenderer&gt;</code>. Comece pelo template:{' '}
            <code style={codeStyle}>templates/app-starter.manifest.json</code>.
        </p>
    </div>
);

/** Props da tela de manifesto inválido: a lista completa de erros de validação. */
export interface SarakInvalidManifestScreenProps {
    /** Todos os `ManifestValidationError` (path + mensagem) — nunca só o primeiro. */
    errors: ManifestValidationError[];
}

/**
 * Payload inválido: lista TODOS os erros (path + mensagem) em dev; em produção mostra
 * um resumo sóbrio (nunca em branco). Distinta de `SarakFallback` (type desconhecido).
 */
export const SarakInvalidManifestScreen: React.FC<SarakInvalidManifestScreenProps> = ({ errors }) => {
    const isDev = process.env.NODE_ENV !== 'production';
    return (
        <div role="alert" data-sarak-invalid-manifest="true" className="px-4 py-3 rounded text-sm" style={screenBoxStyle}>
            <strong>Manifesto inválido</strong>
            {isDev ? (
                <>
                    <p className="mt-1">{`${errors.length} problema(s) encontrado(s):`}</p>
                    <ul className="mt-1 list-disc pl-5">
                        {errors.map((error, index) => (
                            <li key={`${error.path}-${index}`}>
                                <code style={codeStyle}>{error.path}</code>
                                {error.nodeId ? ` (id: "${error.nodeId}")` : ''}: {error.message}
                            </li>
                        ))}
                    </ul>
                </>
            ) : (
                <p className="mt-1">O manifesto fornecido não é válido. Verifique o console para os detalhes.</p>
            )}
        </div>
    );
};
