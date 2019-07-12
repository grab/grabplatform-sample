/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import React from "react";
import { NavLink, Route, Switch } from "react-router-dom";
import "./style.scss";

export default function({ category, products = [] }) {
  return (
    <div className={`product-container`}>
      <div className="product-bar">
        {products.map(([product]) => (
          <NavLink
            activeClassName="active-tab"
            className="tab"
            exact
            key={product}
            to={`/${category}/${product
              .split(" ")
              .map(components => components.toLowerCase())
              .join("-")}`}
          >
            {product}
          </NavLink>
        ))}
      </div>
      <div className="product-content">
        <Switch>
          {products.map(([product, component]) => (
            <Route
              component={component}
              exact
              key={product}
              path={`/${category}/${product
                .split(" ")
                .map(components => components.toLowerCase())
                .join("-")}`}
            />
          ))}
        </Switch>
      </div>
    </div>
  );
}
