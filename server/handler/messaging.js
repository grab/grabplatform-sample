/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
const { handleError } = require("./util");

module.exports = {
  inbox: httpClient => {
    return handleError(async (req, res) => {
      const { data, status } = await httpClient.post("/message/v1/inbox");
      res.status(status).json(data);
    });
  }
};
