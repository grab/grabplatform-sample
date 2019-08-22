import GrabID from "@grab-id/grab-id-client";
import { parse, stringify } from "querystring";

function requireTruthy(key, object) {
  if (!object) {
    throw new Error(`Value ${key} is not truthy`);
  }

  return object;
}

export function copyToClipboard(text) {
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

export function createGrabIDClient(arg0, arg1) {
  const windowObject = !!arg0.fetch ? arg0 : window;

  const {
    additionalACRValues: { consentContext, ...restACR },
    clientID,
    countryCode,
    redirectURI,
    request,
    scopes
  } = !!arg0.fetch ? arg1 : arg0;

  const openIDURL =
    environment() === "production"
      ? GrabID.GrabPartnerUrls.PRODUCTION
      : GrabID.GrabPartnerUrls.STAGING;

  let appConfig = {
    acrValues: {
      additionalValues: restACR,
      consentContext: { ...consentContext, countryCode }
    },
    clientId: clientID,
    redirectUri: getAbsoluteURLPath(windowObject, redirectURI),
    request,
    scope: ["openid", ...scopes].join(" ")
  };

  return new GrabID(openIDURL, appConfig);
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

export function getNavigationQuery() {
  const { search } = window.location;
  return parse(search.substr(1));
}

export async function makeHTTPRequest(arg0, arg1) {
  const fetch = arg0.fetch || window.fetch;

  const { additionalHeaders = {}, body, method, path } = !!arg0.fetch
    ? arg1
    : arg0;

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

export function overrideNavigationQuery(queryFn) {
  const { origin, pathname, search } = window.location;
  const currentURL = `${origin}${pathname}`;
  const oldQuery = parse(search.substr(1));

  const newQuery =
    queryFn instanceof Function
      ? { ...oldQuery, ...queryFn(oldQuery) }
      : { ...oldQuery, ...queryFn };

  const newSearch = `?${stringify(newQuery)}`;
  window.history.replaceState(null, null, `${currentURL}${newSearch}`);
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
