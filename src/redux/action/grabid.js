/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { CommonActionCreators } from "./common";

export const GrabIDActions = {
  CLEAR_CREDENTIALS: "GRABID.CLEAR_CREDENTIALS",
  SET_CLIENT_ID: "GRABID.SET_CLIENT_ID",
  SET_CLIENT_SECRET: "GRABID.SET_CLIENT_SECRET",
  SET_COUNTRY_CODE: "GRABID.SET_COUNTRY_CODE",

  TRIGGER_HANDLE_REDIRECT: "GRABID.TRIGGER_HANDLE_REDIRECT",
  TRIGGER_MAKE_AUTHORIZATION_REQUEST:
    "GRABID.TRIGGER_MAKE_AUTHORIZATION_REQUEST",
  TRIGGER_MAKE_TOKEN_REQUEST: "GRABID.TRIGGER_MAKE_TOKEN_REQUEST"
};

export const GrabIDActionCreators = {
  clearCredentials: () => ({ type: GrabIDActions.CLEAR_CREDENTIALS }),
  setClientID: (clientID = "") => ({
    payload: clientID,
    type: GrabIDActions.SET_CLIENT_ID
  }),
  setClientSecret: (clientSecret = "") => ({
    payload: clientSecret,
    type: GrabIDActions.SET_CLIENT_SECRET
  }),
  setCountryCode: (code = "") => ({
    payload: code,
    type: GrabIDActions.SET_COUNTRY_CODE
  }),
  triggerHandleGrabIDRedirect: () => ({
    payload: async (
      dispatch,
      getState,
      { grabid: { handleAuthorizationCodeFlowResponse } }
    ) => {
      try {
        await handleAuthorizationCodeFlowResponse();
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
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
          grabid: { clientID, countryCode }
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
        try {
          const {
            grabid: { clientID, countryCode }
          } = getState();

          await requestToken({ clientID, countryCode, scopes });
          await reloadPage();
        } catch (e) {
          dispatch(CommonActionCreators.setError(e));
        }
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
          grabid: { clientID, countryCode },
          grabpay: { currency, request }
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
        try {
          const {
            grabid: { clientID, clientSecret }
          } = getState();

          await requestToken({ clientID, clientSecret });
        } catch (e) {
          dispatch(CommonActionCreators.setError(e));
        }
      },
      type: GrabIDActions.TRIGGER_MAKE_TOKEN_REQUEST
    })
  }
};
