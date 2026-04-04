import React, { useEffect } from 'react';

const GoogleTranslateWidget = () => {
    useEffect(() => {
        const addScript = () => {
            if ((window as any).googleTranslateElementInit) return;

            (window as any).googleTranslateElementInit = () => {
                new (window as any).google.translate.TranslateElement({
                    pageLanguage: 'pt',
                    layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                    autoDisplay: false,
                }, 'google_translate_element');
            };

            const script = document.createElement('script');
            script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
            script.async = true;
            document.body.appendChild(script);
        };

        addScript();
    }, []);

    return (
        <div 
            id="google_translate_element" 
            style={{ 
                display: 'none', 
                position: 'fixed', 
                visibility: 'hidden', 
                pointerEvents: 'none' 
            }} 
        />
    );
};

export default GoogleTranslateWidget;
