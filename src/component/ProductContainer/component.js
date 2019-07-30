/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import { join } from "path";
import React from "react";
import { NavLink, Route, Switch } from "react-router-dom";
import "./style.scss";

function productPath(urlPath, product) {
  return join(
    urlPath,
    product
      .split(" ")
      .map(component => component.toLowerCase())
      .join("-")
  );
}

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
            to={productPath(urlPath, product)}
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
              path={productPath(urlPath, product)}
            />
          ))}
        </Switch>
      </div>
    </div>
  );
}
