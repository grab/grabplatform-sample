/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { connect } from "react-redux";
import { compose, withProps } from "recompose";
import { CommonActionCreators, CommonMessages } from "redux/action/common";

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

export function handleMessageHOC() {
  return compose(
    connect(
      () => ({}),
      dispatch => ({
        handleMessage: message =>
          dispatch(CommonActionCreators.setMessage(message))
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

export function grabidPOPTokenHOC() {
  return compose(
    handleMessageHOC(),
    handleErrorHOC(),
    connect(
      ({
        configuration,
        repository: {
          grabid: {
            pop: { authorize, requestToken }
          }
        }
      }) => ({ configuration, authorize, requestToken })
    ),
    withProps(
      ({
        configuration: { clientID, clientSecret, currency, countryCode },
        request,
        scopes,
        authorize,
        handleError,
        handleMessage,
        requestToken
      }) => ({
        /** GrabPay requires an additional request parameter. */
        makeAuthorizationRequest: handleError(async () => {
          await authorize({
            clientID,
            countryCode,
            currency,
            request,
            scopes
          });
        }),
        /** GrabPay requires an additional request parameter. */
        makeTokenRequest: handleError(async () => {
          await requestToken({ clientID, clientSecret });
          handleMessage(CommonMessages.grabid.requestToken);
        })
      })
    )
  );
}
