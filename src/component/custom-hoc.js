/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { connect } from "react-redux";
import { compose, lifecycle } from "recompose";
import { CommonActionCreators } from "redux/action/common";
import { GrabIDActionCreators } from "redux/action/grabid";
import { GrabPayActionCreators } from "redux/action/grabpay";

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

/** Take care of GrabID-specific tasks. */
export function grabIDHandlerHOC() {
  return compose(
    connect(
      () => ({}),
      dispatch => ({
        clearCredentials: () =>
          dispatch(GrabIDActionCreators.clearCredentials())
      })
    ),
    lifecycle({
      componentWillUnmount() {
        this.props.clearCredentials();
      }
    })
  );
}

/** Take care of GrabPay-specific tasks. */
export function grabPayHandlerHOC() {
  return compose(
    connect(
      () => ({}),
      dispatch => ({
        clearCredentials: () =>
          dispatch(GrabPayActionCreators.clearCredentials())
      })
    ),
    lifecycle({
      componentWillUnmount() {
        this.props.clearCredentials();
      }
    })
  );
}

/** Use this to represent a state machine for steps to hit an endpoint. */
export const Stage = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5
};
