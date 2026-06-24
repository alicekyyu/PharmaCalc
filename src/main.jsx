import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Defensively unregister any previously-installed service worker. The old SW
// cached index.html cache-first and broke every deploy with a blank screen; the
// /sw.js shipped now self-destructs, but this also cleans up clients that reach
// fresh JS by another route.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations?.().then((regs) => {
    regs.forEach((reg) => reg.unregister());
  });
}
