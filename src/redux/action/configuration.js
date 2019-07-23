import { CommonActionCreators, CommonMessages } from "./common";

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

  TRIGGER_SAVE_CONFIGURATION: "TRIGGER_SAVE_CONFIGURATION",
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
  triggerGetConfiguration: () => ({
    payload: async (
      dispatch,
      getState,
      { configuration: { getConfiguration } }
    ) => {
      try {
        const configuration = await getConfiguration();
        dispatch(ConfigurationActionCreators.setConfiguration(configuration));
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: ConfigurationActions.TRIGGER_GET_CONFIGURATION
  }),
  triggerSaveConfiguration: () => ({
    payload: async (
      dispatch,
      getState,
      { configuration: { setConfiguration } }
    ) => {
      try {
        const { configuration } = getState();
        await setConfiguration(configuration);

        dispatch(
          CommonActionCreators.setMessage(
            CommonMessages.configuration.setConfiguration
          )
        );
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: ConfigurationActions.TRIGGER_SAVE_CONFIGURATION
  })
};
