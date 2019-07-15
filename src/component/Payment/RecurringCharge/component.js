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
import { GrabIDActionCreators } from "redux/action/grabid";
import { GrabPayActionCreators } from "redux/action/grabpay";
import "./style.scss";

const bindDescription = `
We first need to generate a partner transaction ID (partnerTxID):

${partnerTxIDDescription}

Authorization is HMAC:

${hmacDescription}

Then the bind endpoint is invoked like so (notice the request body used to
generate the HMAC):

${"```javascript"}
async (
  { body: { countryCode, partnerHMACSecret, partnerID } },
  res
) => {
  const partnerTxID = await generatePartnerTransactionID();
  const requestBody = { countryCode, partnerTxID };
  const timestamp = new Date().toUTCString();

  const hmacDigest = await generateHMACSignature({
    httpMethod: "POST",
    contentType: "application/json",
    partnerHMACSecret,
    requestBody,
    requestURL: "/grabpay/partner/v2/bind",
    timestamp
  });

  const { data, status } = await client.post(
    "/grabpay/partner/v2/bind",
    requestBody,
    {
      "Content-Type": "application/json",
      Authorization: ${"`"}${"$"}{partnerID}:${"$"}{hmacDigest}${"`"},
      Date: timestamp
    }
  );

  res.status(status).json({ ...data, partnerTxID });
}
${"```"}
            
This call will give us back:
- **request**: The request body that will need to be passed to GrabID to authorize the charge.

Please store the partnerTxID somewhere because you will need it later to charge
the user.
`;

const chargeDescription = `
After we get the OAuth access token from GrabID, we need to generate another
HMAC with it:

${xgidAuthPOPDescription}

This HMAC will be used as an extra header for the charge:

${"```javascript"}
async (
  {
    body: {
      amount,
      clientSecret,
      currency,
      description,
      merchantID,
      partnerGroupTxID,
      partnerTxID
    },
    headers: { authorization }
  },
  res
) => {
  const requestBody = {
    partnerGroupTxID,
    partnerTxID,
    currency,
    amount,
    description,
    merchantID
  };

  const date = new Date();

  const hmac = await generateHMACForXGIDAUXPOP({
    authorization,
    clientSecret,
    date
  });

  const { data, status } = await client.post(
    "/grabpay/partner/v2/charge",
    requestBody,
    {
      "Content-Type": "application/json",
      "X-GID-AUX-POP": hmac,
      Authorization: authorization,
      Date: date.toUTCString()
    }
  );

  res.status(status).json(data);
}
${"```"}

The wallet check only works after you've done the binding:

