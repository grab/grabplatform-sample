/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { CommonActionCreators } from "./common";

export const GrabIDActions = {
  CLEAR_CREDENTIALS: "GRABID.CLEAR_CREDENTIALS",
  SET_ACCESS_TOKEN: "GRABID.SET_ACCESS_TOKEN",
  SET_CLIENT_ID: "GRABID.SET_CLIENT_ID",
  SET_CLIENT_SECRET: "GRABID.SET_CLIENT_SECRET",
  SET_CODE: "GRABID.SET_CODE",
  SET_CODE_VERIFIER: "GRABID.SET_CODE_VERIFIER",
  SET_COUNTRY_CODE: "GRABID.SET_COUNTRY_CODE",
  SET_ID_TOKEN: "GRABID.SET_ID_TOKEN",
  SET_RETURN_PATH: "GRABID.SET_RETURN_PATH",
  SET_SCOPES: "GRABID.SET_SCOPES",
  SET_STATE: "GRABID.SET_STATE",

  TRIGGER_HANDLE_REDIRECT: "GRABID.TRIGGER_HANDLE_REDIRECT",
  TRIGGER_MAKE_AUTHORIZATION_REQUEST:
    "GRABID.TRIGGER_MAKE_AUTHORIZATION_REQUEST",
  TRIGGER_MAKE_TOKEN_REQUEST: "GRABID.TRIGGER_MAKE_TOKEN_REQUEST"
};

export const GrabIDActionCreators = {
  clearCredentials: () => ({ type: GrabIDActions.CLEAR_CREDENTIALS }),
  setAccessToken: (accessToken = "") => ({
    payload: accessToken,
    type: GrabIDActions.SET_ACCESS_TOKEN
  }),
  setClientID: (clientID = "") => ({
    payload: clientID,
    type: GrabIDActions.SET_CLIENT_ID
  }),
  setClientSecret: (clientSecret = "") => ({
    payload: clientSecret,
    type: GrabIDActions.SET_CLIENT_SECRET
  }),
  setCode: (code = "") => ({
    payload: code,
    type: GrabIDActions.SET_CODE
  }),
  setCodeVerifier: (codeVerifier = "") => ({
    payload: codeVerifier,
    type: GrabIDActions.SET_CODE_VERIFIER
  }),
  setCountryCode: (code = "") => ({
    payload: code,
    type: GrabIDActions.SET_COUNTRY_CODE
  }),
  setIDToken: (idToken = "") => ({
    payload: idToken,
    type: GrabIDActions.SET_ID_TOKEN
  }),
  setReturnPath: (returnPath = "") => ({
    payload: returnPath,
    type: GrabIDActions.SET_RETURN_PATH
  }),
  setScopes: (scopes = []) => ({
    payload: scopes,
    type: GrabIDActions.SET_SCOPES
  }),
  setState: (state = "") => ({
    payload: state,
    type: GrabIDActions.SET_STATE
  }),
  triggerHandleGrabIDRedirect: () => ({
    payload: async (
      dispatch,
      getState,
      { grabid: { handleAuthorizationCodeFlowResponse } }
    ) => {
      try {
        const returnPath = await handleAuthorizationCodeFlowResponse();
        dispatch(GrabIDActionCreators.setReturnPath(returnPath));
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: GrabIDActions.TRIGGER_HANDLE_REDIRECT
  }),
  triggerMakeAuthorizationRequest: () => ({
    payload: async (
      dispatch,
      getState,
      { grabid: { makeAuthorizationRequest } }
    ) => {
      const {
        grabid: { clientID, countryCode, scopes }
      } = getState();

      const { codeVerifier } = await makeAuthorizationRequest({
        clientID,
        countryCode,
        scopes
      });

      dispatch(GrabIDActionCreators.setCodeVerifier(codeVerifier));
    },
    type: GrabIDActions.TRIGGER_MAKE_AUTHORIZATION_REQUEST
  }),
  triggerMakeTokenRequest: () => ({
    payload: async (dispatch, getState, { grabid: { makeTokenRequest } }) => {
      try {
        const {
          grabid: { clientID, countryCode, scopes }
        } = getState();

        const { accessToken, idToken } = await makeTokenRequest({
          clientID,
          countryCode,
          scopes
        });

        dispatch(GrabIDActionCreators.setAccessToken(accessToken));
        dispatch(GrabIDActionCreators.setIDToken(idToken));
      } catch (e) {
        dispatch(CommonActionCreators.setError(e));
      }
    },
    type: GrabIDActions.TRIGGER_MAKE_TOKEN_REQUEST
  })
};
