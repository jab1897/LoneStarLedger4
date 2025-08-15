import React, { useMemo } from 'react'
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table'

const columnHelper = createColumnHelper()

export default function SchoolTable({ rows, onSelect }) {
  const columns = useMemo(()=>[
    columnHelper.accessor('campus_name', { header: 'School' }),
    columnHelper.accessor('district_6', { header: 'District ID' }),
    columnHelper.accessor('reading_on_grade', { header: 'Reading %' }),
    columnHelper.accessor('math_on_grade', { header: 'Math %' }),
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
