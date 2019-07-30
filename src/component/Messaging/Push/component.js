/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import {
  handleErrorHOC,
  handleMessageHOC,
  messagingTemplateHOC,
  stageSwitcherHOC
} from "component/customHOC";
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
  const titleDefault = "Push title";
  const subtitleDefault = "Push subtitle";
  const messageDefault = "Check this out";
  const webURLDefault = "https://www.grab.com";
  const deeplinkDefault = "grab://open?screenType=BOOKING";

  return {
    "Simple Push with Title, Message Body": {
      id: {
        readonly: true,
        value: !!isProduction
          ? "7aaa43b5-e27a-4d08-a349-425b372610cd"
          : "de9ff743-1c20-4776-a3fa-fc5ae291c61a"
      },
      title: { value: titleDefault },
      message: { value: messageDefault }
    },
    "Simple Push with Title, Subtitle, Message Body": {
      id: {
        readonly: true,
        value: !!isProduction
          ? "47ba1130-8af8-42b5-bb1e-82b572c88c64"
          : "50dbd761-be63-4e04-a311-c1075d583a16"
      },
      title: { value: titleDefault },
      subtitle: { value: subtitleDefault },
      message: { value: messageDefault }
    },
    "Web Url Push With Title, Message Body": {
      id: {
        readonly: true,
        value: !!isProduction
          ? "971babf3-ae7d-4319-b3f3-c697e4ba833c"
          : "977bbefe-5eb0-4564-baf8-06f95f8fcbe3"
      },
      title: { value: titleDefault },
      message: { value: messageDefault },
      webUrl: { value: webURLDefault }
    },
    "Web URL push with Title, Subtitle, Message Body": {
      id: {
        readonly: true,
        value: !!isProduction
          ? "622719ca-ee25-41a5-be47-48f1b52ef5be"
          : "977bbefe-5eb0-4564-baf8-06f95f8fcbe3"
      },
      title: { value: titleDefault },
      subtitle: { value: subtitleDefault },
      message: { value: messageDefault },
      webUrl: { value: webURLDefault }
    },
    "DeeplinkUrl with Title, Message Body": {
      id: {
        readonly: true,
        value: !!isProduction
          ? "9b9bdaca-d434-4b63-9fb0-f114b3fbde92"
          : "228ff996-659b-4cb1-96ae-c5de91c049f9"
      },
      title: { value: titleDefault },
      message: { value: messageDefault },
      deeplink: { value: deeplinkDefault }
    },
    "DeeplinkUrl with SubTitle, Message Body": {
      id: {
        readonly: true,
        value: !!isProduction
          ? "216e3eff-e228-4552-a0a8-60e3a40c2732"
          : "c1635e1b-bc6d-4d9f-b8c9-8842b2ef6fb1"
      },
      title: { value: titleDefault },
      subtitle: { value: subtitleDefault },
      message: { value: messageDefault },
      deeplink: { value: deeplinkDefault }
    }
  };
})();

function PrivateInbox({
  currentStage,
  messageID,
  templateName,
  templateParams,
  sendPushMessage,
  setCurrentStage,
  setTemplateName,
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
            onTemplateNameChange={setTemplateName}
            onTemplateParamsChange={setTemplateParams}
            templates={templates}
            templateName={templateName}
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
  messagingTemplateHOC(templates),
  stageSwitcherHOC(),
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
      handleMessage,
      setMessageID,
      templateParams: { id: templateID, ...templateParams }
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
