/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { CommonActionCreators, CommonActions } from "./action/common";

export const alertMiddleware = () => dispatch => a => {
  dispatch(a);

  switch (a.type) {
    case CommonActions.SET_MESSAGE:
      alert(`Message: ${a.payload}`);
      break;

    case CommonActions.SET_ERROR:
      const { message } = a.payload;
      alert(`Error: ${message}`);
      break;

    default:
      break;
  }
};

export const thunkUnwrapMiddleware = ({
  dispatch: rootDispatch
}) => dispatch => a => {
  dispatch(a);

  /** If the action payload is a function, assume it is a thunk action */
  if (typeof a["payload"] === "function") {
    (async () => {
      try {
        await dispatch(a["payload"]);
      } catch (e) {
        rootDispatch(CommonActionCreators.setError(e));
      }
    })();
  }
};
