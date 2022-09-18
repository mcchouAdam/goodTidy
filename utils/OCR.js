const vision = require('@google-cloud/vision');
require('dotenv').config();
const { S3_HOST, GOOGLE_API_KEY } = process.env;

// Creates a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: GOOGLE_API_KEY,
});

const OCR_google = async (req, res) => {
  // filename
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

/**
 * TODO(developer): Uncomment the following line before running the sample.
 */
// const fileName = 'Local image file, e.g. /path/to/image.png';

// // Performs text detection on the local file
// $env:GOOGLE_APPLICATION_CREDENTIALS="/home/ec2-user/googleAPI/appworkssideproject-b9d30923d7e4.json"

// env GOOGLE_APPLICATION_CREDENTIALS="/home/ec2-user/googleAPI/appworkssideproject-b9d30923d7e4.json"

// $env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\adamp\appworkssideproject-b9d30923d7e4.json"

module.exports = { OCR_google };
