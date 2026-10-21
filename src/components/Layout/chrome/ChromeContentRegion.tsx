import React from 'react';
import { CHROME_SPLIT_CONTENT_LAYOUT_CLASS } from './chromeStructuralStyles';

const hasRenderableChildren = (children: React.ReactNode): boolean =>
    React.Children.toArray(children).some((child) => (
        React.isValidElement(child) && child.type === React.Fragment
            ? hasRenderableChildren(child.props.children)
            : true
    ));

export interface ChromeContentRegionProps {
    children: React.ReactNode;
    secondaryContent?: React.ReactNode;
    isSplitViewEnabled: boolean;
    className: string;
    style: React.CSSProperties;
}

export const ChromeContentRegion: React.FC<ChromeContentRegionProps> = ({
    children,
    secondaryContent,
    isSplitViewEnabled,
    className,
    style,
}) => {
    const secondaryChildren = React.Children.toArray(secondaryContent);
    const shouldRenderSplitView = isSplitViewEnabled && hasRenderableChildren(secondaryContent);
    const regionClassName = shouldRenderSplitView ? `${className} @container` : className;

    return (
        <main data-sarak-content className={regionClassName} style={style}>
            {shouldRenderSplitView ? (
                <div className={CHROME_SPLIT_CONTENT_LAYOUT_CLASS}>
                    <div data-sarak-split-panel="primary" className="min-w-0">
                        {children}
                    </div>
                    <div
                        data-sarak-slot="secondaryContent"
                        data-sarak-split-panel="secondary"
                        className="min-w-0"
                    >
                        {secondaryChildren}
                    </div>
                </div>
            ) : children}
        </main>
    );
};
