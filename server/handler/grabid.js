/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
const CryptoJS = require("crypto-js");
const { GrabPartnerUrls } = require("@grab-id/grab-id-client");
const { stringify } = require("querystring");
const {
  base64URLEncode,
  generateRandomString,
  handleError
} = require("./util");

const grabid = {
  /** These requests must be made from backend since it requires clientSecret. */
  requestToken: (dbClient, httpClient) => {
    return handleError(
      async ({ body: { code, codeVerifier, clientID, redirectURI } }, res) => {
        const { clientSecret } = await dbClient.config.getConfiguration();

        const {
          data: { token_endpoint }
        } = await grabid.utils.runServiceDiscovery(httpClient);

        const {
          data: { access_token, id_token },
          status
        } = await httpClient.post(token_endpoint, {
          code,
          code_verifier: codeVerifier,
          client_id: clientID,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          redirect_uri: redirectURI
        });

        await dbClient.grabid.setAccessToken(access_token);
        await dbClient.grabid.setIDToken(id_token);
        res.status(status).json({ message: "Successful" });
      }
    );
  },
  utils: {
    authorize: async (
      dbClient,
      httpClient,
      { clientID: client_id, countryCode, currency, redirectURI, scopes }
    ) => {
      const request = await dbClient.grabpay.getLastTransactionRequest();
      const nonce = await generateRandomString(16);
      const state = await generateRandomString(7);
      const codeVerifier = await generateRandomString(64).then(base64URLEncode);

      const code_challenge = await base64URLEncode(
        CryptoJS.SHA256(codeVerifier)
      );

      const {
        data: { authorization_endpoint }
      } = await grabid.utils.runServiceDiscovery(httpClient);

      const queryParams = stringify(
        [
          {
            acr_values: `consent_ctx:countryCode=${countryCode},currency=${currency}`,
            client_id,
            code_challenge,
            code_challenge_method: "S256",
            nonce,
            redirect_uri: redirectURI,
            request,
            response_type: "code",
            scope: scopes.join(" "),
            state
          }
        ].reduce((acc, item) => ({ ...acc, ...item }), {})
      );

      const authorizeURL = `${authorization_endpoint}?${queryParams}`;
      await dbClient.grabid.setCodeVerifier(codeVerifier);
      return { authorizeURL };
    },
    runServiceDiscovery: async httpClient => {
      const baseURL =
        process.env.NODE_ENV === "production"
          ? GrabPartnerUrls.PRODUCTION
          : GrabPartnerUrls.STAGING;

      const { data, status } = await httpClient.get(
        "/grabid/v1/oauth2/.well-known/openid-configuration",
        { "Content-Type": "application/json" },
        { baseURL }
      );

      return { data, status };
    },
    requestTokenInfo: async (
      httpClient,
      { authorization, "content-type": contentType }
    ) => {
      const baseURL =
        process.env.NODE_ENV === "production"
          ? GrabPartnerUrls.PRODUCTION
          : GrabPartnerUrls.STAGING;

      const { data, status } = await httpClient.get(
        "/grabid/v1/oauth2/access_tokens/token_info",
        { authorization, "Content-Type": contentType },
        { baseURL }
      );

      return { data, status };
    }
  }
};

module.exports = grabid;
