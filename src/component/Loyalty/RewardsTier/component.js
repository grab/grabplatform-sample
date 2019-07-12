/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { grabIDHandlerHOC, Stage } from "component/custom-hoc";
import { GrabID } from "component/GrabID/component";
import React from "react";
import { connect } from "react-redux";
import { compose, lifecycle, mapProps } from "recompose";
import { GrabIDActionCreators, LoyaltyActionCreators } from "redux/action";
import "./style.scss";

function PrivateRewardsTier({ currentStage, rewardsTier, getRewardsTier }) {
  return (
    <div className="rewards-tier-container">
      {currentStage >= Stage.ONE && <GrabID currentStage={1} />}

      {currentStage >= Stage.TWO && (
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
      )}
    </div>
  );
}

export default compose(
  grabIDHandlerHOC(),
  connect(
    ({ grabid: { accessToken, idToken }, loyalty: { rewardsTier } }) => ({
      isGrabIDSatisfied: !!accessToken && !!idToken,
      rewardsTier
    }),
    dispatch => ({
      getRewardsTier: () =>
        dispatch(LoyaltyActionCreators.triggerGetRewardsTier()),
      setScopes: scopes => dispatch(GrabIDActionCreators.setScopes(scopes))
    })
  ),
  mapProps(({ isGrabIDSatisfied, ...rest }) => ({
    ...rest,
    currentStage: Stage.ONE + !!isGrabIDSatisfied
  })),
  lifecycle({
    componentDidMount() {
      this.props.setScopes(["rewards.tierinfo"]);
    }
  })
)(PrivateRewardsTier);
