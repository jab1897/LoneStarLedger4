import React from 'react'

function fmtMoney(x){ const n = Number(x||0); return isFinite(n) ? `$${Math.round(n).toLocaleString()}` : '—' }
function fmtNum(x){ const n = Number(x||0); return isFinite(n) ? n.toLocaleString() : '—' }
function fmtPct(x){ const n = Number(x); return isFinite(n) ? `${n}%` : '—' }

export default function StatBlock({ stats }) {
  const items = [
    { label:'Enrollment', value: fmtNum(stats?.enrollment) },
    { label:'Total Spend', value: fmtMoney(stats?.total_spend) },
    { label:'Per-Pupil Spend', value: fmtMoney(stats?.per_pupil_spend) },
    { label:'Debt (Total)', value: fmtMoney(stats?.debt_total) },
    { label:'Avg Teacher Salary', value: fmtMoney(stats?.avg_teacher_salary) },
    { label:'Superintendent Salary', value: fmtMoney(stats?.superintendent_salary) },
    { label:'Reading On-Grade', value: fmtPct(stats?.reading_on_grade) },
    { label:'Math On-Grade', value: fmtPct(stats?.math_on_grade) },
    { label:'Accountability', value: (stats?.accountability_rating || stats?.rating || '—') },
  ]
  return (
    <div className="grid">
      {items.map((it,i)=>(
        <div key={i} className="card" style={{textAlign:'center', padding:'14px'}}>
          <div style={{fontSize:12, color:'#6a7a95'}}>{it.label}</div>
          <div style={{fontSize:18, fontWeight:700, color:'var(--blue)'}}>{it.value}</div>
        </div>
      ))}
    </div>
  )
}
