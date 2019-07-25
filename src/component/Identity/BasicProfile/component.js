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

function PrivateBasicProfile({ basicProfile, getBasicProfile }) {
  return (
    <div className="basic-profile-container">
      <GrabIDLogin currentProductStageFlow={1} scopes={["profile.read"]} />

      <div className="main-container">
        <div className="intro-title">Stage 2: Basic profile</div>
        <div className="title">Endpoint</div>
        <input disabled readOnly value={"GET /grabid/v1/oauth2/userinfo"} />
        <div className="title">Profile information</div>

        <div className="info-container">
          {!!basicProfile && !!Object.keys(basicProfile).length
            ? Object.entries(basicProfile)
                .map(([key, value]) => [
                  key,
                  <>
                    <b>{key}</b>: {`${value}`}
                  </>
                ])
                .map(([key, info]) => (
                  <div className="info" key={key}>
                    {info}
                  </div>
                ))
            : "No profile information yet"}
        </div>

        <div className="get-profile" onClick={getBasicProfile}>
          Get basic profile
        </div>
      </div>
    </div>
  );
}

export default compose(
  handleMessageHOC(),
  handleErrorHOC(),
  connect(({ repository: { identity: { getBasicProfile } } }) => ({
    getBasicProfile
  })),
  withState("basicProfile", "setBasicProfile", {}),
  withProps(
    ({ getBasicProfile, handleError, setBasicProfile, showMessage }) => ({
      getBasicProfile: handleError(async () => {
        const profile = await getBasicProfile();
        setBasicProfile(profile);
        showMessage(CommonMessages.identity.basicProfile);
      })
    })
  )
)(PrivateBasicProfile);
