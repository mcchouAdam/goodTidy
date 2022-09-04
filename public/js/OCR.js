async function OCR(filename) {
  try {
    const OCR_result = await axios({
      method: 'GET',
      url: `api/1.0/OCR/${filename}`,
      responseType: 'json',
    });
    return OCR_result.data;
  } catch (err) {
    console.log(err);
    return;
  }
}
