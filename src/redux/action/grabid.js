/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { CommonActionCreators, CommonMessages } from "./common";

export const GrabIDActions = {
  CLEAR_CREDENTIALS: "GRABID.CLEAR_CREDENTIALS",

  TRIGGER_HANDLE_REDIRECT: "GRABID.TRIGGER_HANDLE_REDIRECT",
  TRIGGER_MAKE_AUTHORIZATION_REQUEST:
    "GRABID.TRIGGER_MAKE_AUTHORIZATION_REQUEST",
  TRIGGER_MAKE_TOKEN_REQUEST: "GRABID.TRIGGER_MAKE_TOKEN_REQUEST"
};

export const GrabIDActionCreators = {
  clearCredentials: () => ({ type: GrabIDActions.CLEAR_CREDENTIALS }),
  triggerHandleGrabIDRedirect: () => ({
    payload: async (
      dispatch,
      getState,
      { grabid: { handleAuthorizationCodeFlowResponse } }
    ) => {
      await handleAuthorizationCodeFlowResponse();
    },
    type: GrabIDActions.TRIGGER_HANDLE_REDIRECT
  }),
  nonPOP: {
    triggerAuthorize: (scopes = []) => ({
      params: scopes,
      payload: async (
        dispatch,
        getState,
        {
          grabid: {
            nonPOP: { authorize }
          }
        }
      ) => {
        const {
          configuration: { clientID, countryCode }
        } = getState();

        await authorize({
          clientID,
          countryCode,
          scopes
        });
      },
      type: GrabIDActions.TRIGGER_MAKE_AUTHORIZATION_REQUEST
    }),
    triggerRequestToken: (scopes = []) => ({
      params: scopes,
      payload: async (
        dispatch,
        getState,
        {
          grabid: {
            nonPOP: { requestToken }
          },
          navigation: { reloadPage }
        }
      ) => {
        const {
          configuration: { clientID, countryCode }
        } = getState();

        await requestToken({ clientID, countryCode, scopes });
        await reloadPage();

        dispatch(
          CommonActionCreators.setMessage(CommonMessages.grabid.requestToken)
        );
      },
      type: GrabIDActions.TRIGGER_MAKE_TOKEN_REQUEST
    })
  },
  payment: {
    /** GrabPay requires an additional request parameter. */
    triggerAuthorize: (scopes = []) => ({
      params: scopes,
      payload: async (
        dispatch,
        getState,
        {
          grabid: {
            payment: { authorize }
          }
        }
      ) => {
        const {
          configuration: { clientID, currency, countryCode },
          grabpay: { request }
        } = getState();

        await authorize({
          clientID,
          countryCode,
          currency,
          request,
          scopes
        });
      },
      type: GrabIDActions.TRIGGER_MAKE_AUTHORIZATION_REQUEST
    }),
    /** GrabPay requires an additional request parameter. */
    triggerRequestToken: () => ({
      payload: async (
        dispatch,
        getState,
        {
          grabid: {
            payment: { requestToken }
          }
        }
      ) => {
        const {
          configuration: { clientID, clientSecret }
        } = getState();

        await requestToken({ clientID, clientSecret });

        dispatch(
          CommonActionCreators.setMessage(CommonMessages.grabid.requestToken)
        );
      },
      type: GrabIDActions.TRIGGER_MAKE_TOKEN_REQUEST
    })
  }
};
