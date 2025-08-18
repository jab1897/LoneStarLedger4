
import React, { useEffect, useMemo, useState } from "react";
import MapView from "../components/MapView";

const apiBase = (import.meta?.env?.VITE_API) || ""; // leave empty to use absolute URLs if you set them

function Card({ title, value, subtitle }) {
  return (
    <div style={{
      background:"#ffffff",
      borderRadius:16,
      padding:"18px 20px",
      boxShadow:"0 4px 18px rgba(0,0,0,.08)",
      minHeight:82
    }}>
      <div style={{fontSize:14, opacity:.8}}>{title}</div>
      <div style={{fontSize:30, fontWeight:800, marginTop:4}}>{value}</div>
      {subtitle ? <div style={{fontSize:12, opacity:.65, marginTop:6}}>{subtitle}</div> : null}
    </div>
  );
}

export default function Home() {
  const [districts, setDistricts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({ totalSpend: 0, enrollment: 0, perPupil: 0, debt: 0 });

  // Load statewide districts GeoJSON (fallbacks baked in)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Prefer processed props-only file if your API serves it
        const urls = [
          `${apiBase}/geojson/districts.props.geojson`,
          `${apiBase}/geojson/districts`,                      // alternate endpoint
          "/data/processed/geo/districts.props.geojson"        // static fallback if hosted
        ];
        let found = null;
        for (const u of urls) {
          if (!u || u.startsWith("undefined")) continue;
          try {
            const r = await fetch(u);
            if (r.ok) { found = await r.json(); break; }
          } catch {}
        }
        if (!cancelled && found) setDistricts(found);
      } catch {}
      finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Try to load statewide summary (guard if endpoint not present)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const urls = [
        `${apiBase}/stats/state`,
        `${apiBase}/summary/state`
      ];
      for (const u of urls) {
        if (!u || u.startsWith("undefined")) continue;
        try {
          const r = await fetch(u);
          if (r.ok) {
            const j = await r.json();
            if (!cancelled) {
              setState({
                totalSpend: j?.total_spend || j?.totalSpend || 0,
                enrollment: j?.enrollment || 0,
                perPupil: j?.per_pupil || j?.perPupil || 0,
                debt: j?.debt_total || j?.debt || 0
              });
              return;
            }
          }
        } catch {}
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const districtsCount = useMemo(() => {
    try { return districts?.features?.length || 0; } catch { return 0; }
  }, [districts]);

  return (
    <main id="top" style={{background:"#f5f7fb", minHeight:"100vh"}}>
      {/* Banner + blurb */}
      <section style={{
        background: "linear-gradient(180deg, #0a2a47 0%, #113a63 100%)",
        color: "white",
        padding: "28px 16px 22px"
      }}>
        <div style={{maxWidth:1180, margin:"0 auto"}}>
          <div style={{fontSize:26, fontWeight:800, letterSpacing:.25, marginBottom:8}}>
            K-12 finance & accountability
          </div>
          <p style={{maxWidth:860, opacity:.9, lineHeight:1.5, margin:0}}>
            Transparent, statewide look at district spending, student performance, and staffing.
            Search by district or campus, click the map, or explore the tabs.
          </p>
        </div>
      </section>

      {/* Map section */}
      <section id="map" style={{padding:"18px 16px 0"}}>
        <div style={{maxWidth:1180, margin:"0 auto"}}>
          <div style={{margin:"8px 0 10px", fontWeight:700, opacity:.85}}>Texas District Map</div>
          <div style={{borderRadius:16, overflow:"hidden", boxShadow:"0 6px 24px rgba(0,0,0,.10)"}}>
            {loading && !districts ? (
              <div style={{
                height:420, display:"flex", alignItems:"center",
                justifyContent:"center", background:"#ffffff"
              }}>
                Loading map…
              </div>
            ) : (
              <MapView data={districts} styleHeight="460px" />
            )}
          </div>
        </div>
      </section>

      {/* Statewide cards */}
      <section id="stats" style={{padding:"20px 16px 36px"}}>
        <div style={{maxWidth:1180, margin:"0 auto"}}>
          <div style={{
            margin:"16px 0 12px",
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",
            gap:16
          }}>
            <Card title="Districts" value={districtsCount.toLocaleString()} />
            <Card title="Enrollment" value={(state.enrollment || 0).toLocaleString()} />
            <Card title="Total Spend" value={`$${(state.totalSpend||0).toLocaleString()}`} />
            <Card title="Avg Per-Pupil" value={`$${(state.perPupil||0).toLocaleString()}`} />
            <Card title="Debt Total" value={`$${(state.debt||0).toLocaleString()}`} />
          </div>
        </div>
      </section>

      {/* Footer / contact anchor */}
      <section id="contact" style={{padding:"24px 16px 40px", background:"#ffffff"}}>
        <div style={{maxWidth:1180, margin:"0 auto"}}>
          <div style={{fontWeight:700, marginBottom:8}}>Contact</div>
          <div style={{opacity:.75}}>
            Questions or feedback? Reach out and tell us what would make this more useful.
          </div>
        </div>
      </section>
    </main>
  );
}
