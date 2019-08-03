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
import { hmacDescription } from "component/description";
import Documentation from "component/Documentation/component";
import { GrabIDLogin } from "component/GrabID/component";
import Template from "component/Messaging/Template/component";
import StageSwitcher from "component/StageSwitcher/component";
import React from "react";
import { connect } from "react-redux";
import { compose, withState } from "recompose";
import { CommonMessages } from "redux/action/common";
import { environment } from "utils";
import "./style.scss";

const inboxDescription = `
Authorization is HMAC:

${hmacDescription}

The call requires provision of a template whose ID is preset:

${"```javascript"}
app.post('...', async (
  {
    body: { recipientType = "passenger", templateID, templateParams },
    headers: { authorization }
  },
  res
) => {
  const {
    partnerHMACSecret,
    partnerID
  } = await dbClient.config.getConfiguration();

  const {
    data: { partner_user_id: recipientID }
  } = await requestAccessTokenInfo(httpClient, { authorization });

  const requestBody = {
    recipientID,
    recipientType,
    template: { id: templateID, params: templateParams }
  };

  const timestamp = new Date().toUTCString();

  const hmacDigest = await generateHMACSignature({
    contentType: "application/json",
    httpMethod: "POST",
    partnerHMACSecret,
    requestBody,
    requestURL: "/message/v1/inbox",
    timestamp
  });

  const { data, status } = await httpClient.post(
    "/message/v1/inbox",
    requestBody,
    {
      "Content-Type": "application/json",
      Authorization: ${"`"}${"$"}{partnerID}:${"$"}{hmacDigest}${"`"},,
      Date: timestamp
    }
  );

  res.status(status).json(data);
});
${"```"}

This call will give us back:
- **messageID**: The ID of the message that was sent.
`;

const templates = (function() {
  const isProduction = environment() === "production";

  return {
    "Inbox Message": {
      id: {
        readonly: true,
        value: !!isProduction
          ? "510095c0-c4a6-40f5-b80e-f2b9e69d49e2"
          : "28427675-74b3-427f-96bd-a0f489ffdb25"
      },
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
  templateName,
  templateParams,
  sendInboxMessage,
  setCurrentStage,
  setTemplateName,
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

          <div className="stage-description">
            <Documentation className="source-code" source={inboxDescription} />
          </div>

          <div className="divider" />
          <div className="title">Endpoint</div>
          <input disabled readOnly value={"GET /message/v1/inbox"} />

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
  messagingTemplateHOC(templates),
  stageSwitcherHOC(),
  withState("messageID", "setMessageID", ""),
  connect(
    (
      { repository },
      {
        handleError,
        handleMessage,
        setMessageID,
        templateParams: { id: templateID, ...templateParams }
      }
    ) => ({
      sendInboxMessage: handleError(async () => {
        const { messageID } = await repository.messaging.sendInboxMessage({
          templateID,
          templateParams
        });

        setMessageID(messageID);
        handleMessage(CommonMessages.messaging.inbox);
      })
    })
  )
)(PrivateInbox);
