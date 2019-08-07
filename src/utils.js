import GrabID from "@grab-id/grab-id-client";

function requireTruthy(object) {
  if (!object) {
    throw new Error(`Value is not truthy`);
  }

  return object;
}

export function environment() {
  return requireTruthy(process.env.REACT_APP_NODE_ENV) === "production" ||
    requireTruthy(process.env.NODE_ENV) === "production"
    ? "production"
    : "development";
}

export function getRelativeURLPath(url) {
  const a = document.createElement("a");
  a.href = url;
  return `${a.pathname}${a.search}`;
}

export function getAbsoluteURLPath(window, relativeURL) {
  return `${window.location.origin}${relativeURL}`;
}

export async function makeRequest(
  window,
  { additionalHeaders = {}, body, method, path }
) {
  const baseURL = requireTruthy(process.env.REACT_APP_SERVER_URL);
  const { accessToken } = GrabID.getResult();

  const config = {
    body: JSON.stringify(body),
    method,
    headers: {
      "Content-Type": "application/json",
      ...(!!accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...additionalHeaders
    },
    mode: "cors"
  };

  const response = await window.fetch(`${baseURL}${path}`, config);
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
