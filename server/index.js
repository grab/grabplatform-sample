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
const { createDBClient, createHTTPClient } = require("./client");
const configuration = require("./handler/configuration");
const grabid = require("./handler/grabid");
const identity = require("./handler/identity");
const loyalty = require("./handler/loyalty");
const payment = require("./handler/payment");
const messaging = require("./handler/messaging");
const port = 8000;

async function initialize() {
  const dbClient = await createDBClient();
  const httpClient = await createHTTPClient();

  app.use(express.json());

  app.get("/", (req, res) => {
    res.status(200).json("Never should have come here");
  });
  app.get("/configuration", configuration.getConfiguration(dbClient));
  app.post("/configuration", configuration.setConfiguration(dbClient));
  app.post("/grabid/token", grabid.popToken(dbClient, httpClient));
  app.get("/identity/basic-profile", identity.basicProfile(httpClient));
  app.get("/loyalty/rewards-tier", loyalty.rewardsTier(httpClient));
  app.post("/messaging/inbox", messaging.inbox(dbClient, httpClient));
  app.post("/messaging/push", messaging.push(dbClient, httpClient));
  app.post(
    "/payment/one-time-charge/init",
    payment.oneTimeCharge.init(dbClient, httpClient)
  );
  app.post(
    "/payment/one-time-charge/confirm",
    payment.oneTimeCharge.confirm(dbClient, httpClient)
  );
  app.post(
    "/payment/recurring-charge/bind",
    payment.recurringCharge.bind(dbClient, httpClient)
  );
  app.post(
    "/payment/recurring-charge/wallet",
    payment.checkWallet(dbClient, httpClient)
  );
  app.post(
    "/payment/recurring-charge/charge",
    payment.recurringCharge.charge(dbClient, httpClient)
  );
  app.post(
    "/payment/recurring-charge/unbind",
    payment.recurringCharge.unbind(dbClient, httpClient)
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
}

initialize();
