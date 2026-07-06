import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

/* Animación global para la pantalla de confirmación */
const style = document.createElement("style");
style.textContent = `
  @keyframes aparecer {
    from { transform: scale(0.92); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }
  /* Focus visible solo con teclado (accesibilidad) */
  :focus-visible { outline: 2px solid var(--naranja); outline-offset: 2px; }
  :focus:not(:focus-visible) { outline: none; }
`;
document.head.appendChild(style);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
