import React from "react";
import { connect } from "react-redux";
import { compose } from "recompose";
import { GrabIDActionCreators } from "redux/action/grabid";
import { GrabPayActionCreators } from "redux/action/grabpay";
import "./style.scss";

function PrivateConfiguration({
  clientID,
  clientSecret,
  currency,
  merchantID,
  partnerHMACSecret,
  partnerID,
  confirmConfiguration,
  setClientID,
  setClientSecret,
  setCurrency,
  setMerchantID,
  setPartnerHMACSecret,
  setPartnerID
}) {
  return (
    <div className="configuration-container">
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

      <div className="title">Client ID</div>

      <input
        onChange={({ target: { value } }) => setClientID(value)}
        placeholder="Enter your client ID"
        spellCheck={false}
        value={clientID}
      />

      <div className="title">Client secret</div>

      <input
        onChange={({ target: { value } }) => setClientSecret(value)}
        placeholder="Enter your client secret"
        spellCheck={false}
        value={clientSecret}
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

      <div className="confirm-configuration" onClick={confirmConfiguration}>
        Done
      </div>
    </div>
  );
}

export default compose(
  connect(
    ({
      grabid: { clientID, clientSecret, partnerHMACSecret, partnerID },
      grabpay: { currency, merchantID }
    }) => ({
      clientID,
      clientSecret,
      currency,
      partnerHMACSecret,
      partnerID,
      merchantID
    }),
    dispatch => ({
      setClientID: clientID =>
        dispatch(GrabIDActionCreators.setClientID(clientID)),
      setClientSecret: clientSecret =>
        dispatch(GrabIDActionCreators.setClientSecret(clientSecret)),
      setCurrency: currency =>
        dispatch(GrabPayActionCreators.setCurrency(currency)),
      setMerchantID: merchantID =>
        dispatch(GrabPayActionCreators.setMerchantID(merchantID)),
      setPartnerHMACSecret: partnerHMACSecret =>
        dispatch(GrabIDActionCreators.setPartnerHMACSecret(partnerHMACSecret)),
      setPartnerID: partnerID =>
        dispatch(GrabIDActionCreators.setPartnerID(partnerID))
    })
  )
)(PrivateConfiguration);
