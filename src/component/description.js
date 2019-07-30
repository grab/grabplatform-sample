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
