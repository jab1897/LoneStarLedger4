// frontend/src/components/SearchBox.jsx
import React from "react";
import AsyncSelect from "react-select/async";
import { useNavigate } from "react-router-dom";
import * as api from "../lib/api";

const styles = {
  control: (base) => ({ ...base, minWidth: 320, borderRadius: 10, borderColor: "#d7ddea" }),
  option: (base) => ({ ...base, fontSize: 13 }),
};

export default function SearchBox() {
  const nav = useNavigate();

  async function loadOptions(inputValue) {
    if (!inputValue || inputValue.length < 2) return [];
    const [d, s] = await Promise.all([
      api.listDistricts(7, 0, inputValue),
      api.listSchools(7, 0, inputValue),
    ]);

    const dOpts = (d.items || []).map((x) => ({
      label: `District: ${x.district_name || x.name || x.district_6}`,
      value: x.district_6 || x.id,
      kind: "district",
    }));

    const sOpts = (s.items || []).map((x) => ({
      label: `Campus: ${x.campus_name || x.name || x.campus_9}`,
      value: x.campus_9 || x.id,
      kind: "campus",
    }));

    return [...dOpts, ...sOpts];
  }

  function onPick(opt) {
    if (!opt) return;
    if (opt.kind === "district") {
      nav(`/district/${encodeURIComponent(opt.value)}`);
    } else {
      nav(`/campus/${encodeURIComponent(opt.value)}`);
    }
  }

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions={false}
      placeholder="Search by district or campus…"
      loadOptions={loadOptions}
      styles={styles}
      onChange={onPick}
      aria-label="search"
    />
  );
}
