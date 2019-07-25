/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { GrabIDLogin } from "component/GrabID/component";
import React from "react";
import { connect } from "react-redux";
import { compose } from "recompose";
import { LoyaltyActionCreators } from "redux/action/loyalty";
import "./style.scss";

function PrivateRewardsTier({ rewardsTier, getRewardsTier }) {
  return (
    <div className="rewards-tier-container">
      <GrabIDLogin currentProductStageFlow={1} scopes={["rewards.tierinfo"]} />

      <div className="main-container">
        <div className="intro-title">Stage 2: Rewards tier</div>
        <div className="title">Endpoint</div>
        <input disabled readOnly value={"GET /loyalty/rewards/v1/tier"} />
        <div className="title">Rewards tier</div>

        <div className="tier">
          {!!rewardsTier
            ? `You are a/an (${rewardsTier.toUpperCase()}) member`
            : "No tier information yet"}
        </div>

        <div className="get-tier" onClick={getRewardsTier}>
          Get rewards tier
        </div>
      </div>
    </div>
  );
}

export default compose(
  connect(
    ({ loyalty: { rewardsTier } }) => ({ rewardsTier }),
    dispatch => ({
      getRewardsTier: () =>
        dispatch(LoyaltyActionCreators.triggerGetRewardsTier())
    })
  )
)(PrivateRewardsTier);
