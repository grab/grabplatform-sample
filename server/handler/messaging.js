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
              id: "510095c0-c4a6-40f5-b80e-f2b9e69d49e2",
              language: "en",
              params: {
                title: "1.56 Inbox title",
                subtitle: "Inbox subtitle",
                button_link: "button link valur",
                button_text: "button text value",
                category_icon: "category icon value",
                category: "category value",
                code: "code value",
                cover_image: "cover image value",
                icon_image: "icon_image value",
                message_content: "message content value",
                message_date: "24/07/2019",
                message_title: "message_title value",
                min_app_version: "5.44"
              }
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
  },
  push: httpClient => {
    return handleError(
      async (
        {
          body: {
            partnerHMACSecret,
            partnerID,
            recipientType = "passenger",
            template = {
              id: "7aaa43b5-e27a-4d08-a349-425b372610cd",
              language: "en",
              params: {
                title: "my push title - change this",
                message: " my message body - change this"
              }
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
          requestURL: "/message/v1/push",
          timestamp
        });

        const { data, status } = await httpClient.post(
          "/message/v1/push",
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
