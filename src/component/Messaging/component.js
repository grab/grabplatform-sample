/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import ProductContainer from "component/ProductContainer/component";
import React from "react";
import Inbox from "./Inbox/component";
import Push from "./Push/component";
import "./style.scss";

const products = [["Push", Push], ["Inbox", Inbox]];

function PrivateMessaging({ match: { path } }) {
  return (
    <div className={"messaging-container"}>
      <ProductContainer products={products} urlPath={path} />
    </div>
  );
}

export default PrivateMessaging;
