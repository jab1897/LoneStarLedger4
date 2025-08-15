import React from 'react'
import AsyncSelect from 'react-select/async'
import { api } from '../api'

const styles = {
  control: (base)=>({ ...base, minWidth: 280, borderRadius: 10, borderColor:'#d7ddea' }),
  option: (base)=>({ ...base, fontSize: 13 }),
}

export default function SearchBar({ onPick }) {
  async function loadOptions(inputValue) {
    if (!inputValue || inputValue.length < 2) return []
    const [d, s] = await Promise.all([
      api.searchDistricts(inputValue, 7),
      api.searchSchools(inputValue, 7),
    ])
    const dOpts = d.items.map(x=>({ label: `District: ${x.district_name}`, value: x.district_6, kind:'district', raw:x }))
    const sOpts = s.items.map(x=>({ label: `School: ${x.campus_name}`, value: x.campus_9, kind:'school', raw:x }))
    return [...dOpts, ...sOpts]
  }

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions={false}
      placeholder="Search district or school..."
      loadOptions={loadOptions}
      styles={styles}
      onChange={(opt)=> opt && onPick({ type: opt.kind, data: opt.raw })}
      aria-label="search"
    />
  )
}
