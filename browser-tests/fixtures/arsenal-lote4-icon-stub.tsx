import React from 'react';

interface MeasurementIconProps {
    name?: string;
    className?: string;
    size?: number | string;
}

export function SarakIcon({ name = 'measurement-icon', className, size }: MeasurementIconProps): React.ReactElement {
    return <span aria-hidden="true" data-icon={name} className={className} style={{ width: size, height: size }} />;
}
