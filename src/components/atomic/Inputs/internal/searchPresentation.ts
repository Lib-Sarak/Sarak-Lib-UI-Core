import type { SarakSearchItem } from '../SarakSearch';

export const getSearchModifierLabel = (userAgent: string): 'Ctrl' | '⌘' =>
    /Macintosh|Mac OS X|iPhone|iPad|iPod/i.test(userAgent) ? '⌘' : 'Ctrl';

export const getSarakSearchItemSubtitle = (item: SarakSearchItem): string | undefined => {
    const category = item.category?.trim();
    if (category) return category;

    const destination = item.id.trim();
    const isRoutePath = destination.startsWith('/')
        || destination.startsWith('./')
        || destination.startsWith('../')
        || destination.startsWith('#')
        || destination.startsWith('?');

    return isRoutePath ? destination : undefined;
};
