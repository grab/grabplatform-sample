/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import React from "react";
import ProductContainer from "../ProductContainer/component";
import OneTimeCharge from "./OneTimeCharge/component";
import RecurringCharge from "./RecurringCharge/component";
import "./style.scss";

const products = [
  ["One-Time Charge", OneTimeCharge],
  ["Recurring Charge", RecurringCharge]
];

function PrivatePayment() {
  return (
    <div className={"payment-container"}>
      <ProductContainer category="payment" products={products} />
    </div>
  );
}

export default PrivatePayment;
