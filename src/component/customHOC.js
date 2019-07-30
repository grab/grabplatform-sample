/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { parse } from "querystring";
import { connect } from "react-redux";
import { compose, lifecycle, withProps, withState } from "recompose";
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
            console.log(e);
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
      ({
        configuration,
        repository: {
          grabid: {
            payment: { authorize, requestToken }
          },
          grabpay: { getChargeRequestFromPersistence }
        }
      }) => ({
        configuration,
        authorize,
        getChargeRequestFromPersistence,
        requestToken
      })
    ),
    withProps(
      ({
        configuration: { clientID, clientSecret, currency, countryCode },
        authorize,
        getChargeRequestFromPersistence,
        handleError,
        handleMessage,
        requestToken
      }) => ({
        /** GrabPay requires an additional request parameter. */
        makeAuthorizationRequest: handleError(async scopes => {
          const request = await getChargeRequestFromPersistence();

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

export function grabpayTransactionHOC() {
  return compose(
    connect(
      ({
        repository: {
          grabpay: {
            getChargeRequestFromPersistence,
            persistChargeRequest,
            getPartnerTxIDFromPersistence,
            persistPartnerTxID
          }
        }
      }) => ({
        getChargeRequestFromPersistence,
        getPartnerTxIDFromPersistence,
        persistChargeRequest,
        persistPartnerTxID
      })
    ),
    withState("partnerTxID", "setPartnerTxID", ""),
    withState("request", "setRequest", ""),
    lifecycle({
      async componentDidMount() {
        const {
          getChargeRequestFromPersistence,
          getPartnerTxIDFromPersistence,
          setPartnerTxID,
          setRequest
        } = this.props;

        const request = await getChargeRequestFromPersistence();
        const partnerTxID = await getPartnerTxIDFromPersistence();
        setPartnerTxID(partnerTxID);
        setRequest(request);
      }
    })
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
