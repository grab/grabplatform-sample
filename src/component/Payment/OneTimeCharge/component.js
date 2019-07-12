/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import {
  grabIDHandlerHOC,
  grabPayHandlerHOC,
  Stage
} from "component/custom-hoc";
import { GrabID } from "component/GrabID/component";
import { GrabPay } from "component/GrabPay/component";
import {
  grabidDescription,
  hmacDescription,
  partnerTxIDDescription,
  xgidAuthPOPDescription
} from "component/Payment/description";
import Transaction from "component/Payment/Transaction/component";
import React from "react";
import Markdown from "react-markdown";
import { connect } from "react-redux";
import { compose, lifecycle, mapProps } from "recompose";
import { GrabIDActionCreators, GrabPayActionCreators } from "redux/action";
import "./style.scss";

const initDescription = `
We first need to generate a partner transaction ID (partnerTxID):

${partnerTxIDDescription}

Authorization is HMAC:

${hmacDescription}

Then the init endpoint is invoked like so (notice the request body used to
generate the HMAC):

${"```javascript"}
async (
  {
    body: {
      amount,
      currency,
      description,
      merchantID,
      partnerGroupTxID,
      partnerHMACSecret,
      partnerID
    }
  },
  res
) => {
  const partnerTxID = await generatePartnerTransactionID();

  const requestBody = {
    partnerGroupTxID,
    partnerTxID,
    currency,
    amount,
    description,
    merchantID
  };

  const timestamp = new Date().toUTCString();

  const hmacDigest = await generateHMACSignature({
    httpMethod: "POST",
    contentType: "application/json",
    partnerHMACSecret,
    requestBody,
    requestURL: "/grabpay/partner/v2/charge/init",
    timestamp
  });

  const { data, status } = await client.post(
    "/grabpay/partner/v2/charge/init",
    requestBody,
    {
      "Content-Type": "application/json",
      Authorization: ${"`"}${"$"}{partnerID}:${"$"}{hmacDigest}${"`"},
      Date: timestamp
    }
  );

  res.status(status).json(data);
}
${"```"}
            
This call will give us back:
- **partnerTxID**: The same transaction ID generated above.
- **request**: The request body that will need to be passed to GrabID to authorize the charge.
`;

const confirmDescription = `
After we get the OAuth access token from GrabID, we need to generate another
HMAC with it:

${xgidAuthPOPDescription}

This HMAC will be used as an extra header for the confirmation:

${"```javascript"}
async ({
  body: { clientSecret, partnerTxID }, headers: { authorization } }, 
  res
) => {
  const date = new Date();
  
  const hmac = await generateHMACForXGIDAUXPOP({
    authorization,
    clientSecret,
    date
  });

  const { data, status } = await client.post(
    "/grabpay/partner/v2/charge/complete",
    { partnerTxID },
    {
      Authorization: authorization,
      "X-GID-AUX-POP": hmac,
      Date: date.toUTCString()
    }
  );

  res.status(status).json(data);
}
${"```"}
`;

function PrivateOneTimeCharge({
  currentStage,
  request,
  status,
  confirmOneTimeCharge,
  initOneTimeCharge,
  makeAuthorizationRequest,
  makeTokenRequest
}) {
  return (
    <div className="one-time-charge-container">
      {currentStage >= Stage.ONE && <GrabPay currentStage={1} />}

      {currentStage >= Stage.TWO && (
        <div className="init-charge-container">
          <div className="intro-title">Stage 2: Init charge</div>

          <div className="stage-description">
            <Markdown className="source-code" source={initDescription} />
          </div>

          <div className="divider" />
          <div className="title">Endpoint</div>

          <input
            disabled
            readOnly
            value={"POST /grabpay/partner/v2/charge/init"}
          />

          <Transaction />

          {!!request && (
            <>
              <div className="title">Charge request</div>
              <input disabled readOnly spellCheck={false} value={request} />
            </>
          )}

          <div className="init-charge" onClick={initOneTimeCharge}>
            Init transaction
          </div>
        </div>
      )}

      {currentStage >= Stage.THREE && (
        <GrabID
          currentStage={3}
          makeAuthorizationRequest={makeAuthorizationRequest}
          makeTokenRequest={makeTokenRequest}
          stageDescription={
            <Markdown className="source-code" source={grabidDescription} />
          }
        />
      )}

      {currentStage >= Stage.FOUR && (
        <div className="confirm-charge-container">
          <div className="intro-title">Stage 4: Confirm charge</div>

          <div className="stage-description">
            <Markdown className="source-code" source={confirmDescription} />
          </div>

          <div className="divider" />
          <div className="title">Endpoint</div>

          <input
            disabled
            readOnly
            value={"POST /grabpay/partner/v2/charge/complete"}
          />

          <div className="title">Transaction status</div>

          <div className="transaction-status">
            <b>{status || "unconfirmed"}</b>
          </div>

          <div className="confirm-charge" onClick={confirmOneTimeCharge}>
            Confirm transaction
          </div>
        </div>
      )}
    </div>
  );
}

export default compose(
  grabIDHandlerHOC(),
  grabPayHandlerHOC(),
  connect(
    ({
      grabpay: {
        request,
        transaction: { partnerTxID, status }
      }
    }) => ({ request, status, isInitSatisfied: !!partnerTxID && !!request }),
    dispatch => ({
      confirmOneTimeCharge: () =>
        dispatch(GrabPayActionCreators.OneTimeCharge.triggerConfirm()),
      initOneTimeCharge: () =>
        dispatch(GrabPayActionCreators.OneTimeCharge.triggerInit()),
      makeAuthorizationRequest: () =>
        dispatch(GrabPayActionCreators.triggerMakeAuthorizationRequest()),
      makeTokenRequest: () =>
        dispatch(GrabPayActionCreators.triggerMakeTokenRequest()),
      setScopes: scopes => dispatch(GrabIDActionCreators.setScopes(scopes))
    })
  ),
  mapProps(({ isGrabPaySatisfied, ...rest }) => ({
    ...rest,
    currentStage: Stage.ONE + !!isGrabPaySatisfied
  })),
  mapProps(({ isInitSatisfied, currentStage, ...rest }) => ({
    ...rest,
    currentStage: currentStage + !!isInitSatisfied
  })),
  mapProps(({ isGrabIDSatisfied, currentStage, ...rest }) => ({
    ...rest,
    currentStage: currentStage + !!isGrabIDSatisfied
  })),
  lifecycle({
    componentDidMount() {
      this.props.setScopes([
        "payment.one_time_charge",
        "payment.online_acceptance"
      ]);
    }
  })
)(PrivateOneTimeCharge);
