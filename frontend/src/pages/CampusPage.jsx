// frontend/src/pages/CampusPage.jsx
import React, {useEffect,useState} from "react";
import { useParams } from "react-router-dom";
import api from "../api";
export default function CampusPage(){
  const { campus_9 } = useParams();
  const [data, setData] = useState(null);
  useEffect(()=>{ api.campus(campus_9).then(setData).catch(()=>setData(null)); },[campus_9]);
  return (
    <div>
      <h1>Campus {campus_9}</h1>
      {!data ? <p>Loading…</p> : <pre style={{background:"#f7f7f7",padding:12}}>{JSON.stringify(data,null,2)}</pre>}
    </div>
  );
}
