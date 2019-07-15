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
