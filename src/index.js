/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import App from "./App";
import "./index.scss";
import { alertMiddleware, thunkUnwrapMiddleware } from "./redux/middleware";
import reducer from "./redux/reducer";
import {
  createGrabAPIRepository,
  createGrabIDRepository,
  createGrabPayRepository,
  createWindowRepository
} from "./repository";
import * as serviceWorker from "./serviceWorker";

const cacheKey = "cached";
const cachedData = localStorage.getItem(cacheKey);

let storedState = !!cachedData
  ? JSON.parse(cachedData)
  : {
      configuration: {},
      grabid: {},
      grabpay: {
        partnerGroupTxID: "",
        partnerHMACSecret: "",
        partnerTxID: "",
        request: "",
        wallet: {},
        oneTimeCharge: {},
        recurringCharge: {},
        transaction: { amount: 0, description: "", status: "" }
      },
      identity: {},
      loyalty: {},
      messaging: {}
    };

if (!!Object.keys(storedState).length) {
  const {
    configuration: {
      clientID,
      clientSecret,
      countryCode,
      currency,
      merchantID,
      partnerHMACSecret,
      partnerID
    },
    grabpay: {
      request,
      transaction: { amount, description, partnerGroupTxID, partnerTxID }
    }
  } = storedState;

  storedState = {
    configuration: {
      clientID: clientID || process.env.REACT_APP_CLIENT_ID || "",
      clientSecret: clientSecret || process.env.REACT_APP_CLIENT_SECRET || "",
      countryCode: countryCode || process.env.REACT_APP_COUNTRY_CODE || "SG",
      currency: currency || "SGD",
      merchantID: merchantID || process.env.REACT_APP_MERCHANT_ID || "",
      partnerHMACSecret:
        partnerHMACSecret || process.env.REACT_APP_PARTNER_HMAC_SECRET || "",
      partnerID: partnerID || process.env.REACT_APP_PARTNER_ID || ""
    },
    grabid: {},
    grabpay: {
      request: request || "",
      wallet: {},
      recurringCharge: {},
      transaction: {
        amount: amount || 10,
        description: description || "Test transaction",
        partnerGroupTxID: partnerGroupTxID || "testPayment001",
        partnerTxID: partnerTxID || ""
      }
    }
  };
}

const repository = {
  ...createWindowRepository(window),
  ...createGrabIDRepository(window),
  ...createGrabPayRepository(window),
  ...createGrabAPIRepository(window)
};

const store = createStore(
  reducer,
  { repository, ...storedState },
  applyMiddleware(
    alertMiddleware,
    thunkUnwrapMiddleware,
    thunkMiddleware.withExtraArgument(repository)
  )
);

window.addEventListener("beforeunload", () => {
  localStorage.setItem(cacheKey, JSON.stringify(store.getState()));
});

const rootPath = process.env.REACT_APP_ROOT_URL_PATH;

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter basename={rootPath}>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
