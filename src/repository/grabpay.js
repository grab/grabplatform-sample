import { makeHTTPRequest, requireAllValid } from "utils";

export default function createGrabPayRepository(window) {
  return {
    grabpay: {
      checkWallet: async args => {
        const { currency } = requireAllValid(args);

        return makeHTTPRequest(window, {
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

          return makeHTTPRequest(window, {
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
          makeHTTPRequest(window, {
            method: "POST",
            path: "/payment/one-time-charge/confirm"
          })
      },
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
