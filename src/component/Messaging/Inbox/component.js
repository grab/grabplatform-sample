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
      ? "510095c0-c4a6-40f5-b80e-f2b9e69d49e2"
      : "28427675-74b3-427f-96bd-a0f489ffdb25"]: {
      name: { readonly: true, value: "Inbox Message" },
      title: { value: "" },
      subtitle: { value: "" },
      button_link: { value: "" },
      button_text: { value: "" },
      category_icon: { value: "" },
      category: { value: "" },
      code: { value: "" },
      cover_image: { value: "" },
      icon_image: { value: "" },
      message_content: { value: "" },
      message_date: { value: "" },
      message_title: { value: "" },
      min_app_version: { value: "" }
    }
  };
})();

function PrivateInbox({
  currentStage,
  messageID,
  templateID,
  templateParams,
  sendInboxMessage,
  setCurrentStage,
  setTemplateID,
  setTemplateParams
}) {
  return (
    <div className="basic-inbox-container">
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
          <div className="intro-title">Stage 2: Inbox</div>
          <div className="title">Endpoint</div>
          <input disabled readOnly value={"GET /message/v1/inbox"} />

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

          <div className="send-inbox" onClick={sendInboxMessage}>
            Send inbox message
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
        messaging: { sendInboxMessage }
      }
    }) => ({ configuration, sendInboxMessage })
  ),
  withState("currentStage", "setCurrentStage", 0),
  withState("templateID", "setTemplateID", ""),
  withState("templateParams", "setTemplateParams", {}),
  withState("messageID", "setMessageID", ""),
  withProps(
    ({
      configuration: { partnerHMACSecret, partnerID },
      handleError,
      handleMessage,
      sendInboxMessage,
      setMessageID,
      templateID,
      templateParams
    }) => ({
      sendInboxMessage: handleError(async () => {
        const { messageID } = await sendInboxMessage({
          partnerHMACSecret,
          partnerID,
          templateID,
          templateParams
        });

        setMessageID(messageID);
        handleMessage(CommonMessages.messaging.inbox);
      })
    })
  )
)(PrivateInbox);
