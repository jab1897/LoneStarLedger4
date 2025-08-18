// frontend/src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import AppRouter from "./router.jsx";
import "./index.css";
createRoot(document.getElementById("root")).render(<AppRouter />);
