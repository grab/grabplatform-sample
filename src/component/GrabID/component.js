/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import GrabID from "@grab-id/grab-id-client";
import {
  copyToClipboardHOC,
  handleErrorHOC,
  handleMessageHOC
} from "component/customHOC";
import Documentation from "component/Documentation/component";
import { parse } from "querystring";
import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { compose, lifecycle, withProps, withState } from "recompose";
import { CommonMessages } from "redux/action/common";
import {
  authorizeGrabIDFromClient,
  getRelativeURLPath,
  GRABID_AUTHORIZATION_CODE_KEY,
  requestGrabIDTokenFromClient
} from "utils";
import "./style.scss";

// ############################## GRABID AUTH ##############################

const grabidDescription = `
The normal GrabID flow is as follows:
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
logged in user. This **id_token** can then be used to request the 
authorization token like so:

${"```javascript"}
grabIDClient.makeAuthorizationRequest(null, id_token)
${"```"}
`;

function PrivateGrabIDLogin({
  accessToken,
  copyToClipboard,
  currentProductStageFlow,
  idToken,
  popRequired,
  scopes,
  stageDescription,
  state,
  makeAuthorizationRequest,
  makeTokenRequest
}) {
  return (
    <div className="grabid-container">
      <div className="intro-title">{`Stage ${currentProductStageFlow}: GrabID`}</div>

      <div className="stage-description">
        <Documentation className="source-code" source={grabidDescription} />
        {!!stageDescription && stageDescription}
      </div>

      <>
        <div className="divider" />
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

        <div
          className="authorize"
          onClick={() => makeAuthorizationRequest(scopes)}
        >
          Authorize
        </div>
      </>

      <>
        <div className="divider" />
        <div className="title">State</div>
        <input disabled spellCheck={false} readOnly value={state} />
      </>

      {!popRequired && (
        <>
          <div className="title">Access token</div>

          <div
            className="long-content"
            onClick={() => copyToClipboard(accessToken)}
          >
            {accessToken}
          </div>

          <div className="title">ID token</div>

          <div
            className="long-content"
            onClick={() => copyToClipboard(idToken)}
          >
            {idToken}
          </div>
        </>
      )}

      <>
        <div className="request-token" onClick={() => makeTokenRequest(scopes)}>
          Request token
        </div>
      </>
    </div>
  );
}

export const GrabIDLogin = compose(
  handleMessageHOC(),
  handleErrorHOC(),
  copyToClipboardHOC(),
  connect(
    (
      { configuration: { clientID, countryCode } },
      {
        handleError,
        handleMessage,
        makeAuthorizationRequest = handleError(async scopes => {
          await authorizeGrabIDFromClient({
            clientID,
            countryCode,
            scopes
          });
        }),
        makeTokenRequest = handleError(async scopes => {
          await requestGrabIDTokenFromClient({
            clientID,
            countryCode,
            scopes
          });

          window.location.reload();
          handleMessage(CommonMessages.grabid.requestToken);
        })
      }
    ) => ({ makeAuthorizationRequest, makeTokenRequest })
  ),
  withState("accessToken", "setAccessToken", ""),
  withState("idToken", "setIDToken", ""),
  withState("state", "setState", ""),
  lifecycle({
    async componentDidMount() {
      const { setAccessToken, setIDToken, setState } = this.props;
      const { accessToken, idToken, state } = GrabID.getResult();
      setAccessToken(accessToken || "");
      setIDToken(idToken || "");
      setState(state || "");
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

export const GrabIDNonPOPRedirect = compose(
  handleErrorHOC(),
  withState("returnURI", "setReturnURI", ""),
  lifecycle({
    async componentDidMount() {
      const { setReturnURI } = this.props;
      GrabID.handleAuthorizationCodeFlowResponse();
      const fullReturnURI = GrabID.getLoginReturnURI();
      const relativeReturnURI = getRelativeURLPath(fullReturnURI);
      setReturnURI(relativeReturnURI);
    }
  })
)(PrivateGrabIDRedirect);

export const GrabIDPOPRedirect = compose(
  withProps(({ location: { search } }) => parse(search.substr(1))),
  handleErrorHOC(),
  withState("returnURI", "setReturnURI", ""),
  lifecycle({
    async componentDidMount() {
      const { code, setReturnURI } = this.props;
      window.localStorage.setItem(GRABID_AUTHORIZATION_CODE_KEY, code);
      const fullReturnURI = GrabID.getLoginReturnURI();
      const relativeReturnURI = getRelativeURLPath(fullReturnURI);
      setReturnURI(relativeReturnURI);
    }
  })
)(PrivateGrabIDRedirect);
