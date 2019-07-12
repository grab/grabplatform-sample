/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
export const CommonActions = {
  SET_ERROR: "SET_ERROR"
};

export const CommonActionCreators = {
  setError: error => ({ payload: error, type: CommonActions.SET_ERROR })
};

export const GrabIDActions = {
  CLEAR_CREDENTIALS: "GRABID.CLEAR_CREDENTIALS",
  SET_ACCESS_TOKEN: "GRABID.SET_ACCESS_TOKEN",
  SET_CLIENT_ID: "GRABID.SET_CLIENT_ID",
  SET_CLIENT_SECRET: "GRABID.SET_CLIENT_SECRET",
  SET_CODE: "GRABID.SET_CODE",
  SET_CODE_VERIFIER: "GRABID.SET_CODE_VERIFIER",
  SET_COUNTRY_CODE: "GRABID.SET_COUNTRY_CODE",
  SET_ID_TOKEN: "GRABID.SET_ID_TOKEN",
  SET_RETURN_PATH: "GRABID.SET_RETURN_PATH",
  SET_SCOPES: "GRABID.SET_SCOPES",
  SET_STATE: "GRABID.SET_STATE",

  TRIGGER_HANDLE_REDIRECT: "GRABID.TRIGGER_HANDLE_REDIRECT",
  TRIGGER_MAKE_AUTHORIZATION_REQUEST:
    "GRABID.TRIGGER_MAKE_AUTHORIZATION_REQUEST",
  TRIGGER_MAKE_TOKEN_REQUEST: "GRABID.TRIGGER_MAKE_TOKEN_REQUEST"
};

