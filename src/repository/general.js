import { makeHTTPRequest, requireAllValid } from "utils";

export default function createGrabAPIRepository(window) {
  return {
    configuration: {
      getConfigurationFromPersistence: () =>
        makeHTTPRequest(window, { method: "GET", path: "/configuration" }),
      persistConfiguration: config =>
        makeHTTPRequest(window, {
          body: config,
          method: "POST",
          path: "/configuration"
        })
    },
    loyalty: {
      getRewardsTier: () =>
        makeHTTPRequest(window, {
          method: "GET",
          path: "/loyalty/rewards-tier"
        })
    },
    messaging: {
      sendInboxMessage: async args => {
        const { templateID, templateParams } = requireAllValid(args);

        return makeHTTPRequest(window, {
          body: { templateID, templateParams },
          method: "POST",
          path: "/messaging/inbox"
        });
      },
      sendPushMessage: async args => {
        const { templateID, templateParams } = requireAllValid(args);

        return makeHTTPRequest(window, {
          body: { templateID, templateParams },
          method: "POST",
          path: "/messaging/push"
        });
      }
    }
  };
}
