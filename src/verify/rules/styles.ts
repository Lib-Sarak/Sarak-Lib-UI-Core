import { declaredSarakVars, findSarakVarReferences } from '../detect/cssVars';
import { cssPropertyOf, literalKindOf } from '../detect/literals';
import { SELECTOR_METHODS, findInternalClassSelectors } from '../detect/selectors';
import { loadVerificationData } from '../data';
import { internalSelectorMessage, literalMessage, unknownCssVarMessage } from '../messages';
import { defineRule, isAllowedFile, readOptions, stringValueOf, type AstNode, type RuleContext, type Visitor } from './kit';

interface PropertyNode extends AstNode {
    key: AstNode & { name?: string; value?: unknown };
    value: AstNode;
}

interface StyleAttribute extends AstNode {
    name: { name?: string };
    value?: { type: string; expression?: AstNode & { properties?: PropertyNode[] } } | null;
}

interface CallNode extends AstNode {
    callee: AstNode & { property?: { name?: string } };
    arguments: AstNode[];
}

const keyName = (property: PropertyNode): string | undefined =>
    property.key.type === 'Identifier' ? property.key.name : typeof property.key.value === 'string' ? property.key.value : undefined;

const knownCssVar = (context: RuleContext): Visitor => {
    const data = loadVerificationData();
    const { ignore } = readOptions(context);
    const declared = declaredSarakVars(context.sourceCode.text);
    const check = (node: AstNode): void => {
        const raw = context.sourceCode.getText(node);
        for (const reference of findSarakVarReferences(raw)) {
            if (data.cssVars.has(reference.name) || declared.has(reference.name) || ignore.includes(reference.name)) continue;
            context.report({
                loc: context.sourceCode.getLocFromIndex(node.range[0] + reference.index),
                message: unknownCssVarMessage(reference.name, data),
            });
        }
    };
    return { Literal: check, TemplateLiteral: check };
};

const noLiteralColorFont = (context: RuleContext): Visitor => {
    if (isAllowedFile(context, readOptions(context).allow)) return {};
    return {
        JSXAttribute: (node: StyleAttribute) => {
            if (node.name.name !== 'style' || node.value?.type !== 'JSXExpressionContainer') return;
            for (const property of node.value.expression?.properties ?? []) {
                // `style={{ ...base, color: x }}`: o espalhamento não tem chave e o valor dele não se lê aqui.
                if (property.type !== 'Property') continue;
                const key = keyName(property);
                const value = stringValueOf(property.value);
                const kind = key && value ? literalKindOf(cssPropertyOf(key), value) : null;
                if (kind && key) context.report({ loc: property.loc, message: literalMessage(kind, cssPropertyOf(key)) });
            }
        },
    };
};

const noInternalClassSelector = (context: RuleContext): Visitor => ({
    CallExpression: (node: CallNode) => {
        const method = node.callee.property?.name;
        const selector = stringValueOf(node.arguments[0]);
        if (!method || !SELECTOR_METHODS.has(method) || selector === undefined) return;
        for (const hit of findInternalClassSelectors(selector)) {
            context.report({ loc: node.arguments[0].loc, message: internalSelectorMessage(hit.selector) });
        }
    },
});

export const styleRules = {
    'known-css-var': defineRule('Barra `var(--sarak-*)` que não está em `tokens.cssVars` do catálogo.', knownCssVar),
    'no-literal-color-font': defineRule('Barra cor ou fonte literal em `style`, fora de `var()` com reserva.', noLiteralColorFont),
    'no-internal-class-selector': defineRule('Barra seletor por classe interna da lib em teste ou script.', noInternalClassSelector),
};
