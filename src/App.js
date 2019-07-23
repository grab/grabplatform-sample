/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { GrabIDRedirect } from "component/GrabID/component";
import { GrabPayRedirect } from "component/GrabPay/component";
import Identity from "component/Identity/component";
import Loyalty from "component/Loyalty/component";
import Messaging from "component/Messaging/component";
import Payment from "component/Payment/component";
import querystring from "querystring";
import React from "react";
import Configuration from "component/Configuration/component";
import { connect } from "react-redux";
import { NavLink, Route, Switch } from "react-router-dom";
import { compose, lifecycle, mapProps, withState } from "recompose";
import { CommonActionCreators } from "redux/action/common";
import "./App.scss";

const categories = [
  ["Identity", Identity],
  ["Payment", Payment],
  ["Loyalty", Loyalty],
  ["Messaging", Messaging]
];

function PrivateAppContent({
  clearEverything,
  showConfiguration,
  setShowConfiguration
}) {
  return (
    <div className="App">
      {!!showConfiguration && (
        <div className="configuration-overlay overlay">
          <Configuration
            confirmConfiguration={() => setShowConfiguration(false)}
          />
        </div>
      )}

      <div className="global-action-container">
        <div className="configure" onClick={() => setShowConfiguration(true)}>
          Configure
        </div>

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
    ({
      repository: {
        grabid: { storeIDTokenLocally }
      }
    }) => ({ storeIDTokenLocally }),
    dispatch => ({
      clearEverything: () =>
        dispatch(CommonActionCreators.triggerClearEverything())
    })
  ),
  withState("showConfiguration", "setShowConfiguration", false),
  lifecycle({
    async componentDidMount() {
      const { idToken, storeIDTokenLocally } = this.props;
      await storeIDTokenLocally(idToken);
    }
  })
)(PrivateAppContent);

/**
 * We need a root URL path in case we want to host this app somewhere at a
 * subpath. Root URL path must start with a "/".
 */
function PrivateApp() {
  return (
    <Switch>
      <Route component={GrabIDRedirect} exact path={"/grabid/redirect"} />
      <Route component={GrabPayRedirect} exact path={"/grabpay/redirect"} />
      <Route component={AppContent} />
    </Switch>
  );
}

export default PrivateApp;
