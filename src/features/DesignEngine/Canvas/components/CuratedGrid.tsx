import React, { useState } from 'react';
import type { ComponentPreset } from '../../../../core/Design/presets/components/cards';
import type { PresetGroupDef } from '../../../../core/Design/presets/components/registry';
import { usePresetText } from '../../hooks/usePresetText';

interface CuratedGridProps {
    group: PresetGroupDef;
    /** Grade de colunas do grupo (classe literal de `panelResponsive.presets`). */
    gridClassName: string;
    renderTile: (preset: ComponentPreset, index: number) => React.ReactNode;
    /** Com "Ver todas" aberto, agrupa as opções (famílias de textura, categorias de fonte); sem isto, uma grade só. */
    sectionOf?: (preset: ComponentPreset) => { id: string; title: string };
}

/**
 * Um grupo de opções curado: mostra as que o registro destaca (de 6 a 8) e guarda o resto atrás do "Ver todas", que
 * abre as demais, agrupadas quando o grupo tem famílias. O botão diz quantas há e é um interruptor (`aria-expanded`).
 */
export const CuratedGrid: React.FC<CuratedGridProps> = ({ group, gridClassName, renderTile, sectionOf }) => {
    const [expanded, setExpanded] = useState(false);
    const text = usePresetText();
    const hasMore = group.presets.length > group.featured.length;
    const byId = new Map(group.presets.map((preset) => [preset.id, preset]));
    const featured = group.featured.flatMap((id) => (byId.has(id) ? [byId.get(id) as ComponentPreset] : []));
    const shown = expanded ? group.presets : featured;

    const sections = expanded && sectionOf
        ? [...shown.reduce((map, preset) => {
            const section = sectionOf(preset);
            map.set(section.id, { title: section.title, items: [...(map.get(section.id)?.items ?? []), preset] });
            return map;
        }, new Map<string, { title: string; items: ComponentPreset[] }>())]
        : [['all', { title: '', items: [...shown] }] as const];

    return (
        <div data-preset-group={group.id} className="flex flex-col gap-4">
            {sections.map(([id, section]) => (
                <div key={id} className="flex flex-col gap-3">
                    {section.title && <h4 className="text-xs font-semibold text-[var(--theme-muted)]">{section.title}</h4>}
                    <div className={`grid ${gridClassName} gap-6`}>{section.items.map((preset, index) => renderTile(preset, index))}</div>
                </div>
            ))}
            {hasMore && (
                <button
                    type="button"
                    aria-expanded={expanded}
                    data-preset-toggle={group.id}
                    onClick={() => setExpanded((current) => !current)}
                    className="self-start rounded-[var(--sarak-card-radius,10px)] border border-[var(--theme-border)] px-3 py-1.5 text-[length:var(--sarak-type-scale-caption,12px)] font-semibold text-[var(--theme-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
                >
                    {expanded ? text.ui('seeFewer') : text.ui('seeAllCount', { count: group.presets.length })}
                </button>
            )}
        </div>
    );
};
