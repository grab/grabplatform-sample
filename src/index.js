/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
import App from "App";
import "index.scss";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { applyMiddleware, createStore } from "redux";
import thunkMiddleware from "redux-thunk";
import { alertMiddleware, thunkUnwrapMiddleware } from "redux/middleware";
import reducer from "redux/reducer";
import * as serviceWorker from "./serviceWorker";

const store = createStore(
  reducer,
  applyMiddleware(alertMiddleware, thunkUnwrapMiddleware, thunkMiddleware)
);

const rootPath = process.env.REACT_APP_ROOT_PATH;

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
