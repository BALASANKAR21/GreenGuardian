import * as functions from "firebase-functions";
import axios from "axios";

export const identifyPlant = functions.https.onRequest(async (req, res) => {
  // Expect image as base64 or URL
  const { image } = req.body;
  // Call Pl@ntNet API
  const result = await axios.post("https://my.plantnet.org/v2/identify/all", {
    images: [image],
    organs: ["leaf", "flower", "fruit", "bark"]
  }, { params: { "api-key": functions.config().plantnet.key } });
  res.json(result.data);
});
