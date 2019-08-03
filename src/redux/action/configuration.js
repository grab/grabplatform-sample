import { CommonActionCreators } from "./common";

/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */

export const ConfigurationActions = {
  SET_CONFIGURATION: "SET_CONFIGURATION",
  SET_CLIENT_ID: "SET_CLIENT_ID",
  SET_CLIENT_SECRET: "SET_CLIENT_SECRET",
  SET_COUNTRY_CODE: "SET_COUNTRY_CODE",
  SET_CURRENCY: "SET_CURRENCY",
  SET_MERCHANT_ID: "SET_MERCHANT_ID",
  SET_PARTNER_HMAC_SECRET: "SET_PARTNER_HMAC_SECRET",
  SET_PARTNER_ID: "SET_PARTNER_ID",

  Transaction: {
    SET_AMOUNT: "TX.SET_AMOUNT",
    SET_DESCRIPTION: "TX.SET_DESCRIPTION",
    SET_PARTNER_GROUP_TRANSACTION_ID: "TX.SET_PARTNER_GROUP_TRANSACTION_ID"
  },

  TRIGGER_GET_CONFIGURATION: "TRIGGER_SET_CONFIGURATION"
};

export const ConfigurationActionCreators = {
  setConfiguration: (config = {}) => ({
    payload: config,
    type: ConfigurationActions.SET_CONFIGURATION
  }),
  setClientID: (clientID = "") => ({
    payload: clientID,
    type: ConfigurationActions.SET_CLIENT_ID
  }),
  setClientSecret: (clientSecret = "") => ({
    payload: clientSecret,
    type: ConfigurationActions.SET_CLIENT_SECRET
  }),
  setCountryCode: (code = "") => ({
    payload: code,
    type: ConfigurationActions.SET_COUNTRY_CODE
  }),
  setCurrency: (currency = "") => ({
    payload: currency,
    type: ConfigurationActions.SET_CURRENCY
  }),
  setMerchantID: (merchantID = "") => ({
    payload: merchantID,
    type: ConfigurationActions.SET_MERCHANT_ID
  }),
  setPartnerHMACSecret: (partnerHMACSecret = "") => ({
    payload: partnerHMACSecret,
    type: ConfigurationActions.SET_PARTNER_HMAC_SECRET
  }),
  setPartnerID: (partnerID = "") => ({
    payload: partnerID,
    type: ConfigurationActions.SET_PARTNER_ID
  }),
  triggerGetConfigurationFromPersistence: () => ({
    payload: async (
      dispatch,
      getState,
      { configuration: { getConfigurationFromPersistence } }
    ) => {
      try {
        const configuration = await getConfigurationFromPersistence();
        dispatch(ConfigurationActionCreators.setConfiguration(configuration));
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: ConfigurationActions.TRIGGER_GET_CONFIGURATION
  }),
  Transaction: {
    setAmount: amount => ({
      payload: amount,
      type: ConfigurationActions.Transaction.SET_AMOUNT
    }),
    setDescription: description => ({
      payload: description,
      type: ConfigurationActions.Transaction.SET_DESCRIPTION
    }),
    setPartnerGroupTransactionID: partnerGroupTxID => ({
      payload: partnerGroupTxID,
      type: ConfigurationActions.Transaction.SET_PARTNER_GROUP_TRANSACTION_ID
    })
  }
};
