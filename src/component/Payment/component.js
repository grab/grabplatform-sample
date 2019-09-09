/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import React from "react";
import ProductContainer from "../ProductContainer/component";
import HomeCurrency from "./HomeCurrency/component";
import OneTimeCharge from "./OneTimeCharge/component";
import RecurringCharge from "./RecurringCharge/component";
import "./style.scss";

const products = [
  ["One-Time Charge", OneTimeCharge],
  ["Recurring Charge", RecurringCharge],
  ["Home Currency", HomeCurrency]
];

function PrivatePayment({ match: { path } }) {
  return (
    <div className={"payment-container"}>
      <ProductContainer products={products} urlPath={path} />
    </div>
  );
}

export default PrivatePayment;
