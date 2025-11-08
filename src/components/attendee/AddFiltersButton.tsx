import React from 'react'
interface FiltersButtonProps {
  value: string[];
  onChange: (value: string[]) => void;
}

function AddFiltersButton({value, onChange}: FiltersButtonProps) {
  return (
    <div>
        <button className="rounded bg-slate-700 px-3 py-1 text-sm font-medium text-slate-200 hover:bg-slate-600">Add Filters</button>
    </div>
  )
}

export default AddFiltersButton
