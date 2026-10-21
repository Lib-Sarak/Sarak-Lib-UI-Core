import React from 'react';
import { useSarakUIOptional } from '../../../core/Provider/SarakUIProvider';
import { SarakIconMap, type SarakIconFamily } from './IconMap';
import { SARAK_ICON_NAMES, SARAK_ICONE_DESCONHECIDO, type SarakIconName } from './iconNames';

export interface SarakIconPresentationProps {
    size?: number | string;
    className?: string;
    color?: string;
    style?: React.CSSProperties;
    strokeWidth?: number;
    onClick?: () => void;
}

export type SarakIconProps = SarakIconPresentationProps & (
    | { name: React.ReactNode; icon?: never }
    | { icon: React.ReactNode; name?: never }
);

export interface SarakRegisteredIconProps extends SarakIconPresentationProps {
    weight?: string;
    strokeWidth?: number;
}

interface ResolvedIconPresentation {
    size: number | string;
    className: string;
    color?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

const registeredIcons = new Map<string, React.ElementType>();

/** Adds consumer icons by name and returns a function that removes this registration. */
export function sarakRegisterIcons(
    icons: Record<string, React.ElementType>,
): () => void {
    if (!icons || typeof icons !== 'object' || Array.isArray(icons)) {
        throw new TypeError('Registered icons must be provided as a name-to-component object.');
    }
    const entries = Object.entries(icons);
    for (const [name, component] of entries) {
        if (!name.trim()) throw new TypeError('Registered icon names must not be empty.');
        if (SARAK_ICON_NAMES.includes(name as SarakIconName)) {
            throw new Error(`The built-in icon name "${name}" cannot be replaced.`);
        }
        if (registeredIcons.has(name)) {
            throw new Error(`An icon named "${name}" is already registered.`);
        }
        if (typeof component !== 'function' && (typeof component !== 'object' || component === null)) {
            throw new TypeError(`The icon registered as "${name}" must be a React component.`);
        }
    }

    entries.forEach(([name, component]) => registeredIcons.set(name, component));
    return () => {
        entries.forEach(([name, component]) => {
            if (registeredIcons.get(name) === component) registeredIcons.delete(name);
        });
    };
}

const ICON_STROKE_LIGHT = 1.5;
const ICON_STROKE_BOLD = 2.5;
const ICON_STROKE_FILL = 3;
const TABLER_STROKE_LIGHT = 1.25;
const TABLER_STROKE_REGULAR = 1.5;
const TABLER_STROKE_BOLD = 2.5;

const strokeByWeight: Record<string, number> = {
    thin: 1,
    light: ICON_STROKE_LIGHT,
    regular: 2,
    bold: ICON_STROKE_BOLD,
    fill: ICON_STROKE_FILL,
    duotone: 2,
};

const tablerStrokeByWeight: Record<string, number> = {
    thin: 1,
    light: TABLER_STROKE_LIGHT,
    regular: TABLER_STROKE_REGULAR,
    bold: 2,
    fill: TABLER_STROKE_BOLD,
    duotone: TABLER_STROKE_REGULAR,
};

const warnedNames = new Set<string>();

function warnUnknownName(name: string): void {
    if (warnedNames.has(name)) return;
    warnedNames.add(name);
    console.warn(
        `[Sarak:Icon] ícone "${name}" fora do contrato — renderizando "${SARAK_ICONE_DESCONHECIDO}" no lugar. ` +
        'Use sarakRegisterIcons para registrar um componente do consumidor.',
    );
}

function resolveStrokeWidth(
    family: SarakIconFamily,
    weight: string,
    tokenWidth: unknown,
    explicitWidth?: number,
): number {
    const baseWidth = getWeightStrokeWidth(family, weight);
    const parsedTokenWidth = Number(tokenWidth);
    const scale = Number.isFinite(parsedTokenWidth) && parsedTokenWidth > 0 ? parsedTokenWidth / 2 : 1;
    const themedWidth = baseWidth * scale;
    return explicitWidth !== undefined ? themedWidth * (explicitWidth / baseWidth) : themedWidth;
}

function getWeightStrokeWidth(family: SarakIconFamily, weight: string): number {
    return (family === 'tabler' ? tablerStrokeByWeight : strokeByWeight)[weight] ?? 2;
}

function renderDirectElement(
    element: React.ReactElement,
    presentation: ResolvedIconPresentation,
    strokeWidth: number,
): React.ReactElement {
    const currentProps = element.props as React.SVGProps<SVGSVGElement> & { size?: number | string };
    const mergedProps = {
        ...currentProps,
        size: presentation.size,
        width: presentation.size,
        height: presentation.size,
        className: [currentProps.className, presentation.className].filter(Boolean).join(' '),
        color: presentation.color ?? currentProps.color,
        strokeWidth,
        style: { ...currentProps.style, ...presentation.style },
        onClick: presentation.onClick ?? currentProps.onClick,
    };
    return React.cloneElement(element as React.ReactElement<Record<string, unknown>>, mergedProps);
}

function resolveBuiltInIcon(name: string, family: SarakIconFamily): React.ElementType {
    const triple = SarakIconMap[name as SarakIconName];
    if (!triple) warnUnknownName(name);
    return (triple ?? SarakIconMap[SARAK_ICONE_DESCONHECIDO])[family]
        ?? SarakIconMap[SARAK_ICONE_DESCONHECIDO].lucide;
}

interface FamilyIconRenderOptions {
    IconComponent: React.ElementType;
    family: SarakIconFamily;
    presentation: ResolvedIconPresentation;
    weight: string;
    strokeWidth: number;
}

function renderFamilyIcon({ IconComponent, family, presentation, weight, strokeWidth }: FamilyIconRenderOptions): React.ReactElement {
    if (family === 'phosphor') return <IconComponent {...presentation} weight={weight} />;
    if (family === 'tabler') return <IconComponent {...presentation} stroke={strokeWidth} />;
    return <IconComponent {...presentation} strokeWidth={strokeWidth} />;
}

export const SarakIcon = (props: SarakIconProps): React.ReactElement => {
    const design = useSarakUIOptional()?.design;
    const family = (design?.iconFamily || 'lucide') as SarakIconFamily;
    const weight = String(design?.iconWeight || 'regular');
    const presentation: ResolvedIconPresentation = {
        size: props.size ?? 24,
        className: props.className ?? '',
        color: props.color,
        style: props.style,
        onClick: props.onClick,
    };
    const strokeWidth = resolveStrokeWidth(family, weight, design?.iconStrokeWidth, props.strokeWidth);
    const source = 'icon' in props ? props.icon : props.name;

    if (React.isValidElement(source)) {
        return renderDirectElement(source, presentation, strokeWidth);
    }
    if (typeof source !== 'string') return <>{source}</>;

    const RegisteredIcon = registeredIcons.get(source);
    if (RegisteredIcon) {
        return <RegisteredIcon {...presentation} weight={weight} strokeWidth={strokeWidth} />;
    }

    return renderFamilyIcon({
        IconComponent: resolveBuiltInIcon(source, family),
        family,
        presentation,
        weight,
        strokeWidth,
    });
};
