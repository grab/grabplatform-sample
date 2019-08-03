/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import Configuration from "component/Configuration/component";
import {
  GrabIDNonPOPRedirect,
  GrabIDPOPRedirect
} from "component/GrabID/component";
import Identity from "component/Identity/component";
import Loyalty from "component/Loyalty/component";
import Messaging from "component/Messaging/component";
import Payment from "component/Payment/component";
import querystring from "querystring";
import React from "react";
import { connect } from "react-redux";
import { NavLink, Route, Switch } from "react-router-dom";
import { compose, lifecycle, withProps, withState } from "recompose";
import { CommonActionCreators } from "redux/action/common";
import { ConfigurationActionCreators } from "redux/action/configuration";
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
  setShowConfiguration,
  toggleDocumentation
}) {
  return (
    <div className="App">
      {!!showConfiguration && (
        <div className="configuration-overlay overlay">
          <Configuration
            closeConfiguration={() => setShowConfiguration(false)}
          />
        </div>
      )}

      <div className="global-action-container">
        <div className="configure" onClick={() => setShowConfiguration(true)}>
          Configure
        </div>

        <div className="documentation" onClick={toggleDocumentation}>
          Toggle documentation
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
  withProps(({ location: { hash } }) => querystring.parse(hash.substr(1))),
  withProps(({ id_token: idToken }) => ({ idToken })),
  connect(
    ({ repository }) => ({ repository }),
    dispatch => ({
      clearEverything: () =>
        dispatch(CommonActionCreators.triggerClearEverything()),
      getConfigurationFromPersistence: () =>
        dispatch(
          ConfigurationActionCreators.triggerGetConfigurationFromPersistence()
        )
    })
  ),
  withProps(({ repository }) => ({
    toggleDocumentation: async () => {
      await repository.navigation.overrideQuery(({ documentation }) => ({
        documentation: documentation !== "true"
      }));

      await repository.navigation.reloadPage();
    }
  })),
  withState("showConfiguration", "setShowConfiguration", false),
  lifecycle({
    async componentDidMount() {
      const {
        getConfigurationFromPersistence,
        idToken,
        repository
      } = this.props;

      await repository.grabid.persistInitialIDToken(idToken);
      await getConfigurationFromPersistence();
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
      <Route
        component={GrabIDNonPOPRedirect}
        exact
        path={"/grabid/redirect/nonpop"}
      />

      <Route
        component={GrabIDPOPRedirect}
        exact
        path={"/grabid/redirect/pop"}
      />

      <Route component={AppContent} />
    </Switch>
  );
}

export default PrivateApp;
