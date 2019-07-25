/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { combineReducers } from "redux";
import { ConfigurationActions } from "./action/configuration";
import { GrabPayActions } from "./action/grabpay";

function configuration(state = { countryCode: "SG" }, { type, payload }) {
  switch (type) {
    case ConfigurationActions.SET_CONFIGURATION:
      return { ...state, ...payload };

    case ConfigurationActions.SET_CLIENT_ID:
      return { ...state, clientID: payload };

    case ConfigurationActions.SET_CLIENT_SECRET:
      return { ...state, clientSecret: payload };

    case ConfigurationActions.SET_COUNTRY_CODE:
      return { ...state, countryCode: payload };

    case ConfigurationActions.SET_CURRENCY:
      return { ...state, currency: payload };

    case ConfigurationActions.SET_MERCHANT_ID:
      return { ...state, merchantID: payload };

    case ConfigurationActions.SET_PARTNER_HMAC_SECRET:
      return { ...state, partnerHMACSecret: payload };

    case ConfigurationActions.SET_PARTNER_ID:
      return { ...state, partnerID: payload };

    default:
      return { ...state };
  }
}

function grabpay(
  state = {
    oneTimeCharge: {},
    recurringCharge: {},
    transaction: {},
    wallet: {}
  },
  { type, payload }
) {
  switch (type) {
    case GrabPayActions.SET_REQUEST:
      return { ...state, request: payload };

    case GrabPayActions.SET_WALLET:
      return { ...state, wallet: payload };

    case GrabPayActions.Transaction.SET_AMOUNT:
      return {
        ...state,
        transaction: { ...state.transaction, amount: payload }
      };

    case GrabPayActions.Transaction.SET_DESCRIPTION:
      return {
        ...state,
        transaction: { ...state.transaction, description: payload }
      };

    case GrabPayActions.Transaction.SET_PARTNER_GROUP_TRANSACTION_ID:
      return {
        ...state,
        transaction: { ...state.transaction, partnerGroupTxID: payload }
      };

    case GrabPayActions.Transaction.SET_PARTNER_TRANSACTION_ID:
      return {
        ...state,
        transaction: { ...state.transaction, partnerTxID: payload }
      };

    case GrabPayActions.Transaction.SET_TRANSACTION_STATUS:
      return {
        ...state,
        transaction: { ...state.transaction, status: payload }
      };

    default:
      return { ...state };
  }
}

export default combineReducers({
  configuration,
  grabpay,
  repository: (state = {}) => state
});
