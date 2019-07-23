/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { grabIDHandlerHOC } from "component/custom-hoc";
import { GrabIDLogin } from "component/GrabID/component";
import React from "react";
import { connect } from "react-redux";
import { compose } from "recompose";
import { IdentityActionCreators } from "redux/action/identity";
import "./style.scss";

function PrivateBasicProfile({ profile, getBasicProfile }) {
  return (
    <div className="basic-profile-container">
      <GrabIDLogin currentProductStageFlow={1} scopes={["profile.read"]} />

      <div className="main-container">
        <div className="intro-title">Stage 2: Basic profile</div>
        <div className="title">Endpoint</div>
        <input disabled readOnly value={"GET /grabid/v1/oauth2/userinfo"} />
        <div className="title">Profile information</div>

        <div className="info-container">
          {!!profile && !!Object.keys(profile).length
            ? Object.entries(profile)
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
  grabIDHandlerHOC(),
  connect(
    ({ identity: { basicProfile: profile } }) => ({ profile }),
    dispatch => ({
      getBasicProfile: () =>
        dispatch(IdentityActionCreators.triggerGetBasicProfile())
    })
  )
)(PrivateBasicProfile);
