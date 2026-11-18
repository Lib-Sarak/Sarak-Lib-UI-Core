import { useEffect, useRef, useState } from 'react';

/** O id do grupo das paletas salvas na galeria. */
export const MINE_GROUP = 'mine';

/**
 * Quais grupos da galeria de paletas estão abertos. `initial` é o conjunto de partida; `savedCount` é quantas paletas salvas
 * há: quando cresce, o grupo "Minhas paletas" abre para mostrar a recém-salva (o grupo nasce junto, recolhido, sem isso).
 */
export const useOpenGalleryGroups = (initial: () => ReadonlySet<string>, savedCount: number) => {
    const [opened, setOpened] = useState<ReadonlySet<string>>(initial);
    const previousCount = useRef(savedCount);
    useEffect(() => {
        if (savedCount > previousCount.current) setOpened((current) => new Set([...current, MINE_GROUP]));
        previousCount.current = savedCount;
    }, [savedCount]);
    const toggle = (id: string): void => setOpened((current) => {
        const next = new Set(current);
        if (!next.delete(id)) next.add(id);
        return next;
    });
    return { opened, toggle };
};
