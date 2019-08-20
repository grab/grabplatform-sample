import GrabID from "@grab-id/grab-id-client";

function requireTruthy(key, object) {
  if (!object) {
    throw new Error(`Value ${key} is not truthy`);
  }

  return object;
}

export function environment() {
  return requireTruthy("REACT_APP_NODE_ENV", process.env.REACT_APP_NODE_ENV) ===
    "production"
    ? "production"
    : "development";
}

/** We need to make sure to exclude the root path. */
export function getRelativeURLPath(url) {
  const a = document.createElement("a");
  const rootURLPath = process.env.REACT_APP_ROOT_PATH || "";
  a.href = url;
  return `${a.pathname.substr(rootURLPath.length)}${a.search}`;
}

/** We need to make sure to include the root path. */
export function getAbsoluteURLPath(window, relativeURL) {
  const rootURLPath = process.env.REACT_APP_ROOT_PATH || "";
  return `${window.location.origin}${rootURLPath}${relativeURL}`;
}

export async function makeHTTPRequest(...args) {
  const fetch = args[0].fetch || window.fetch;

  const { additionalHeaders = {}, body, method, path } = !!args[0].fetch
    ? args[1]
    : args[0];

  const baseURL = process.env.REACT_APP_SERVER_URL || "";
  const { accessToken } = GrabID.getResult();

  const config = {
    body: JSON.stringify(body),
    method,
    headers: {
      "content-type": "application/json",
      ...(!!accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      ...additionalHeaders
    },
    mode: "cors"
  };

  const response = await fetch(`${baseURL}${path}`, config);
  if (response.status === 204) return {};
  const json = await response.json();
  if (!`${response.status}`.startsWith("2")) throw json;
  return json;
}

export function requireAllValid(args) {
  if (typeof args === "object" && !!Object.keys(args).length) {
    Object.entries(args).forEach(([key, value]) => {
      if (value === null || value === undefined || !requireAllValid(value)) {
        throw new Error(`Invalid ${key}: ${undefined}`);
      }
    });
  }

  return args;
}
