/**
 * Copyright 2019 Grabtaxi Holdings PTE LTE (GRAB), All rights reserved.
 * Use of this source code is governed by an MIT-style license that can be found in the LICENSE file
 */
export const partnerTxIDDescription = `
${"```javascript"}
async function generatePartnerTransactionID() {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
${"```"}
`;

export const hmacDescription = `
${"```javascript"}
// Make sure to use the same UTC string timestamp for headers as well.
async function generateHMACSignature({
  contentType = "application/json",
  httpMethod = "POST",
  partnerHMACSecret,
  requestBody,
  requestURL = "/grabpay/partner/v2/charge/init",
  timestamp = new Date().toUTCString()
}) {
  const rawRequestBody = typeof requestBody === "object" ? JSON.stringify(requestBody) : requestBody;
  const relativeURLPath = getRelativeURLPath(requestURL);
  const hashedRequestBody = CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(rawRequestBody));

  const requestData = [
    [
      httpMethod,
      contentType,
      timestamp,
      relativeURLPath,
      hashedRequestBody
    ].join("\\n"),
    "\\n"
  ].join("");

  return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(requestData, partnerHMACSecret));
}
${"```"}
`;

export const grabidDescription = `
For this authorization request, we will need to pass the **request** payload 
received from the call to init charge (GrabID SDK allows request as a query 
parameter, so the authorize call can be made from frontend).

After authorization is completed, we must request token from backend since the 
token endpoint requires client secret.

${"```javascript"}
async ({ body: { code, codeVerifier, clientID, clientSecret, redirectURI } }, res) => {
  // Make sure to run service discovery instead of using hardcoded values.
  const baseURL =
    process.env.NODE_ENV === "production"
      ? GrabPartnerUrls.PRODUCTION
      : GrabPartnerUrls.STAGING;

  const {
    data: { access_token: accessToken, id_token: idToken }, status
  } = await client.post(
    "/grabid/v1/oauth2/token",
    {
      code,
      code_verifier: codeVerifier,
      client_id: clientID,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectURI
    },
    { baseURL }
  );

  res.status(status).json({ accessToken, idToken });
}
${"```"}
`;

export const xgidAuthPOPDescription = `
${"```javascript"}
async function generateHMACForXGIDAUXPOP({ accessToken, clientSecret, date }) {
  const timestamp = getUnixTimestamp(date);
  const message = timestamp + accessToken;
  const signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(message, clientSecret));
  const payload = { time_since_epoch: timestamp, sig: base64URLEncode(signature) };
  const payloadBytes = JSON.stringify(payload);
  return base64URLEncode(btoa(payloadBytes));
}
${"```"}
`;
