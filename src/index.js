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
  createGrabPayRepository
} from "./repository";
import * as serviceWorker from "./serviceWorker";

const cacheKey = "cached";
const cachedData = localStorage.getItem(cacheKey);

let storedState = !!cachedData
  ? JSON.parse(cachedData)
  : {
      grabid: {
        clientID: "",
        clientSecret: "",
        codeVerifier: "",
        countryCode: ""
      },
      grabpay: {
        currency: "",
        merchantID: "",
        partnerGroupTxID: "",
        partnerHMACSecret: "",
        partnerID: "",
        partnerTxID: "",
        request: "",
        wallet: {},
        oneTimeCharge: {},
        recurringCharge: {},
        transaction: { amount: 0, description: "", status: "" }
      },
      identity: { basicProfile: {} },
      loyalty: { rewardsTier: "" }
    };

if (!!Object.keys(storedState).length) {
  const {
    grabid: { clientID, clientSecret, codeVerifier, countryCode, scopes },
    grabpay: {
      currency,
      merchantID,
      partnerHMACSecret,
      partnerID,
      request,
      transaction: { amount, description, partnerGroupTxID, partnerTxID }
    }
  } = storedState;

  storedState = {
    grabid: {
      clientID: clientID || process.env.REACT_APP_CLIENT_ID || "",
      clientSecret: clientSecret || process.env.REACT_APP_CLIENT_SECRET || "",
      codeVerifier: codeVerifier || "",
      countryCode: countryCode || process.env.REACT_APP_COUNTRY_CODE || "SG",
      scopes: scopes || []
    },
    grabpay: {
      currency: currency || "SGD",
      merchantID: merchantID || process.env.REACT_APP_MERCHANT_ID || "",
      partnerHMACSecret:
        partnerHMACSecret || process.env.REACT_APP_PARTNER_HMAC_SECRET || "",
      partnerID: partnerID || process.env.REACT_APP_PARTNER_ID || "",
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

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
