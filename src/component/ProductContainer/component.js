/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import React from "react";
import { NavLink, Route, Switch } from "react-router-dom";
import { join } from "path";
import "./style.scss";

export default function({ products = [], urlPath }) {
  return (
    <div className={`product-container`}>
      <div className="product-bar">
        {products.map(([product]) => (
          <NavLink
            activeClassName="active-tab"
            className="tab"
            exact
            key={product}
            to={`${join(
              urlPath,
              product
                .split(" ")
                .map(component => component.toLowerCase())
                .join("-")
            )}?stage=1`}
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
              path={join(
                urlPath,
                product
                  .split(" ")
                  .map(component => component.toLowerCase())
                  .join("-")
              )}
            />
          ))}
        </Switch>
      </div>
    </div>
  );
}
