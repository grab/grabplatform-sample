/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { parse } from "querystring";
import React from "react";
import Markdown from "react-markdown";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { compose, lifecycle, mapProps } from "recompose";
import { CommonActionCreators } from "redux/action/common";
import { GrabIDActionCreators } from "redux/action/grabid";
import "./style.scss";

// ############################### GRABID LOGIN ###############################

function PrivateGrabIDGlobalLogin({ clearCredentials }) {
  return (
    <div className="grabid-login-container">
      <div className="login">Log in as a user</div>

      <div className="clear-credentials" onClick={clearCredentials}>
        Clear state
      </div>
    </div>
  );
}

export const GrabIDGlobalLogin = compose(
  connect(
    () => ({}),
    dispatch => ({
      clearCredentials: () =>
        dispatch(CommonActionCreators.triggerClearCredentials())
    })
  )
)(PrivateGrabIDGlobalLogin);

// ############################## GRABID TRIGGER ##############################

const grabidDescription = `
GrabID flow is as follows:
- Authorize with user's consent for permission to access user information. A
browser popup will appear with the authentication/consent screens.
- Handle authorize result with a redirect page. GrabID will give back 
**code** and **state**.
- Use **code** and **state** to perform token request. Depending on whether the 
access token POP is required, this call can be from client (no need for 
**clientSecret**) or server (need for **clientSecret**).

In the case of partners, upon redirection to partner website (after user is
shown the consent screen and has given consent), the partner will receive an
**id_token**, which is a JSON Web Token (JWT) containing information of the
logged in user. This **id_token** can then be used to request of the 
authorization token like so:

${"```javascript"}
grabIDClient.makeAuthorizationRequest(null, id_token)
${"```"}
`;

function PrivateGrabIDLogin({
  accessToken,
  clientID,
  clientSecret,
  currentStage,
  code,
  idToken,
  popRequired,
  scopes,
  stageDescription,
  state,
  makeAuthorizationRequest,
  makeTokenRequest,
  setClientID,
  setClientSecret
}) {
  return (
    <div className="grabid-container">
      <div className="intro-title">{`Stage ${currentStage}: GrabID`}</div>

      <div className="stage-description">
        <Markdown className="source-code" source={grabidDescription} />
        {!!stageDescription && stageDescription}
      </div>

      <div className="divider" />
      <div className="title">Client ID</div>

      <input
        onChange={({ target: { value } }) => setClientID(value)}
        placeholder="Enter your client ID"
        spellCheck={false}
        value={clientID}
      />

      {!!popRequired && (
        <>
          <div className="title">Client secret</div>

          <input
            onChange={({ target: { value } }) => setClientSecret(value)}
            placeholder="Enter your client secret"
            spellCheck={false}
            value={clientSecret}
          />
        </>
      )}

      <div className="title">Requested scopes</div>

      <div className="scope-container">
        {["openid"]
          .concat(scopes)
          .filter(scope => !!scope)
          .map(scope => (
            <div className="scope" key={scope}>
              <div className="internal">{scope}</div>
            </div>
          ))}
      </div>

      <div className="authorize" onClick={makeAuthorizationRequest}>
        Authorize
      </div>

      {!!code && !!state && (
        <>
          <div className="divider" />
          <div className="title">Code</div>
          <input disabled spellCheck={false} readOnly value={code} />
          <div className="title">State</div>
          <input disabled spellCheck={false} readOnly value={state} />

          {!!accessToken && !!idToken && (
            <>
              <div className="title">Access token</div>
              <input disabled spellCheck={false} readOnly value={accessToken} />
              <div className="title">ID token</div>
              <input disabled spellCheck={false} readOnly value={idToken} />
            </>
          )}

          <div className="request-token" onClick={makeTokenRequest}>
            Request token
          </div>
        </>
      )}
    </div>
  );
}

export const GrabIDLogin = compose(
  connect(
    ({
      grabid: { accessToken, clientID, clientSecret, code, idToken, state }
    }) => ({
      accessToken,
      clientID,
      clientSecret,
      code,
      idToken,
      state
    }),
    (dispatch, { scopes, makeAuthorizationRequest, makeTokenRequest }) => ({
      setClientID: clientID =>
        dispatch(GrabIDActionCreators.setClientID(clientID)),
      setClientSecret: clientSecret =>
        dispatch(GrabIDActionCreators.setClientSecret(clientSecret)),
      makeAuthorizationRequest: () =>
        /**
         * If makeAuthorizationRequest is specified in props, do not override
         * it, e.g. GrabPay requires additional query parameters.
         */
        !!makeAuthorizationRequest
          ? makeAuthorizationRequest(scopes)
          : dispatch(GrabIDActionCreators.nonPOP.triggerAuthorize(scopes)),
      makeTokenRequest: () =>
        /**
         * If makeTokenRequest is specified in props, do not override it, e.g.
         * GrabPay requires additional query parameters.
         */
        !!makeTokenRequest
          ? makeTokenRequest(scopes)
          : dispatch(GrabIDActionCreators.nonPOP.triggerRequestToken(scopes))
    })
  )
)(PrivateGrabIDLogin);

// ############################# GRABID REDIRECT #############################

function PrivateGrabIDRedirect({ returnPath }) {
  return (
    <div className="grabid-redirect-container">
      You are being redirected...
      {!!returnPath && <Redirect to={returnPath} />}
    </div>
  );
}

export const GrabIDRedirect = compose(
  mapProps(({ location: { search } }) => parse(search.slice(1))),
  connect(
    ({ grabid: { returnPath } }) => ({ returnPath }),
    (dispatch, { code, state }) => ({
      handleGrabIDRedirect: () =>
        dispatch(GrabIDActionCreators.triggerHandleGrabIDRedirect()),
      setCode: () => dispatch(GrabIDActionCreators.setCode(code)),
      setState: () => dispatch(GrabIDActionCreators.setState(state))
    })
  ),
  lifecycle({
    componentDidMount() {
      this.props.setCode();
      this.props.setState();
      this.props.handleGrabIDRedirect();
    }
  })
)(PrivateGrabIDRedirect);
