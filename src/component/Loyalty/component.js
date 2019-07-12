/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import RewardsTier from "component/Loyalty/RewardsTier/component";
import ProductContainer from "component/ProductContainer/component";
import React from "react";
import "./style.scss";

const products = [["Rewards Tier", RewardsTier]];

function PrivateLoyalty() {
  return (
    <div className={"loyalty-container"}>
      <ProductContainer category="loyalty" products={products} />
    </div>
  );
}

export default PrivateLoyalty;
