/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import GrabID from "@grab-id/grab-id-client";

function createGrabIDClient(
  window,
  {
    additionalACRValues: { consentContext, ...restACR },
    clientID,
    countryCode,
    redirectURI,
    request,
    scopes
  }
) {
  const openIdUrl =
    process.env.REACT_APP_NODE_ENV === "production"
      ? GrabID.GrabPartnerUrls.PRODUCTION
      : GrabID.GrabPartnerUrls.STAGING;

  let appConfig = {
    acrValues: {
      additionalValues: restACR,
      consentContext: { ...consentContext, countryCode }
    },
    clientId: clientID,
    redirectUri: getAbsoluteURLPath(window, redirectURI),
    request,
    scope: ["openid", ...scopes].join(" ")
  };

  return new GrabID(openIdUrl, appConfig);
}

function getRelativeURLPath(url) {
  const a = document.createElement("a");
  a.href = url;
  return a.pathname;
}

function getAbsoluteURLPath(window, relativeURL) {
  return `${window.location.origin}${relativeURL}`;
}

async function makeRequest(
  window,
  { additionalHeaders = {}, body, method, relativePath = "" }
) {
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

  const response = await window.fetch(
    `${window.location.pathname}${relativePath}`,
    config
  );

  return response.status === 204 ? {} : response.json();
}

export function createGrabIDRepository(window) {
  return {
    grabid: {
      getLoginReturnURI: () => getRelativeURLPath(GrabID.getLoginReturnURI()),
      handleAuthorizationCodeFlowResponse: async () => {
        GrabID.handleAuthorizationCodeFlowResponse();
      },
      nonPOP: (() => {
        const extraConfig = {
          additionalACRValues: { service: "PASSENGER" },
          redirectURI: "/grabid/redirect"
        };

        return {
          authorize: async ({ clientID, countryCode, scopes }) => {
            const client = createGrabIDClient(window, {
              clientID,
              countryCode,
              scopes,
              ...extraConfig
            });

            const result = await client.makeAuthorizationRequest();
            const { codeVerifier } = GrabID.getResult();
            return { ...result, codeVerifier };
          },
          requestToken: async ({ clientID, countryCode, scopes }) => {
            const client = createGrabIDClient(window, {
              clientID,
              countryCode,
              scopes,
              ...extraConfig
            });

            await client.makeTokenRequest();
            return GrabID.getResult();
          }
        };
      })(),
      payment: (() => {
        const redirectURI = "/grabpay/redirect";

        function extraGrabIDConfig(currency) {
          return {
            additionalACRValues: { consentContext: { currency } },
            redirectURI
          };
        }

        return {
          authorize: async ({
            clientID,
            countryCode,
            currency,
            request,
            scopes
          }) => {
            const client = createGrabIDClient(window, {
              clientID,
              countryCode,
              request,
              scopes,
              ...extraGrabIDConfig(currency)
            });

            const result = await client.makeAuthorizationRequest();
            const { codeVerifier } = GrabID.getResult();
            return { ...result, codeVerifier };
          },
          requestToken: async ({
            code,
            codeVerifier,
            clientID,
            clientSecret
          }) =>
            makeRequest(window, {
              body: {
                code,
                codeVerifier,
                clientID,
                clientSecret,
                redirectURI: getAbsoluteURLPath(window, redirectURI)
              },
              method: "POST",
              relativePath: "/token"
            })
        };
      })()
    }
  };
}

export function createGrabPayRepository(window) {
  return {
    grabpay: {
      checkWallet: async ({ accessToken, ...body }) =>
        makeRequest(window, {
          additionalHeaders: { Authorization: `Bearer ${accessToken}` },
          body,
          method: "POST",
          relativePath: "/wallet"
        }),
      oneTimeCharge: {
        init: async ({
          amount,
          currency,
          description,
          merchantID,
          partnerHMACSecret,
          partnerGroupTxID,
          partnerID
        }) =>
          makeRequest(window, {
            body: {
              amount,
              currency,
              description,
              merchantID,
              partnerHMACSecret,
              partnerGroupTxID,
              partnerID
            },
            method: "POST",
            relativePath: "/init"
          }),
        confirm: async ({ accessToken, ...body }) =>
          makeRequest(window, {
            additionalHeaders: { Authorization: `Bearer ${accessToken}` },
            body,
            method: "POST",
            relativePath: "/confirm"
          })
      },
      recurringCharge: {
        bind: async ({ countryCode, partnerHMACSecret, partnerID }) =>
          makeRequest(window, {
            body: { countryCode, partnerHMACSecret, partnerID },
            method: "POST",
            relativePath: "/bind"
          }),
        charge: async ({
          accessToken,
          amount,
          clientSecret,
          currency,
          description,
          merchantID,
          partnerGroupTxID,
          partnerTxID
        }) =>
          makeRequest(window, {
            additionalHeaders: { Authorization: `Bearer ${accessToken}` },
            body: {
              amount,
              clientSecret,
              currency,
              description,
              merchantID,
              partnerGroupTxID,
              partnerTxID
            },
            method: "POST",
            relativePath: "/charge"
          }),
        unbind: async ({ accessToken, clientSecret, partnerTxID }) =>
          makeRequest(window, {
            additionalHeaders: { Authorization: `Bearer ${accessToken}` },
            body: { clientSecret, partnerTxID },
            method: "POST",
            relativePath: "/unbind"
          })
      }
    }
  };
}

export function createGrabAPIRepository(window) {
  return {
    identity: {
      getBasicProfile: () => makeRequest(window, { method: "GET" })
    },
    loyalty: {
      getRewardsTier: () => makeRequest(window, { method: "GET" })
    }
  };
}
