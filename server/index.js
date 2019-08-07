/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const session = require("express-session");
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

function requireTruthy(object) {
  if (!object) {
    throw new Error(`Value is not truthy`);
  }

  return object;
}

async function initialize() {
  const dbClient = await createDBClient({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, undefined) || undefined,
    url: process.env.REDIS_URL
  });

  const httpClient = await createHTTPClient({
    env: requireTruthy(process.env.NODE_ENV)
  });

  app.use(cors({ origin: requireTruthy(process.env.CLIENT_URL) }));
  app.use(express.json());

  app.use(
    session({
      resave: true,
      secret: "grabplatform-sample",
      saveUninitialized: true
    })
  );

  app.get("/", ({ session }, res) => {
    res
      .status(200)
      .json(`Never should have come here: ${JSON.stringify(session)}`);
  });
  app.get("/configuration", configuration.getConfiguration(dbClient));
  app.post("/configuration", configuration.setConfiguration(dbClient));
  app.post("/grabid/payment/authorize", async ({ body, session }, res) => {
    const { authorizeURL } = await grabid.utils.authorize(
      session,
      httpClient,
      body
    );

    res.status(200).json({ authorizeURL });
  });
  app.post("/grabid/token", grabid.requestToken(dbClient, httpClient));
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

  if (process.env.USE_SELF_SIGNED_CERT !== "false") {
    https
      .createServer(
        {
          key: fs.readFileSync("server/server.key"),
          cert: fs.readFileSync("server/server.cert")
        },
        app
      )
      .listen(port, () => console.log(`Listening at ${port}`));
  } else {
    app.listen(port, () => console.log(`Listening at ${port}`));
  }
}

initialize();
