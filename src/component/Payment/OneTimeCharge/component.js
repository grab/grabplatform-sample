/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { grabidPaymentHOC, stageSwitcherHOC } from "component/customHOC";
import { hmacDescription } from "component/description";
import Documentation from "component/Documentation/component";
import { GrabIDLogin } from "component/GrabID/component";
import {
  grabidDescription,
  partnerTxIDDescription,
  xgidAuthPOPDescription
} from "component/Payment/description";
import Transaction from "component/Payment/Transaction/component";
import StageSwitcher from "component/StageSwitcher/component";
import React from "react";
import { connect } from "react-redux";
import { compose, withProps, withState } from "recompose";
import { CommonMessages } from "redux/action/common";
import "./style.scss";

const initDescription = `
We first need to generate a partner transaction ID (partnerTxID):

${partnerTxIDDescription}

Authorization is HMAC:

${hmacDescription}

Then the init endpoint is invoked like so (notice the request body used to
generate the HMAC):

${"```javascript"}
app.post('...', async (
  { body: { amount, currency, description, partnerGroupTxID }, session },
  res
) => {
  const {
    merchantID,
    partnerHMACSecret,
    partnerID
  } = await dbClient.config.getConfiguration();

  const partnerTxID = await generatePartnerTransactionID();
  amount = parseInt(amount, undefined);

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

  const {
    data: { request, partnerTxID: resultTxID },
    status
  } = await httpClient.post(
    "/grabpay/partner/v2/charge/init",
    requestBody,
    {
      "Content-Type": "application/json",
      Authorization: ${"`"}${"$"}{partnerID}:${"$"}{hmacDigest}${"`"},
      Date: timestamp
    }
  );

  session.partnerTxID = partnerTxID;
  session.request = request;
  res.status(status).json({ request, partnerTxID: resultTxID });
});
${"```"}
            
This call will give us back:
- **partnerTxID**: The same transaction ID generated above.
- **request**: The request body that will need to be passed to GrabID to 
authorize the charge.
`;

const confirmDescription = `
After we get the OAuth access token from GrabID, we need to generate another
HMAC with it:

${xgidAuthPOPDescription}

This HMAC will be used as an extra header for the confirmation:

${"```javascript"}
app.post('...', async ({ session: { partnerTxID, puid } }, res) => { 
  const accessToken = await dbClient.getAccessToken(puid);
  const { clientSecret } = await dbClient.config.getConfiguration();
  const date = new Date();
  
  const hmac = await generateHMACForXGIDAUXPOP({
    accessToken,
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
});
${"```"}
`;

function PrivateOneTimeCharge({
  currentStage,
  partnerTxID,
  request,
  status,
  confirmOneTimeCharge,
  initOneTimeCharge,
  makeAuthorizationRequest,
  makeTokenRequest,
  setCurrentStage
}) {
  return (
    <div className="one-time-charge-container">
      <StageSwitcher
        currentStage={currentStage}
        setStage={setCurrentStage}
        stageCount={3}
      />

      {currentStage === 0 && (
        <div className="init-charge-container">
          <div className="intro-title">Stage 1: Init charge</div>

          <div className="stage-description">
            <Documentation className="source-code" source={initDescription} />
          </div>

          <div className="divider" />
          <div className="title">Endpoint</div>

          <input
            disabled
            readOnly
            value={"POST /grabpay/partner/v2/charge/init"}
          />

          <Transaction partnerTxID={partnerTxID} />

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

      {currentStage === 1 && (
        <GrabIDLogin
          currentProductStageFlow={2}
          makeAuthorizationRequest={makeAuthorizationRequest}
          makeTokenRequest={makeTokenRequest}
          popRequired
          scopes={["payment.one_time_charge", "payment.online_acceptance"]}
          stageDescription={
            <Documentation className="source-code" source={grabidDescription} />
          }
        />
      )}

      {currentStage === 2 && (
        <div className="confirm-charge-container">
          <div className="intro-title">Stage 3: Confirm charge</div>

          <div className="stage-description">
            <Documentation
              className="source-code"
              source={confirmDescription}
            />
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
  grabidPaymentHOC(),
  stageSwitcherHOC(),
  connect(
    ({
      configuration,
      repository: {
        grabpay: {
          oneTimeCharge: {
            init: initOneTimeCharge,
            confirm: confirmOneTimeCharge
          }
        }
      }
    }) => ({
      configuration,
      confirmOneTimeCharge,
      initOneTimeCharge
    })
  ),
  withState("partnerTxID", "setPartnerTxID", ""),
  withState("request", "setRequest", ""),
  withState("status", "setStatus", ""),
  withProps(
    ({
      configuration: {
        currency,
        transaction: { amount, description, partnerGroupTxID }
      },
      handleError,
      handleMessage,
      confirmOneTimeCharge,
      initOneTimeCharge,
      setPartnerTxID,
      setRequest,
      setStatus
    }) => ({
      initOneTimeCharge: handleError(async () => {
        const { partnerTxID, request } = await initOneTimeCharge({
          amount,
          currency,
          description,
          partnerGroupTxID
        });

        setPartnerTxID(partnerTxID);
        setRequest(request);
        handleMessage(CommonMessages.grabpay.oneTimeCharge.init);
      }),
      confirmOneTimeCharge: handleError(async () => {
        const { status } = await confirmOneTimeCharge();
        setStatus(status);
        handleMessage(CommonMessages.grabpay.oneTimeCharge.confirm);
      })
    })
  )
)(PrivateOneTimeCharge);
