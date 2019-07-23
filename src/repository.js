/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import GrabID from "@grab-id/grab-id-client";

export function createWindowRepository(window) {
  return {
    localStorage: {
      clearEverything: async () => window.localStorage.clear()
    },
    navigation: {
      reloadPage: async () => window.location.reload()
    }
  };
}

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

  if (response.status === 204) return {};
  const json = await response.json();
  if (!`${response.status}`.startsWith("2")) throw json;
  return json;
}

export function createGrabIDRepository(window) {
  const LOCAL_ID_TOKEN_KEY = "your_id_token_key";

  const repository = {
    grabid: {
      getGrabIDResult: async () => GrabID.getResult(),
      getLoginReturnURI: async () =>
        getRelativeURLPath(GrabID.getLoginReturnURI()),
      storeIDTokenLocally: async idToken =>
        window.localStorage.setItem(LOCAL_ID_TOKEN_KEY, idToken),
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

            const idTokenHint = window.localStorage.getItem(LOCAL_ID_TOKEN_KEY);
            await client.makeAuthorizationRequest(undefined, idTokenHint);
          },
          requestToken: async ({ clientID, countryCode, scopes }) => {
            const client = createGrabIDClient(window, {
              clientID,
              countryCode,
              scopes,
              ...extraConfig
            });

            await client.makeTokenRequest();
          }
        };
      })(),
      pop: {
        requestToken: async ({ clientID, clientSecret, redirectURI }) => {
          const code = window.localStorage.getItem("grabid:code");
          const { codeVerifier } = await repository.grabid.getGrabIDResult();

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
          });
        }
      },
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

            await client.makeAuthorizationRequest();
          },
          requestToken: async ({ clientID, clientSecret }) =>
            repository.grabid.pop.requestToken({
              clientID,
              clientSecret,
              redirectURI
            })
        };
      })()
    }
  };

  return repository;
}

export function createGrabPayRepository(window) {
  return {
    grabpay: {
      checkWallet: async ({ clientSecret, currency }) =>
        makeRequest(window, {
          body: { clientSecret, currency },
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
        confirm: async ({ clientSecret, partnerTxID }) =>
          makeRequest(window, {
            body: { clientSecret, partnerTxID },
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
          amount,
          clientSecret,
          currency,
          description,
          merchantID,
          partnerGroupTxID,
          partnerTxID
        }) =>
          makeRequest(window, {
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
        unbind: async ({ clientSecret, partnerTxID }) =>
          makeRequest(window, {
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
    },
    messaging: {
      sendInboxMessage: async ({ partnerHMACSecret, partnerID }) =>
        makeRequest(window, {
          body: { partnerHMACSecret, partnerID },
          method: "POST"
        })
    }
  };
}
