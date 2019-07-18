/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
const { handleError } = require("./util");

module.exports = {
  rewardsTier: function(httpClient) {
    return handleError(async ({ headers }, res) => {
      const {
        data: {
          result: { tier }
        },
        status
      } = await httpClient.get("/loyalty/rewards/v1/tier", headers);

      res.status(status).json(tier);
    });
  }
};
