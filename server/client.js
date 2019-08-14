/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
require("colors");
const axios = require("axios").default;
const { createClient: createRedisClient } = require("redis");
const { promisify } = require("util");

axios.interceptors.request.use(request => {
  const {
    data,
    headers: {
      Authorization,
      "Content-Type": contentType,
      Date: date,
      "X-GID-AUX-POP": xgidAuthPOP
    },
    method,
    url
  } = request;

  console.log("Starting Request".bgBlue, method.toUpperCase(), url);
  console.log("Request Headers:");
  console.log("\tContent-Type: ", contentType);
  console.log("\tDate: ", date);
  console.log("\tAuthorization: ", Authorization);
  console.log("\tX-GID-AUX-POP: ", xgidAuthPOP);
  console.log("Request Data:\n", data);
  console.log("--");
  return request;
});

axios.interceptors.response.use(
  response => {
    const { data, headers, status, statusText } = response;
    console.log("Response: ".bgGreen, status, statusText);
    console.log("Response Headers:\n", headers);
    console.log("Response Data:\n", data);
    console.log("--");
    return response;
  },
  error => {
    if (!!error.response) {
      const {
        response: { data, headers, status, statusText }
      } = error;

      console.log("Response: ".bgRed, status, statusText);
      console.log("Response Headers:\n", headers);
      console.log("Response Data:\n", data);
      console.log("--");
    } else console.error(error);

    throw error;
  }
);

exports.createHTTPClient = function({ env = "development" }) {
  const baseURL =
    env === "production"
      ? "https://partner-api.grab.com"
      : "https://partner-api.stg-myteksi.com";

  const baseHeaders = { "Content-Type": "application/json" };

  return {
    get: (url, headers) =>
      axios.get(url, { baseURL, headers: { ...baseHeaders, ...headers } }),
    post: (url, body, headers) =>
      axios.post(url, body, {
        baseURL,
        headers: { ...baseHeaders, ...headers }
      }),
    delete: (url, data, headers) =>
      axios.delete(url, {
        baseURL,
        data,
        headers: { ...baseHeaders, ...headers }
      })
  };
};

exports.createDBClient = async function(redis) {
  const baseGet = promisify(redis.get).bind(redis);
  const baseSet = promisify(redis.set).bind(redis);
  const get = async k => baseGet(`${process.env.NODE_ENV}-${k}`);
  const set = async (k, v) => baseSet(`${process.env.NODE_ENV}-${k}`, v);

  const keys = {
    configuration: "configuration",
    grabid: {
      ACCESS_TOKEN: "grabid.access_token",
      CODE_VERIFIER: "grabid.code_verified",
      ID_TOKEN: "grabid.id_token"
    }
  };

  function formatPartnerUserIDKey(partnerUserID, key) {
    return `${partnerUserID}-${key}`;
  }

  return {
    config: {
      setConfiguration: config =>
        set(keys.configuration, JSON.stringify(config)),
      getConfiguration: () =>
        get(keys.configuration)
          .then(JSON.parse)
          .catch(() => ({}))
    },
    grabid: {
      setAccessToken: (puid, accessToken) => {
        const key = formatPartnerUserIDKey(puid, keys.grabid.ACCESS_TOKEN);
        return set(key, accessToken);
      },
      setIDToken: (puid, idToken) => {
        const key = formatPartnerUserIDKey(puid, keys.grabid.ID_TOKEN);
        return set(key, idToken);
      },
      getAccessToken: puid => {
        const key = formatPartnerUserIDKey(puid, keys.grabid.ACCESS_TOKEN);
        return get(key);
      }
    }
  };
};
