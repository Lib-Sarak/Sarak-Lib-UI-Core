import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LayoutDashboard } from 'lucide-react';

export const IconRenderer = ({ name, className, size = 16 }: { name?: string, className?: string, size?: number }) => {
    if (!name) return <LayoutDashboard size={size} className={className} />;
    const IconComponent = (LucideIcons as any)[name];
    return IconComponent ? <IconComponent size={size} className={className} /> : <LayoutDashboard size={size} className={className} />;
};

