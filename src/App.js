/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { GrabIDGlobalLogin, GrabIDRedirect } from "component/GrabID/component";
import { GrabPayRedirect } from "component/GrabPay/component";
import Identity from "component/Identity/component";
import Loyalty from "component/Loyalty/component";
import Payment from "component/Payment/component";
import React from "react";
import { connect } from "react-redux";
import { NavLink, Redirect, Route, Switch } from "react-router-dom";
import { compose } from "recompose";
import { CommonActionCreators } from "redux/action/common";
import "./App.scss";

const categories = [
  ["Identity", Identity],
  ["Payment", Payment],
  ["Loyalty", Loyalty]
];

function PrivateApp({ accessToken, clearCredentials }) {
  return (
    <Switch>
      <Route component={GrabIDGlobalLogin} exact path={"/login"} />
      <Route component={GrabIDRedirect} exact path={"/grabid/redirect"} />
      <Route component={GrabPayRedirect} exact path={"/grabpay/redirect"} />
      <Route
        render={() => (
          <div className="App">
            {!!accessToken ? (
              <>
                <div className="global-action-container">
                  <div className="clear-credentials" onClick={clearCredentials}>
                    Clear everything
                  </div>
                </div>

                <div className="divider" />
                <div className="app-bar">
                  <div className="category-container">
                    {categories.map(([category]) => (
                      <NavLink
                        activeClassName="active-tab"
                        className="tab"
                        key={category}
                        to={`/${category.toLowerCase()}`}
                      >
                        {category}
                      </NavLink>
                    ))}
                  </div>
                </div>
                <div className="app-content">
                  <Switch>
                    {categories.map(([category, component]) => (
                      <Route
                        component={component}
                        key={category}
                        path={`/${category.toLowerCase()}`}
                      />
                    ))}
                  </Switch>
                </div>
              </>
            ) : (
              <Redirect to={"/login"} />
            )}
          </div>
        )}
      />
    </Switch>
  );
}

export default compose(
  connect(
    ({ grabid: { accessToken } }) => ({ accessToken }),
    dispatch => ({
      clearCredentials: () =>
        dispatch(CommonActionCreators.triggerClearCredentials())
    })
  )
)(PrivateApp);
