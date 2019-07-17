/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { GrabIDGlobalLogin, GrabIDRedirect } from "component/GrabID/component";
import { GrabPayRedirect } from "component/GrabPay/component";
import Identity from "component/Identity/component";
import Loyalty from "component/Loyalty/component";
import Payment from "component/Payment/component";
import querystring from "querystring";
import React from "react";
import { connect } from "react-redux";
import { NavLink, Redirect, Route, Switch } from "react-router-dom";
import { compose, mapProps } from "recompose";
import { CommonActionCreators } from "redux/action/common";
import "./App.scss";

const categories = [
  ["Identity", Identity],
  ["Payment", Payment],
  ["Loyalty", Loyalty]
];

const globalLoginEnabled = false;

function PrivateAppContent({ accessToken, idToken, clearEverything }) {
  return (
    <div className="App">
      {!globalLoginEnabled || !!accessToken ? (
        <>
          <div className="global-action-container">
            <div className="clear-everything" onClick={clearEverything}>
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
  );
}

const AppContent = compose(
  mapProps(({ location: { hash }, ...rest }) => ({
    ...rest,
    ...querystring.parse(hash.substr(1))
  })),
  mapProps(({ id_token: idToken, ...rest }) => ({ ...rest, idToken })),
  connect(
    ({ grabid: { accessToken } }) => ({ accessToken }),
    dispatch => ({
      clearEverything: () =>
        dispatch(CommonActionCreators.triggerClearEverything())
    })
  )
)(PrivateAppContent);

function PrivateApp() {
  return (
    <Switch>
      <Route component={GrabIDGlobalLogin} exact path={"/login"} />
      <Route component={GrabIDRedirect} exact path={"/grabid/redirect"} />
      <Route component={GrabPayRedirect} exact path={"/grabpay/redirect"} />
      <Route component={AppContent} />
    </Switch>
  );
}

export default PrivateApp;
