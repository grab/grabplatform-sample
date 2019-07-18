/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { parse } from "querystring";
import React from "react";
import { connect } from "react-redux";
import { Redirect } from "react-router-dom";
import { compose, lifecycle, mapProps, withState } from "recompose";
import { GrabIDActionCreators } from "redux/action/grabid";
import { GrabPayActionCreators } from "redux/action/grabpay";
import "./style.scss";

function PrivateGrabPay({
  currency,
  currentProductStage,
  merchantID,
  partnerHMACSecret,
  partnerID,
  setCurrency,
  setMerchantID,
  setPartnerHMACSecret,
  setPartnerID
}) {
  return (
    <div className="grabpay-container">
      <div className="intro-title">{`Stage ${currentProductStage}: GrabPay`}</div>
      <div className="title">Partner ID</div>

      <input
        onChange={({ target: { value } }) => setPartnerID(value)}
        placeholder="Enter your partner ID"
        spellCheck={false}
        value={partnerID}
      />

      <div className="title">Partner HMAC secret</div>

      <input
        onChange={({ target: { value } }) => setPartnerHMACSecret(value)}
        placeholder="Enter your partner HMAC secret"
        spellCheck={false}
        value={partnerHMACSecret}
      />

      <div className="title">Merchant ID</div>

      <input
        onChange={({ target: { value } }) => setMerchantID(value)}
        placeholder="Enter your merchant ID"
        spellCheck={false}
        value={merchantID}
      />

      <div className="title">Currency</div>

      <input
        onChange={({ target: { value } }) => setCurrency(value)}
        placeholder="Enter your currency code"
        spellCheck={false}
        value={currency}
      />
    </div>
  );
}

export const GrabPay = compose(
  connect(
    ({ grabpay: { currency, merchantID, partnerHMACSecret, partnerID } }) => ({
      currency,
      merchantID,
      partnerHMACSecret,
      partnerID
    }),
    dispatch => ({
      setCurrency: currency =>
        dispatch(GrabPayActionCreators.setCurrency(currency)),
      setMerchantID: merchantID =>
        dispatch(GrabPayActionCreators.setMerchantID(merchantID)),
      setPartnerHMACSecret: hmac =>
        dispatch(GrabPayActionCreators.setPartnerHMACSecret(hmac)),
      setPartnerID: partnerID =>
        dispatch(GrabPayActionCreators.setPartnerID(partnerID))
    })
  )
)(PrivateGrabPay);

function PrivateGrabPayRedirect({ returnURI }) {
  return (
    <div className="grabpay-redirect-container">
      You are being redirected...
      {!!returnURI && <Redirect to={returnURI} />}
    </div>
  );
}

export const GrabPayRedirect = compose(
  mapProps(({ location: { search } }) => parse(search.slice(1))),
  connect(
    ({
      repository: {
        grabid: { getLoginReturnURI }
      }
    }) => ({ getLoginReturnURI }),
    dispatch => ({
      handleGrabPayRedirect: () =>
        dispatch(GrabIDActionCreators.triggerHandleGrabIDRedirect())
    })
  ),
  withState("returnURI", "setReturnURI", ""),
  lifecycle({
    async componentDidMount() {
      const {
        getLoginReturnURI,
        handleGrabPayRedirect,
        setReturnURI
      } = this.props;

      handleGrabPayRedirect();
      const returnURI = await getLoginReturnURI();
      setReturnURI(returnURI);
    }
  })
)(PrivateGrabPayRedirect);
