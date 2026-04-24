import React from "react";

const FilterSelect = ({ col, placeholder, filters, onChange, options }: any) => (
    <select
        value={filters[col]}
        onChange={(e) => onChange(col, e.target.value)}
        className="w-full bg-theme-card border-theme rounded-theme text-2xs text-slate-300 outline-none focus:border-blue-500 appearance-none cursor-pointer"
        style={{ padding: 'calc(var(--theme-pad) / 5)' }}
    >
        <option value="">(All)</option>
        {options.map((opt: any) => (
            <option key={opt} value={opt}>{opt}</option>
        ))}
    </select>
);

export default FilterSelect;

