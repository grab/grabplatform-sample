import React from "react";
import "./style.scss";

function PrivateConfiguration({
  clientID,
  clientSecret,
  partnerHMACSecret,
  partnerID,
  setClientID,
  setClientSecret,
  setPartnerHMACSecret,
  setPartnerID
}) {
  return (
    <div className="configuration-container" onClick={e => e.stopPropagation()}>
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
    </div>
  );
}

export default PrivateConfiguration;
