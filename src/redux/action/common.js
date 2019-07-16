/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { GrabIDActionCreators } from "./grabid";
import { GrabPayActionCreators } from "./grabpay";

export const CommonActions = {
  SET_ERROR: "COMMON.SET_ERROR",

  TRIGGER_CLEAR_EVERYTHING: "COMMON.TRIGGER_CLEAR_EVERYTHING"
};

export const CommonActionCreators = {
  setError: error => ({ payload: error, type: CommonActions.SET_ERROR }),

  triggerClearEverything: () => ({
    payload: dispatch => {
      dispatch(GrabIDActionCreators.clearCredentials());
      dispatch(GrabPayActionCreators.clearCredentials());
    },
    type: CommonActions.TRIGGER_CLEAR_EVERYTHING
  })
};
