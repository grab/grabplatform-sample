import GrabID from "@grab-id/grab-id-client";
import {
  environment,
  getAbsoluteURLPath,
  getRelativeURLPath,
  makeRequest,
  requireAllValid
} from "utils";

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

export default function createGrabIDRepository(window) {
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
