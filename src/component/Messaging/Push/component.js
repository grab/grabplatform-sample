/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { handleErrorHOC, handleMessageHOC } from "component/customHOC";
import { GrabIDLogin } from "component/GrabID/component";
import React from "react";
import { connect } from "react-redux";
import { compose, withProps, withState } from "recompose";
import { CommonMessages } from "redux/action/common";
import "./style.scss";

function PrivateInbox({ sendPushMessage }) {
  return (
    <div className="basic-push-container">
      <GrabIDLogin
        currentProductStageFlow={1}
        scopes={["message.notifications"]}
      />

      <div className="main-container">
        <div className="intro-title">Stage 2: Push</div>
        <div className="title">Endpoint</div>
        <input disabled readOnly value={"GET /message/v1/push"} />

        <div className="send-push" onClick={sendPushMessage}>
          Send push message
        </div>
      </div>
    </div>
  );
}

export default compose(
  handleMessageHOC(),
  handleErrorHOC(),
  connect(
    ({
      configuration,
      repository: {
        messaging: { sendPushMessage }
      }
    }) => ({ configuration, sendPushMessage })
  ),
  withState("messageID", "setMessageID", ""),
  withProps(
    ({
      configuration: { partnerHMACSecret, partnerID },
      handleError,
      sendPushMessage,
      setMessageID,
      showMessage
    }) => ({
      sendPushMessage: handleError(async () => {
        const { messageID } = await sendPushMessage({
          partnerHMACSecret,
          partnerID
        });

        setMessageID(messageID);
        showMessage(CommonMessages.messaging.push);
      })
    })
  )
)(PrivateInbox);
