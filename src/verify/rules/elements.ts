import { isValidSpacing, spacingSuggestion } from '../detect/spacing';
import { loadVerificationData } from '../data';
import type { NativeEquivalent } from '../types';
import { defineRule, isAllowedFile, readOptions, someDescendant, stringValueOf, type AstNode, type RuleContext, type Visitor } from './kit';

interface JsxName extends AstNode {
    name?: string;
}

interface OpeningNode extends AstNode {
    name: JsxName;
    attributes: (AstNode & { name?: JsxName; value?: AstNode | null })[];
}

interface ElementNode extends AstNode {
    openingElement: OpeningNode;
}

const hasDescendantNamed = (element: ElementNode, names: readonly string[]): boolean =>
    someDescendant(element, (child) => {
        const name = (child as ElementNode).openingElement?.name?.name;
        return child.type === 'JSXElement' && name !== undefined && names.includes(name);
    });

const applies = (entry: NativeEquivalent, element: ElementNode): boolean =>
    !entry.contains || hasDescendantNamed(element, entry.contains);

const listOf = (names: string[]): string => {
    const quoted = names.map((name) => `\`${name}\``);
    return quoted.length > 1 ? `${quoted.slice(0, -1).join(', ')} ou ${quoted[quoted.length - 1]}` : quoted[0];
};

const preferSarakComponent = (context: RuleContext): Visitor => {
    if (isAllowedFile(context, readOptions(context).allow)) return {};
    const byElement = new Map<string, NativeEquivalent[]>();
    for (const entry of loadVerificationData().catalog.verification.nativeEquivalents) {
        byElement.set(entry.element, [...(byElement.get(entry.element) ?? []), entry]);
    }
    return {
        JSXElement: (node: ElementNode) => {
            const tag = node.openingElement.name.name;
            const matching = tag ? (byElement.get(tag) ?? []).filter((entry) => applies(entry, node)) : [];
            if (matching.length === 0) return;
            const components = [...new Set(matching.map((entry) => entry.component))];
            context.report({
                loc: node.openingElement.loc,
                message: `\`<${tag}>\` tem componente na lib: use ${listOf(components)} (veja o catálogo do kit).`,
            });
        },
    };
};

const spacingMessage = (prop: string, value: string, tokens: string[]): string => {
    const near = spacingSuggestion(value, tokens);
    const hint = near ? ` Use \`${near}\`.` : '';
    return `\`${prop}="${value}"\` não é token de espaçamento nem comprimento CSS e cai no padrão sem aviso.${hint} Tokens: ${tokens.map((token) => `\`${token}\``).join(', ')}.`;
};

const validSpacingValue = (context: RuleContext): Visitor => {
    const data = loadVerificationData();
    return {
        JSXOpeningElement: (node: OpeningNode) => {
            const props = node.name.name ? data.spacingProps.get(node.name.name) : undefined;
            if (!props) return;
            for (const attribute of node.attributes) {
                const prop = attribute.name?.name;
                const raw = attribute.value;
                const value = stringValueOf(raw?.type === 'JSXExpressionContainer' ? (raw as AstNode & { expression: AstNode }).expression : raw);
                if (!prop || !props.has(prop) || value === undefined || isValidSpacing(value, data.spacingTokens)) continue;
                context.report({ loc: attribute.loc, message: spacingMessage(prop, value, data.spacingTokens) });
            }
        },
    };
};

export const elementRules = {
    'prefer-sarak-component': defineRule('Barra elemento nativo que tem componente equivalente na lib.', preferSarakComponent),
    'valid-spacing-value': defineRule('Barra valor de espaçamento que não é token nem comprimento CSS.', validSpacingValue),
};
