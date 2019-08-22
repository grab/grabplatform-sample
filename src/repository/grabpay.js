import { makeHTTPRequest, requireAllValid } from "utils";

export default function createGrabPayRepository(window) {
  return {
    grabpay: {
      recurringCharge: {
        bind: async args => {
          const { countryCode } = requireAllValid(args);

          return makeHTTPRequest(window, {
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

          return makeHTTPRequest(window, {
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
          makeHTTPRequest(window, {
            method: "POST",
            path: "/payment/recurring-charge/unbind"
          })
      }
    }
  };
}
