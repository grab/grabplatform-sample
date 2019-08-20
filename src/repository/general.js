import { makeHTTPRequest } from "utils";

export default function createGrabAPIRepository(window) {
  return {
    configuration: {
      getConfigurationFromPersistence: () =>
        makeHTTPRequest(window, { method: "GET", path: "/configuration" }),
      persistConfiguration: config =>
        makeHTTPRequest(window, {
          body: config,
          method: "POST",
          path: "/configuration"
        })
    }
  };
}
