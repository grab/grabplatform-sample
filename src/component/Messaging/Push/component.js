/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { handleErrorHOC, handleMessageHOC } from "component/customHOC";
import { GrabIDLogin } from "component/GrabID/component";
import StageSwitcher from "component/StageSwitcher/component";
import React from "react";
import { connect } from "react-redux";
import { compose, withProps, withState } from "recompose";
import { CommonMessages } from "redux/action/common";
import "./style.scss";

function PrivateInbox({
  currentStage,
  messageID,
  sendPushMessage,
  setCurrentStage
}) {
  return (
    <div className="basic-push-container">
      <StageSwitcher
        currentStage={currentStage}
        setStage={setCurrentStage}
        stageCount={2}
      />

      {currentStage === 0 && (
        <GrabIDLogin
          currentProductStageFlow={1}
          scopes={["message.notifications"]}
        />
      )}

      {currentStage === 1 && (
        <div className="main-container">
          <div className="intro-title">Stage 2: Push</div>
          <div className="title">Endpoint</div>
          <input disabled readOnly value={"GET /message/v1/push"} />

          {!!messageID && (
            <>
              <div className="title">Message ID</div>
              <input disabled readOnly value={messageID} />
            </>
          )}

          <div className="send-push" onClick={sendPushMessage}>
            Send push message
          </div>
        </div>
      )}
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
  withState("currentStage", "setCurrentStage", 0),
  withState("messageID", "setMessageID", ""),
  withProps(
    ({
      configuration: { partnerHMACSecret, partnerID },
      handleError,
      sendPushMessage,
      handleMessage,
      setMessageID
    }) => ({
      sendPushMessage: handleError(async () => {
        const { messageID } = await sendPushMessage({
          partnerHMACSecret,
          partnerID
        });

        setMessageID(messageID);
        handleMessage(CommonMessages.messaging.push);
      })
    })
  )
)(PrivateInbox);