export const GrabIDActionCreators = {
  clearCredentials: () => ({ type: GrabIDActions.CLEAR_CREDENTIALS }),
  setAccessToken: (accessToken = "") => ({
    payload: accessToken,
    type: GrabIDActions.SET_ACCESS_TOKEN
  }),
  setClientID: (clientID = "") => ({
    payload: clientID,
    type: GrabIDActions.SET_CLIENT_ID
  }),
  setClientSecret: (clientSecret = "") => ({
    payload: clientSecret,
    type: GrabIDActions.SET_CLIENT_SECRET
  }),
  setCode: (code = "") => ({
    payload: code,
    type: GrabIDActions.SET_CODE
  }),
  setCodeVerifier: (codeVerifier = "") => ({
    payload: codeVerifier,
    type: GrabIDActions.SET_CODE_VERIFIER
  }),
  setCountryCode: (code = "") => ({
    payload: code,
    type: GrabIDActions.SET_COUNTRY_CODE
  }),
  setIDToken: (idToken = "") => ({
    payload: idToken,
    type: GrabIDActions.SET_ID_TOKEN
  }),
  setReturnPath: (returnPath = "") => ({
    payload: returnPath,
    type: GrabIDActions.SET_RETURN_PATH
  }),
  setScopes: (scopes = []) => ({
    payload: scopes,
    type: GrabIDActions.SET_SCOPES
  }),
  setState: (state = "") => ({
    payload: state,
    type: GrabIDActions.SET_STATE
  }),
  triggerHandleGrabIDRedirect: () => ({
    payload: async (
      dispatch,
      getState,
      { grabid: { handleAuthorizationCodeFlowResponse } }
    ) => {
      try {
        const returnPath = await handleAuthorizationCodeFlowResponse();
        dispatch(GrabIDActionCreators.setReturnPath(returnPath));
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: GrabIDActions.TRIGGER_HANDLE_REDIRECT
  }),
  triggerMakeAuthorizationRequest: () => ({
    payload: async (
      dispatch,
      getState,
      { grabid: { makeAuthorizationRequest } }
    ) => {
      const { grabid } = getState();
      const { codeVerifier } = await makeAuthorizationRequest(grabid);
      dispatch(GrabIDActionCreators.setCodeVerifier(codeVerifier));
    },
    type: GrabIDActions.TRIGGER_MAKE_AUTHORIZATION_REQUEST
  }),
  triggerMakeTokenRequest: () => ({
    payload: async (dispatch, getState, { grabid: { makeTokenRequest } }) => {
      try {
        const { grabid } = getState();
        const { accessToken, idToken } = await makeTokenRequest(grabid);
        dispatch(GrabIDActionCreators.setAccessToken(accessToken));
        dispatch(GrabIDActionCreators.setIDToken(idToken));
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: GrabIDActions.TRIGGER_MAKE_TOKEN_REQUEST
  })
};

export const GrabPayActions = {
  CLEAR_CREDENTIALS: "GRABPAY.CLEAR_CREDENTIALS",
  SET_CURRENCY: "GRABPAY.SET_CURRENCY",
  SET_MERCHANT_ID: "GRABPAY.SET_MERCHANT_ID",
  SET_PARTNER_HMAC_SECRET: "GRABPAY.SET_PARTNER_HMAC_SECRET",
  SET_PARTNER_ID: "GRABPAY.SET_PARTNER_ID",
  SET_REQUEST: "GRABPAY.SET_REQUEST",
  SET_WALLET: "SET_WALLET",

  TRIGGER_CHECK_WALLET: "TRIGGET_CHECK_WALLET",

  OneTimeCharge: {
    TRIGGER_INIT: "GRABPAY.OTC.TRIGGER_INIT",
    TRIGGER_MAKE_AUTHORIZATION_REQUEST:
      "GRABPAY.OTC.TRIGGER_MAKE_AUTHORIZATION_REQUEST",
    TRIGGER_MAKE_TOKEN_REQUEST: "GRABPAY.OTC.TRIGGER_MAKE_TOKEN_REQUEST",
    TRIGGER_CONFIRM: "GRABPAY.OTC.TRIGGER_CONFIRM"
  },

  RecurringCharge: {
    TRIGGER_BIND: "GRABPAY.RC.TRIGGER_BIND",
    TRIGGER_CHARGE: "GRABPAY.RC.TRIGGER_CHARGE",
    TRIGGER_UNBIND: "GRABPAY.RC.TRIGGER_UNBIND"
  },

  Transaction: {
    SET_AMOUNT: "GRABPAY.TX.SET_AMOUNT",
    SET_DESCRIPTION: "GRABPAY.TX.SET_DESCRIPTION",
    SET_PARTNER_GROUP_TRANSACTION_ID:
      "GRABPAY.TX.SET_PARTNER_GROUP_TRANSACTION_ID",
    SET_PARTNER_TRANSACTION_ID: "GRABPAY.TX.SET_PARTNER_TRANSACTION_ID",
    SET_TRANSACTION_STATUS: "GRABPAY.TX.SET_TRANSACTION_STATUS"
  }
};

export const GrabPayActionCreators = {
  clearCredentials: () => ({ type: GrabPayActions.CLEAR_CREDENTIALS }),
  setCurrency: currency => ({
    payload: currency,
    type: GrabPayActions.SET_CURRENCY
  }),
  setMerchantID: merchantID => ({
    payload: merchantID,
    type: GrabPayActions.SET_MERCHANT_ID
  }),
  setPartnerHMACSecret: hmac => ({
    payload: hmac,
    type: GrabPayActions.SET_PARTNER_HMAC_SECRET
  }),
  setPartnerID: partnerID => ({
    payload: partnerID,
    type: GrabPayActions.SET_PARTNER_ID
  }),
  setRequest: request => ({
    payload: request,
    type: GrabPayActions.SET_REQUEST
  }),
  setWallet: (wallet = {}) => ({
    payload: wallet,
    type: GrabPayActions.SET_WALLET
  }),
  triggerCheckWallet: () => ({
    payload: async (dispatch, getState, { grabpay: { checkWallet } }) => {
      const {
        grabid: { accessToken, clientSecret },
        grabpay: { currency }
      } = getState();

      const wallet = await checkWallet({
        accessToken,
        clientSecret,
        currency
      });

      dispatch(GrabPayActionCreators.setWallet(wallet));
    },
    type: GrabPayActions.TRIGGER_CHECK_WALLET
  }),
  /** GrabPay requires an additional request parameter. */
  triggerMakeAuthorizationRequest: () => ({
    payload: async (dispatch, getState, { grabpay: { authorize } }) => {
      const {
        grabid,
        grabpay: { currency, request }
      } = getState();

      const { codeVerifier } = await authorize({
        ...grabid,
        currency,
        request
      });

      dispatch(GrabIDActionCreators.setCodeVerifier(codeVerifier));
    },
    type: GrabPayActions.OneTimeCharge.TRIGGER_MAKE_AUTHORIZATION_REQUEST
  }),
  /** GrabPay requires an additional request parameter. */
  triggerMakeTokenRequest: () => ({
    payload: async (dispatch, getState, { grabpay: { requestToken } }) => {
      try {
        const { grabid } = getState();
        const { accessToken, idToken } = await requestToken(grabid);
        dispatch(GrabIDActionCreators.setAccessToken(accessToken));
        dispatch(GrabIDActionCreators.setIDToken(idToken));
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: GrabPayActions.OneTimeCharge.TRIGGER_MAKE_TOKEN_REQUEST
  }),
  OneTimeCharge: {
    triggerInit: () => ({
      payload: async (
        dispatch,
        getState,
        {
          grabpay: {
            oneTimeCharge: { init }
          }
        }
      ) => {
        const {
          grabpay: {
            currency,
            merchantID,
            partnerHMACSecret,
            partnerID,
            transaction: { amount, description, partnerGroupTxID }
          }
        } = getState();

        const { partnerTxID, request } = await init({
          amount,
          currency,
          description,
          merchantID,
          partnerGroupTxID,
          partnerHMACSecret,
          partnerID
        });

        dispatch(
          GrabPayActionCreators.Transaction.setPartnerTransactionID(partnerTxID)
        );

        dispatch(GrabPayActionCreators.setRequest(request));
      },
      type: GrabPayActions.OneTimeCharge.TRIGGER_INIT
    }),
    triggerConfirm: () => ({
      payload: async (
        dispatch,
        getState,
        {
          grabpay: {
            oneTimeCharge: { confirm }
          }
        }
      ) => {
        const {
          grabid: { accessToken, clientSecret },
          grabpay: {
            transaction: { partnerTxID }
          }
        } = getState();

        const { status } = await confirm({
          accessToken,
          clientSecret,
          partnerTxID
        });

        dispatch(
          GrabPayActionCreators.Transaction.setTransactionStatus(status)
        );
      },
      type: GrabPayActions.OneTimeCharge.TRIGGER_CONFIRM
    })
  },
  RecurringCharge: {
    triggerBind: () => ({
      payload: async (
        dispatch,
        getState,
        {
          grabpay: {
            recurringCharge: { bind }
          }
        }
      ) => {
        const {
          grabid: { countryCode },
          grabpay: { partnerHMACSecret, partnerID }
        } = getState();

        const { partnerTxID, request } = await bind({
          countryCode,
          partnerHMACSecret,
          partnerID
        });

        dispatch(GrabPayActionCreators.setRequest(request));

        dispatch(
          GrabPayActionCreators.Transaction.setPartnerTransactionID(partnerTxID)
        );
      },
      type: GrabPayActions.RecurringCharge.TRIGGER_BIND
    }),
    triggerCharge: () => ({
      payload: async (
        dispatch,
        getState,
        {
          grabpay: {
            recurringCharge: { charge }
          }
        }
      ) => {
        const {
          grabid: { accessToken, clientSecret },
          grabpay: {
            currency,
            merchantID,
            transaction: { amount, description, partnerGroupTxID, partnerTxID }
          }
        } = getState();

        const { status } = await charge({
          accessToken,
          amount,
          clientSecret,
          currency,
          description,
          merchantID,
          partnerGroupTxID,
          partnerTxID
        });

        dispatch(
          GrabPayActionCreators.Transaction.setTransactionStatus(status)
        );

        dispatch(GrabPayActionCreators.triggerCheckWallet());
      },
      type: GrabPayActions.RecurringCharge.TRIGGER_CHARGE
    }),
    triggerUnbind: () => ({
      payload: async (
        dispatch,
        getState,
        {
          grabpay: {
            recurringCharge: { unbind }
          }
        }
      ) => {
        const {
          grabid: { accessToken, clientSecret },
          grabpay: {
            transaction: { partnerTxID }
          }
        } = getState();

        await unbind({ accessToken, clientSecret, partnerTxID });
        dispatch(GrabIDActionCreators.clearCredentials());
        dispatch(GrabPayActionCreators.clearCredentials());
      },
      type: GrabPayActions.RecurringCharge.TRIGGER_CHARGE
    })
  },
  Transaction: {
    setDescription: description => ({
      payload: description,
      type: GrabPayActions.Transaction.SET_DESCRIPTION
    }),
    setPartnerGroupTransactionID: partnerGroupTxID => ({
      payload: partnerGroupTxID,
      type: GrabPayActions.Transaction.SET_PARTNER_GROUP_TRANSACTION_ID
    }),
    setPartnerTransactionID: partnerTxID => ({
      payload: partnerTxID,
      type: GrabPayActions.Transaction.SET_PARTNER_TRANSACTION_ID
    }),
    setTransactionAmount: amount => ({
      payload: amount,
      type: GrabPayActions.Transaction.SET_AMOUNT
    }),
    setTransactionStatus: status => ({
      payload: status,
      type: GrabPayActions.Transaction.SET_TRANSACTION_STATUS
    })
  }
};

export const IdentityActions = {
  SET_BASIC_PROFILE: "SET_BASIC_PROFILE",

  TRIGGER_GET_BASIC_PROFILE: "TRIGGER_GET_BASIC_PROFILE"
};

export const IdentityActionCreators = {
  setBasicProfile: profile => ({
    payload: profile,
    type: IdentityActions.SET_BASIC_PROFILE
  }),
  triggerGetBasicProfile: () => ({
    payload: async (dispatch, getState, { identity: { getBasicProfile } }) => {
      const {
        grabid: { accessToken }
      } = getState();

      try {
        const profile = await getBasicProfile(accessToken);
        dispatch(IdentityActionCreators.setBasicProfile(profile));
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: IdentityActions.TRIGGER_GET_BASIC_PROFILE
  })
};

export const LoyaltyActions = {
  SET_REWARDS_TIER: "SET_REWARDS_TIER",

  TRIGGER_GET_REWARDS_TIER: "TRIGGER_GET_REWARDS_TIER"
};

export const LoyaltyActionCreators = {
  setRewardsTier: rewardsTier => ({
    payload: rewardsTier,
    type: LoyaltyActions.SET_REWARDS_TIER
  }),
  triggerGetRewardsTier: () => ({
    payload: async (dispatch, getState, { loyalty: { getRewardsTier } }) => {
      const {
        grabid: { accessToken }
      } = getState();

      try {
        const tier = await getRewardsTier(accessToken);
        dispatch(LoyaltyActionCreators.setRewardsTier(tier));
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: LoyaltyActions.TRIGGER_GET_REWARDS_TIER
  })
};
