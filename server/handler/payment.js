/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
const btoa = require("btoa");
const CryptoJS = require("crypto-js");
const { handleError } = require("./util");

function base64URLEncode(str) {
  return str
    .toString(CryptoJS.enc.Base64)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function generatePartnerTransactionID() {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function generateHMACSignature({
  contentType,
  httpMethod,
  partnerHMACSecret,
  requestBody,
  requestURL,
  timestamp
}) {
  const rawRequestBody =
    typeof requestBody === "object" ? JSON.stringify(requestBody) : requestBody;

  const relativeURLPath = getRelativeURLPath(requestURL);

  const hashedRequestBody = CryptoJS.enc.Base64.stringify(
    CryptoJS.SHA256(rawRequestBody)
  );

  const requestData = [
    [
      httpMethod,
      contentType,
      timestamp,
      relativeURLPath,
      hashedRequestBody
    ].join("\n"),
    "\n"
  ].join("");

  const hmacDigest = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(requestData, partnerHMACSecret)
  );

  return hmacDigest;
}

async function generateHMACForXGIDAUXPOP({
  authorization,
  clientSecret,
  date
}) {
  const accessToken = authorization.match(/bearer (.*)/i)[1];
  const timestamp = getUnixTimestamp(date);
  const message = timestamp + accessToken;

  const signature = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(message, clientSecret)
  );

  const payload = {
    time_since_epoch: timestamp,
    sig: base64URLEncode(signature)
  };

  const payloadBytes = JSON.stringify(payload);
  return base64URLEncode(btoa(payloadBytes));
}

function getRelativeURLPath(url) {
  let pathRegex = /.+?:\/\/.+?(\/.+?)(?:#|\?|$)/;
  let result = url.match(pathRegex);

  if (!result) {
    pathRegex = /\/.*/;
    result = url.match(pathRegex);
    return result && result.length === 1 ? result[0] : "";
  }

  return result && result.length > 1 ? result[1] : "";
}

function getUnixTimestamp(date) {
  return Math.round(date.getTime() / 1000);
}

module.exports = {
  oneTimeCharge: {
    init: function(client) {
      return handleError(
        async (
          {
            body: {
              amount,
              currency,
              description,
              merchantID,
              partnerGroupTxID,
              partnerHMACSecret,
              partnerID
            }
          },
          res
        ) => {
          const partnerTxID = await generatePartnerTransactionID();

          const requestBody = {
            partnerGroupTxID,
            partnerTxID,
            currency,
            amount,
            description,
            merchantID
          };

          const timestamp = new Date().toUTCString();

          const hmacDigest = await generateHMACSignature({
            httpMethod: "POST",
            contentType: "application/json",
            partnerHMACSecret,
            requestBody,
            requestURL: "/grabpay/partner/v2/charge/init",
            timestamp
          });

          const { data, status } = await client.post(
            "/grabpay/partner/v2/charge/init",
            requestBody,
            {
              "Content-Type": "application/json",
              Authorization: `${partnerID}:${hmacDigest}`,
              Date: timestamp
            }
          );

          res.status(status).json(data);
        }
      );
    },
    confirm: function(client) {
      return handleError(
        async (
          { body: { clientSecret, partnerTxID }, headers: { authorization } },
          res
        ) => {
          const date = new Date();

          const hmac = await generateHMACForXGIDAUXPOP({
            authorization,
            clientSecret,
            date
          });

          const { data, status } = await client.post(
            "/grabpay/partner/v2/charge/complete",
            { partnerTxID },
            {
              "X-GID-AUX-POP": hmac,
              Authorization: authorization,
              Date: date.toUTCString()
            }
          );

          res.status(status).json(data);
        }
      );
    }
  },
  recurringCharge: {
    bind: function(client) {
      return handleError(
        async (
          { body: { countryCode, partnerHMACSecret, partnerID } },
          res
        ) => {
          const partnerTxID = await generatePartnerTransactionID();
          const requestBody = { countryCode, partnerTxID };
          const timestamp = new Date().toUTCString();

          const hmacDigest = await generateHMACSignature({
            httpMethod: "POST",
            contentType: "application/json",
            partnerHMACSecret,
            requestBody,
            requestURL: "/grabpay/partner/v2/bind",
            timestamp
          });

          const { data, status } = await client.post(
            "/grabpay/partner/v2/bind",
            requestBody,
            {
              "Content-Type": "application/json",
              Authorization: `${partnerID}:${hmacDigest}`,
              Date: timestamp
            }
          );

          res.status(status).json({ ...data, partnerTxID });
        }
      );
    },
    charge: function(client) {
      return handleError(
        async (
          {
            body: {
              amount,
              clientSecret,
              currency,
              description,
              merchantID,
              partnerGroupTxID,
              partnerTxID
            },
            headers: { authorization }
          },
          res
        ) => {
          const requestBody = {
            partnerGroupTxID,
            partnerTxID,
            currency,
            amount,
            description,
            merchantID
          };

          const date = new Date();

          const hmac = await generateHMACForXGIDAUXPOP({
            authorization,
            clientSecret,
            date
          });

          const { data, status } = await client.post(
            "/grabpay/partner/v2/charge",
            requestBody,
            {
              "Content-Type": "application/json",
              "X-GID-AUX-POP": hmac,
              Authorization: authorization,
              Date: date.toUTCString()
            }
          );

          res.status(status).json(data);
        }
      );
    },
    unbind: function(client) {
      return handleError(
        async (
          { body: { clientSecret, partnerTxID }, headers: { authorization } },
          res
        ) => {
          const date = new Date();

          const hmac = await generateHMACForXGIDAUXPOP({
            authorization,
            clientSecret,
            date
          });

          const { status } = await client.delete(
            "/grabpay/partner/v2/bind",
            { partnerTxID },
            {
              "Content-Type": "application/json",
              "X-GID-AUX-POP": hmac,
              Authorization: authorization,
              Date: date.toUTCString()
            }
          );

          res.status(status).json({});
        }
      );
    }
  },
  checkWallet: function(client) {
    return handleError(
      async (
        { body: { clientSecret, currency }, headers: { authorization } },
        res
      ) => {
        const date = new Date();

        const hmac = await generateHMACForXGIDAUXPOP({
          authorization,
          clientSecret,
          date
        });

        const { data, status } = await client.get(
          `/grabpay/partner/v2/wallet/info?currency=${currency}`,
          {
            Authorization: authorization,
            "X-GID-AUX-POP": hmac,
            Date: date.toUTCString()
          }
        );

        res.status(status).json(data);
      }
    );
  }
};
