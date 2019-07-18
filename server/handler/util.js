/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
exports.handleError = function(requestHandler) {
  return async (req, res) => {
    try {
      await requestHandler(req, res);
    } catch (e) {
      console.log(e);

      const {
        response: {
          data: { message },
          status
        }
      } = e;

      res.status(status).json({ message });
    }
  };
};
