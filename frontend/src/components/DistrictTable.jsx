import React, { useMemo } from 'react'
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table'

const columnHelper = createColumnHelper()

export default function DistrictTable({ rows, onSelect }) {
  const columns = useMemo(()=>[
    columnHelper.accessor('district_name', { header: 'District' }),
    columnHelper.accessor('enrollment', { header: 'Enroll.', cell: info => Number(info.getValue()||0).toLocaleString() }),
    columnHelper.accessor('total_spend', { header: 'Total Spend', cell: info => `$${Number(info.getValue()||0).toLocaleString()}` }),
    columnHelper.accessor('per_pupil_spend', { header: 'Per-Pupil', cell: info => `$${Number(info.getValue()||0).toLocaleString()}` }),
  ], [])

  const table = useReactTable({ data: rows||[], columns, getCoreRowModel: getCoreRowModel() })

  return (
    <table className="table">
      <thead>
        {table.getHeaderGroups().map(hg=>(
          <tr key={hg.id}>
            {hg.headers.map(h=>(
              <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map(r=>(
          <tr key={r.id} onClick={()=>onSelect?.(r.original)} style={{cursor:'pointer'}}>
            {r.getVisibleCells().map(c=>(
              <td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
