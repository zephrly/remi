import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter, Routes, Route, useRoutes } from "react-router-dom";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import routes from "tempo-routes";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Define the component outside of the render function
function AppWithTempoRoutes() {
  // Use the useRoutes hook conditionally inside a component
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <>
      {tempoRoutes}
      <App />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithTempoRoutes />
    </BrowserRouter>
  </React.StrictMode>,
);
