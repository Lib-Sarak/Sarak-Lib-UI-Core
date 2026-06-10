import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSarakUI } from '../../../../core/Provider/SarakUIProvider';

export function useThemeEngineState() {
    const sarakContext = useSarakUI();
    const { systemDesign, design, branding, updateBranding, ...rest } = sarakContext;

    // Deep Reference Stability
    const sarak = useMemo(() => ({ 
        systemDesign, 
        design, 
        ...rest 
    }), [systemDesign, design, JSON.stringify(rest)]);

    // Preview UI State
    const [activePreviewApp, setActivePreviewApp] = useState('dashboard');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'smartphone'>('desktop');
    const [activePillarId, setActivePillarId] = useState<string | null>('brand');
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'preview' | 'catalog' | 'templates'>('preview');
    const [searchQuery, setSearchQuery] = useState('');
    const [isEssentialMode, setIsEssentialMode] = useState(true);
    const [isPreviewStacked, setIsPreviewStacked] = useState(false);

    // Persistence Tracking
    const [currentThemeId, setCurrentThemeId] = useState<string | null>(null);
    const [currentThemeOrigin, setCurrentThemeOrigin] = useState<'script' | 'database'>('script');
    const [currentThemeName, setCurrentThemeName] = useState<string>('');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingApply, setPendingApply] = useState(false);

    // Pillar sync logic
    const appToPillarMap: Record<string, string> = useMemo(() => ({
        'dashboard': 'surfaces',
        'components': 'surfaces',
        'tabela': 'surfaces',
        'caixas-texto': 'interaction',
        'typography': 'typography',
        'chat': 'advanced',
        'graficos': 'advanced',
        'matrix': 'advanced',
        'auth': 'brand',
        'settings': 'systems',
        'logs': 'systems'
    }), []);

    useEffect(() => {
        const pillarId = appToPillarMap[activePreviewApp];
        if (pillarId && activePillarId !== pillarId) {
            setActivePillarId(pillarId);
        }
    }, [activePreviewApp, appToPillarMap, activePillarId]);

    const uiBaseUrl = sarak.options?.endpoints?.baseUrl || '/api/ui';
    const apiToken = sarak.token;

    const fetchActiveTheme = useCallback(async () => {
        try {
            const headers: any = { 'Content-Type': 'application/json' };
            if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;
            const res = await fetch(`${uiBaseUrl}/design`, { headers });
            if (!res.ok) return null;
            const payload = await res.json();
            return payload.data?.design || null;
        } catch (err) {
            console.error('ThemeEngine: fetchActiveTheme failed', err);
            return null;
        }
    }, [uiBaseUrl, apiToken]);

    return {
        sarak,
        uiBaseUrl,
        apiToken,
        // UI State
        activePreviewApp, setActivePreviewApp,
        previewDevice, setPreviewDevice,
        activePillarId, setActivePillarId,
        activeSectionId, setActiveSectionId,
        viewMode, setViewMode,
        searchQuery, setSearchQuery,
        isEssentialMode, setIsEssentialMode,
        isPreviewStacked, setIsPreviewStacked,
        // Persistence State
        currentThemeId, setCurrentThemeId,
        currentThemeOrigin, setCurrentThemeOrigin,
        currentThemeName, setCurrentThemeName,
        isSaveModalOpen, setIsSaveModalOpen,
        isSaving, setIsSaving,
        pendingApply, setPendingApply,
        // Methods
        fetchActiveTheme
    };
}
