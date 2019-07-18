/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
const { GrabPartnerUrls } = require("@grab-id/grab-id-client");
const { handleError } = require("./util");

module.exports = {
  /** These requests must be made from backend since it requires clientSecret. */
  popToken: function({ grabid: { setAccessToken, setIDToken } }, { post }) {
    return handleError(
      async (
        { body: { code, codeVerifier, clientID, clientSecret, redirectURI } },
        res
      ) => {
        const baseURL =
          process.env.NODE_ENV === "production"
            ? GrabPartnerUrls.PRODUCTION
            : GrabPartnerUrls.STAGING;

        const {
          data: { access_token, id_token },
          status
        } = await post(
          "/grabid/v1/oauth2/token",
          {
            code,
            code_verifier: codeVerifier,
            client_id: clientID,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            redirect_uri: redirectURI
          },
          { baseURL }
        );

        await setAccessToken(access_token);
        await setIDToken(id_token);
        res.status(status).json({ message: "Successful" });
      }
    );
  }
};
