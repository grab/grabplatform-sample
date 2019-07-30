/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
const { handleError } = require("./util");

module.exports = {
  setConfiguration: function(dbClient) {
    return handleError(async ({ body }, res) => {
      await dbClient.config.setConfiguration(body);
      res.status(200).json({ message: "Successful" });
    });
  },
  getConfiguration: function(dbClient) {
    return handleError(async ({ body }, res) => {
      const config = await dbClient.config.getConfiguration(body);
      res.status(200).json(config);
    });
  }
};
