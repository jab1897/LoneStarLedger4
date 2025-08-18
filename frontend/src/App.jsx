import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shell from "./shell/Shell.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

// Use the pages that already exist in your repo:
import Home from "./pages/Home.jsx";
import DistrictDetail from "./pages/DistrictDetail.jsx";
import CampusDetail from "./pages/CampusDetail.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/district/:districtId" element={<DistrictDetail />} />
            <Route path="/campus/:campusId" element={<CampusDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
