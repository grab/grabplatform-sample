/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
const axios = require("axios").default;
const { createClient: createRedisClient } = require("redis");
const { promisify } = require("util");

exports.createHTTPClient = function() {
  const baseURL =
    process.env.NODE_ENV === "production"
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

exports.createDBClient = async function() {
  const redis = await createRedisClient({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "", undefined),
    url: process.env.REDIS_URL
  });

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
    },
    grabpay: {
      LAST_TRANSACTION_REQUEST: "grabpay.last_transaction_request",
      LAST_TRANSACTION_ID: "grabpay.last_transaction_id"
    }
  };

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
      setAccessToken: accessToken => set(keys.grabid.ACCESS_TOKEN, accessToken),
      setIDToken: idToken => set(keys.grabid.ID_TOKEN, idToken),
      getAccessToken: () => get(keys.grabid.ACCESS_TOKEN)
    }
  };
};
