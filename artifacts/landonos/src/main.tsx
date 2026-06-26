import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/?$/, "/");
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${base}sw.js`).catch(() => {
      // Non-fatal — app still works in the browser tab
    });
  });
}
