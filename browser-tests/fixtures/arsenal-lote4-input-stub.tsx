import React from 'react';

interface MeasurementInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    leftIcon?: React.ReactNode;
}

export function SarakInput({ leftIcon, ...props }: MeasurementInputProps): React.ReactElement {
    return <label>{leftIcon}<input {...props} /></label>;
}
