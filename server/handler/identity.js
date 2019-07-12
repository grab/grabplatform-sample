/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
const { handleError } = require("./util");

module.exports = {
  basicProfile: function(client) {
    return handleError(async ({ headers }, res) => {
      const { data, status } = await client.get(
        "/grabid/v1/oauth2/userinfo",
        headers
      );

      res.status(status).json(data);
    });
  }
};
