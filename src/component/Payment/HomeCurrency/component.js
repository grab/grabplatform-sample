/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import {
  handleErrorHOC,
  handleMessageHOC,
  stageSwitcherHOC
} from "component/customHOC";
import { GrabIDLogin } from "component/GrabID/component";
import StageSwitcher from "component/StageSwitcher/component";
import React from "react";
import { compose, withProps, withState } from "recompose";
import { CommonMessages } from "redux/action/common";
import { makeHTTPRequest } from "utils";
import "./style.scss";

function PrivateHomeCurrency({
  currentStage,
  getHomeCurrency,
  homeCurrency,
  setCurrentStage
}) {
  return (
    <div className="home-currency-container">
      <StageSwitcher
        currentStage={currentStage}
        setStage={setCurrentStage}
        stageCount={2}
      />

      {currentStage === 0 && (
        <GrabIDLogin
          currentProductStageFlow={1}
          scopes={["payment.home_currency"]}
        />
      )}

      {currentStage === 1 && (
        <div className="main-container">
          <div className="intro-title">Stage 2: Home currency</div>
          <div className="title">Endpoint</div>

          <input
            disabled
            readOnly
            value={"GET /grabpay/partner/v2/wallet/home-currency"}
          />

          <div className="title">Home currency</div>

          <div className="home-currency">
            {!!homeCurrency
              ? `Your home currency is ${homeCurrency}`
              : "No home currency information yet"}
          </div>

          <div className="get-home-currency" onClick={getHomeCurrency}>
            Get home currency
          </div>
        </div>
      )}
    </div>
  );
}

export default compose(
  handleMessageHOC(),
  handleErrorHOC(),
  stageSwitcherHOC(),
  withState("homeCurrency", "setHomeCurrency", ""),
  withProps(({ handleError, handleMessage, setHomeCurrency }) => ({
    getHomeCurrency: handleError(async () => {
      const { homeCurrency } = await makeHTTPRequest({
        method: "GET",
        path: "/payment/home-currency"
      });

      setHomeCurrency(homeCurrency);
      handleMessage(CommonMessages.grabpay.homeCurrency);
    })
  }))
)(PrivateHomeCurrency);
