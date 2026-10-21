import { useContext } from 'react';
import { UIContext } from '../../../core/Provider/SarakUIProvider';
import { resolveSarakUIMode } from '../../../core/Provider/scope';
import { useHasGlobalBackgroundMedia } from '../../../core/Provider/useHasGlobalBackgroundMedia';

/**
 * Fundo da raiz do cromo. Ela só pinta `--bg-body` quando ninguém por baixo pinta a página:
 * com mídia global, ou com o `body` em Modo App (há `SarakUIProvider`) emitindo gradiente, tom
 * e textura (`_background.css`, `_atmosphere.css`), uma raiz opaca cobriria essas camadas — então
 * fica transparente e a atmosfera da página aparece atrás do conteúdo.
 *
 * Sem Provider não há motor nem atmosfera para deixar passar, e no Modo Embarcado o `body` é o do
 * host: nos dois casos a raiz mantém a própria pintura.
 */
export const useChromeRootBackground = (): string => {
    const hasGlobalMedia = useHasGlobalBackgroundMedia();
    const context = useContext(UIContext);
    const bodyPaintsPage = context !== undefined && resolveSarakUIMode(context.options) === 'app';
    return hasGlobalMedia || bodyPaintsPage ? 'transparent' : 'var(--bg-body, var(--theme-body, transparent))';
};
