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

function PrivateInbox({ messageID, sendInboxMessage }) {
  return (
    <div className="basic-inbox-container">
      <GrabIDLogin
        currentProductStageFlow={1}
        scopes={["message.notifications"]}
      />

      <div className="main-container">
        <div className="intro-title">Stage 2: Inbox</div>
        <div className="title">Endpoint</div>
        <input disabled readOnly value={"GET /message/v1/inbox"} />

        {!!messageID && (
          <>
            <div className="title">Message ID</div>
            <input disabled readOnly value={messageID} />
          </>
        )}

        <div className="send-inbox" onClick={sendInboxMessage}>
          Send inbox message
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
        messaging: { sendInboxMessage }
      }
    }) => ({ configuration, sendInboxMessage })
  ),
  withState("messageID", "setMessageID", ""),
  withProps(
    ({
      configuration: { partnerHMACSecret, partnerID },
      handleError,
      sendInboxMessage,
      setMessageID,
      showMessage
    }) => ({
      sendInboxMessage: handleError(async () => {
        const { messageID } = await sendInboxMessage({
          partnerHMACSecret,
          partnerID
        });

        setMessageID(messageID);
        showMessage(CommonMessages.messaging.inbox);
      })
    })
  )
)(PrivateInbox);
