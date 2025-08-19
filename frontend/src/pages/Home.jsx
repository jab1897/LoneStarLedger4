import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../lib/api";

export default function SearchBox(){
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try{
        const ix = await api.searchIndex();
        if (!cancelled) setItems(ix);
      }catch(e){
        console.error("Search index error:", e);
        if (!cancelled) setErr("Search not available right now.");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items.slice(0, 8);
    return items.filter(x => (x.name||"").toLowerCase().includes(s)).slice(0, 12);
  }, [q, items]);

  function go(item){
    if (!item) return;
    if (item.type === "district"){
      nav(`/district/${encodeURIComponent(item.id)}`);
    } else if (item.type === "campus"){
      const d = item.districtId ?? "unknown";
      nav(`/district/${encodeURIComponent(d)}/campus/${encodeURIComponent(item.id)}`);
    }
    setQ("");
  }

  return (
    <div className="search-wrap">
      <input
        placeholder="Search district or campus…"
        value={q}
        onChange={e=>setQ(e.target.value)}
        list="search-datalist"
      />
      <datalist id="search-datalist">
        {filtered.map((x,i)=>(
          <option key={i} value={x.name} />
        ))}
      </datalist>
      {/* click-to-go dropdown (simple) */}
      {q && filtered.length > 0 && (
        <div className="card" style={{position:"absolute",zIndex:500,width:520,maxWidth:"calc(100% - 40px)"}}>
          {filtered.map((x,i)=>(
            <div key={i} style={{padding:"6px 8px",cursor:"pointer"}} onClick={()=>go(x)}>
              <span style={{color:"#111"}}>{x.name}</span>
              <span style={{color:"#6b7280",marginLeft:8}}>· {x.type}</span>
            </div>
          ))}
        </div>
      )}
      {err && <div className="alert error" style={{marginTop:8}}>{err}</div>}
    </div>
  );
}
