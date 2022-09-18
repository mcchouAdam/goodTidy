const vision = require('@google-cloud/vision');
require('dotenv').config();
const { S3_HOST, GOOGLE_API_KEY } = process.env;

// Creates a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: GOOGLE_API_KEY,
});

const OCR_google = async (req, res) => {
  // filename
  // console.log('aaaa');
  const filename = req.filename;
  // console.log(filename);
  const [result] = await client.textDetection(`${S3_HOST}/OCR/${filename}`);
  const detections = result.textAnnotations;
  detections.forEach((text) => {
    console.log(text);
    console.log(text.boundingPoly.vertices);
  });

  return res.status(200).json(detections);
};

module.exports = { OCR_google };
