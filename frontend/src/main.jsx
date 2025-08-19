// frontend/src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css"; // ensure this file exists (we define it below)

createRoot(document.getElementById("root")).render(<App />);
