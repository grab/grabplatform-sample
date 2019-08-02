/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
const {
  generateHMACSignature,
  generateHMACForXGIDAUXPOP,
  handleError
} = require("./util");

async function generatePartnerTransactionID() {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

module.exports = {
  oneTimeCharge: {
    init: (dbClient, httpClient) =>
      handleError(
        async (
          {
            body: { amount, currency, description, partnerGroupTxID },
            session
          },
          res
        ) => {
          const {
            merchantID,
            partnerHMACSecret,
            partnerID
          } = await dbClient.config.getConfiguration();

          const partnerTxID = await generatePartnerTransactionID();
          amount = parseInt(amount, undefined);

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

          const {
            data: { request, partnerTxID: resultTxID },
            status
          } = await httpClient.post(
            "/grabpay/partner/v2/charge/init",
            requestBody,
            {
              "Content-Type": "application/json",
              Authorization: `${partnerID}:${hmacDigest}`,
              Date: timestamp
            }
          );

          session.partnerTxID = partnerTxID;
          session.request = request;
          res.status(status).json({ request, partnerTxID: resultTxID });
        }
      ),
    confirm: (dbClient, httpClient) =>
      handleError(async ({ session: { partnerTxID, puid } }, res) => {
        const accessToken = await dbClient.grabid.getAccessToken(puid);
        const { clientSecret } = await dbClient.config.getConfiguration();
        const date = new Date();

        const hmac = await generateHMACForXGIDAUXPOP({
          accessToken,
          clientSecret,
          date
        });

        const { data, status } = await httpClient.post(
          "/grabpay/partner/v2/charge/complete",
          { partnerTxID },
          {
            "X-GID-AUX-POP": hmac,
            Authorization: `Bearer ${accessToken}`,
            Date: date.toUTCString()
          }
        );

        res.status(status).json(data);
      })
  },
  recurringCharge: {
    bind: (dbClient, httpClient) =>
      handleError(async ({ body: { countryCode }, session }, res) => {
        const {
          partnerHMACSecret,
          partnerID
        } = await dbClient.config.getConfiguration();

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

        const {
          data: { request },
          status
        } = await httpClient.post("/grabpay/partner/v2/bind", requestBody, {
          "Content-Type": "application/json",
          Authorization: `${partnerID}:${hmacDigest}`,
          Date: timestamp
        });

        session.partnerTxID = partnerTxID;
        session.request = request;
        res.status(status).json({ request, partnerTxID });
      }),
    charge: (dbClient, httpClient) =>
      handleError(
        async (
          {
            body: { amount, currency, description, partnerGroupTxID },
            session: { partnerTxID, puid }
          },
          res
        ) => {
          const accessToken = await dbClient.grabid.getAccessToken(puid);

          const {
            clientSecret,
            merchantID
          } = await dbClient.config.getConfiguration();

          amount = parseInt(amount, undefined);

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
            accessToken,
            clientSecret,
            date
          });

          const { data, status } = await httpClient.post(
            "/grabpay/partner/v2/charge",
            requestBody,
            {
              "Content-Type": "application/json",
              "X-GID-AUX-POP": hmac,
              Authorization: `Bearer ${accessToken}`,
              Date: date.toUTCString()
            }
          );

          res.status(status).json(data);
        }
      ),
    unbind: function(dbClient, httpClient) {
      return handleError(async ({ session: { partnerTxID, puid } }, res) => {
        const accessToken = await dbClient.grabid.getAccessToken(puid);
        const { clientSecret } = await dbClient.config.getConfiguration();
        const date = new Date();

        const hmac = await generateHMACForXGIDAUXPOP({
          accessToken,
          clientSecret,
          date
        });

        const { status } = await httpClient.delete(
          "/grabpay/partner/v2/bind",
          { partnerTxID },
          {
            "Content-Type": "application/json",
            "X-GID-AUX-POP": hmac,
            Authorization: `Bearer ${accessToken}`,
            Date: date.toUTCString()
          }
        );

        res.status(status).json({});
      });
    }
  },
  checkWallet: function(dbClient, httpClient) {
    return handleError(
      async ({ body: { currency }, session: { puid } }, res) => {
        const accessToken = await dbClient.grabid.getAccessToken(puid);
        const { clientSecret } = await dbClient.config.getConfiguration();
        const date = new Date();

        const hmac = await generateHMACForXGIDAUXPOP({
          accessToken,
          clientSecret,
          date
        });

        const { data, status } = await httpClient.get(
          `/grabpay/partner/v2/wallet/info?currency=${currency}`,
          {
            Authorization: `Bearer ${accessToken}`,
            "X-GID-AUX-POP": hmac,
            Date: date.toUTCString()
          }
        );

        res.status(status).json(data);
      }
    );
  }
};
