// frontend/src/components/SearchBox.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../lib/api";

function normalize(s) {
  return (s || "").toString().toLowerCase().trim();
}

function districtIdFromProps(props = {}, fallback) {
  return (
    props.id ||
    props.district_id ||
    props.DISTRICT_ID ||
    props.LEAID ||
    props.GEOID ||
    fallback
  );
}

function campusIdFromProps(props = {}, fallback) {
  return (
    props.id ||
    props.campus_id ||
    props.CAMPUS_ID ||
    props.CAMPNO ||
    props.campusid ||
    fallback
  );
}

/**
 * SearchBox
 * - Loads a lightweight districts props geojson + campus points once
 * - Client-side substring search (fast enough and SSR/cache-friendly)
 * - Emits navigation to /district/:id or /campus/:id on selection
 */
export default function SearchBox({ placeholder = "Search district or campus…" }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [data, setData] = useState({ districts: [], campuses: [] });
  const boxRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [d, c] = await Promise.all([
          api.geoDistrictProps(), // {features:[{properties:{name,...}}]}
          api.campusPoints(),      // {features:[{properties:{campus_name, district_name,...}}]}
        ]);
        if (cancelled) return;

        const districts = (d?.features || []).map((f, i) => {
          const p = f.properties || {};
          return {
            type: "district",
            id: districtIdFromProps(p, f.id || i),
            name: p.name || p.dist_name || p.DNAME || p.DistrictName || "Unknown district",
            extra: p.county || p.COUNTY || p.region || p.REGION || "",
            source: f,
          };
        });

        const campuses = (c?.features || []).map((f, i) => {
          const p = f.properties || {};
          return {
            type: "campus",
            id: campusIdFromProps(p, f.id || i),
            name: p.campus_name || p.CNAME || p.SCHOOLNAME || "Unknown campus",
            extra:
              p.district_name ||
              p.dist_name ||
              p.DNAME ||
              p.DistrictName ||
              "—",
            districtId: districtIdFromProps(p, p.DISTRICT_ID),
            source: f,
          };
        });

        setData({ districts, campuses });
      } catch (e) {
        // Fails quietly; the component will just not show results.
        console.error("SearchBox data load failed", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const n = normalize(q);
    if (!n) return [];
    // very small, fast filter (first 7 districts then 7 campuses)
    const d = data.districts
      .filter(r => normalize(r.name).includes(n) || normalize(r.extra).includes(n))
      .slice(0, 7);

    const c = data.campuses
      .filter(r => normalize(r.name).includes(n) || normalize(r.extra).includes(n))
      .slice(0, 7);

    return [...d, ...c];
  }, [q, data]);

  function select(item) {
    setOpen(false);
    setQ("");
    if (!item) return;
    if (item.type === "district") {
      nav(`/district/${encodeURIComponent(item.id)}`);
    } else {
      // Prefer campus page; if that route isn’t live yet, fall back to district
      if (item.id != null) nav(`/campus/${encodeURIComponent(item.id)}`);
      else if (item.districtId != null) nav(`/district/${encodeURIComponent(item.districtId)}`);
    }
  }

  function onKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(results[cursor]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function onDoc(e) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="lsl-search" ref={boxRef}>
      <input
        className="lsl-search-input"
        type="search"
        autoComplete="off"
        placeholder={placeholder}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setCursor(0);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => q && setOpen(true)}
        aria-label="Search for a district or campus"
      />
      {open && results.length > 0 && (
        <div className="lsl-search-panel" role="listbox">
          {results.map((r, i) => (
            <button
              key={`${r.type}:${r.id}:${i}`}
              role="option"
              aria-selected={i === cursor}
              className={`lsl-search-item ${i === cursor ? "is-active" : ""}`}
              onMouseEnter={() => setCursor(i)}
              onClick={() => select(r)}
            >
              <span className={`lsl-type-badge ${r.type}`}>{r.type === "district" ? "District" : "Campus"}</span>
              <span className="lsl-item-main">{r.name}</span>
              {r.extra ? <span className="lsl-item-extra"> · {r.extra}</span> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
