import React from "react";
import { SarakSelect } from "../Inputs/SarakSelect";

const FilterSelect = ({ col, placeholder, filters, onChange, options }: any) => (
    <SarakSelect
        value={filters[col]}
        onChange={(e: any) => onChange(col, e.target.value)}
        className="w-full text-2xs text-slate-300 transition-all"
        style={{ 
            padding: 'var(--sx-spacing-sm)', 
            borderRadius: 'var(--sx-radius-md)' 
        }}
    >
        <option value="">(All)</option>
        {options.map((opt: any) => (
            <option key={opt} value={opt}>{opt}</option>
        ))}
    </SarakSelect>
);

export default FilterSelect;

