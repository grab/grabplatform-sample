/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { parse } from "querystring";
import { connect } from "react-redux";
import { compose, withProps, withState } from "recompose";
import { CommonActionCreators, CommonMessages } from "redux/action/common";
import { copyToClipboard } from "utils";

export function copyToClipboardHOC() {
  return compose(
    handleMessageHOC(),
    withProps(({ handleMessage }) => ({
      copyToClipboard: text => {
        copyToClipboard(text);
        handleMessage(CommonMessages.common.copiedToClipboard);
      }
    }))
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
            console.log("Encountered error:", e);
            dispatch(CommonActionCreators.setError(e));
          }
        }
      })
    )
  );
}

export function grabidPaymentHOC() {
  return compose(
    handleMessageHOC(),
    handleErrorHOC(),
    connect(
      (
        { configuration: { clientID, currency, countryCode }, repository },
        { handleError, handleMessage }
      ) => ({
        /** GrabPay requires an additional request parameter. */
        makeAuthorizationRequest: handleError(async scopes => {
          await repository.grabid.payment.authorize({
            clientID,
            countryCode,
            currency,
            scopes
          });
        }),
        /** GrabPay requires an additional request parameter. */
        makeTokenRequest: handleError(async () => {
          await repository.grabid.payment.requestToken({ clientID });
          handleMessage(CommonMessages.grabid.requestToken);
        })
      })
    )
  );
}

export function messagingTemplateHOC(templates) {
  return compose(
    withState("templateName", "setTemplateName", ""),
    withState("templateParams", "setTemplateParams", {}),
    withProps(({ setTemplateName, setTemplateParams }) => ({
      setTemplateName: name => {
        setTemplateName(name);

        setTemplateParams(
          Object.entries(templates[name] || {})
            .map(([key, { value }]) => ({ [key]: value }))
            .reduce((acc, item) => ({ ...acc, ...item }), {})
        );
      }
    }))
  );
}

export function stageSwitcherHOC() {
  return compose(
    withProps(({ location: { search } }) => ({
      currentStage:
        (parseInt(parse(search.substr(1)).stage, undefined) || 1) - 1
    })),
    withState(
      "currentStage",
      "setCurrentStage",
      ({ currentStage }) => currentStage
    )
  );
}
