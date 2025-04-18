import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { loadApiKey } from "../utils/ApiKeyManager";
import { OfficeProvider } from "../context/OfficeContext";
import { SelectionProvider } from "./contexts/SelectionContext";

/* global document, Office, module, require */

const title = "AI Assist Add-in";

const rootElement = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;

/* Application rendering is now handled by the Provider */
console.log("index.jsx: Rendering OfficeProvider...");

/* No more Office.onReady here, the Provider handles it */
const initialApiKey = loadApiKey();

root?.render(
  <FluentProvider theme={webLightTheme}>
    <OfficeProvider>
      <SelectionProvider>
        <App title={title} initialApiKey={initialApiKey} />
      </SelectionProvider>
    </OfficeProvider>
  </FluentProvider>
);

if (module.hot) {
  module.hot.accept("./components/App", () => {
    console.log("index.jsx: HMR detected for App component.");
    const NextApp = require("./components/App").default;
    const nextInitialApiKey = loadApiKey();
    root?.render(
      <FluentProvider theme={webLightTheme}>
        <OfficeProvider>
          <SelectionProvider>
            <NextApp title={title} initialApiKey={nextInitialApiKey} />
          </SelectionProvider>
        </OfficeProvider>
      </FluentProvider>
    );
  });
}
