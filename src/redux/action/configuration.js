/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */

export const ConfigurationActions = {
  SET_CLIENT_ID: "SET_CLIENT_ID",
  SET_CLIENT_SECRET: "SET_CLIENT_SECRET",
  SET_COUNTRY_CODE: "SET_COUNTRY_CODE",
  SET_CURRENCY: "SET_CURRENCY",
  SET_MERCHANT_ID: "SET_MERCHANT_ID",
  SET_PARTNER_HMAC_SECRET: "SET_PARTNER_HMAC_SECRET",
  SET_PARTNER_ID: "SET_PARTNER_ID"
};

export const ConfigurationActionCreators = {
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
  })
};
