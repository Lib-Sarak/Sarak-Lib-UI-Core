import React from "react";

const FilterSelect = ({ col, placeholder, filters, onChange, options }: any) => (
    <select
        value={filters[col]}
        onChange={(e) => onChange(col, e.target.value)}
        className="w-full bg-[var(--input-bg,rgba(255,255,255,0.05))] border border-white/5 text-2xs text-slate-300 outline-none focus:border-[var(--theme-primary-border)] appearance-none cursor-pointer transition-all"
        style={{ 
            padding: 'var(--sarak-filter-padding, 8px)', 
            borderRadius: 'var(--sarak-filter-radius, var(--sarak-grid-radius, 6px))' 
        }}
    >
        <option value="">(All)</option>
        {options.map((opt: any) => (
            <option key={opt} value={opt}>{opt}</option>
        ))}
    </select>
);

export default FilterSelect;

