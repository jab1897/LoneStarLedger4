// frontend/src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header";
import ErrorBoundary from "./shell/ErrorBoundary";

const Home = lazy(() => import("./pages/Home"));
const DistrictDetail = lazy(() => import("./pages/DistrictDetail"));
const CampusDetail = lazy(() => import("./pages/CampusDetail"));
const Browse = lazy(() => import("./pages/Browse"));
const NotFound = lazy(() => import("./pages/NotFound"));

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function Fallback() {
  return (
    <div
      className="spinner"
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: 160,
        fontWeight: 600,
        letterSpacing: "0.02em",
      }}
    >
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <ScrollToTop />
      <ErrorBoundary>
        <Suspense fallback={<Fallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/district/:id" element={<DistrictDetail />} />
            <Route path="/campus/:id" element={<CampusDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
