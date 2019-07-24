import React from "react";
import { connect } from "react-redux";
import { compose, withState, lifecycle } from "recompose";
import { ConfigurationActionCreators } from "redux/action/configuration";
import "./style.scss";

// ########################### General configuration ###########################

function PrivateGeneralConfiguration({
  clientID = "",
  clientSecret = "",
  partnerHMACSecret = "",
  partnerID = "",
  saveConfiguration,
  setClientID,
  setClientSecret,
  setPartnerHMACSecret,
  setPartnerID
}) {
  return (
    <div className="general-configuration-container">
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

      <div className="confirm-configuration" onClick={saveConfiguration}>
        Confirm
      </div>
    </div>
  );
}

const GeneralConfiguration = compose(
  connect(
    ({ configuration }) => configuration,
    dispatch => ({
      setClientID: clientID =>
        dispatch(ConfigurationActionCreators.setClientID(clientID)),
      setClientSecret: clientSecret =>
        dispatch(ConfigurationActionCreators.setClientSecret(clientSecret)),
      setCurrency: currency =>
        dispatch(ConfigurationActionCreators.setCurrency(currency)),
      setMerchantID: merchantID =>
        dispatch(ConfigurationActionCreators.setMerchantID(merchantID)),
      setPartnerHMACSecret: hmacSecret =>
        dispatch(ConfigurationActionCreators.setPartnerHMACSecret(hmacSecret)),
      setPartnerID: partnerID =>
        dispatch(ConfigurationActionCreators.setPartnerID(partnerID))
    })
  )
)(PrivateGeneralConfiguration);

// ########################### GrabPay configuration ###########################

function PrivateGrabPayConfiguration({
  currency = "",
  merchantID = "",
  closeConfiguration,
  saveConfiguration,
  setCurrency,
  setMerchantID
}) {
  return (
    <div className="grabpay-configuration-container">
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

      <div className="confirm-configuration" onClick={saveConfiguration}>
        Confirm
      </div>
    </div>
  );
}

const GrabPayConfiguration = compose(
  connect(
    ({ configuration }) => configuration,
    dispatch => ({
      setCurrency: currency =>
        dispatch(ConfigurationActionCreators.setCurrency(currency)),
      setMerchantID: merchantID =>
        dispatch(ConfigurationActionCreators.setMerchantID(merchantID))
    })
  )
)(PrivateGrabPayConfiguration);

// ############################ All configuration ############################

function PrivateConfiguration({
  configurationType = "general",
  saveConfiguration,
  setConfigurationType
}) {
  return (
    <div className="configuration-container">
      <div className="type-switcher">
        <div
          className="general-switch"
          onClick={() => setConfigurationType("general")}
        >
          General
        </div>

        <div className="divider" />

        <div
          className="grabpay-switch"
          onClick={() => setConfigurationType("grabpay")}
        >
          GrabPay
        </div>
      </div>

      {configurationType === "general" && (
        <GeneralConfiguration saveConfiguration={saveConfiguration} />
      )}

      {configurationType === "grabpay" && (
        <GrabPayConfiguration saveConfiguration={saveConfiguration} />
      )}
    </div>
  );
}

export default compose(
  connect(
    () => ({}),
    (dispatch, { closeConfiguration }) => ({
      saveConfiguration: () => {
        dispatch(ConfigurationActionCreators.triggerSaveConfiguration());
        closeConfiguration();
      }
    })
  ),
  withState("configurationType", "setConfigurationType", "general"),
  lifecycle(
    (() => {
      let keyHandler = null;

      return {
        componentDidMount() {
          keyHandler = ({ key }) => {
            switch (key) {
              case "ArrowLeft":
                this.props.setConfigurationType("general");
                break;

              case "ArrowRight":
                this.props.setConfigurationType("grabpay");
                break;

              case "Enter":
                this.props.saveConfiguration();
                break;

              case "Escape":
                this.props.closeConfiguration();
                break;

              default:
                break;
            }
          };

          document.addEventListener("keydown", keyHandler, false);
        },
        componentWillUnmount() {
          document.removeEventListener("keydown", keyHandler, false);
        }
      };
    })()
  )
)(PrivateConfiguration);
