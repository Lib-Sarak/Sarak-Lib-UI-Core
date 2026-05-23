import React from 'react';
import { SarakIcon } from '../../../components/atomic/Icon/SarakIcon';

export const IconRenderer = ({ name, className, size = 16 }: { name?: string, className?: string, size?: number }) => {
    if (!name) return <SarakIcon name="LayoutDashboard" size={size} className={className} />;
    return <SarakIcon name={name} size={size} className={className} />;
};
