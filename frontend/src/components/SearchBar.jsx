import React, { useEffect, useMemo, useState } from "react";
import * as api from "../api";

export default function SearchBox() {
  const [items, setItems] = useState([]);   // districts + campuses combined
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const campuses = await api.campusPoints().catch(() => []);
        // If you have a district name list, load it here; otherwise just campuses
        const combined = campuses || [];
        if (!cancelled) setItems(combined);
      } catch (e) {
        console.error("SearchBox data load failed", e);
        if (!cancelled) setErr("Search data is temporarily unavailable.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return items.filter(it => (it.name || it.CAMPUS || it.DISTNAME || "")
      .toLowerCase().includes(s)).slice(0, 20);
  }, [q, items]);

  return (
    <div style={{ maxWidth: 520 }}>
      <input
        type="search"
        placeholder="Search district or campus"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="input"
      />
      {err && <div className="text-muted" style={{ marginTop: 6 }}>{err}</div>}
      {q && !filtered.length && !err && (
        <div className="text-muted" style={{ marginTop: 6 }}>No matches.</div>
      )}
      {/* render suggestions dropdown here if you like */}
    </div>
  );
}
