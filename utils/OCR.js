require('dotenv').config();

const { S3_HOST, GOOGLE_API_KEY } = process.env;

const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: GOOGLE_API_KEY,
});

const getOCR = async (req, res) => {
  const { filename } = req;
  const [result] = await client.textDetection(`${S3_HOST}/OCR/${filename}`);
  const detections = result.textAnnotations;
  detections.forEach((text) => {
    console.log(text);
    console.log(text.boundingPoly.vertices);
  });

  if (detections.length === 0) {
    return res.status(500).json({
      data: 'OCR錯誤，請您重新嘗試',
    });
  }
  return res.status(200).json(detections);
};

module.exports = {
  getOCR,
};
