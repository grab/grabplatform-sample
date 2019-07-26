/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { handleErrorHOC, handleMessageHOC } from "component/customHOC";
import { GrabIDLogin } from "component/GrabID/component";
import Template from "component/Messaging/Template/component";
import StageSwitcher from "component/StageSwitcher/component";
import React from "react";
import { connect } from "react-redux";
import { compose, withProps, withState } from "recompose";
import { CommonMessages } from "redux/action/common";
import { environment } from "utils";
import "./style.scss";

const templates = (function() {
  const isProduction = environment() === "production";

  return {
    [!!isProduction
      ? "7aaa43b5-e27a-4d08-a349-425b372610cd"
      : "de9ff743-1c20-4776-a3fa-fc5ae291c61a"]: {
      name: { readonly: true, value: "Simple Push with Title, Message Body" },
      title: { value: "" },
      message: { value: "" }
    },
    [!!isProduction
      ? "47ba1130-8af8-42b5-bb1e-82b572c88c64"
      : "50dbd761-be63-4e04-a311-c1075d583a16"]: {
      name: {
        readonly: true,
        value: "Simple Push with Title, Subtitle, Message Body"
      },
      title: { value: "" },
      subtitle: { value: "" },
      message: { value: "" }
    }
  };
})();

function PrivateInbox({
  currentStage,
  messageID,
  templateID,
  templateParams,
  sendPushMessage,
  setCurrentStage,
  setTemplateID,
  setTemplateParams
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

          <Template
            onTemplateIDChange={setTemplateID}
            onTemplateParamsChange={setTemplateParams}
            templates={templates}
            templateID={templateID}
            templateParams={templateParams}
          />

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
  withState("templateID", "setTemplateID", ""),
  withState("templateParams", "setTemplateParams", {}),
  withState("messageID", "setMessageID", ""),
  withProps(
    ({
      configuration: { partnerHMACSecret, partnerID },
      handleError,
      sendPushMessage,
      handleMessage,
      setMessageID,
      templateID,
      templateParams
    }) => ({
      sendPushMessage: handleError(async () => {
        const { messageID } = await sendPushMessage({
          partnerHMACSecret,
          partnerID,
          templateID,
          templateParams
        });

        setMessageID(messageID);
        handleMessage(CommonMessages.messaging.push);
      })
    })
  )
)(PrivateInbox);
