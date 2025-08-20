import { registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import microfrontendLayout from "./microfrontend-layout.html";

const routes = constructRoutes(microfrontendLayout);

function loadAppWithErrorBoundary(name) {
  return import(/* webpackIgnore: true */ name)
    .catch((err) => {
      console.error(`Failed to load app ${name}:`, err);
      return {
        bootstrap: () => Promise.resolve(),
        mount: () => {
          const container = document.createElement("div");
          container.style.color = "red";
          container.style.padding = "2rem";
          container.innerHTML = `<h2>⚠️ ${name} is offline or failed to load.</h2>`;
          document.body.appendChild(container);
          return Promise.resolve();
        },
        unmount: () => Promise.resolve(),
      };
    });
}

const applications = constructApplications({
  routes,
  loadApp({ name }) {
    return loadAppWithErrorBoundary(name); // ✅ Correct type
  },
});

const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach(registerApplication);
layoutEngine.activate();
start();
