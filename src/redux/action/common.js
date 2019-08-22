/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
export const CommonActions = {
  SET_MESSAGE: "COMMON.SET_MESSAGE",
  SET_ERROR: "COMMON.SET_ERROR"
};

export const CommonActionCreators = {
  setMessage: (message = "") => ({
    payload: message,
    type: CommonActions.SET_MESSAGE
  }),
  setError: (error = new Error("Unexpected error")) => ({
    payload: error,
    type: CommonActions.SET_ERROR
  })
};

export const CommonMessages = {
  common: { copiedToClipboard: "Copied to clipboard" },
  configuration: { setConfiguration: "Successfully set configurations" },
  grabid: { requestToken: "Requested token successfully" },
  grabpay: {
    oneTimeCharge: {
      init: "Initialized charge successfully",
      confirm: "Confirmed charge successfully"
    },
    recurringCharge: {
      bind: "Bound successfully",
      charge: "Charged successfully",
      unbind: "Unbound successfully"
    }
  },
  identity: { basicProfile: "Requested basic profile successfully" },
  loyalty: { rewardsTier: "Requested rewards tier successfully" },
  messaging: {
    inbox: "Sent inbox message successfully",
    push: "Sent push message successfully"
  }
};
