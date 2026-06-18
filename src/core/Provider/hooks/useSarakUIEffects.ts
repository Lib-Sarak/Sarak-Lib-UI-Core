import { useEffect } from 'react';

export const useSarakUIEffects = (branding: any) => {
    // Injeção de Fontes Avançadas (Core Optimization)
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const domains = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'];
        domains.forEach(domain => {
            const preconnect = document.createElement('link');
            preconnect.rel = 'preconnect';
            preconnect.href = domain;
            document.head.appendChild(preconnect);
        });

        const ID = 'sarak-core-fonts';
        if (document.getElementById(ID)) return;
        const style = document.createElement('style');
        style.id = ID;
        style.textContent = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800;900&family=Outfit:wght@300;400;600;700;800;900&family=Roboto:wght@300;400;500;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;600;800&family=Lexend:wght@300;400;500;600;700;800;900&family=Unbounded:wght@300;400;600;900&family=Plus+Jakarta+Sans:wght@300;400;600;800&family=Playfair+Display:wght@400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Sora:wght@400;500;600;700;800&family=Syne:wght@400;500;600;700;800&family=Archivo:wght@400;500;600;700&family=Bebas+Neue&family=Dancing+Script:wght@400;500;600;700&family=Pacifico&family=Satisfy&family=Caveat:wght@400;500;600;700&family=Fraunces:wght@300;400;500;600;700;800;900&display=swap');`;
        document.head.prepend(style);
    }, []);

    // Atualização Dinâmica do Título e Ícone da Aba (Branding)
    useEffect(() => {
        if (typeof document === 'undefined') return;
        
        if (branding?.tabName) {
            document.title = branding.tabName;
        }

        if (branding?.logoBase64) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = branding.logoBase64;
        }
    }, [branding?.tabName, branding?.logoBase64]);
};
