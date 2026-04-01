import React, { ReactNode } from 'react';

interface SarakShellProps {
    children: ReactNode;
    brand?: {
        name?: string;
        logo?: string;
    };
    sidebar?: ReactNode;
    topbar?: ReactNode;
}

export const SarakShell: React.FC<SarakShellProps> = ({ 
    children, 
    brand = { name: "Sarak OS" },
    sidebar,
    topbar 
}) => {
    return (
        <div className="sarak-shell min-h-screen bg-[var(--color-theme-bg)] text-white font-sans selection:bg-blue-500/30">
            {/* Topbar Layout */}
            <header className="sarak-topbar sticky top-0 z-50 h-16 border-b border-[var(--glass-border)] bg-[var(--color-theme-bg)]/80 backdrop-blur-md px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {brand.logo && <img src={brand.logo} alt="Logo" className="h-8 w-8 object-contain" />}
                    <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        {brand.name}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {topbar}
                </div>
            </header>

            <div className="flex">
                {/* Optional Sidebar */}
                {sidebar && (
                    <aside className="sarak-sidebar w-64 sticky top-16 h-[calc(100vh-64px)] border-r border-[var(--glass-border)] hidden lg:block overflow-y-auto">
                        {sidebar}
                    </aside>
                )}

                {/* Main Content Area */}
                <main className="flex-1 p-6 lg:p-8 animate-in fade-in duration-500">
                    <div className="max-w-[1400px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SarakShell;
