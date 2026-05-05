const axios = require("axios");

let _token = null;
let _tokenExpiry = null;

const getSharePointToken = async () => {
  if (_token && _tokenExpiry && Date.now() < _tokenExpiry) return _token;

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.SP_CLIENT_ID,
    client_secret: process.env.SP_CLIENT_SECRET,
    scope: process.env.SP_SCOPE,
  });

  const res = await axios.post(
    `https://login.microsoftonline.com/${process.env.SP_TENANT_ID}/oauth2/v2.0/token`,
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  _token = res.data.access_token;
  _tokenExpiry = Date.now() + (res.data.expires_in - 300) * 1000;
  return _token;
};

/**
 * Upload a file buffer to SharePoint via Microsoft Graph.
 * @param {Buffer} fileBuffer
 * @param {string} fileName
 * @param {string} [folder] - optional subfolder e.g. "DeliveryOrders"
 */
const uploadToSharePoint = async (fileBuffer, fileName, folder = "") => {
  const token = await getSharePointToken();

  // SP_ROOT_URL ends with "root:/"
  // Final URL pattern: {root:}/{folder}/{fileName}:/content
  const rootUrl = process.env.SP_ROOT_URL;
  const filePath = folder ? `${folder}/${fileName}` : fileName;
  const uploadUrl = `${rootUrl}${filePath}:/content`;

  console.log("[SharePoint] Uploading to:", uploadUrl);

  const res = await axios.put(uploadUrl, fileBuffer, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  return res.data;
};

module.exports = { getSharePointToken, uploadToSharePoint };
