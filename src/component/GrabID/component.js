/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { Stage } from "component/custom-hoc";
import { parse } from "querystring";
import React from "react";
import Markdown from "react-markdown";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { compose, lifecycle, mapProps, withState } from "recompose";
import { GrabIDActionCreators } from "redux/action/grabid";
import "./style.scss";

// ############################## GRABID AUTH ##############################

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
  currentProductStageFlow,
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
      <div className="intro-title">{`Stage ${currentProductStageFlow}: GrabID`}</div>

      <div className="stage-description">
        <Markdown className="source-code" source={grabidDescription} />
        {!!stageDescription && stageDescription}
      </div>

      {currentStage >= Stage.ONE && (
        <>
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
        </>
      )}

      {currentStage >= Stage.TWO && (
        <>
          <div className="divider" />
          <div className="title">State</div>
          <input disabled spellCheck={false} readOnly value={state} />
        </>
      )}

      {currentStage >= Stage.THREE && (
        <>
          <div className="title">Access token</div>
          <input disabled spellCheck={false} readOnly value={accessToken} />
          <div className="title">ID token</div>
          <input disabled spellCheck={false} readOnly value={idToken} />
        </>
      )}

      {currentStage >= Stage.TWO && (
        <>
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
      grabid: { clientID, clientSecret },
      repository: {
        grabid: { getGrabIDResult }
      }
    }) => ({
      clientID,
      clientSecret,
      getGrabIDResult
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
  ),
  withState("accessToken", "setAccessToken", ""),
  withState("idToken", "setIDToken", ""),
  withState("state", "setState", ""),
  mapProps(({ state, ...rest }) => ({
    currentStage: Stage.ONE + !!state,
    state,
    ...rest
  })),
  mapProps(({ accessToken, currentStage, idToken, ...rest }) => ({
    accessToken,
    currentStage: currentStage + (!!accessToken && !!idToken),
    idToken,
    ...rest
  })),
  lifecycle({
    async componentDidMount() {
      const {
        getGrabIDResult,
        setAccessToken,
        setIDToken,
        setState
      } = this.props;

      const { accessToken, idToken, state } = await getGrabIDResult();
      setAccessToken(accessToken);
      setIDToken(idToken);
      setState(state);
    }
  })
)(PrivateGrabIDLogin);

// ############################# GRABID REDIRECT #############################

function PrivateGrabIDRedirect({ returnURI }) {
  return (
    <div className="grabid-redirect-container">
      You are being redirected...
      {!!returnURI && <Redirect to={returnURI} />}
    </div>
  );
}

export const GrabIDRedirect = compose(
  mapProps(({ location: { search } }) => parse(search.slice(1))),
  connect(
    ({
      repository: {
        grabid: { getLoginReturnURI }
      }
    }) => ({ getLoginReturnURI }),
    dispatch => ({
      handleGrabIDRedirect: () =>
        dispatch(GrabIDActionCreators.triggerHandleGrabIDRedirect())
    })
  ),
  withState("returnURI", "setReturnURI", ""),
  lifecycle({
    async componentDidMount() {
      const {
        getLoginReturnURI,
        handleGrabIDRedirect,
        setReturnURI
      } = this.props;

      handleGrabIDRedirect();
      const returnURI = await getLoginReturnURI();
      setReturnURI(returnURI);
    }
  })
)(PrivateGrabIDRedirect);
