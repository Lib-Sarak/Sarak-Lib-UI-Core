import React from "react";
import { SarakSelect } from "../Inputs/SarakSelect";

interface FilterSelectProps {
    col: string;
    placeholder?: string;
    filters: Record<string, string>;
    onChange: (col: string, value: string) => void;
    options: string[];
}

const FilterSelect: React.FC<FilterSelectProps> = ({ col, placeholder, filters, onChange, options }) => (
    <SarakSelect
        value={filters[col] || ''}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(col, e.target.value)}
        className="w-full text-2xs text-slate-300 transition-all"
        style={{ 
            padding: 'var(--sarak-layout-gap-sm,8px)', 
            borderRadius: 'var(--sarak-card-radius,12px)' 
        }}
    >
        <option value="">(All)</option>
        {options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
        ))}
    </SarakSelect>
);

export default FilterSelect;
