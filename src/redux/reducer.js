/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { combineReducers } from "redux";
import { ConfigurationActions } from "./action/configuration";

function configuration(
  state = { countryCode: "SG", transaction: {} },
  { type, payload }
) {
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

    case ConfigurationActions.Transaction.SET_AMOUNT:
      return {
        ...state,
        transaction: { ...state.transaction, amount: payload }
      };

    case ConfigurationActions.Transaction.SET_DESCRIPTION:
      return {
        ...state,
        transaction: { ...state.transaction, description: payload }
      };

    case ConfigurationActions.Transaction.SET_PARTNER_GROUP_TRANSACTION_ID:
      return {
        ...state,
        transaction: { ...state.transaction, partnerGroupTxID: payload }
      };

    default:
      return { ...state };
  }
}

export default combineReducers({ configuration });
