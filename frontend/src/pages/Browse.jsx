// frontend/src/pages/Browse.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listDistricts, listSchools } from "../lib/api";

function usePager(fetcher) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const limit = 25;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcher(limit, page * limit, q)
      .then((res) => {
        if (cancelled) return;
        const data = Array.isArray(res?.items) ? res.items : res;
        setRows(data || []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetcher, page, q]);

  return { q, setQ, page, setPage, rows, loading };
}

function Pager({ page, setPage }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
        Prev
      </button>
      <span>Page {page + 1}</span>
      <button onClick={() => setPage(page + 1)}>Next</button>
    </div>
  );
}

export default function Browse() {
  const d = usePager(listDistricts);
  const s = usePager(listSchools);

  return (
    <main className="container" style={{ paddingBottom: 24 }}>
      <h1>Browse</h1>

      <section style={{ marginTop: 12 }}>
        <h2>Districts</h2>
        <input
          placeholder="Search districts"
          value={d.q}
          onChange={(e) => d.setQ(e.target.value)}
          style={{ padding: 8, width: "100%", maxWidth: 420 }}
        />
        {d.loading ? (
          <p>Loading…</p>
        ) : (
          <ul style={{ marginTop: 12 }}>
            {d.rows.map((row) => (
              <li key={row.DISTRICT_N} style={{ marginBottom: 8 }}>
                <Link to={`/district/${encodeURIComponent(row.DISTRICT_N)}`}>
                  {row.name ?? `District ${row.DISTRICT_N}`}
                </Link>
              </li>
            ))}
            {d.rows.length === 0 && <li>No results</li>}
          </ul>
        )}
        <Pager page={d.page} setPage={d.setPage} />
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Campuses</h2>
        <input
          placeholder="Search campuses"
          value={s.q}
          onChange={(e) => s.setQ(e.target.value)}
          style={{ padding: 8, width: "100%", maxWidth: 420 }}
        />
        {s.loading ? (
          <p>Loading…</p>
        ) : (
          <ul style={{ marginTop: 12 }}>
            {s.rows.map((row) => (
              <li key={row.id} style={{ marginBottom: 8 }}>
                <Link to={`/campus/${encodeURIComponent(row.id)}`}>
                  {row.name ?? `Campus ${row.id}`}
                </Link>
              </li>
            ))}
            {s.rows.length === 0 && <li>No results</li>}
          </ul>
        )}
        <Pager page={s.page} setPage={s.setPage} />
      </section>
    </main>
  );
}
