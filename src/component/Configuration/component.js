import { handleErrorHOC, handleMessageHOC } from "component/customHOC";
import React from "react";
import { connect } from "react-redux";
import { compose, lifecycle, withState } from "recompose";
import { CommonMessages } from "redux/action/common";
import { ConfigurationActionCreators } from "redux/action/configuration";
import "./style.scss";

// ########################### General configuration ###########################

function PrivateGeneralConfiguration({
  clientID = "",
  clientSecret = "",
  countryCode = "",
  partnerHMACSecret = "",
  partnerID = "",
  persistConfiguration,
  setClientID,
  setClientSecret,
  setCountryCode,
  setPartnerHMACSecret,
  setPartnerID
}) {
  return (
    <div className="general-configuration-container">
      <div className="title">Country Code</div>

      <input
        onChange={({ target: { value } }) => setCountryCode(value)}
        placeholder="Enter country code"
        spellCheck={false}
        value={countryCode}
      />

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

      <div className="confirm-configuration" onClick={persistConfiguration}>
        Confirm
      </div>
    </div>
  );
}

const GeneralConfiguration = compose(
  connect(
    () => ({}),
    dispatch => ({
      setClientID: clientID =>
        dispatch(ConfigurationActionCreators.setClientID(clientID)),
      setClientSecret: clientSecret =>
        dispatch(ConfigurationActionCreators.setClientSecret(clientSecret)),
      setCountryCode: countryCode =>
        dispatch(ConfigurationActionCreators.setCountryCode(countryCode)),
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
  amount = 0,
  description = "",
  currency = "",
  merchantID = "",
  partnerGroupTxID = "",
  persistConfiguration,
  setAmount,
  setCurrency,
  setDescription,
  setMerchantID,
  setPartnerGroupTransactionID
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

      <div className="title">Partner group transaction ID</div>

      <input
        onChange={({ target: { value } }) =>
          setPartnerGroupTransactionID(value)
        }
        placeholder="Enter partner group transaction ID"
        spellCheck={false}
        value={partnerGroupTxID}
      />

      <div className="title">Transaction description</div>

      <input
        onChange={({ target: { value } }) => setDescription(value)}
        placeholder="Enter transaction description"
        spellCheck={false}
        value={description}
      />

      <div className="title">Transaction amount</div>

      <input
        onChange={({ target: { value } }) => setAmount(value)}
        placeholder="Enter transaction amount"
        spellCheck={false}
        value={amount}
      />

      <div className="confirm-configuration" onClick={persistConfiguration}>
        Confirm
      </div>
    </div>
  );
}

const GrabPayConfiguration = compose(
  connect(
    () => ({}),
    dispatch => ({
      setAmount: amount =>
        dispatch(ConfigurationActionCreators.Transaction.setAmount(amount)),
      setCurrency: currency =>
        dispatch(ConfigurationActionCreators.setCurrency(currency)),
      setDescription: description =>
        dispatch(
          ConfigurationActionCreators.Transaction.setDescription(description)
        ),
      setMerchantID: merchantID =>
        dispatch(ConfigurationActionCreators.setMerchantID(merchantID)),
      setPartnerGroupTransactionID: partnerGroupTxID =>
        dispatch(
          ConfigurationActionCreators.Transaction.setPartnerGroupTransactionID(
            partnerGroupTxID
          )
        )
    })
  )
)(PrivateGrabPayConfiguration);

// ############################ All configuration ############################

function PrivateConfiguration({
  configuration,
  configurationType = "general",
  persistConfiguration,
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
        <GeneralConfiguration
          {...configuration}
          persistConfiguration={persistConfiguration}
        />
      )}

      {configurationType === "grabpay" && (
        <GrabPayConfiguration
          {...{ ...configuration, ...configuration.transaction }}
          persistConfiguration={persistConfiguration}
        />
      )}
    </div>
  );
}

export default compose(
  handleMessageHOC(),
  handleErrorHOC(),
  connect(
    (
      { configuration, repository },
      { closeConfiguration, handleError, handleMessage }
    ) => ({
      configuration,
      persistConfiguration: handleError(async () => {
        await repository.configuration.persistConfiguration(configuration);
        closeConfiguration();
        handleMessage(CommonMessages.configuration.setConfiguration);
      })
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
              case "Enter":
                this.props.persistConfiguration();
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
