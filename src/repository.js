/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import GrabID from "@grab-id/grab-id-client";
import { environment, requireAllValid } from "utils";

export function createWindowRepository(window) {
  return {
    clipboard: {
      copyToClipboard: async text => {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
    },
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
    redirectUri: getAbsoluteURLPath(window, redirectURI),
    request,
    scope: ["openid", ...scopes].join(" ")
  };

  return new GrabID(openIDURL, appConfig);
}

function getRelativeURLPath(url) {
  const a = document.createElement("a");
  a.href = url;
  return `${a.pathname}${a.search}`;
}

function getAbsoluteURLPath(window, relativeURL) {
  return `${window.location.origin}${relativeURL}`;
}

async function makeRequest(
  window,
  { additionalHeaders = {}, body, method, path }
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

  const response = await window.fetch(path, config);
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
      persistInitialIDToken: async idToken =>
        window.localStorage.setItem(LOCAL_ID_TOKEN_KEY, idToken),
      persistAuthorizationCode: async code =>
        window.localStorage.setItem("grabid:code", code),
      handleAuthorizationCodeFlowResponse: async () => {
        GrabID.handleAuthorizationCodeFlowResponse();
      },
      nonPOP: (() => {
        const extraConfig = {
          additionalACRValues: { service: "PASSENGER" },
          redirectURI: "/grabid/redirect/nonpop"
        };

        return {
          authorize: async args => {
            const { clientID, countryCode, scopes } = requireAllValid(args);

            const client = createGrabIDClient(window, {
              clientID,
              countryCode,
              scopes,
              ...extraConfig
            });

            const idTokenHint = window.localStorage.getItem(LOCAL_ID_TOKEN_KEY);
            await client.makeAuthorizationRequest(undefined, idTokenHint);
          },
          requestToken: async args => {
            const { clientID, countryCode, scopes } = requireAllValid(args);

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
        requestToken: async args => {
          const { clientID, redirectURI } = requireAllValid(args);
          const { code } = await repository.grabid.getGrabIDResult();

          return makeRequest(window, {
            body: {
              clientID,
              code,
              redirectURI: getAbsoluteURLPath(window, redirectURI)
            },
            method: "POST",
            path: "/grabid/token"
          });
        }
      },
      payment: (() => {
        const redirectURI = "/grabid/redirect/pop";

        return {
          authorize: async args => {
            const { clientID, countryCode, currency, scopes } = requireAllValid(
              args
            );

            const { authorizeURL } = await makeRequest(window, {
              body: {
                clientID,
                countryCode,
                currency,
                redirectURI: getAbsoluteURLPath(window, redirectURI),
                scopes
              },
              method: "POST",
              path: "/grabid/payment/authorize"
            });

            window.localStorage.setItem(
              "grabid:login_return_uri",
              window.location.href
            );

            window.location.assign(authorizeURL);
          },
          requestToken: async args => {
            const { clientID } = requireAllValid(args);

            return repository.grabid.pop.requestToken({
              clientID,
              redirectURI
            });
          }
        };
      })()
    }
  };

  return repository;
}

export function createGrabPayRepository(window) {
  return {
    grabpay: {
      checkWallet: async args => {
        const { currency } = requireAllValid(args);

        return makeRequest(window, {
          body: { currency },
          method: "POST",
          path: "/payment/recurring-charge/wallet"
        });
      },
      oneTimeCharge: {
        init: async args => {
          const {
            amount,
            currency,
            description,
            partnerGroupTxID
          } = requireAllValid(args);

          return makeRequest(window, {
            body: {
              amount,
              currency,
              description,
              partnerGroupTxID
            },
            method: "POST",
            path: "/payment/one-time-charge/init"
          });
        },
        confirm: async () =>
          makeRequest(window, {
            method: "POST",
            path: "/payment/one-time-charge/confirm"
          })
      },
      recurringCharge: {
        bind: async args => {
          const { countryCode } = requireAllValid(args);

          return makeRequest(window, {
            body: { countryCode },
            method: "POST",
            path: "/payment/recurring-charge/bind"
          });
        },
        charge: async args => {
          const {
            amount,
            currency,
            description,
            partnerGroupTxID
          } = requireAllValid(args);

          return makeRequest(window, {
            body: {
              amount,
              currency,
              description,
              partnerGroupTxID
            },
            method: "POST",
            path: "/payment/recurring-charge/charge"
          });
        },
        unbind: async () =>
          makeRequest(window, {
            method: "POST",
            path: "/payment/recurring-charge/unbind"
          })
      }
    }
  };
}

export function createGrabAPIRepository(window) {
  return {
    configuration: {
      getConfigurationFromPersistence: () =>
        makeRequest(window, { method: "GET", path: "/configuration" }),
      persistConfiguration: config =>
        makeRequest(window, {
          body: config,
          method: "POST",
          path: "/configuration"
        })
    },
    identity: {
      getBasicProfile: () =>
        makeRequest(window, { method: "GET", path: "/identity/basic-profile" })
    },
    loyalty: {
      getRewardsTier: () =>
        makeRequest(window, { method: "GET", path: "/loyalty/rewards-tier" })
    },
    messaging: {
      sendInboxMessage: async args => {
        const { templateID, templateParams } = requireAllValid(args);

        return makeRequest(window, {
          body: { templateID, templateParams },
          method: "POST",
          path: "/messaging/inbox"
        });
      },
      sendPushMessage: async args => {
        const { templateID, templateParams } = requireAllValid(args);

        return makeRequest(window, {
          body: { templateID, templateParams },
          method: "POST",
          path: "/messaging/push"
        });
      }
    }
  };
}
