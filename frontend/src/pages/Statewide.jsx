// frontend/src/pages/Statewide.jsx
import React, {useEffect,useState} from "react";
import api from "../api";
export default function Statewide(){
  const [stats, setStats] = useState(null);
  useEffect(()=>{ api.stateStats().then(setStats).catch(()=>setStats(null)); },[]);
  return (
    <div>
      <h1>Statewide statistics</h1>
      {!stats ? <p>Loading…</p> : (
        <pre style={{background:"#f7f7f7",padding:12,overflow:"auto"}}>{JSON.stringify(stats,null,2)}</pre>
      )}
    </div>
  );
}
