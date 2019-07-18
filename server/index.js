/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
const dotenv = require("dotenv");
const express = require("express");
const fs = require("fs");
const https = require("https");

dotenv.config();

const app = express();
const { createHTTPClient } = require("./client");
const grabid = require("./handler/grabid");
const identity = require("./handler/identity");
const loyalty = require("./handler/loyalty");
const payment = require("./handler/payment");
const port = 8000;
const httpClient = createHTTPClient();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json("Never should have come here");
});

app.get("/identity/basic-profile", identity.basicProfile(httpClient));
app.get("/loyalty/rewards-tier", loyalty.rewardsTier(httpClient));
app.post("/payment/one-time-charge/token", grabid.popToken(httpClient));
app.post(
  "/payment/one-time-charge/init",
  payment.oneTimeCharge.init(httpClient)
);
app.post(
  "/payment/one-time-charge/confirm",
  payment.oneTimeCharge.confirm(httpClient)
);
app.post(
  "/payment/recurring-charge/bind",
  payment.recurringCharge.bind(httpClient)
);
app.post("/payment/recurring-charge/token", grabid.popToken(httpClient));
app.post("/payment/recurring-charge/wallet", payment.checkWallet(httpClient));
app.post(
  "/payment/recurring-charge/charge",
  payment.recurringCharge.charge(httpClient)
);
app.post(
  "/payment/recurring-charge/unbind",
  payment.recurringCharge.unbind(httpClient)
);

https
  .createServer(
    {
      key: fs.readFileSync("server/server.key"),
      cert: fs.readFileSync("server/server.cert")
    },
    app
  )
  .listen(port, () => console.log(`Listening at ${port}`));
