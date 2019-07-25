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
  handleMessageHOC(),
  handleErrorHOC(),
  connect(({ repository: { loyalty: { getRewardsTier } } }) => ({
    getRewardsTier
  })),
  withState("rewardsTier", "setRewardsTier", ""),
  withProps(
    ({ getRewardsTier, handleError, handleMessage, setRewardsTier }) => ({
      getRewardsTier: handleError(async () => {
        const rewardsTier = await getRewardsTier();
        setRewardsTier(rewardsTier);
        handleMessage(CommonMessages.loyalty.rewardsTier);
      })
    })
  )
)(PrivateRewardsTier);
