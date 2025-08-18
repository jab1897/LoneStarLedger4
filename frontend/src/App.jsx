import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shell from "./shell/Shell.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import Home from "./pages/Home.jsx";
import District from "./pages/District.jsx";
import Campus from "./pages/Campus.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/district/:districtId" element={<District />} />
            <Route path="/campus/:campusId" element={<Campus />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Shell>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
