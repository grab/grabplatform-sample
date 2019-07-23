/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
const {
  utils: { requestTokenInfo }
} = require("./grabid");
const { generateHMACSignature, handleError } = require("./util");

module.exports = {
  inbox: httpClient => {
    return handleError(
      async (
        {
          body: {
            partnerHMACSecret,
            partnerID,
            recipientType = "passenger",
            template = {
              id: "1234",
              language: "en"
            }
          },
          headers: { authorization, "content-type": contentType }
        },
        res
      ) => {
        const {
          data: { partner_user_id: recipientID }
        } = await requestTokenInfo(httpClient, {
          authorization,
          "content-type": contentType
        });

        const requestBody = { recipientID, recipientType, template };
        const timestamp = new Date().toUTCString();

        const hmacDigest = await generateHMACSignature({
          contentType: "application/json",
          httpMethod: "POST",
          partnerHMACSecret,
          requestBody,
          requestURL: "/message/v1/inbox",
          timestamp
        });

        const { data, status } = await httpClient.post(
          "/message/v1/inbox",
          requestBody,
          {
            "Content-Type": "application/json",
            Authorization: `${partnerID}:${hmacDigest}`,
            Date: timestamp
          }
        );

        res.status(status).json(data);
      }
    );
  }
};
