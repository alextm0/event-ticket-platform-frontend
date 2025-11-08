import React from 'react'

interface SelectSortingCriteriasProps {
  value: string;
  onChange: (value: string) => void;
}

function SelectSortingCriterias({ value, onChange }: SelectSortingCriteriasProps) {
  const criteria = [
    { value: 'created_at_desc', label: 'Creation Date (Newest First)' },
    { value: 'created_at_asc', label: 'Creation Date (Oldest First)' },
    { value: 'status_asc', label: 'Status (A-Z)' },
    { value: 'status_desc', label: 'Status (Z-A)' },
  ];

  return (
    <div>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-200 hover:border-slate-500"
      >
        {criteria.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectSortingCriterias
