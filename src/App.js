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
import { NavLink, Route, Switch } from "react-router-dom";
import "./App.scss";

const categories = [
  ["Identity", Identity],
  ["Payment", Payment],
  ["Loyalty", Loyalty]
];

function App() {
  return (
    <Switch>
      <Route component={GrabIDRedirect} exact path={"/grabid/redirect"} />
      <Route component={GrabPayRedirect} exact path={"/grabpay/redirect"} />
      <Route
        render={() => (
          <div className="App">
            <div className="app-bar">
              <GrabIDGlobalLogin />
              <div className="divider" />

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
        )}
      />
    </Switch>
  );
}

export default App;
