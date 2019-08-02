import { makeRequest, requireAllValid } from "utils";

export default function createGrabAPIRepository(window) {
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
