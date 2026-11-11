import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// Página local do editor (fatia 1): só liga o React na <div id="raiz">.
const elemento = document.getElementById("raiz");
if (!elemento) throw new Error('Não achei a <div id="raiz"> no editor/index.html');

createRoot(elemento).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
