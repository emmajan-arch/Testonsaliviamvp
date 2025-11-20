
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { IASandboxAnalysis } from "./pages/IASandboxAnalysis";

// La sandbox IA n'est accessible que via l'URL /ia-sandbox
const isSandboxRoute =
  typeof window !== "undefined" &&
  window.location.pathname.startsWith("/ia-sandbox");

createRoot(document.getElementById("root")!).render(
  isSandboxRoute ? <IASandboxAnalysis /> : <App />
);
