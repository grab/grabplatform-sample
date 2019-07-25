/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { connect } from "react-redux";
import { compose } from "recompose";
import { CommonActionCreators } from "redux/action/common";

export function copyToClipboardHOC() {
  return compose(
    connect(
      () => ({}),
      dispatch => ({
        copyToClipboard: text =>
          dispatch(CommonActionCreators.triggerCopyToClipboard(text))
      })
    )
  );
}

export function handleErrorHOC() {
  return compose(
    connect(
      () => ({}),
      dispatch => ({
        handleError: fn => async (...args) => {
          try {
            await fn(...args);
          } catch (e) {
            dispatch(CommonActionCreators.setError(e));
          }
        }
      })
    )
  );
}
