/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { grabIDHandlerHOC } from "component/custom-hoc";
import { GrabIDLogin } from "component/GrabID/component";
import React from "react";
import { connect } from "react-redux";
import { compose } from "recompose";
import { MessagingActionCreators } from "redux/action/messaging";
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
  grabIDHandlerHOC(),
  connect(
    () => ({}),
    dispatch => ({
      sendPushMessage: () =>
        dispatch(MessagingActionCreators.triggerSendPushMessage())
    })
  )
)(PrivateInbox);
