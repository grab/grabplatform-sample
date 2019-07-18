/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
const axios = require("axios").default;

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