${"```javascript"}
async (
  { body: { clientSecret, currency }, headers: { authorization } },
  res
) => {
  const date = new Date();

  const hmac = await generateHMACForXGIDAUXPOP({
    authorization,
    clientSecret,
    date
  });

  const { data, status } = await client.get(
    ${"`"}/grabpay/partner/v2/wallet/info?currency=${"$"}{currency}${"`"},
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

const unbindDescription = `
There is no **unbind** endpoint - to unbind, you simply fire a DELETE request
to the bind endpoint with the necessary credentials:

${"```javascript"}
async (
  { body: { clientSecret, partnerTxID }, headers: { authorization } },
  res
) => {
  const date = new Date();

  const hmac = await generateHMACForXGIDAUXPOP({
    authorization,
    clientSecret,
    date
  });

  const { status } = await client.delete(
    "/grabpay/partner/v2/bind",
    { partnerTxID },
    {
      "Content-Type": "application/json",
      "X-GID-AUX-POP": hmac,
      Authorization: authorization,
      Date: date.toUTCString()
    }
  );

  res.status(status).json({});
}
${"```"}
`;

function RecurringCharge({
  currentStage,
  balance,
  cardImage,
  currency,
  request,
  status,
  bindCharge,
  chargeUser,
  checkWallet,
  makeAuthorizationRequest,
  makeTokenRequest,
  unbindCharge
}) {
  return (
    <div className="recurring-charge-container">
      {currentStage >= Stage.ONE && <GrabPay currentStage={1} />}

      {currentStage >= Stage.TWO && (
        <div className="bind-container">
          <div className="intro-title">Stage 2: Bind</div>

          <div className="stage-description">
            <Markdown className="source-code" source={bindDescription} />
          </div>

          <div className="divider" />
          <div className="title">Endpoint</div>
          <input disabled readOnly value={"POST /grabpay/partner/v2/bind"} />

          {!!request && (
            <>
              <div className="title">Charge request</div>
              <input disabled readOnly spellCheck={false} value={request} />
            </>
          )}

          <div className="bind-charge" onClick={bindCharge}>
            Bind
          </div>
        </div>
      )}

      {currentStage >= Stage.THREE && (
        <GrabID
          currentStage={3}
          makeAuthorizationRequest={makeAuthorizationRequest}
          makeTokenRequest={makeTokenRequest}
          popRequired
          stageDescription={
            <Markdown className="source-code" source={grabidDescription} />
          }
        />
      )}

      {currentStage >= Stage.FOUR && (
        <div className="charge-container">
          <div className="intro-title">Stage 4: Charge user</div>

          <div className="stage-description">
            <Markdown className="source-code" source={chargeDescription} />
          </div>

          <div className="divider" />

          <div className="title">Endpoint</div>

          <input
            disabled
            readOnly
            value={"GET /grabpay/partner/v2/wallet/info?currency=currency"}
          />

          {!!balance && !!cardImage && (
            <>
              <div className="title">Balance</div>
              <input disabled readOnly value={balance} />
              <div className="title">currency</div>
              <input disabled readOnly value={currency} />
            </>
          )}

          <div className="check-wallet" onClick={checkWallet}>
            Check wallet
          </div>

          <div className="divider" />
          <div className="title">Endpoint</div>

          <input
            disabled
            readOnly
            value={"POST /grabpay/partner/v2/wallet/info"}
          />

          <Transaction />
          <div className="title">Transaction status</div>

          <div className="transaction-status">
            <b>{status || "unconfirmed"}</b>
          </div>

          <div className="confirm-charge" onClick={chargeUser}>
            Charge user
          </div>
        </div>
      )}

      {currentStage >= Stage.FOUR && (
        <div className="unbind-container">
          <div className="intro-title">Stage 5: Unbind charge</div>

          <div className="stage-description">
            <Markdown className="source-code" source={unbindDescription} />
          </div>

          <div className="divider" />
          <div className="title">Endpoint</div>
          <input disabled readOnly value={"DELETE /grabpay/partner/v2/bind"} />

          <div className="unbind-charge" onClick={unbindCharge}>
            Unbind
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
        transaction: { status },
        wallet: { balance, cardImage, currency }
      }
    }) => ({
      balance,
      cardImage,
      currency,
      request,
      status,
      isBindSatisfied: !!request
    }),
    dispatch => ({
      bindCharge: () =>
        dispatch(GrabPayActionCreators.RecurringCharge.triggerBind()),
      chargeUser: () =>
        dispatch(GrabPayActionCreators.RecurringCharge.triggerCharge()),
      checkWallet: () => dispatch(GrabPayActionCreators.triggerCheckWallet()),
      makeAuthorizationRequest: () =>
        dispatch(GrabPayActionCreators.triggerMakeAuthorizationRequest()),
      makeTokenRequest: () =>
        dispatch(GrabPayActionCreators.triggerMakeTokenRequest()),
      setScopes: scopes => dispatch(GrabIDActionCreators.setScopes(scopes)),
      unbindCharge: () =>
        dispatch(GrabPayActionCreators.RecurringCharge.triggerUnbind())
    })
  ),
  mapProps(({ isGrabPaySatisfied, ...rest }) => ({
    ...rest,
    currentStage: Stage.ONE + !!isGrabPaySatisfied
  })),
  mapProps(({ currentStage, isBindSatisfied, ...rest }) => ({
    ...rest,
    currentStage: currentStage + !!isBindSatisfied
  })),
  mapProps(({ currentStage, isGrabIDSatisfied, ...rest }) => ({
    ...rest,
    currentStage: currentStage + !!isGrabIDSatisfied
  })),
  lifecycle({
    componentDidMount() {
      this.props.setScopes([
        "payment.recurring_charge",
        "payment.online_acceptance"
      ]);
    }
  })
)(RecurringCharge);
