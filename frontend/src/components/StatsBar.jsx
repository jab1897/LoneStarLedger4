// frontend/src/components/StatsBar.jsx
export default function StatsBar({ items = [] }) {
  return (
    <section className="stats">
      {items.map((it) => (
        <div key={it.label} className="stat">
          <div className="stat-value">{it.value}</div>
          <div className="stat-label">{it.label}</div>
        </div>
      ))}
      <style>{`
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px; }
        .stat { padding: 12px; border: 1px solid #e5e7eb; border-radius: 12px; background: white; }
        .stat-value { font-size: 1.5rem; font-weight: 700; }
        .stat-label { color: #6b7280; }
        @media (max-width: 720px) { .stats { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
